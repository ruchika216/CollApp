
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setProjects, setLoading } from '../../store/slices/projectSlice';
import { getProjects } from '../../firebase/firestore';
import Icon from '../../components/common/Icon';
import ProjectList from './ProjectList';
import UserList from './UserList';
import PendingUsers from './PendingUsers';
import ThemeToggle from '../../components/common/ThemeToggle';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }: any) => {
  const { colors, gradients, shadows, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const projects = useAppSelector(state => state.projects.projects);
  const loading = useAppSelector(state => state.projects.loading);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => 
      ['Development', 'Review', 'Testing'].includes(p.status)
    ).length;
    const completedProjects = projects.filter(p => p.status === 'Done').length;
    const pendingProjects = projects.filter(p => p.status === 'Pending').length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
    };
  }, [projects]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      dispatch(setLoading(true));
      const [projectsData] = await Promise.all([
        getProjects(),
      ]);
      dispatch(setProjects(projectsData));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
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
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notification')}
            >
              <Icon name="notification" size={24} tintColor="#fff" />
            </TouchableOpacity>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
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
              onPress={() => navigation.navigate('ProjectList', { filter: 'active' })}
            />
            <StatCard
              title="Completed"
              value={stats.completedProjects}
              color={colors.info}
              icon="status"
              onPress={() => navigation.navigate('ProjectList', { filter: 'completed' })}
            />
            <StatCard
              title="Pending"
              value={stats.pendingProjects}
              color={colors.warning}
              icon="calendar"
              onPress={() => navigation.navigate('ProjectList', { filter: 'pending' })}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              title="Create Project"
              icon="add"
              color={colors.primary}
              onPress={() => navigation.navigate('ProjectForm')}
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

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Projects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProjectList')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ProjectList />
        </View>

        {/* Pending Users */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Approvals</Text>
          <PendingUsers />
        </View>

        {/* Team Members */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Members</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserList')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
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
});

export default AdminDashboard;
