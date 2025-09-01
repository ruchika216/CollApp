import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '../theme/useTheme';
import AppText from '../components/common/AppText';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProjects, fetchUserProjects } from '../store/slices/projectSlice';
import {
  fetchTasks,
  subscribeToTasks,
  unsubscribeFromTasks,
} from '../store/slices/taskSlice';
import {
  fetchMeetings,
  fetchUserMeetings,
  fetchUpcomingMeetings,
} from '../store/slices/meetingSlice';
import { fetchApprovedUsers } from '../store/slices/userSlice';
import { Task, Meeting } from '../types';
import WelcomeCardSection from '../components/homepage/WelcomeCard';
import UsersScrollBarSection from '../components/homepage/UsersScrollBar';
import TodaysTasksCardSection from '../components/homepage/TodaysTasksCard';
import UpcomingMeetingsSection from '../components/homepage/UpcomingMeetingsSection';
import AllTasksScrollSection from '../components/homepage/AllTasksScrollSection';
import ProjectCardsSection from '../components/homepage/ProjectCardsSection';
import QuickActionsGrid from '../components/homepage/QuickActionsGrid';
import TodaysScheduleSection from '../components/homepage/TodaysScheduleSection';
import SectionCarousel from '../components/homepage/SectionCarousel';
import {
  filterUpcomingMeetings,
  filterTodaysMeetings,
} from '../utils/meetingUtils';

// const { width } = Dimensions.get('window');

import type { BottomTabScreenPropsType } from '../types/navigation';

interface HomeScreenProps extends BottomTabScreenPropsType<'Home'> {}

