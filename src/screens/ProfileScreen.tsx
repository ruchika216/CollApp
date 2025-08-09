import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../store/slices/authSlice';
import { fetchUserTasks } from '../store/slices/taskSlice';
import { fetchUserProjects } from '../store/slices/projectSlice';
import Icon from '../components/common/Icon';
import { Task, Project } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const userTasks = useAppSelector(state => state.tasks.userTasks);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
  });

  useEffect(() => {
    if (user) {
      // Fetch user-specific data
      dispatch(fetchUserTasks(user.uid));
      dispatch(fetchUserProjects(user.uid));
    }
  }, [user, dispatch]);

  useEffect(() => {
    // Calculate stats
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.status === 'Done').length;
    const activeTasks = userTasks.filter(task => task.status === 'In Progress').length;
    const totalProjects = userProjects.length;

    setStats({
      totalTasks,
      completedTasks, 
      activeTasks,
      totalProjects,
    });
  }, [userTasks, userProjects]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(signOut());
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No user data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Icon name="logout" size={24} tintColor="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }, shadows.md]}>
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name || user.email?.split('@')[0] || 'Unknown User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? colors.error : colors.primary }]}>
            <Text style={styles.roleText}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: user.approved ? colors.success : colors.warning }]}>
            <Text style={styles.statusText}>
              {user.approved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <Icon name="check" size={32} tintColor={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.completedTasks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed Tasks</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <Icon name="time" size={32} tintColor={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.activeTasks}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Tasks</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <Icon name="project" size={32} tintColor={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalProjects}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Projects</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TaskScreen')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {userTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.taskDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                  {task.description}
                </Text>
              </View>
              <View style={[
                styles.taskStatus,
                { backgroundColor: getStatusColor(task.status) + '20' }
              ]}>
                <Text style={[styles.taskStatusText, { color: getStatusColor(task.status) }]}>
                  {task.status}
                </Text>
              </View>
            </View>
          ))}
          
          {userTasks.length === 0 && (
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              No tasks assigned to you
            </Text>
          )}
        </View>

        {/* Account Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }, shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>User ID</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.uid}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
            <Text style={[styles.infoValue, { color: user.approved ? colors.success : colors.warning }]}>
              {user.approved ? 'Active' : 'Pending Approval'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'To Do':
      case 'Pending': return colors.warning;
      case 'In Progress': return colors.primary;
      case 'Done': return colors.success;
      case 'Testing': return colors.info;
      default: return colors.textSecondary;
    }
  }
};

export default ProfileScreen;

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
  signOutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});
