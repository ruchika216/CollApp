import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';
import { deleteTask, setTasks } from '../../store/slices/taskSlice';
import { Task } from '../../types';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import TaskCardItem from '../../components/tasks/TaskCardItem';
import {
  getTasks,
  getUserTasks,
  deleteTaskFromFirestore,
} from '../../firebase/taskServices';

interface TaskListScreenProps {
  navigation: any;
  route?: any;
  userSpecific?: boolean;
  userId?: string;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({
  navigation,
  route,
  userSpecific = false,
  userId,
}) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.tasks);
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();

  // local ui state
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filter = route?.params?.filter;
  const isAdmin = user?.role === 'admin';
  const targetUserId = userId || user?.uid;

  // Status filter options
  const statusFilters = [
    { id: 'To Do', label: 'Todo', color: '#6B7280' },
    { id: 'In Progress', label: 'Active', color: '#2563EB' },
    { id: 'Review', label: 'Review', color: '#9333EA' },
    { id: 'Testing', label: 'Test', color: '#F59E0B' },
    { id: 'Completed', label: 'Done', color: '#10B981' },
  ];

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      let tasksData: Task[] = [];
      if (userSpecific && targetUserId) {
        tasksData = await getUserTasks(targetUserId);
      } else {
        tasksData = await getTasks();
      }
      dispatch(setTasks(tasksData));
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, userSpecific, targetUserId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Also refresh tasks when the component focuses (navigation returns to this screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });
    return unsubscribe;
  }, [navigation, loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleDelete = (task: Task) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can delete tasks');
      return;
    }

    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskFromFirestore(task.id);
              dispatch(deleteTask(task.id));
              Alert.alert('Success', 'Task deleted successfully');
            } catch (err) {
              console.error('Error deleting task:', err);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ],
    );
  };

  const handleAdd = () => {
    // Only admins can create tasks
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only administrators can create tasks');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create tasks');
      return;
    }
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    if (task.id) {
      navigation.navigate('TaskDetailScreen', { taskId: task.id });
    }
  };

  const handleTaskPress = (task: Task) => {
    if (!task.id) {
      Alert.alert('Error', 'Task ID is missing. Cannot navigate to details.');
      return;
    }
    navigation.navigate('TaskDetailScreen', { taskId: task.id });
  };

  // Filter tasks based on search and status filter
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        task =>
          (task.title || '').toLowerCase().includes(searchLower) ||
          (task.description || '').toLowerCase().includes(searchLower),
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    return filtered;
  }, [tasks, search, selectedStatus]);

  // Get status color function
  const getStatusColor = (status: Task['status']) => {
    const statusFilter = statusFilters.find(filter => filter.id === status);
    return statusFilter?.color || '#6B7280';
  };

  // Get priority color function
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

  // Function to map status to progress percentage
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

  // Render task item
  const renderTaskItem = ({ item }: { item: Task }) => {
    const canDevUpdate =
      !isAdmin &&
      Array.isArray(item.assignedTo) &&
      !!user?.uid &&
      item.assignedTo.includes(user.uid);

    return (
      <TaskCardItem
        task={item}
        colors={colors}
        isAdmin={!!isAdmin}
        canDevUpdate={canDevUpdate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPress={handleTaskPress}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        getProgressFromStatus={getProgressFromStatus}
      />
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} tintColor={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.titleText, { color: colors.text }]}>Tasks</Text>
          <View
            style={[
              styles.countPill,
              { backgroundColor: `${colors.primary}15` },
            ]}
          >
            <Text style={[styles.countPillText, { color: colors.primary }]}>
              {filteredTasks.length}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAdd}
          >
            <Icon name="add" size={20} tintColor="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBox, { backgroundColor: `${colors.card}80` }]}
        >
          <Icon name="search" size={16} tintColor={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close" size={16} tintColor={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusFilterContainer}
        style={styles.statusFilterScrollView}
      >
        <TouchableOpacity
          style={[
            styles.statusPill,
            {
              backgroundColor:
                selectedStatus === null ? colors.primary : `${colors.card}80`,
              borderWidth: selectedStatus === null ? 0 : 0.5,
              borderColor:
                selectedStatus === null ? 'transparent' : colors.border,
            },
          ]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text
            style={[
              styles.statusPillText,
              {
                color:
                  selectedStatus === null ? '#FFFFFF' : colors.textSecondary,
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {statusFilters.map(status => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  selectedStatus === status.id
                    ? status.color
                    : `${status.color}20`,
                borderWidth: selectedStatus === status.id ? 0 : 0.5,
                borderColor:
                  selectedStatus === status.id
                    ? 'transparent'
                    : `${status.color}60`,
              },
            ]}
            onPress={() => setSelectedStatus(status.id)}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    selectedStatus === status.id ? '#FFFFFF' : status.color,
                },
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: `${colors.card}40` },
          ]}
        >
          <Icon name="file" size={64} tintColor={`${colors.textSecondary}80`} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Tasks Found
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            {search || selectedStatus
              ? 'No tasks match your current filters. Try changing your search or filter criteria.'
              : isAdmin
              ? 'There are no tasks to display. Create your first task to get started.'
              : 'No tasks assigned to you yet. Tasks will appear here when assigned by administrators.'}
          </Text>
          {isAdmin && !search && !selectedStatus && (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleAdd}
            >
              <Icon name="add" size={18} tintColor="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Task</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Create Task Modal */}
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <CreateTaskModal
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              // Make sure to reload tasks after creating a new one
              loadTasks();
            }}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 20,
    paddingVertical: 0,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusFilterScrollView: {
    flexGrow: 0,
  },
  statusPill: {
    paddingHorizontal: 20, // Increased from 16 to 20 for wider pills
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TaskListScreen;
