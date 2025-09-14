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
  Alert,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchProjects } from '../../store/slices/projectSlice';
import { fetchPendingUsers } from '../../store/slices/userSlice';
import { fetchMeetings, deleteMeeting } from '../../store/slices/meetingSlice';
import firestoreService from '../../firebase/firestoreService';
import { User, Meeting } from '../../types';
import Icon from '../../components/common/Icon';
import NotificationButton from '../../components/common/NotificationButton';
import ProjectList from '../Project/ProjectList';
import UserList from './UserList';
import PendingUsers from './PendingUsers';
import ThemeToggle from '../../components/common/ThemeToggle';
// import ProjectCard from '../../components/projects/ProjectCard';
// import UserApprovalCard from '../../components/admin/UserApprovalCard';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }: any) => {
  const { colors, gradients, shadows } = useTheme();
  useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const projects = useAppSelector(state => state.projects.projects);
  const loading = useAppSelector(state => state.projects.loading);
  const pendingUsers = useAppSelector(state => state.user.pendingUsers);
  const meetings = useAppSelector(state => state.meetings.meetings);

  // Modal states
  // Meeting modal state removed; navigating to MeetingScreen instead

  // Form states
  // Task management removed

  // Meeting form state removed

  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [_loadingUsers, setLoadingUsers] = useState(false);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p =>
      ['In Progress', 'Review', 'Testing'].includes(p.status),
    ).length;
    const completedProjects = projects.filter(p => p.status === 'Done').length;
    const todoProjects = projects.filter(p => p.status === 'To Do').length;
    const pendingApprovals = pendingUsers.length;

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
      totalMeetings,
      upcomingMeetings,
    };
  }, [projects, pendingUsers, meetings]);

  const loadApprovedUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const users = await firestoreService.getApprovedUsers();
      setApprovedUsers(users);
    } catch (error) {
      console.error('Error loading approved users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchProjects()),
        dispatch(fetchPendingUsers()),
        dispatch(fetchMeetings()),
        loadApprovedUsers(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [dispatch, loadApprovedUsers]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Refresh data when screen comes into focus (after creating/editing projects)
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData]),
  );

  // Task management removed

  // Meeting Management Functions

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

  // Meeting form helpers removed

  // Task modal removed

  // Meeting modal removed

  // Task helpers removed

  // Small presentational components extracted to avoid re-defining on each render
  const StatCard = useCallback(
    ({ title, value, color, icon, onPress }: any) => {
      return (
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
    },
    [shadows.md],
  );

  const QuickAction = useCallback(
    ({ title, icon, onPress, color }: any) => {
      return (
        <TouchableOpacity
          style={[
            styles.quickAction,
            { backgroundColor: colors.card },
            shadows.sm,
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}
          >
            <Icon name={icon} size={24} tintColor={color} />
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>
            {title}
          </Text>
        </TouchableOpacity>
      );
    },
    [colors.card, colors.text, shadows.sm],
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
        style={styles.header}
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

        {/* Task Management Section removed */}

        {/* Meeting Arrangement Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meeting Arrangement
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MeetingScreen')}
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
                        onPress={() =>
                          navigation.navigate('MeetingScreen', {
                            meetingId: meeting.id,
                          })
                        }
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
              {approvedUsers.map(teamUser => (
                <TouchableOpacity
                  key={teamUser.uid}
                  style={styles.userImageContainer}
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
                    style={[styles.teamUserName, { color: colors.text }]}
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
  teamUserName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
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
  userRole: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});

export default AdminDashboard;
