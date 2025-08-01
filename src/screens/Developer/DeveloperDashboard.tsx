import React, { useEffect, useMemo, useState } from 'react';
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
import { setUserProjects, setLoading } from '../../store/slices/projectSlice';
import { getUserProjects } from '../../firebase/firestore';
import Icon from '../../components/common/Icon';
import { Project } from '../../types';

const { width } = Dimensions.get('window');

const DeveloperDashboard = ({ navigation }: any) => {
  const { colors, gradients, theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  const loading = useAppSelector(state => state.projects.loading);
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => {
    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(p => 
      ['Development', 'Review', 'Testing'].includes(p.status)
    ).length;
    const completedProjects = userProjects.filter(p => p.status === 'Done').length;
    const pendingProjects = userProjects.filter(p => p.status === 'Pending').length;
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

  const loadUserProjects = async () => {
    if (!user) return;
    
    try {
      dispatch(setLoading(true));
      const projects = await getUserProjects(user.uid);
      dispatch(setUserProjects(projects));
    } catch (error) {
      console.error('Error loading user projects:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProjects();
    setRefreshing(false);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Pending': return colors.warning;
      case 'Development': return colors.primary;
      case 'Review': return colors.info;
      case 'Testing': return colors.secondary;
      case 'Done': return colors.success;
      case 'Deployment': return colors.accent;
      case 'Fixing Bug': return colors.error;
      default: return colors.disabled;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Critical': return colors.error;
      case 'High': return colors.warning;
      case 'Medium': return colors.info;
      case 'Low': return colors.success;
      default: return colors.disabled;
    }
  };

  const StatCard = ({ title, value, color, icon, onPress }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[color, `${color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.statCard, theme.shadow.medium]}
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
      style={[styles.projectCard, { backgroundColor: colors.card }, theme.shadow.small]}
      onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>
            {project.title}
          </Text>
          <Text style={[styles.projectDescription, { color: colors.subtext }]} numberOfLines={2}>
            {project.description}
          </Text>
        </View>
        <View style={styles.projectMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(project.priority)}20` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
              {project.priority}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.projectFooter}>
        <View style={styles.progressSection}>
          <Text style={[styles.progressLabel, { color: colors.subtext }]}>Progress</Text>
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
          <Text style={[styles.dateLabel, { color: colors.subtext }]}>Due Date</Text>
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
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
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
            <Text style={styles.userName}>{user?.displayName || 'Developer'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notification')}
          >
            <Icon name="notification" size={24} tintColor="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
              title="Overdue"
              value={stats.overdue}
              color={colors.error}
              icon="calendar"
            />
          </View>
        </View>

        {/* Active Projects */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Projects</Text>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
