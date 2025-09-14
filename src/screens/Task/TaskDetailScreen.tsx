import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';
import { Task, TaskComment, User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTasks } from '../../store/slices/taskSlice';
import firestoreService from '../../firebase/firestoreService';
import {
  getTask,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  addCommentToTask,
} from '../../firebase/taskServices';

// Import components
import TaskHeader from './components/TaskHeader';
import StatusPrioritySelector from './components/StatusPrioritySelector';
import EditableField from './components/EditableField';
import ProgressSection from './components/ProgressSection';
import TaskInfoCards from './components/TaskInfoCards';
import TaskCommentBox from '../../components/tasks/TaskCommentBox';

interface Props {
  route: { params: { taskId: string } };
}

const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [assignees, setAssignees] = useState<User[]>([]);
  const user = useAppSelector(s => s.auth.user);
  const [commenting, setCommenting] = useState(false);
  const isAdmin = user?.role === 'admin';
  const canEdit =
    isAdmin ||
    (task?.assignedTo?.includes(user?.uid || '') &&
      task?.status !== 'Completed');

  // Load task data
  useEffect(() => {
    (async () => {
      try {
        const t = await getTask(route.params.taskId);
        setTask(t);
        if (t) {
          setEditedTask({
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignedTo: t.assignedTo,
          });
        }

        // Get available users for assignment (admin only)
        if (isAdmin) {
          const users = await firestoreService.getApprovedUsers();
          setAssignees(users);
        }
      } catch (error) {
        console.error('Error loading task:', error);
        Alert.alert('Error', 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.taskId, isAdmin]);

  const handleSaveChanges = async () => {
    if (!task || !editedTask.title) return;

    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, editedTask);

      // Update local state
      setTask({
        ...task,
        ...editedTask,
      });

      setEditMode(false);
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    setEditedTask({
      ...editedTask,
      status: newStatus,
    });
  };

  const handlePriorityChange = (newPriority: Task['priority']) => {
    setEditedTask({
      ...editedTask,
      priority: newPriority,
    });
  };

  const handleAddComment = async (text: string) => {
    if (!task || !user || !text.trim()) return;

    try {
      setCommenting(true);

      const newComment: TaskComment = {
        id: Date.now().toString(),
        text: text.trim(),
        userId: user.displayName || user.email || 'User',
        createdAt: new Date().toISOString(),
      };

      // Add comment to Firestore
      await addCommentToTask(task.id, newComment);

      // Update local state
      setTask({
        ...task,
        comments: [...(task.comments || []), newComment],
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteTask = () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await deleteTaskFromFirestore(task.id);
              Alert.alert('Success', 'Task deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // Helper functions for task status and priority colors
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do':
        return '#6B7280'; // Gray
      case 'In Progress':
        return '#2563EB'; // Blue
      case 'Review':
        return '#9333EA'; // Purple
      case 'Testing':
        return '#F59E0B'; // Amber
      case 'Completed':
        return '#10B981'; // Green
      default:
        return colors.primary;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return '#EF4444'; // Red
      case 'Medium':
        return '#F59E0B'; // Amber
      case 'Low':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getProgressFromStatus = (status: Task['status']): number => {
    switch (status) {
      case 'To Do':
        return 0; // Not started - 0%
      case 'In Progress':
        return 40; // Work in progress - 40%
      case 'Review':
        return 75; // Review phase - 75%
      case 'Testing':
        return 90; // Testing phase - 90%
      case 'Completed':
        return 100; // Done - 100%
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading task details...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <Icon name="alert-circle" size={48} tintColor={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          Task not found
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} tintColor={colors.text} />
            </TouchableOpacity>

            <View style={styles.titleSection}>
              {editMode ? (
                <EditableField
                  value={editedTask.title || ''}
                  onChangeText={text =>
                    setEditedTask({ ...editedTask, title: text })
                  }
                  placeholder="Task Title"
                  multiline
                  style={styles.titleInput}
                />
              ) : (
                <Text style={[styles.title, { color: colors.text }]}>
                  {task.title}
                </Text>
              )}

              <View style={styles.metaRow}>
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  Created {new Date(task.createdAt).toLocaleDateString()}
                </Text>
                {task.dueDate && (
                  <View style={styles.dueDateContainer}>
                    <Icon
                      name="calendar"
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                    <Text
                      style={[styles.metaText, { color: colors.textSecondary }]}
                    >
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            {canEdit && (
              <TouchableOpacity
                style={[
                  styles.editButton,
                  {
                    backgroundColor: editMode ? colors.success : colors.primary,
                  },
                ]}
                onPress={() => {
                  if (editMode) {
                    handleSaveChanges();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon
                      name={editMode ? 'check' : 'edit-2'}
                      size={18}
                      tintColor="#fff"
                    />
                    <Text style={styles.editButtonText}>
                      {editMode ? 'Save' : 'Edit'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {isAdmin && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteTask}
                disabled={updating}
              >
                <Icon name="trash-2" size={18} tintColor="#fff" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            {editMode && (
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  setEditMode(false);
                  // Reset edited task to current task
                  if (task) {
                    setEditedTask({
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      priority: task.priority,
                      dueDate: task.dueDate,
                      assignedTo: task.assignedTo,
                    });
                  }
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status & Priority Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Status & Priority
          </Text>

          <View style={styles.statusPriorityRow}>
            <View style={styles.statusContainer}>
              <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                Status
              </Text>
              {editMode ? (
                <View style={styles.statusOptions}>
                  {[
                    'To Do',
                    'In Progress',
                    'Review',
                    'Testing',
                    'Completed',
                  ].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusOption,
                        {
                          backgroundColor:
                            editedTask.status === s
                              ? getStatusColor(s as Task['status'])
                              : `${getStatusColor(s as Task['status'])}20`,
                        },
                      ]}
                      onPress={() => handleStatusChange(s as Task['status'])}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          {
                            color:
                              editedTask.status === s
                                ? '#fff'
                                : getStatusColor(s as Task['status']),
                          },
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(task.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{task.status}</Text>
                </View>
              )}
            </View>

            <View style={styles.priorityContainer}>
              <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                Priority
              </Text>
              {editMode ? (
                <View style={styles.priorityOptions}>
                  {['High', 'Medium', 'Low'].map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityOption,
                        {
                          backgroundColor:
                            editedTask.priority === p
                              ? getPriorityColor(p as Task['priority'])
                              : `${getPriorityColor(p as Task['priority'])}20`,
                        },
                      ]}
                      onPress={() =>
                        handlePriorityChange(p as Task['priority'])
                      }
                    >
                      <Text
                        style={[
                          styles.priorityOptionText,
                          {
                            color:
                              editedTask.priority === p
                                ? '#fff'
                                : getPriorityColor(p as Task['priority']),
                          },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(task.priority) },
                  ]}
                >
                  <Text style={styles.priorityBadgeText}>{task.priority}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                Progress
              </Text>
              <Text style={[styles.progressValue, { color: colors.text }]}>
                {getProgressFromStatus(task.status)}%
              </Text>
            </View>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: `${colors.text}10` },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: getStatusColor(task.status),
                    width: `${getProgressFromStatus(task.status)}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          {editMode ? (
            <EditableField
              value={editedTask.description || ''}
              onChangeText={text =>
                setEditedTask({ ...editedTask, description: text })
              }
              placeholder="Add a description for this task..."
              multiline
              style={[
                styles.descriptionInput,
                { backgroundColor: `${colors.card}50` },
              ]}
            />
          ) : (
            <Text style={[styles.description, { color: colors.text }]}>
              {task.description || 'No description provided.'}
            </Text>
          )}
        </View>

        {/* Assignees Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Assigned To
          </Text>
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <View style={styles.assigneesList}>
              {task.assignedTo.map((userId, index) => (
                <View
                  key={userId + index}
                  style={[
                    styles.assigneeItem,
                    { backgroundColor: `${colors.card}80` },
                  ]}
                >
                  <View
                    style={[
                      styles.assigneeAvatar,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.assigneeInitial}>
                      {userId.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.assigneeName, { color: colors.text }]}>
                    {userId}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No assignees
            </Text>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Activity & Comments
            </Text>
            <View
              style={[
                styles.commentsBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.commentsBadgeText}>
                {task.comments ? task.comments.length : 0}
              </Text>
            </View>
          </View>

          <TaskCommentBox
            comments={task.comments || []}
            onAddComment={handleAddComment}
            currentUserName={user?.displayName || user?.email || 'User'}
            isLoading={commenting}
            canComment={true}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    padding: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPriorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusContainer: {
    flex: 1,
    marginRight: 8,
  },
  priorityContainer: {
    flex: 1,
    marginLeft: 8,
  },
  labelText: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  priorityOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  assigneesList: {
    marginTop: 8,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assigneeInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  commentsBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;
