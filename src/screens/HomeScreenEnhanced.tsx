import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Button,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import AppText from '../components/common/AppText';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProjects, fetchUserProjects } from '../store/slices/projectSlice';
import {
  fetchMeetings,
  fetchUserMeetings,
  fetchUpcomingMeetings,
} from '../store/slices/meetingSlice';
import { fetchApprovedUsers } from '../store/slices/userSlice';
import { Meeting, Task } from '../types';
import WelcomeCardSection from '../components/homepage/WelcomeCard';
import UsersScrollBarSection from '../components/homepage/UsersScrollBar';
import UpcomingMeetingsSection from '../components/homepage/UpcomingMeetingsSection';
import ProjectCardsSection from '../components/homepage/ProjectCardsSection';
import QuickActionsGrid from '../components/homepage/QuickActionsGrid';
import TodaysScheduleSection from '../components/homepage/TodaysScheduleSection';
import SectionCarousel from '../components/homepage/SectionCarousel';
import {
  filterUpcomingMeetings,
  filterTodaysMeetings,
} from '../utils/meetingUtils';
import { testFirestoreRules } from '../utils/testFirestoreRules';
import { getUserTasks } from '../firebase/taskServices';

// const { width } = Dimensions.get('window');

import type { BottomTabScreenPropsType } from '../types/navigation';

interface HomeScreenProps extends BottomTabScreenPropsType<'Home'> {}

const HomeScreenEnhanced: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const projects = useAppSelector(state => state.projects.projects);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  // Tasks removed
  const allMeetings = useAppSelector(state => state.meetings.meetings);
  const userMeetings = useAppSelector(state => state.meetings.userMeetings);
  const approvedUsers = useAppSelector(state => state.user.approvedUsers);

  // Tasks removed
  const [todaysMeetings, setTodaysMeetings] = useState<Meeting[]>([]);
  const [nextMeetings, setNextMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userTaskCount, setUserTaskCount] = useState(0);

  const userUid = user?.uid;
  const userRole = user?.role;
  const isAdmin = userRole === 'admin';
  const displayProjects = isAdmin ? projects : userProjects;
  const displayMeetings = isAdmin ? allMeetings : userMeetings; // Show appropriate meetings based on role

  const loadTodaysData = useCallback(async () => {
    if (!user || !user.approved) {
      setTodaysMeetings([]);
      setNextMeetings([]);
      return;
    }
    try {
      const userSpecificMeetings = isAdmin ? displayMeetings : userMeetings;
      const todaysMeetingsFiltered = filterTodaysMeetings(userSpecificMeetings);
      const upcomingMeetingsFiltered = filterUpcomingMeetings(
        userSpecificMeetings,
        5,
      );
      setTodaysMeetings(todaysMeetingsFiltered);
      setNextMeetings(upcomingMeetingsFiltered);
    } catch (error) {
      console.error("Error loading today's data:", error);
      setTodaysMeetings([]);
      setNextMeetings([]);
    }
  }, [user, isAdmin, displayMeetings, userMeetings]);

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

  // Load user tasks count
  useEffect(() => {
    const loadUserTaskCount = async () => {
      if (user?.uid) {
        try {
          const userTasks = await getUserTasks(user.uid);
          setUserTaskCount(userTasks.length);
        } catch (error) {
          console.error('Error loading user tasks count:', error);
        }
      }
    };

    loadUserTaskCount();
  }, [user?.uid]);

  // If user is not available, ensure we don't show endless loading
  useEffect(() => {
    if (!userUid) {
      setLoading(false);
    }
  }, [userUid]);

  // Task subscriptions removed

  // Update today's data whenever meetings change
  useEffect(() => {
    if (user && user.approved) {
      loadTodaysData();
    }
  }, [allMeetings, user, loadTodaysData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();

    // Also refresh task count
    if (user?.uid) {
      try {
        const userTasks = await getUserTasks(user.uid);
        setUserTaskCount(userTasks.length);
      } catch (error) {
        console.error('Error refreshing user tasks count:', error);
      }
    }

    setRefreshing(false);
  };

  // Task deletion removed

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Task helpers removed

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
              icon: 'status',
              badge: userTaskCount > 0 ? userTaskCount.toString() : undefined,
              onPress: () => {
                // Navigate to the enhanced task management system
                navigation.navigate('Tasks' as never);
              },
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

        {/* All Tasks section removed */}

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
