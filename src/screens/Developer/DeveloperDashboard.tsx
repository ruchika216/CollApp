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
  Alert,
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
      <View style={[styles.statCard, shadows.md, {
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.05)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
      }]}>
        <LinearGradient
          colors={[
            isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.1)', 
            isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(147, 51, 234, 0.08)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCardGradient}
        >
          <View style={styles.statContent}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, {
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                borderColor: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
              }]}>
                <Icon name={icon} size={18} tintColor={isDark ? '#818cf8' : '#3b82f6'} />
              </View>
              <Text style={[styles.statValue, {
                color: isDark ? '#e0e7ff' : '#1e293b',
                textShadowColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }]}>{value}</Text>
            </View>
            <Text style={[styles.statTitle, {
              color: isDark ? '#c7d2fe' : '#475569'
            }]}>{title}</Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const ProjectCard = ({ project }: { project: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.15)',
        borderWidth: 1,
      }, shadows.sm]}
      onPress={() => {
        console.log('Navigating to project:', project.title, 'ID:', project.id);
        
        if (!project.id) {
          console.error('ERROR: Project ID is missing!', project);
          Alert.alert('Error', 'Project ID is missing. Cannot navigate to project details.');
          return;
        }
        
        navigation.navigate('ProjectDetailScreenNew', { projectId: project.id });
      }}
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
          <View style={[styles.statusBadge, {
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(59, 130, 246, 0.15)',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
          }]}>
            <Text style={[styles.statusText, {
              color: isDark ? '#818cf8' : '#3b82f6'
            }]}>{project.status}</Text>
          </View>
          <View style={[styles.priorityBadge, {
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(147, 51, 234, 0.1)',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(147, 51, 234, 0.2)',
            borderWidth: 1,
          }]}>
            <Text style={[styles.priorityText, {
              color: isDark ? '#c4b5fd' : '#7c3aed'
            }]}>
              {project.priority}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.projectFooter}>
        <View style={styles.progressSection}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progress</Text>
          <View style={[styles.progressBar, {
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            borderWidth: 1,
          }]}>
            <LinearGradient
              colors={[
                isDark ? '#6366f1' : '#3b82f6',
                isDark ? '#8b5cf6' : '#6366f1'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill, 
                { width: `${project.progress}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { 
            color: isDark ? '#e0e7ff' : '#1e293b',
            fontWeight: '700'
          }]}>{project.progress}%</Text>
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
    <View style={[styles.container, { 
      backgroundColor: isDark 
        ? 'rgba(15, 23, 42, 0.95)' 
        : 'rgba(241, 245, 249, 0.98)' 
    }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(59, 130, 246, 0.8)'} 
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDark 
          ? ['rgba(30, 41, 59, 0.95)', 'rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.15)']
          : ['rgba(59, 130, 246, 0.8)', 'rgba(147, 51, 234, 0.7)', 'rgba(99, 102, 241, 0.9)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, {
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.3)',
        }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.welcomeText, {
              color: isDark ? '#c7d2fe' : '#ffffff',
              textShadowColor: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }]}>Welcome back,</Text>
            <Text style={[styles.userName, {
              color: isDark ? '#e0e7ff' : '#ffffff',
              textShadowColor: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(0, 0, 0, 0.4)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }]}>{user?.name || 'Developer'}</Text>
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
            style={[styles.quickActionCard, {
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.95)',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.2)',
              borderWidth: 1,
            }, shadows.sm]}
            onPress={() => navigation.navigate('ProjectListScreen', { userSpecific: true })}
          >
            <LinearGradient
              colors={[
                isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.15)',
                isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(147, 51, 234, 0.12)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickActionGradient}
            >
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionLeft}>
                  <Icon name="project" size={32} tintColor="#fff" />
                  <View style={styles.quickActionText}>
                    <Text style={[styles.quickActionTitle, {
                      color: isDark ? '#e0e7ff' : '#1e293b',
                      textShadowColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }]}>Manage Projects</Text>
                    <Text style={[styles.quickActionSubtitle, {
                      color: isDark ? '#c7d2fe' : '#475569'
                    }]}>
                      View details, update status, add subtasks & comments
                    </Text>
                  </View>
                </View>
                <Icon name="arrow-right" size={20} tintColor={isDark ? '#818cf8' : '#3b82f6'} />
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
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
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
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
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
    height: 8,
    borderRadius: 4,
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
