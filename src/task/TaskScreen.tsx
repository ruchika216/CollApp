import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  fetchTasks,
  fetchUserTasks,
  createTask,
  updateTask,
  deleteTask,
  subscribeToTasks,
  unsubscribeFromTasks,
} from '../store/slices/taskSlice';
import { fetchApprovedUsers } from '../store/slices/userSlice';
import { Task, User } from '../types';
import Icon from '../components/common/Icon';
import Dropdown from '../components/common/Dropdown';

const { width } = Dimensions.get('window');

interface TaskScreenProps {
  navigation: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const tasks = useAppSelector(state => state.tasks.tasks);
  const userTasks = useAppSelector(state => state.tasks.userTasks);
  const loading = useAppSelector(state => state.tasks.loading);
  const approvedUsers = useAppSelector(state => state.user.approvedUsers);
  const usersLoading = useAppSelector(state => state.user.loading);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [dateScrollDates, setDateScrollDates] = useState<string[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [_deletingTask, setDeletingTask] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedComments, setExpandedComments] = useState<{
    [taskId: string]: boolean;
  }>({});

  const dateScrollRef = useRef<FlatList>(null);

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Done',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    assignedTo: [] as string[],
    assignedUser: '', // Single assignee
    comment: '', // New field for developer comments
  });

  const isAdmin = user?.role === 'admin';

  // Debug: Log current user information
  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('Current user approved status:', user.approved);
      console.log('Current user role:', user.role);
    }
  }, [user]);

  useEffect(() => {
    const initializeData = async () => {
      await loadData();
      generateDateRange();

      // Fetch approved users and log the result
      dispatch(fetchApprovedUsers())
        .then(result => {
          console.log('fetchApprovedUsers result:', result);
        })
        .catch(error => {
          console.log('fetchApprovedUsers error:', error);
        });

      // Subscribe to real-time task updates - all approved users can now see all tasks
      if (user?.uid && user?.approved) {
        dispatch(subscribeToTasks());
      }
    };

    initializeData();

    // Cleanup subscriptions on unmount
    return () => {
      dispatch(unsubscribeFromTasks());
    };
  }, [dispatch, user?.uid, user?.approved]);

  useEffect(() => {
    const filterTasks = () => {
      // All users can now see all tasks, but we still filter by date
      const tasksToFilter = tasks.length > 0 ? tasks : userTasks;
      const filtered = tasksToFilter.filter(task => {
        const taskDate = task.startDate.split('T')[0];
        return taskDate === selectedDate;
      });
      setFilteredTasks(filtered);
    };

    filterTasks();
  }, [selectedDate, tasks, userTasks]);

  // Debug: Log the approvedUsers whenever they change
  useEffect(() => {
    console.log('approvedUsers changed:', approvedUsers);
    console.log('approvedUsers length:', approvedUsers.length);
    if (approvedUsers.length > 0) {
      console.log('First user:', approvedUsers[0]);
    }
  }, [approvedUsers]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      // All approved users can now see all tasks
      await dispatch(fetchTasks()).unwrap();
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to user tasks if permission denied
      if (!isAdmin && user?.uid) {
        try {
          await dispatch(fetchUserTasks(user.uid)).unwrap();
        } catch (fallbackError) {
          console.error('Error loading user tasks:', fallbackError);
        }
      }
    } finally {
      setLoadingData(false);
    }
  };

  const generateDateRange = () => {
    const dates: string[] = [];
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Generate 30 days: 15 before today, today, and 14 after today
    for (let i = -15; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    setDateScrollDates(dates);

    // Set today as the selected date if not already set
    if (selectedDate !== todayString) {
      setSelectedDate(todayString);
    }

    // Auto-scroll to today's date after a short delay to ensure FlatList is rendered
    setTimeout(() => {
      const todayIndex = dates.findIndex(date => date === todayString);
      if (todayIndex !== -1 && dateScrollRef.current) {
        dateScrollRef.current.scrollToIndex({
          index: todayIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }
    }, 100);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        assignedTo: task.assignedTo,
        assignedUser: task.assignedTo.length > 0 ? task.assignedTo[0] : '', // Use first assignee as single assignee
        comment: '', // Reset comment field for new input
      });
    } else {
      setSelectedTask(null);
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      startDate: selectedDate,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      assignedTo: [],
      assignedUser: '',
      comment: '',
    });
  };

  const handleSubmit = async () => {
    // Developer can only edit status and add comments, not create new tasks
    if (!selectedTask && !isAdmin) {
      Alert.alert('Error', 'Only admins can create new tasks');
      return;
    }

    // For new tasks (admin only)
    if (
      !selectedTask &&
      (!taskForm.title.trim() ||
        !taskForm.description.trim() ||
        !taskForm.assignedUser.trim())
    ) {
      Alert.alert(
        'Error',
        'Please fill all required fields and assign to a user',
      );
      return;
    }

    // For developers editing existing tasks - only allow status and comment changes
    if (selectedTask && !isAdmin) {
      if (!taskForm.comment.trim() && selectedTask.status === taskForm.status) {
        Alert.alert('Error', 'Please add a comment or change the status');
        return;
      }
    }

    try {
      setSavingTask(true);

      if (selectedTask) {
        // Update existing task
        let updateData: any = {};

        if (isAdmin) {
          // Admin can update everything
          updateData = {
            ...taskForm,
            assignedTo: [taskForm.assignedUser],
            updatedBy: user?.uid || '',
            updatedAt: new Date().toISOString(),
          };

          // Add comment if provided - Add to comments array so everyone can see
          if (taskForm.comment.trim()) {
            const newComment = {
              id: Date.now().toString(),
              text: taskForm.comment.trim(),
              userId: user?.uid || '',
              userName: user?.name || user?.email?.split('@')[0] || 'Admin',
              timestamp: new Date().toISOString(),
              type: 'admin_update',
            };

            // Add to existing comments array or create new array
            updateData.comments = selectedTask.comments
              ? [...selectedTask.comments, newComment]
              : [newComment];
            updateData.lastCommentAt = new Date().toISOString();
            updateData.lastCommentBy = user?.uid || '';
          }
        } else {
          // Developer can only update status and add comments
          updateData = {
            status: taskForm.status,
            updatedBy: user?.uid || '',
            updatedAt: new Date().toISOString(),
          };

          // Add comment if provided - Add to comments array so everyone can see
          if (taskForm.comment.trim()) {
            const newComment = {
              id: Date.now().toString(),
              text: taskForm.comment.trim(),
              userId: user?.uid || '',
              userName: user?.name || user?.email?.split('@')[0] || 'Developer',
              timestamp: new Date().toISOString(),
              type: 'developer_update',
            };

            // Add to existing comments array or create new array
            updateData.comments = selectedTask.comments
              ? [...selectedTask.comments, newComment]
              : [newComment];
            updateData.lastCommentAt = new Date().toISOString();
            updateData.lastCommentBy = user?.uid || '';
          }
        }

        await dispatch(
          updateTask({
            taskId: selectedTask.id,
            updates: updateData,
          }),
        ).unwrap();

        Alert.alert(
          'Success',
          isAdmin
            ? 'Task updated successfully'
            : 'Task status updated successfully',
        );
      } else {
        // Create new task (admin only)
        const taskData = {
          ...taskForm,
          assignedTo: [taskForm.assignedUser],
          createdBy: user?.uid || '',
        };
        const { comment: _comment, ...taskDataWithoutComment } = taskData;
        await dispatch(createTask(taskDataWithoutComment)).unwrap();
        Alert.alert('Success', 'Task created successfully');
      }

      setModalVisible(false);
      resetForm();
      setSelectedTask(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
      console.error('Error saving task:', error);
    } finally {
      setSavingTask(false);
    }
  };

  const handleDelete = (task: Task) => {
    if (!isAdmin) {
      Alert.alert('Error', 'Only admins can delete tasks');
      return;
    }

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingTask(true);
              await dispatch(deleteTask(task.id)).unwrap();
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
              console.error('Error deleting task:', error);
            } finally {
              setDeletingTask(false);
            }
          },
        },
      ],
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return colors.error;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return colors.success;
      case 'In Progress':
        return colors.primary;
      case 'Pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getAssigneeName = (userId: string) => {
    const assignedUser = approvedUsers.find(u => u.uid === userId);
    return (
      assignedUser?.name || assignedUser?.email?.split('@')[0] || 'Unknown User'
    );
  };

  const toggleComments = (taskId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const EmptyTasksComponent = () => (
    <View style={styles.emptyState}>
      <Icon name="check" size={48} tintColor={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No tasks for {formatDate(selectedDate)}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {isAdmin
          ? 'Create a new task to get started'
          : 'No tasks assigned to you for this date'}
      </Text>
    </View>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderDateItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedDate;
    const date = new Date(item);

    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          { backgroundColor: colors.surface },
          isSelected && { backgroundColor: colors.primary },
          shadows.sm,
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text
          style={[
            styles.dateDay,
            { color: isSelected ? colors.textOnPrimary : colors.text },
          ]}
        >
          {date.getDate()}
        </Text>
        <Text
          style={[
            styles.dateWeekday,
            { color: isSelected ? colors.textOnPrimary : colors.textSecondary },
          ]}
        >
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View
      style={[styles.taskCard, { backgroundColor: colors.surface }, shadows.md]}
    >
      <View style={styles.taskHeader}>
        <Text
          style={[styles.taskTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {(isAdmin ||
          (item.assignedTo.includes(user?.uid || '') &&
            user?.role === 'developer')) && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={() => openModal(item)}
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <Icon name="edit" size="sm" tintColor={colors.primary} />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.error + '10' },
                ]}
              >
                <Icon name="delete" size="sm" tintColor={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Text
        style={[styles.taskDescription, { color: colors.textSecondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.taskMeta}>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(item.priority) + '20' },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              { color: getPriorityColor(item.priority) },
            ]}
          >
            {item.priority}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
        <Text style={[styles.assigneeCount, { color: colors.textSecondary }]}>
          {getAssigneeName(item.assignedTo[0]) || 'Unassigned'}
        </Text>
      </View>

      <View style={styles.taskTime}>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {new Date(item.startDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          -{' '}
          {new Date(item.endDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Comments section for admin only */}
      {isAdmin && item.comments && item.comments.length > 0 && (
        <View style={styles.taskCommentsSection}>
          <TouchableOpacity
            onPress={() => toggleComments(item.id)}
            style={styles.commentsToggle}
          >
            <Text
              style={[styles.commentsToggleText, { color: colors.primary }]}
            >
              💬 Comments ({item.comments.length})
            </Text>
            <Icon
              name={expandedComments[item.id] ? 'arrow-up' : 'arrow-down'}
              size={12}
              tintColor={colors.primary}
            />
          </TouchableOpacity>

          {expandedComments[item.id] && (
            <View
              style={[
                styles.taskCommentsDropdown,
                { backgroundColor: colors.background },
              ]}
            >
              {item.comments.slice(-3).map(comment => (
                <View key={comment.id} style={styles.taskCommentItem}>
                  <View style={styles.taskCommentHeader}>
                    <Text
                      style={[
                        styles.taskCommentAuthor,
                        { color: colors.primary },
                      ]}
                    >
                      {comment.userName}
                    </Text>
                    <Text
                      style={[
                        styles.taskCommentTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {new Date(comment.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text
                    style={[styles.taskCommentText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {comment.text}
                  </Text>
                </View>
              ))}
              {item.comments.length > 3 && (
                <TouchableOpacity
                  onPress={() => openModal(item)}
                  style={styles.viewAllComments}
                >
                  <Text
                    style={[
                      styles.viewAllCommentsText,
                      { color: colors.primary },
                    ]}
                  >
                    View all {item.comments.length} comments
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Enhanced Header */}
      <View
        style={[styles.header, { backgroundColor: colors.primary }, shadows.lg]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size="lg" tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => openModal()}
            style={[styles.addButton, shadows.sm]}
          >
            <Icon name="add" size="lg" tintColor="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date Selector */}
      <View style={styles.dateSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {formatDate(selectedDate)}
        </Text>
        <FlatList
          ref={dateScrollRef}
          data={dateScrollDates}
          renderItem={renderDateItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
          getItemLayout={(_, index) => ({
            length: 84, // 60 (minWidth) + 24 (gap/padding)
            offset: 84 * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            // Fallback if scrollToIndex fails
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
              dateScrollRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.5,
              });
            });
          }}
        />
      </View>

      {/* Tasks List */}
      {loadingData ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading tasks...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          style={styles.tasksList}
          contentContainerStyle={styles.tasksContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={EmptyTasksComponent}
        />
      )}

      {/* Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { backgroundColor: colors.primary }]}
          >
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
                setSelectedTask(null);
              }}
              style={styles.modalBackButton}
            >
              <Icon name="cancel" size={24} tintColor="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedTask ? 'Edit Task' : 'Create Task'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                  setSelectedTask(null);
                }}
                style={[styles.modalActionButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.modalActionButton,
                  styles.modalSaveButton,
                  savingTask && styles.modalSaveButtonDisabled,
                ]}
                disabled={savingTask}
              >
                <Text style={styles.modalSaveText}>
                  {savingTask ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Title *
                </Text>
                <TextInput
                  value={taskForm.title}
                  onChangeText={text =>
                    setTaskForm({ ...taskForm, title: text })
                  }
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Enter task title"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            )}

            {isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Description *
                </Text>
                <TextInput
                  value={taskForm.description}
                  onChangeText={text =>
                    setTaskForm({ ...taskForm, description: text })
                  }
                  style={[
                    styles.textArea,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Enter task description"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            {!isAdmin && selectedTask && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Task: {selectedTask.title}
                </Text>
                <Text
                  style={[
                    styles.taskDetailText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {selectedTask.description}
                </Text>
              </View>
            )}

            {isAdmin && (
              <View style={styles.assigneeSection}>
                <View style={styles.assigneeHeader}>
                  <Text
                    style={[
                      styles.inputLabel,
                      styles.assigneeLabelFlex,
                      { color: colors.text },
                    ]}
                  >
                    Assignee *
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Refresh button clicked!');
                      dispatch(fetchApprovedUsers())
                        .then(result => {
                          console.log('Manual fetch result:', result);
                        })
                        .catch(error => {
                          console.log('Manual fetch error:', error);
                        });
                    }}
                    style={styles.refreshIconContainer}
                  >
                    <Icon name="search" size={16} tintColor={colors.primary} />
                  </TouchableOpacity>
                </View>
                <Dropdown
                  data={
                    usersLoading
                      ? [{ label: 'Loading users...', value: '' }]
                      : approvedUsers.length === 0
                      ? [
                          {
                            label: 'No users available - Tap refresh',
                            value: '',
                          },
                        ]
                      : approvedUsers.map(approvedUser => ({
                          label:
                            approvedUser.name ||
                            approvedUser.displayName ||
                            approvedUser.email?.split('@')[0] ||
                            'Unknown User',
                          value: approvedUser.uid,
                        }))
                  }
                  selectedValue={taskForm.assignedUser}
                  onSelect={value => {
                    if (value !== '') {
                      setTaskForm({ ...taskForm, assignedUser: value });
                    }
                  }}
                  placeholder={
                    usersLoading
                      ? 'Loading users...'
                      : approvedUsers.length === 0
                      ? 'No users available'
                      : 'Select a user to assign'
                  }
                  disabled={usersLoading || approvedUsers.length === 0}
                />
              </View>
            )}

            {/* Today's Date Section - Non-editable, shows selected date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Today's Date
              </Text>
              <View
                style={[
                  styles.todayDateContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.todayDateContent}>
                  <Icon name="calendar" size={16} tintColor={colors.primary} />
                  <Text style={[styles.todayDateText, { color: colors.text }]}>
                    {formatDate(selectedDate)} -{' '}
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.todayDateLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Selected from date picker above
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              {isAdmin && (
                <View
                  style={[styles.inputGroup, styles.priorityInputContainer]}
                >
                  <Dropdown
                    label="Priority"
                    data={[
                      { label: 'Low', value: 'Low' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'High', value: 'High' },
                    ]}
                    selectedValue={taskForm.priority}
                    onSelect={value =>
                      setTaskForm({ ...taskForm, priority: value as any })
                    }
                    placeholder="Select priority"
                  />
                </View>
              )}

              <View
                style={[
                  styles.inputGroup,
                  isAdmin
                    ? styles.statusInputContainer
                    : styles.statusInputContainerNoMargin,
                ]}
              >
                <Dropdown
                  label="Status"
                  data={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Done', value: 'Done' },
                  ]}
                  selectedValue={taskForm.status}
                  onSelect={value =>
                    setTaskForm({ ...taskForm, status: value as any })
                  }
                  placeholder="Select status"
                />
              </View>
            </View>

            {isAdmin && (
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.dateInputContainer]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Start Date
                  </Text>
                  <TextInput
                    value={taskForm.startDate}
                    onChangeText={text =>
                      setTaskForm({ ...taskForm, startDate: text })
                    }
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.surface, color: colors.text },
                    ]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={[styles.inputGroup, styles.dateEndInputContainer]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    End Date
                  </Text>
                  <TextInput
                    value={taskForm.endDate}
                    onChangeText={text =>
                      setTaskForm({ ...taskForm, endDate: text })
                    }
                    style={[
                      styles.textInput,
                      { backgroundColor: colors.surface, color: colors.text },
                    ]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            )}

            {/* Comments Section - Show existing comments to everyone */}
            {selectedTask &&
              selectedTask.comments &&
              selectedTask.comments.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Comments ({selectedTask.comments.length})
                  </Text>
                  <ScrollView
                    style={styles.commentsContainer}
                    nestedScrollEnabled
                  >
                    {selectedTask.comments.map(comment => (
                      <View
                        key={comment.id}
                        style={[
                          styles.commentItem,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <View style={styles.commentHeader}>
                          <Text
                            style={[
                              styles.commentAuthor,
                              { color: colors.primary },
                            ]}
                          >
                            {comment.userName}
                          </Text>
                          <Text
                            style={[
                              styles.commentTime,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {new Date(comment.timestamp).toLocaleString()}
                          </Text>
                        </View>
                        <Text
                          style={[styles.commentText, { color: colors.text }]}
                        >
                          {comment.text}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

            {/* Developer Comment Field - Always show for existing tasks or when developer is editing */}
            {selectedTask && !isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Add Comment
                </Text>
                <TextInput
                  value={taskForm.comment}
                  onChangeText={text =>
                    setTaskForm({ ...taskForm, comment: text })
                  }
                  style={[
                    styles.textArea,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Add your comment about the task progress..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Admin can also add comments */}
            {selectedTask && isAdmin && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Add Comment (Optional)
                </Text>
                <TextInput
                  value={taskForm.comment}
                  onChangeText={text =>
                    setTaskForm({ ...taskForm, comment: text })
                  }
                  style={[
                    styles.textArea,
                    { backgroundColor: colors.surface, color: colors.text },
                  ]}
                  placeholder="Add a comment about this task update..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  addButton: {
    padding: 8,
  },
  dateSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateScroll: {
    marginHorizontal: -20,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateWeekday: {
    fontSize: 12,
    fontWeight: '500',
  },
  tasksList: {
    flex: 1,
  },
  tasksContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assigneeCount: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  taskTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalSaveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: '600',
    opacity: 0.8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  assigneeSection: {
    marginBottom: 16,
  },
  taskDetailText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveButtonDisabled: {
    opacity: 0.6,
  },
  assigneeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assigneeLabelFlex: {
    flex: 1,
  },
  refreshIconContainer: {
    padding: 4,
  },
  priorityInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusInputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  statusInputContainerNoMargin: {
    flex: 1,
    marginLeft: 0,
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateEndInputContainer: {
    flex: 1,
    marginLeft: 8,
  },
  commentsContainer: {
    maxHeight: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  commentItem: {
    padding: 8,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 10,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
  },
  // Task comments dropdown styles
  taskCommentsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  commentsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  commentsToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskCommentsDropdown: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  taskCommentItem: {
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  taskCommentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskCommentAuthor: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskCommentTime: {
    fontSize: 9,
  },
  taskCommentText: {
    fontSize: 11,
    lineHeight: 14,
  },
  viewAllComments: {
    marginTop: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  viewAllCommentsText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Today's Date styles
  todayDateContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  todayDateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayDateText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  todayDateLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default TaskScreen;
