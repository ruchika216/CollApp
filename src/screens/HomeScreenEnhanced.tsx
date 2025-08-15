import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProjects, fetchUserProjects } from '../store/slices/projectSlice';
import { fetchTasks, fetchUserTasks, fetchTasksByDate, subscribeToTasks, unsubscribeFromTasks } from '../store/slices/taskSlice';
import { fetchMeetings, fetchUserMeetings, fetchMeetingsByDate, fetchUpcomingMeetings } from '../store/slices/meetingSlice';
import { fetchApprovedUsers } from '../store/slices/userSlice';
import Icon from '../components/common/Icon';
import { User, Project, Task, Meeting } from '../types';
import firestoreService from '../firebase/firestoreService';
import ProjectCard from '../components/projects/ProjectCard';
import MeetingCard from '../components/meetings/MeetingCard';
import { filterUpcomingMeetings, filterTodaysMeetings } from '../utils/meetingUtils';

const { width } = Dimensions.get('window');

import type { BottomTabScreenPropsType } from '../types/navigation';

interface HomeScreenProps extends BottomTabScreenPropsType<'Home'> {}

const HomeScreenEnhanced: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const projects = useAppSelector(state => state.projects.projects);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  const allTasks = useAppSelector(state => state.tasks.tasks);
  const userTasks = useAppSelector(state => state.tasks.userTasks);
  const allMeetings = useAppSelector(state => state.meetings.meetings);
  const userMeetings = useAppSelector(state => state.meetings.userMeetings);
  const upcomingMeetings = useAppSelector(state => state.meetings.upcomingMeetings);
  const approvedUsers = useAppSelector(state => state.user.approvedUsers);

  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<Meeting[]>([]);
  const [nextMeetings, setNextMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === 'admin';
  const displayProjects = isAdmin ? projects : userProjects;
  const displayTasks = allTasks; // Show all tasks to all users
  const displayMeetings = isAdmin ? allMeetings : userMeetings; // Show appropriate meetings based on role
  
  

  useEffect(() => {
    loadHomeData();
    
    // Subscribe to real-time task updates for all approved users
    if (user && user.approved) {
      console.log('HomeScreen: Subscribing to tasks for user:', user.role, user.uid);
      dispatch(subscribeToTasks());
    }

    // Cleanup subscriptions on unmount
    return () => {
      dispatch(unsubscribeFromTasks());
    };
  }, [user, dispatch]);

  // Update today's data whenever tasks or meetings change
  useEffect(() => {
    if (user && user.approved) {
      loadTodaysData();
    }
  }, [allTasks, allMeetings, upcomingMeetings, user]);

  const loadHomeData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load all data concurrently
      await Promise.all([
        // Load projects
        isAdmin 
          ? dispatch(fetchProjects()).unwrap()
          : dispatch(fetchUserProjects(user.uid)).unwrap(),
        
        // Load tasks based on user role
        dispatch(fetchTasks()).unwrap(),
        
        // Load meetings based on user role
        isAdmin 
          ? dispatch(fetchMeetings()).unwrap()
          : dispatch(fetchUserMeetings(user.uid)).unwrap(),
        
        // Load upcoming meetings with countdown
        dispatch(fetchUpcomingMeetings({ userId: user.uid, limit: 5 })).unwrap(),
        
        // Load users
        dispatch(fetchApprovedUsers()).unwrap(),
        
        // Load today's tasks and meetings
        loadTodaysData(),
      ]);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadTodaysData = async () => {
    if (!user || !user.approved) {
      // If user is not approved, set empty arrays
      setTodaysTasks([]);
      setTodaysMeetings([]);
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Filter today's tasks from all tasks
      const todaysTasksFiltered = displayTasks.filter(task => {
        const taskDate = new Date(task.startDate).toISOString().split('T')[0];
        return taskDate === today;
      });
      
      // Use utility functions to filter meetings
      const userSpecificMeetings = isAdmin ? displayMeetings : userMeetings;
      const todaysMeetingsFiltered = filterTodaysMeetings(userSpecificMeetings);
      const upcomingMeetingsFiltered = filterUpcomingMeetings(userSpecificMeetings, 5);
      
      setTodaysTasks(todaysTasksFiltered);
      setTodaysMeetings(todaysMeetingsFiltered);
      setNextMeetings(upcomingMeetingsFiltered);
    } catch (error) {
      console.error('Error loading today\'s data:', error);
      // Set empty arrays as fallback
      setTodaysTasks([]);
      setTodaysMeetings([]);
      setNextMeetings([]);
    }
  };

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
      case 'Pending': return colors.warning;
      case 'In Progress': return colors.primary;
      case 'Done': return colors.success;
      case 'Testing': return colors.info;
      case 'Review': return '#9C27B0';
      case 'Deployment': return '#FF5722';
      default: return colors.textSecondary;
    }
  };

  const getAssigneeName = (userId: string) => {
    const user = approvedUsers.find(u => u.uid === userId);
    return user?.name || user?.displayName || user?.email?.split('@')[0] || 'Unknown User';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      case 'Low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Welcome Card Component
  const WelcomeCard = () => (
    <View style={[styles.welcomeCard, { backgroundColor: colors.primary }, shadows.xl]}>
      <View style={styles.welcomeContent}>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeMessage}>
            Welcome to CollApp. Start your day and be productive.
          </Text>
          <Text style={styles.greetingText}>
            {getGreeting()}, {user?.name || user?.email?.split('@')[0]}!
          </Text>
        </View>
        <View style={styles.welcomeIconContainer}>
          <View style={styles.welcomeIcon}>
            <Icon name="dashboard" size="xxl" color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );

  // User Avatar Component
  const UserAvatar = ({ userItem, index }: { userItem: User; index: number }) => (
    <TouchableOpacity
      style={[styles.avatarContainer, { marginLeft: index > 0 ? 12 : 0 }]}
      onPress={() => {
        // Show tooltip or user info
        console.log(`Tapped on ${userItem.name}`);
      }}
    >
      <View style={[styles.avatarWrapper, shadows.sm]}>
        {userItem.photoURL ? (
          <Image
            source={{ uri: userItem.photoURL }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {userItem.name?.charAt(0) || userItem.email?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        {userItem.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
        {userItem.name || userItem.email?.split('@')[0]}
      </Text>
    </TouchableOpacity>
  );

  // Users ScrollBar Component
  const UsersScrollBar = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Team Members ({approvedUsers.length})
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.usersScroll}
        contentContainerStyle={styles.usersContainer}
      >
        {approvedUsers.map((userItem, index) => (
          <UserAvatar key={userItem.uid} userItem={userItem} index={index} />
        ))}
      </ScrollView>
    </View>
  );

  // Today's Tasks Card Component
  const TodaysTasksCard = () => (
    <View style={[styles.card, { backgroundColor: colors.surface }, shadows.md]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name="check" size={24} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Today's Tasks
          </Text>
        </View>
        <TouchableOpacity
          style={styles.allTasksButton}
          onPress={() => navigation.navigate('TaskScreen')}
        >
          <Text style={[styles.allTasksText, { color: colors.primary }]}>
            All Tasks
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {todaysTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks scheduled for today
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.todaysTasksScroll}
          contentContainerStyle={styles.todaysTasksScrollContainer}
        >
          {todaysTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.todaysTaskCard, { backgroundColor: colors.background }, shadows.sm]}
              onPress={() => navigation.navigate('TaskScreen')}
            >
              <View style={styles.todaysTaskHeader}>
                <Text style={[styles.todaysTaskTitle, { color: colors.text }]} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={[
                  styles.todaysTaskPriority, 
                  { backgroundColor: getPriorityColor(task.priority) }
                ]}>
                  <Text style={styles.todaysTaskPriorityText}>
                    {task.priority.charAt(0)}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.todaysTaskDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {task.description}
              </Text>
              
              <View style={styles.todaysTaskMeta}>
                <View style={[
                  styles.todaysTaskStatus, 
                  { backgroundColor: getStatusColor(task.status) + '20' }
                ]}>
                  <Text style={[
                    styles.todaysTaskStatusText, 
                    { color: getStatusColor(task.status) }
                  ]}>
                    {task.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.todaysTaskFooter}>
                <Text style={[styles.todaysTaskAssignee, { color: colors.textSecondary }]} numberOfLines={1}>
                  {task.assignedTo.length > 0 ? getAssigneeName(task.assignedTo[0]) : 'Unassigned'}
                </Text>
                <View style={styles.todaysTaskDateTime}>
                  <Text style={[styles.todaysTaskDate, { color: colors.text }]}>
                    {new Date(task.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).replace(' ', '')}
                  </Text>
                  <Text style={[styles.todaysTaskTime, { color: colors.primary }]}>
                    {new Date(task.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Meetings & Reports Card Component
  const MeetingsReportsCard = () => (
    <View style={[styles.card, { backgroundColor: colors.surface }, shadows.md]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name="calendar" size={24} color={colors.info} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Today's Meetings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.allTasksButton}
          onPress={() => navigation.navigate('MeetingScreen')}
        >
          <Text style={[styles.allTasksText, { color: colors.primary }]}>
            All Meetings
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {todaysMeetings.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="calendar" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No meetings scheduled for today
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.meetingsScroll}
          contentContainerStyle={styles.meetingsContainer}
        >
          {todaysMeetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCardWrapper}>
              <MeetingCard
                meeting={meeting}
                showCountdown={true}
                compact={true}
                onPress={() => navigation.navigate('MeetingScreen')}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Upcoming Meetings Section
  const UpcomingMeetingsSection = () => (
    <View style={[styles.card, { backgroundColor: colors.surface }, shadows.md]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name="clock" size={24} color={colors.warning} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Upcoming Meetings
          </Text>
        </View>
        <TouchableOpacity
          style={styles.allTasksButton}
          onPress={() => navigation.navigate('MeetingScreen')}
        >
          <Text style={[styles.allTasksText, { color: colors.primary }]}>
            View All
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {nextMeetings.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="clock" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No upcoming meetings
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.meetingsScroll}
          contentContainerStyle={styles.meetingsContainer}
        >
          {nextMeetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCardWrapper}>
              <MeetingCard
                meeting={meeting}
                showCountdown={true}
                compact={true}
                onPress={() => navigation.navigate('MeetingScreen')}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // All Tasks Scroll Section
  const AllTasksScrollSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Tasks ({displayTasks.length})
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TaskScreen')}
          style={styles.viewAllButton}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            Manage Tasks
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {displayTasks.length === 0 ? (
        <View style={styles.emptyProjectsState}>
          <Icon name="check" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Tasks Available
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {isAdmin 
              ? 'Create tasks to get your team organized'
              : 'No tasks have been created yet'
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tasksScroll}
          contentContainerStyle={styles.tasksScrollContainer}
        >
          {displayTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[styles.taskScrollCard, { backgroundColor: colors.surface }, shadows.sm]}
              onPress={() => navigation.navigate('TaskScreen')}
            >
              <View style={styles.taskScrollHeader}>
                <Text style={[styles.taskScrollTitle, { color: colors.text }]} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={[
                  styles.taskScrollPriority, 
                  { backgroundColor: getPriorityColor(task.priority) }
                ]}>
                  <Text style={styles.taskScrollPriorityText}>
                    {task.priority.charAt(0)}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.taskScrollDescription, { color: colors.textSecondary }]} numberOfLines={3}>
                {task.description}
              </Text>
              
              <View style={styles.taskScrollMeta}>
                <View style={[
                  styles.taskScrollStatus, 
                  { backgroundColor: getStatusColor(task.status) + '20' }
                ]}>
                  <Text style={[
                    styles.taskScrollStatusText, 
                    { color: getStatusColor(task.status) }
                  ]}>
                    {task.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.taskScrollFooter}>
                <Text style={[styles.taskScrollAssignee, { color: colors.textSecondary }]} numberOfLines={1}>
                  {task.assignedTo.length > 0 ? getAssigneeName(task.assignedTo[0]) : 'Unassigned'}
                </Text>
                <Text style={[styles.taskScrollDate, { color: colors.primary }]}>
                  {new Date(task.startDate).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Project Cards Section
  const ProjectCardsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isAdmin ? 'All Projects' : 'My Projects'} ({displayProjects.length})
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Projects')}
          style={styles.viewAllButton}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {displayProjects.length === 0 ? (
        <View style={styles.emptyProjectsState}>
          <Icon name="project" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {isAdmin ? 'No Projects Created' : 'No Projects Assigned'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {isAdmin 
              ? 'Create your first project to get started'
              : 'No projects assigned to you yet'
            }
          </Text>
        </View>
      ) : (
        displayProjects.slice(0, 5).map((project) => (
          <View key={project.id} style={styles.projectCardWrapper}>
            <ProjectCard
              project={project}
              onPress={() => {
                console.log('Navigating to project:', project.title, 'ID:', project.id);
                
                if (!project.id) {
                  console.error('ERROR: Project ID is missing!', project);
                  Alert.alert('Error', 'Project ID is missing. Cannot navigate to project details.');
                  return;
                }
                
                navigation.navigate('ProjectDetailScreenNew', { projectId: project.id });
              }}
              showAssignees={true}
              compact={true}
            />
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Card */}
        <WelcomeCard />

        {/* Users ScrollBar */}
        <UsersScrollBar />

        {/* Today's Tasks Card */}
        <TodaysTasksCard />

        {/* Today's Meetings Card */}
        <MeetingsReportsCard />

        {/* Upcoming Meetings Section */}
        <UpcomingMeetingsSection />

        {/* All Tasks Scroll Section */}
        <AllTasksScrollSection />

        {/* Project Cards */}
        <ProjectCardsSection />

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