const HomeScreenEnhanced: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const projects = useAppSelector(state => state.projects.projects);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  const allTasks = useAppSelector(state => state.tasks.tasks);
  // const userTasks = useAppSelector(state => state.tasks.userTasks);
  const allMeetings = useAppSelector(state => state.meetings.meetings);
  const userMeetings = useAppSelector(state => state.meetings.userMeetings);
  const approvedUsers = useAppSelector(state => state.user.approvedUsers);

  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<Meeting[]>([]);
  const [nextMeetings, setNextMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userUid = user?.uid;
  const userRole = user?.role;
  const isAdmin = userRole === 'admin';
  const displayProjects = isAdmin ? projects : userProjects;
  const displayTasks = allTasks; // Show all tasks to all users
  const displayMeetings = isAdmin ? allMeetings : userMeetings; // Show appropriate meetings based on role

  const loadTodaysData = useCallback(async () => {
    if (!user || !user.approved) {
      setTodaysTasks([]);
      setTodaysMeetings([]);
      setNextMeetings([]);
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const todaysTasksFiltered = displayTasks.filter(task => {
        const taskDate = new Date(task.startDate).toISOString().split('T')[0];
        return taskDate === today;
      });
      const userSpecificMeetings = isAdmin ? displayMeetings : userMeetings;
      const todaysMeetingsFiltered = filterTodaysMeetings(userSpecificMeetings);
      const upcomingMeetingsFiltered = filterUpcomingMeetings(
        userSpecificMeetings,
        5,
      );

      setTodaysTasks(todaysTasksFiltered);
      setTodaysMeetings(todaysMeetingsFiltered);
      setNextMeetings(upcomingMeetingsFiltered);
    } catch (error) {
      console.error("Error loading today's data:", error);
      setTodaysTasks([]);
      setTodaysMeetings([]);
      setNextMeetings([]);
    }
  }, [user, displayTasks, isAdmin, displayMeetings, userMeetings]);

  const loadHomeData = useCallback(async () => {
    if (!userUid) {
      // No user yet; don't keep spinner on indefinitely
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const admin = userRole === 'admin';
      const promises: Array<Promise<any>> = [];
      if (admin) {
        promises.push(dispatch(fetchProjects()) as unknown as Promise<any>);
        promises.push(dispatch(fetchMeetings()) as unknown as Promise<any>);
      } else {
        promises.push(
          dispatch(fetchUserProjects(userUid)) as unknown as Promise<any>,
        );
        promises.push(
          dispatch(fetchUserMeetings(userUid)) as unknown as Promise<any>,
        );
      }
      promises.push(dispatch(fetchTasks()) as unknown as Promise<any>);
      promises.push(
        dispatch(
          fetchUpcomingMeetings({ userId: userUid, limit: 5 }),
        ) as unknown as Promise<any>,
      );
      promises.push(dispatch(fetchApprovedUsers()) as unknown as Promise<any>);

      // Await completion of dispatched thunks (without unwrap to avoid throw)
      await Promise.all(promises);
      // Do not call loadTodaysData here; separate effect will update it as store changes
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, userUid, userRole]);

  // Load initial data (runs when dependencies of loadHomeData change)
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // If user is not available, ensure we don't show endless loading
  useEffect(() => {
    if (!userUid) {
      setLoading(false);
    }
  }, [userUid]);

  // Manage real-time subscription separately; only depends on user id/approval
  useEffect(() => {
    if (user?.approved) {
      console.log(
        'HomeScreen: Subscribing to tasks for user:',
        userRole,
        userUid,
      );
      dispatch(subscribeToTasks());
      return () => {
        dispatch(unsubscribeFromTasks());
      };
    }
    // If not approved or no user, ensure we clean up any existing subscription
    return () => {
      dispatch(unsubscribeFromTasks());
    };
  }, [dispatch, user?.approved, userUid, userRole]);

  // Update today's data whenever tasks or meetings change
  useEffect(() => {
    if (user && user.approved) {
      loadTodaysData();
    }
  }, [allTasks, allMeetings, user, loadTodaysData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
      case 'Pending':
        return colors.warning;
      case 'In Progress':
        return colors.primary;
      case 'Done':
        return colors.success;
      case 'Testing':
        return colors.info;
      case 'Review':
        return '#9C27B0';
      case 'Deployment':
        return '#FF5722';
      default:
        return colors.textSecondary;
    }
  };

  const getAssigneeName = (userId: string) => {
    const foundUser = approvedUsers.find(u => u.uid === userId);
    return (
      foundUser?.name ||
      foundUser?.displayName ||
      foundUser?.email?.split('@')[0] ||
      'Unknown User'
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

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <AppText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <WelcomeCardSection
          shadows={shadows}
          greeting={getGreeting()}
          userName={user?.name || user?.email?.split('@')[0]}
        />
        {/* Users ScrollBar */}
        <UsersScrollBarSection
          approvedUsers={approvedUsers}
          shadows={shadows}
        />

        {/* Quick actions grid (glassy, blue) */}
        <QuickActionsGrid
          shadows={shadows}
          actions={[
            {
              key: 'tasks',
              label: 'Tasks',
              icon: 'dashboard',
              onPress: () => navigation.navigate('TaskScreen' as never),
            },
            {
              key: 'meet',
              label: 'Meetings',
              icon: 'calendar',
              onPress: () => navigation.navigate('MeetingScreen' as never),
            },
            {
              key: 'projects',
              label: 'Projects',
              icon: 'project',
              onPress: () => navigation.navigate('ProjectListScreen' as never),
            },
            {
              key: 'profile',
              label: 'Profile',
              icon: 'user',
              onPress: () => navigation.navigate('ProfileScreen' as never),
            },
            {
              key: 'files',
              label: 'Files',
              icon: 'file',
              onPress: () => navigation.navigate('ProjectListScreen' as never),
            },
            {
              key: 'reports',
              label: 'Reports',
              icon: 'status',
              onPress: () => navigation.navigate('ReportScreen' as never),
            },
          ]}
        />

        {/* Spotlight carousel: swipe between Today’s Tasks, Today, and Upcoming */}
        <SectionCarousel
          contentPaddingHorizontal={0}
          sections={[
            {
              key: 'today_tasks',
              render: () => (
                <TodaysTasksCardSection
                  todaysTasks={todaysTasks}
                  navigation={navigation}
                  shadows={shadows}
                />
              ),
            },
            {
              key: 'today_schedule',
              render: () => (
                <TodaysScheduleSection
                  items={todaysMeetings}
                  shadows={shadows}
                />
              ),
            },
            {
              key: 'upcoming_meetings',
              render: () => (
                <UpcomingMeetingsSection
                  nextMeetings={nextMeetings}
                  navigation={navigation}
                  shadows={shadows}
                />
              ),
            },
          ]}
        />

        {/* All Tasks Scroll Section */}
        <AllTasksScrollSection
          displayTasks={displayTasks}
          navigation={navigation}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
          getAssigneeName={getAssigneeName}
          shadows={shadows}
        />

        {/* Project Cards */}
        <ProjectCardsSection
          displayProjects={displayProjects}
          navigation={navigation}
          isAdmin={isAdmin}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
  },
  welcomeCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  welcomeIconContainer: {
    marginLeft: 16,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  usersScroll: {
    paddingLeft: 20,
  },
  usersContainer: {
    paddingRight: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    width: 70,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  allTasksButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allTasksText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
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
  assigneeText: {
    fontSize: 11,
    marginLeft: 8,
  },
  moreItemsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  meetingsScroll: {
    paddingBottom: 8,
  },
  meetingsContainer: {
    paddingHorizontal: 4,
  },
  meetingCard: {
    width: 200,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  meetingTime: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  meetingAgenda: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  meetingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meetingType: {
    fontSize: 10,
    fontWeight: '600',
  },
  participantsCount: {
    fontSize: 10,
  },
  meetingCardWrapper: {
    width: 280,
    marginRight: 16,
  },
  projectCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyProjectsState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  // All Tasks Scroll Styles
  tasksScroll: {
    paddingLeft: 20,
  },
  tasksScrollContainer: {
    paddingRight: 20,
  },
  taskScrollCard: {
    width: 240,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    minHeight: 180,
  },
  taskScrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskScrollTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  taskScrollPriority: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskScrollPriorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  taskScrollDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    minHeight: 54, // 3 lines
  },
  taskScrollMeta: {
    marginBottom: 12,
  },
  taskScrollStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  taskScrollStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskScrollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  taskScrollAssignee: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  taskScrollDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Today's Tasks Scroll Styles
  todaysTasksScroll: {
    paddingLeft: 4,
  },
  todaysTasksScrollContainer: {
    paddingRight: 16,
  },
  todaysTaskCard: {
    width: 200,
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    minHeight: 140,
  },
  todaysTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  todaysTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  todaysTaskPriority: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todaysTaskPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  todaysTaskDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
    minHeight: 32, // 2 lines
  },
  todaysTaskMeta: {
    marginBottom: 8,
  },
  todaysTaskStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  todaysTaskStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  todaysTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  todaysTaskAssignee: {
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  todaysTaskDateTime: {
    alignItems: 'flex-end',
  },
  todaysTaskDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  todaysTaskTime: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default HomeScreenEnhanced;
