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
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';
import { deleteTask, setTasks } from '../../store/slices/taskSlice';
import { Task } from '../../types';
import CreateTaskModal from '../../components/tasks/CreateTaskModal';
import {
  getTasks,
  getUserTasks,
  deleteTaskFromFirestore,
} from '../../firebase/taskServices';

// Separate item component to satisfy lint rules and avoid redefining components on each render
type ThemeColors = ReturnType<typeof useTheme>['colors'];

interface TaskCardItemProps {
  task: Task;
  colors: ThemeColors;
  isAdmin: boolean;
  canDevUpdate?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPress: (task: Task) => void;
  getStatusColor: (s: Task['status']) => string;
  getPriorityColor: (p: Task['priority']) => string;
  getProgressFromStatus: (status: Task['status']) => number;
}

const TaskCardItem: React.FC<TaskCardItemProps> = ({
  task,
  colors,
  isAdmin,
  canDevUpdate,
  onEdit,
  onDelete,
  onPress,
  getStatusColor,
  getPriorityColor,
  getProgressFromStatus,
}) => {
  const assigneeLabel = task.assignedTo
    ?.map((uid: string) => uid || 'User')
    .join(', ');

  // Truncate description to around 15-20 words
  const truncateDescription = (text: string, wordLimit: number = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      style={[
        styles.taskCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.text,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          borderLeftWidth: 4,
          borderLeftColor: getStatusColor(task.status),
        },
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>
            {task.title}
          </Text>
          <View style={styles.taskActions}>
            {/* Only admin can edit */}
            {isAdmin && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => onEdit(task)}
              >
                <Icon name="edit" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
            {/* Only admin can delete */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => onDelete(task)}
              >
                <Icon name="delete" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
            {/* Show status update button for assigned developers */}
            {!isAdmin && canDevUpdate && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => onEdit(task)}
              >
                <Icon name="edit" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
          {truncateDescription(task.description || '')}
        </Text>
      </View>
      <View style={styles.taskMeta}>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${getStatusColor(task.status)}20` },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: getStatusColor(task.status) }]}
            >
              {task.status}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${getPriorityColor(task.priority)}20` },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getPriorityColor(task.priority) },
              ]}
            >
              {task.priority}
            </Text>
          </View>
        </View>

        {/* Progress bar - like in project screen */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text
              style={[styles.progressText, { color: colors.textSecondary }]}
            >
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

        <View style={styles.taskInfo}>
          {task.dueDate && (
            <View style={styles.infoItem}>
              <Icon
                name="calendar"
                size={16}
                tintColor={colors.textSecondary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {task.assignedTo && task.assignedTo.length > 0 && (
            <View style={styles.avatarContainer}>
              {task.assignedTo.slice(0, 3).map((uid, index) => {
                const avatarStyle = [
                  styles.avatar,
                  { backgroundColor: colors.primary },
                ];
                if (index > 0) {
                  avatarStyle.push({ marginLeft: -8 });
                }
                return (
                  <View key={uid} style={avatarStyle}>
                    <Text style={styles.avatarText}>
                      {uid.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                );
              })}
              {task.assignedTo.length > 3 && (
                <Text
                  style={[
                    styles.extraAvatarCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  +{task.assignedTo.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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

  // local ui state
  const [modalVisible, setModalVisible] = useState(false);
  const [_selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // visual filters/search for everyone (admin and user)
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState<
    'all' | 'active' | 'pending' | 'completed'
  >('active');

  const filter = route?.params?.filter;
  const isAdmin = user?.role === 'admin';
  const targetUserId = userId || user?.uid;

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
      Alert.alert(
        'Permission Denied',
        'Only administrators can create tasks in the system',
      );
      return;
    }
    setSelectedTask(null);
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    // Only allow admin to edit tasks
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only administrators can edit tasks');
      return;
    }

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

  // Filtered list for admin visuals
  const adminVisuallyFiltered = useMemo(() => {
    let data = tasks;
    if (isAdmin) {
      if (adminFilter !== 'all') {
        data = data.filter(p => {
          if (adminFilter === 'active') {
            return ['In Progress', 'Review', 'Testing'].includes(
              p.status as any,
            );
          }
          if (adminFilter === 'pending') return p.status === 'To Do';
          if (adminFilter === 'completed') return p.status === 'Completed';
          return true;
        });
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    return data;
  }, [tasks, isAdmin, adminFilter, search]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'To Do':
        return '#FF3B30';
      case 'In Progress':
        return '#007AFF';
      case 'Review':
        return '#FF9500';
      case 'Testing':
        return '#30D158';
      case 'Completed':
        return '#34C759';
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Low':
        return '#6B7280';
      case 'Medium':
        return '#2563EB';
      case 'High':
        return '#DC2626';
      default:
        return colors.textSecondary;
    }
  };

  // Function to map status to progress percentage - like in project screen
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
          { backgroundColor: colors.background },
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
      {isAdmin && !userSpecific ? (
        <>
          {/* Admin header with back button */}
          <View style={styles.adminHeader}>
            <View style={styles.adminHeaderLeft}>
              <TouchableOpacity
                style={[
                  styles.backButton,
                  { backgroundColor: `${colors.text}10` },
                ]}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={20} tintColor={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.adminTitle, { color: colors.text }]}>
                Tasks
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Text style={[styles.countPillText, { color: colors.primary }]}>
                  {tasks.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.newBtn, { backgroundColor: colors.primary }]}
            >
              <Icon name="add" size={18} tintColor="#fff" />
              <Text style={styles.newBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {/* Filter chips */}
          <View style={styles.controlsRow}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: colors.card },
                shadows.sm,
              ]}
            >
              <Icon name="search" size={16} tintColor={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>{tasks.length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'completed' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('completed')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'completed' && styles.filterChipTextActive,
                  ]}
                >
                  Complete
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'Completed').length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'pending' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('pending')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'pending' && styles.filterChipTextActive,
                  ]}
                >
                  To Do
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'To Do').length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'active' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('active')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'active' && styles.filterChipTextActive,
                  ]}
                >
                  In Review
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'Review').length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {adminVisuallyFiltered.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: colors.card },
                  shadows.sm,
                ]}
              >
                <Icon name="project" size={48} tintColor={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Tasks Found
                </Text>
                <Text
                  style={[styles.emptyMessage, { color: colors.textSecondary }]}
                >
                  {search || adminFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'No tasks have been created yet.'}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAdd}
                >
                  <Icon name="add" size={20} tintColor="#fff" />
                  <Text style={styles.createButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={adminVisuallyFiltered}
                key={'admin-list'}
                keyExtractor={item => item.id}
                renderItem={renderTaskItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                  />
                }
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </>
      ) : (
        <>
          {/* User header with back button and add button for admins */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.backButton,
                { backgroundColor: `${colors.text}10` },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} tintColor={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.titleText, { color: colors.text }]}>
                Tasks
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Text style={[styles.countPillText, { color: colors.primary }]}>
                  {tasks.length}
                </Text>
              </View>
            </View>
            {isAdmin && (
              <TouchableOpacity
                style={[styles.newBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Icon name="add" size={18} tintColor="#fff" />
                <Text style={styles.newBtnText}>New</Text>
              </TouchableOpacity>
            )}
            {!isAdmin && <View style={styles.placeholder} />}
          </View>

          {/* User: Search and chips (same as admin) */}
          <View style={styles.controlsRow}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: colors.card },
                shadows.sm,
              ]}
            >
              <Icon name="search" size={16} tintColor={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>{tasks.length}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'completed' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('completed')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'completed' && styles.filterChipTextActive,
                  ]}
                >
                  Complete
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'Completed').length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'pending' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('pending')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'pending' && styles.filterChipTextActive,
                  ]}
                >
                  To Do
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'To Do').length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  adminFilter === 'active' && styles.filterChipActive,
                ]}
                onPress={() => setAdminFilter('active')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    adminFilter === 'active' && styles.filterChipTextActive,
                  ]}
                >
                  In Review
                </Text>
                <View style={styles.filterChipCount}>
                  <Text style={styles.filterChipCountText}>
                    {tasks.filter(t => t.status === 'Review').length}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            {adminVisuallyFiltered.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: colors.card },
                  shadows.sm,
                ]}
              >
                <Icon name="project" size={48} tintColor={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Tasks Found
                </Text>
                <Text
                  style={[styles.emptyMessage, { color: colors.textSecondary }]}
                >
                  {search || adminFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : userSpecific
                    ? 'No tasks assigned to this user yet.'
                    : filter
                    ? `No ${filter} tasks at the moment.`
                    : 'No tasks have been created yet.'}
                </Text>
                {isAdmin && !userSpecific && (
                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAdd}
                  >
                    <Icon name="add" size={20} tintColor="#fff" />
                    <Text style={styles.createButtonText}>Create Task</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={adminVisuallyFiltered}
                key={'user-list'}
                keyExtractor={item => item.id}
                renderItem={renderTaskItem}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                  />
                }
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </>
      )}

      {/* No floating action button; bottom nav is present */}

      {isAdmin && modalVisible && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
          presentationStyle="pageSheet"
        >
          <CreateTaskModal
            visible={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setSelectedTask(null);
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
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingBottom: 40 },
  loadingText: { marginTop: 12, fontSize: 16 },
  listContainer: { paddingBottom: 40 },
  listContainerGrid: { paddingBottom: 40, paddingTop: 8 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: { fontSize: 22, fontWeight: '700' },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addInlineButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: { width: 36, height: 36 },

  taskCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 4,
  },
  taskHeader: { marginBottom: 12 },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 12 },
  taskActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDescription: { fontSize: 14, lineHeight: 20 },
  taskMeta: { gap: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13 },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  extraAvatarCount: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  avatarCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: { gap: 4, marginVertical: 8 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: { fontSize: 12 },
  progressValue: { fontSize: 12, fontWeight: '600' },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  tileProgressBar: { marginTop: 8 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
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
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  adminHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminTitle: { fontSize: 22, fontWeight: '800' },
  controlsRow: { paddingHorizontal: 20, gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb33',
  },
  chipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#fff' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#222222',
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    color: '#222222',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipCount: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridColumnWrapper: { gap: 12 },
  adminTile: {
    flex: 1,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tileTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  tileActions: { flexDirection: 'row', gap: 6 },
  tileActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDesc: { fontSize: 12, lineHeight: 18 },
  tileBadgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tileBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  tileBadgeText: { fontSize: 11, fontWeight: '700' },
});

export default TaskListScreen;
