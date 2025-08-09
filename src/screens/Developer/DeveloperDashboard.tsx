import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { fetchUserProjects } from '../../store/slices/projectSlice';
import Icon from '../../components/common/Icon';
import NotificationButton from '../../components/common/NotificationButton';
import { Project } from '../../types';
import { getStatusColor, getPriorityColor } from '../../theme/themeUtils';
import ThemeToggle from '../../components/common/ThemeToggle';

const { width } = Dimensions.get('window');

const DeveloperDashboard = ({ navigation }: any) => {
  const { colors, gradients, shadows, isDark } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  const loading = useAppSelector(state => state.projects.loading);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(p => 
      ['In Progress', 'Review', 'Testing'].includes(p.status)
    ).length;
    const completedProjects = userProjects.filter(p => p.status === 'Done').length;
    const pendingProjects = userProjects.filter(p => p.status === 'To Do').length;
    const overdue = userProjects.filter(p => 
      new Date(p.endDate) < new Date() && p.status !== 'Done'
    ).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      overdue,
    };
  }, [userProjects]);

  useEffect(() => {
    loadUserProjects();
  }, [user]);

  // Refresh data when screen comes into focus (after project updates)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadUserProjects();
      }
    }, [user])
  );

  const loadUserProjects = async () => {
    if (!user) return;
    
    try {
      await dispatch(fetchUserProjects(user.uid)).unwrap();
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProjects();
    setRefreshing(false);
  };

  const getProjectStatusColor = (status: Project['status']) => 
    getStatusColor(status, colors);

  const getProjectPriorityColor = (priority: Project['priority']) => 
    getPriorityColor(priority, colors);

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
            <Icon name={icon} size={20} tintColor="#fff" />
            <Text style={styles.statValue}>{value}</Text>
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ProjectCard = ({ project }: { project: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.card }, shadows.sm]}
      onPress={() => navigation.navigate('ProjectDetailScreen', { projectId: project.id, project })}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>
            {project.title}
          </Text>
          <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {project.description}
          </Text>
        </View>
        <View style={styles.projectMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getProjectStatusColor(project.status) }]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${getProjectPriorityColor(project.priority)}20` }]}>
            <Text style={[styles.priorityText, { color: getProjectPriorityColor(project.priority) }]}>
              {project.priority}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.projectFooter}>
        <View style={styles.progressSection}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progress</Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: colors.primary, width: `${project.progress}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>{project.progress}%</Text>
        </View>
        
        <View style={styles.dateSection}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Due Date</Text>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {new Date(project.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="project" size={64} tintColor={colors.disabled} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Projects Assigned</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        You don't have any projects assigned yet. Check back later or contact your admin.
      </Text>
    </View>
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
            <Text style={styles.userName}>{user?.name || 'Developer'}</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card }, shadows.sm]}
            onPress={() => navigation.navigate('ProjectListScreen', { userSpecific: true })}
          >
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionLeft}>
                  <Icon name="project" size={32} tintColor="#fff" />
                  <View style={styles.quickActionText}>
                    <Text style={styles.quickActionTitle}>Manage Projects</Text>
                    <Text style={styles.quickActionSubtitle}>
                      View details, update status, add subtasks & comments
                    </Text>
                  </View>
                </View>
                <Icon name="arrow-right" size={20} tintColor="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Projects Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total"
              value={stats.totalProjects}
              color={colors.primary}
              icon="project"
            />
            <StatCard
              title="Active"
              value={stats.activeProjects}
              color={colors.success}
              icon="dashboard"
            />
            <StatCard
              title="Completed"
              value={stats.completedProjects}
              color={colors.info}
              icon="status"
            />
            <StatCard
              title="To Do"
              value={stats.pendingProjects}
              color={colors.warning}
              icon="calendar"
            />
          </View>
        </View>

        {/* Active Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Projects</Text>
            <TouchableOpacity
              style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('ProjectListScreen', { userSpecific: true })}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="arrow-right" size={16} tintColor="#fff" />
            </TouchableOpacity>
          </View>
          {userProjects.length === 0 ? (
            <EmptyState />
          ) : (
            userProjects
              .filter(p => p.status !== 'Done')
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
          )}
        </View>

        {/* Completed Projects */}
        {userProjects.filter(p => p.status === 'Done').length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed Projects</Text>
            {userProjects
              .filter(p => p.status === 'Done')
              .slice(0, 3)
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </View>
        )}
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
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    marginLeft: 16,
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  projectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectHeader: {
    marginBottom: 16,
  },
  projectInfo: {
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    flex: 1,
    marginRight: 16,
  },
  progressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateSection: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default DeveloperDashboard;
