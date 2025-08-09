import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setProjects, deleteProject, setLoading } from '../../store/slices/projectSlice';
import { getProjects, deleteProjectFromFirestore, getUserProjects } from '../../firebase/firestore';
import { Project } from '../../types';
import Icon from '../../components/common/Icon';
import ProjectForm from '../Admin/ProjectForm';

interface ProjectListScreenProps {
  navigation: any;
  route?: any;
  userSpecific?: boolean; // If true, show only user's assigned projects
  userId?: string; // Specific user ID to filter projects
}

const ProjectListScreen: React.FC<ProjectListScreenProps> = ({ 
  navigation, 
  route, 
  userSpecific = false, 
  userId 
}) => {
  const { colors, gradients, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects.projects);
  const loading = useAppSelector(state => state.projects.loading);
  const user = useAppSelector(state => state.auth.user);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filter = route?.params?.filter;
  const isAdmin = user?.role === 'admin';
  const targetUserId = userId || user?.uid;

  useEffect(() => {
    loadProjects();
  }, [userSpecific, userId]);

  const loadProjects = async () => {
    try {
      dispatch(setLoading(true));
      let projectsData: Project[];
      
      if (userSpecific && targetUserId) {
        projectsData = await getUserProjects(targetUserId);
      } else {
        projectsData = await getProjects();
      }
      
      dispatch(setProjects(projectsData));
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDelete = (project: Project) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can delete projects');
      return;
    }

    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProjectFromFirestore(project.id);
              dispatch(deleteProject(project.id));
              Alert.alert('Success', 'Project deleted successfully');
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (project: Project) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can edit projects');
      return;
    }
    setSelectedProject(project);
    setModalVisible(true);
  };

  const handleAdd = () => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only admins can create projects');
      return;
    }
    setSelectedProject(null);
    setModalVisible(true);
  };

  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetailScreen', { projectId: project.id, project });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Pending': return colors.warning;
      case 'Development': return colors.info;
      case 'Review': return colors.secondary;
      case 'Testing': return colors.warning;
      case 'Done': return colors.success;
      case 'Deployment': return colors.primary;
      case 'Fixing Bug': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Low': return colors.success;
      case 'Medium': return colors.warning;
      case 'High': return colors.error;
      case 'Critical': return '#ff4757';
      default: return colors.textSecondary;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!filter) return true;
    
    switch (filter) {
      case 'active':
        return ['Development', 'Review', 'Testing'].includes(project.status);
      case 'completed':
        return project.status === 'Done';
      case 'pending':
        return project.status === 'Pending';
      default:
        return true;
    }
  });

  const ProjectCard = ({ project }: { project: Project }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.card }, shadows.md]}
      onPress={() => handleProjectPress(project)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={1}>
            {project.title}
          </Text>
          {isAdmin && (
            <View style={styles.projectActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.primary}20` }]}
                onPress={() => handleEdit(project)}
              >
                <Icon name="edit" size={16} tintColor={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: `${colors.error}20` }]}
                onPress={() => handleDelete(project)}
              >
                <Icon name="delete" size={16} tintColor={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {project.description}
        </Text>
      </View>

      <View style={styles.projectMeta}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: `${getStatusColor(project.status)}20` }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(project.status) }]}>
              {project.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${getPriorityColor(project.priority)}20` }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(project.priority) }]}>
              {project.priority}
            </Text>
          </View>
        </View>

        <View style={styles.projectInfo}>
          <View style={styles.infoItem}>
            <Icon name="account" size={14} tintColor={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {project.assignedUser?.displayName || 'Unassigned'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Icon name="calendar" size={14} tintColor={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {new Date(project.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Progress: {project.progress}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: `${colors.primary}20` }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${project.progress}%` }
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getScreenTitle = () => {
    if (userSpecific && userId !== user?.uid) {
      return 'User Projects';
    }
    if (userSpecific) {
      return 'My Projects';
    }
    return 'All Projects';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar 
          barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} 
          backgroundColor={colors.primary} 
        />
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="left-arrow" size={24} tintColor="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        
        <View style={[styles.centerContent, { flex: 1 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading projects...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} 
        backgroundColor={colors.primary} 
      />
      
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="left-arrow" size={24} tintColor="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          {isAdmin && !userSpecific && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
            >
              <Icon name="add" size={24} tintColor="#fff" />
            </TouchableOpacity>
          )}
          {(!isAdmin || userSpecific) && <View style={styles.placeholder} />}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {filteredProjects.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }, shadows.sm]}>
            <Icon name="project" size={48} tintColor={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Projects Found</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              {userSpecific 
                ? 'No projects assigned to this user yet.' 
                : filter 
                  ? `No ${filter} projects at the moment.` 
                  : 'No projects have been created yet.'
              }
            </Text>
            {isAdmin && !userSpecific && (
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Icon name="add" size={20} tintColor="#fff" />
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ProjectCard project={item} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      {isAdmin && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <ProjectForm
            project={selectedProject}
            onClose={() => {
              setModalVisible(false);
              setSelectedProject(null);
              loadProjects(); // Refresh the list
            }}
            navigation={navigation}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  projectCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  projectActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  projectMeta: {
    gap: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
  progressContainer: {
    gap: 4,
  },
  progressText: {
    fontSize: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProjectListScreen;