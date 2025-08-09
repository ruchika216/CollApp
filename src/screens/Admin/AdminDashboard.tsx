import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchProjects,
  fetchUserProjects,
} from '../../store/slices/projectSlice';
import { fetchPendingUsers } from '../../store/slices/userSlice';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../../store/slices/taskSlice';
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../../store/slices/meetingSlice';
import firestoreService from '../../firebase/firestoreService';
import { User, Task, Meeting } from '../../types';
import Icon from '../../components/common/Icon';
import NotificationButton from '../../components/common/NotificationButton';
import ProjectList from '../Project/ProjectList';
import UserList from './UserList';
import PendingUsers from './PendingUsers';
import ThemeToggle from '../../components/common/ThemeToggle';
import ProjectCard from '../../components/projects/ProjectCard';
import UserApprovalCard from '../../components/admin/UserApprovalCard';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }: any) => {
  const { colors, gradients, shadows, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const projects = useAppSelector(state => state.projects.projects);
  const loading = useAppSelector(state => state.projects.loading);
  const pendingUsers = useAppSelector(state => state.user.pendingUsers);
  const userLoading = useAppSelector(state => state.user.loading);
  const tasks = useAppSelector(state => state.tasks.tasks);
  const taskLoading = useAppSelector(state => state.tasks.loading);
  const meetings = useAppSelector(state => state.meetings.meetings);
  const meetingLoading = useAppSelector(state => state.meetings.loading);

  // Modal states
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Done',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 7 days later
    assignedTo: [] as string[],
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    agenda: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'Group' as 'Individual' | 'Group',
    assignedTo: [] as string[],
  });

  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p =>
      ['In Progress', 'Review', 'Testing'].includes(p.status),
    ).length;
    const completedProjects = projects.filter(p => p.status === 'Done').length;
    const todoProjects = projects.filter(p => p.status === 'To Do').length;
    const pendingApprovals = pendingUsers.length;

    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;

    const totalMeetings = meetings.length;
    const upcomingMeetings = meetings.filter(
      m => new Date(m.date) > new Date(),
    ).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      todoProjects,
      pendingApprovals,
      totalTasks,
      activeTasks,
      completedTasks,
      totalMeetings,
      upcomingMeetings,
    };
  }, [projects, pendingUsers, tasks, meetings]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when screen comes into focus (after creating/editing projects)
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProjects()),
        dispatch(fetchPendingUsers()),
        dispatch(fetchTasks()),
        dispatch(fetchMeetings()),
        loadApprovedUsers(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadApprovedUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await firestoreService.getApprovedUsers();
      setApprovedUsers(users);
    } catch (error) {
      console.error('Error loading approved users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Task Management Functions
  const handleCreateTask = async () => {
    if (
      !taskForm.title.trim() ||
      !taskForm.description.trim() ||
      taskForm.assignedTo.length === 0
    ) {
      Alert.alert(
        'Error',
        'Please fill all required fields and assign to at least one user',
      );
      return;
    }

    try {
      const taskData = {
        ...taskForm,
        createdBy: user?.uid || '',
      };

      await dispatch(createTask(taskData)).unwrap();
      setTaskModalVisible(false);
      resetTaskForm();
      Alert.alert('Success', 'Task created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !taskForm.title.trim()) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      await dispatch(
        updateTask({
          taskId: selectedTask.id,
          updates: taskForm,
        }),
      ).unwrap();
      setTaskModalVisible(false);
      setSelectedTask(null);
      resetTaskForm();
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = (task: Task) => {
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
              await dispatch(deleteTask(task.id)).unwrap();
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
              console.error('Error deleting task:', error);
            }
          },
        },
      ],
    );
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      assignedTo: [],
    });
  };

  // Meeting Management Functions
  const handleCreateMeeting = async () => {
    if (
      !meetingForm.title.trim() ||
      !meetingForm.agenda.trim() ||
      meetingForm.assignedTo.length === 0
    ) {
      Alert.alert(
        'Error',
        'Please fill all required fields and assign to at least one user',
      );
      return;
    }

    try {
      const meetingDateTime = new Date(
        `${meetingForm.date}T${meetingForm.time}:00`,
      );
      const meetingData = {
        ...meetingForm,
        date: meetingDateTime.toISOString(),
        createdBy: user?.uid || '',
      };

      await dispatch(createMeeting(meetingData)).unwrap();
      setMeetingModalVisible(false);
      resetMeetingForm();
      Alert.alert('Success', 'Meeting scheduled successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule meeting');
      console.error('Error creating meeting:', error);
    }
  };

  const handleUpdateMeeting = async () => {
    if (!selectedMeeting || !meetingForm.title.trim()) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    try {
      const meetingDateTime = new Date(
        `${meetingForm.date}T${meetingForm.time}:00`,
      );
      const updateData = {
        ...meetingForm,
        date: meetingDateTime.toISOString(),
      };

      await dispatch(
        updateMeeting({
          meetingId: selectedMeeting.id,
          updates: updateData,
        }),
      ).unwrap();
      setMeetingModalVisible(false);
      setSelectedMeeting(null);
      resetMeetingForm();
      Alert.alert('Success', 'Meeting updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update meeting');
      console.error('Error updating meeting:', error);
    }
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    Alert.alert(
      'Delete Meeting',
      `Are you sure you want to delete "${meeting.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMeeting(meeting.id)).unwrap();
              Alert.alert('Success', 'Meeting deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meeting');
              console.error('Error deleting meeting:', error);
            }
          },
        },
      ],
    );
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      title: '',
      agenda: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'Group',
      assignedTo: [],
    });
  };

  const openTaskModal = (task?: Task) => {
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
      });
    } else {
      setSelectedTask(null);
      resetTaskForm();
    }
    setTaskModalVisible(true);
  };

  const openMeetingModal = (meeting?: Meeting) => {
    if (meeting) {
      setSelectedMeeting(meeting);
      const meetingDate = new Date(meeting.date);
      setMeetingForm({
        title: meeting.title,
        agenda: meeting.agenda,
        date: meetingDate.toISOString().split('T')[0],
        time: meetingDate.toTimeString().slice(0, 5),
        type: meeting.type,
        assignedTo: meeting.assignedTo,
      });
    } else {
      setSelectedMeeting(null);
      resetMeetingForm();
    }
    setMeetingModalVisible(true);
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

  const StatCard = ({ title, value, color, icon, onPress }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[color, `${color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statCard, shadows.md]}
      >
        <View style={styles.statContent}>
          <View style={styles.statHeader}>
            <Icon name={icon} size={24} tintColor="#fff" />
            <Text style={styles.statValue}>{value}</Text>
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.card }, shadows.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} tintColor={color} />
      </View>
      <Text style={[styles.quickActionText, { color: colors.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={Platform.OS === 'ios'}
      />

      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16 },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggle size={20} style={styles.themeToggle} />
            <NotificationButton
              onPress={() => navigation.navigate('NotificationScreen')}
              size={20}
              tintColor="#fff"
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboardData} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              color={colors.primary}
              icon="project"
              onPress={() => navigation.navigate('ProjectList')}
            />
            <StatCard
              title="Active"
              value={stats.activeProjects}
              color={colors.success}
              icon="dashboard"
              onPress={() =>
                navigation.navigate('ProjectList', { filter: 'active' })
              }
            />
            <StatCard
              title="Completed"
              value={stats.completedProjects}
              color={colors.info}
              icon="status"
              onPress={() =>
                navigation.navigate('ProjectList', { filter: 'completed' })
              }
            />
            <StatCard
              title="To Do"
              value={stats.todoProjects}
              color={colors.warning}
              icon="calendar"
              onPress={() =>
                navigation.navigate('ProjectList', { filter: 'todo' })
              }
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <QuickAction
              title="Create Project"
              icon="add"
              color={colors.primary}
              onPress={() =>
                navigation.navigate('Projects', { screen: 'ProjectForm' })
              }
            />
            <QuickAction
              title="Manage Users"
              icon="account"
              color={colors.secondary}
              onPress={() => navigation.navigate('UserList')}
            />
            <QuickAction
              title="Pending Approvals"
              icon="notification"
              color={colors.warning}
              onPress={() => navigation.navigate('PendingUsers')}
            />
          </View>
        </View>

        {/* Task Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Task Management
            </Text>
            <TouchableOpacity
              onPress={() => openTaskModal()}
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Icon name="add" size={20} tintColor="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.miniStatCard,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.miniStatValue, { color: colors.primary }]}>
                {stats.totalTasks}
              </Text>
              <Text style={[styles.miniStatLabel, { color: colors.text }]}>
                Total Tasks
              </Text>
            </View>
            <View
              style={[
                styles.miniStatCard,
                { backgroundColor: colors.warning + '20' },
              ]}
            >
              <Text style={[styles.miniStatValue, { color: colors.warning }]}>
                {stats.activeTasks}
              </Text>
              <Text style={[styles.miniStatLabel, { color: colors.text }]}>
                In Progress
              </Text>
            </View>
            <View
              style={[
                styles.miniStatCard,
                { backgroundColor: colors.success + '20' },
              ]}
            >
              <Text style={[styles.miniStatValue, { color: colors.success }]}>
                {stats.completedTasks}
              </Text>
              <Text style={[styles.miniStatLabel, { color: colors.text }]}>
                Completed
              </Text>
            </View>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="check" size={32} tintColor={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No tasks created yet
              </Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {tasks.slice(0, 3).map(task => (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    { backgroundColor: colors.card },
                    shadows.sm,
                  ]}
                >
                  <View style={styles.taskCardHeader}>
                    <Text
                      style={[styles.taskTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        onPress={() => openTaskModal(task)}
                        style={styles.actionButton}
                      >
                        <Icon
                          name="edit"
                          size={16}
                          tintColor={colors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTask(task)}
                        style={styles.actionButton}
                      >
                        <Icon
                          name="delete"
                          size={16}
                          tintColor={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.taskDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {task.description}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            getPriorityColor(task.priority) + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: getPriorityColor(task.priority) },
                        ]}
                      >
                        {task.priority}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(task.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(task.status) },
                        ]}
                      >
                        {task.status}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.assigneeCount,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {task.assignedTo.length} assignees
                    </Text>
                  </View>
                </View>
              ))}
              {tasks.length > 3 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => navigation.navigate('TaskScreen')}
                >
                  <Text
                    style={[styles.viewMoreText, { color: colors.primary }]}
                  >
                    View {tasks.length - 3} more tasks →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Meeting Arrangement Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meeting Arrangement
            </Text>
            <TouchableOpacity
              onPress={() => openMeetingModal()}
              style={[styles.addButton, { backgroundColor: colors.info }]}
            >
              <Icon name="add" size={20} tintColor="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.miniStatCard,
                { backgroundColor: colors.info + '20' },
              ]}
            >
              <Text style={[styles.miniStatValue, { color: colors.info }]}>
                {stats.totalMeetings}
              </Text>
              <Text style={[styles.miniStatLabel, { color: colors.text }]}>
                Total Meetings
              </Text>
            </View>
            <View
              style={[
                styles.miniStatCard,
                { backgroundColor: colors.warning + '20' },
              ]}
            >
              <Text style={[styles.miniStatValue, { color: colors.warning }]}>
                {stats.upcomingMeetings}
              </Text>
              <Text style={[styles.miniStatLabel, { color: colors.text }]}>
                Upcoming
              </Text>
            </View>
          </View>

          {meetings.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon
                name="calendar"
                size={32}
                tintColor={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No meetings scheduled yet
              </Text>
            </View>
          ) : (
            <View style={styles.meetingList}>
              {meetings.slice(0, 3).map(meeting => (
                <View
                  key={meeting.id}
                  style={[
                    styles.meetingCard,
                    { backgroundColor: colors.card },
                    shadows.sm,
                  ]}
                >
                  <View style={styles.meetingCardHeader}>
                    <Text
                      style={[styles.meetingTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {meeting.title}
                    </Text>
                    <View style={styles.meetingActions}>
                      <TouchableOpacity
                        onPress={() => openMeetingModal(meeting)}
                        style={styles.actionButton}
                      >
                        <Icon name="edit" size={16} tintColor={colors.info} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteMeeting(meeting)}
                        style={styles.actionButton}
                      >
                        <Icon
                          name="delete"
                          size={16}
                          tintColor={colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.meetingAgenda,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {meeting.agenda}
                  </Text>
                  <View style={styles.meetingMeta}>
                    <Text
                      style={[styles.meetingDate, { color: colors.primary }]}
                    >
                      {new Date(meeting.date).toLocaleDateString()} at{' '}
                      {new Date(meeting.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={styles.meetingType}>
                      <Text
                        style={[styles.meetingTypeText, { color: colors.info }]}
                      >
                        {meeting.type}
                      </Text>
                      <Text
                        style={[
                          styles.participantCount,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {meeting.assignedTo.length} participants
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              {meetings.length > 3 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => navigation.navigate('MeetingScreen')}
                >
                  <Text
                    style={[styles.viewMoreText, { color: colors.primary }]}
                  >
                    View {meetings.length - 3} more meetings →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Projects
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ProjectList')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <ProjectList />
        </View>

        {/* Pending Users */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pending Approvals
          </Text>
          <PendingUsers />
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Team Members
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserList')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Image Scroll */}
          <View style={styles.userScrollContainer}>
            <Text
              style={[styles.userScrollLabel, { color: colors.textSecondary }]}
            >
              Tap a team member to view their projects
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.userScroll}
            >
              {approvedUsers.map((teamUser, index) => (
                <TouchableOpacity
                  key={teamUser.uid}
                  style={[
                    styles.userImageContainer,
                    { marginLeft: index === 0 ? 0 : 12 },
                  ]}
                  onPress={() =>
                    navigation.navigate('ProjectListScreen', {
                      userSpecific: true,
                      userId: teamUser.uid,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.userImageWrapper,
                      { borderColor: colors.primary },
                    ]}
                  >
                    {teamUser.photoURL ? (
                      <Image
                        source={{ uri: teamUser.photoURL }}
                        style={styles.userImage}
                        defaultSource={require('../../assets/images/default-avatar.png')}
                      />
                    ) : (
                      <View
                        style={[
                          styles.defaultUserImage,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Text style={styles.userInitials}>
                          {(teamUser.name ||
                            teamUser.displayName ||
                            teamUser.email ||
                            'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.userName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {teamUser.name || teamUser.displayName || 'User'}
                  </Text>
                  <Text
                    style={[styles.userRole, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {teamUser.role || 'Member'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <UserList />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  miniStatCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
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
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  meetingList: {
    gap: 12,
  },
  meetingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  meetingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meetingTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  meetingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  meetingAgenda: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meetingMeta: {
    gap: 8,
  },
  meetingDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  meetingType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meetingTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantCount: {
    fontSize: 12,
  },
  userScrollContainer: {
    marginBottom: 16,
  },
  userScrollLabel: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  userScroll: {
    marginBottom: 16,
  },
  userImageContainer: {
    alignItems: 'center',
    width: 80,
  },
  userImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultUserImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});

export default AdminDashboard;
