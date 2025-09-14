import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setLoading,
  setProjects,
  deleteProject,
} from '../../store/slices/projectSlice';
import {
  getProjects,
  getUserProjects,
  deleteProjectFromFirestore,
} from '../../firebase/firestore';
import { Project } from '../../types';
import Icon from '../../components/common/Icon';
import ProjectForm from '../Admin/ProjectForm';

// Separate item component to satisfy lint rules and avoid redefining components on each render
type ThemeColors = ReturnType<typeof useTheme>['colors'];

interface ProjectCardItemProps {
  project: Project;
  colors: ThemeColors;
  isAdmin: boolean;
  canDevUpdate?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onPress: (project: Project) => void;
  getStatusColor: (s: Project['status']) => string;
  getPriorityColor: (p: Project['priority']) => string;
}

const ProjectCardItem: React.FC<ProjectCardItemProps> = ({
  project,
  colors,
  isAdmin,
  canDevUpdate,
  onEdit,
  onDelete,
  onPress,
  getStatusColor,
  getPriorityColor,
}) => {
  const assigneeLabel = project.assignedUsers
    ?.map(u => u?.displayName || u?.email || 'User')
    .join(', ');

  // Truncate description to around 15-20 words
  const truncateDescription = (text: string, wordLimit: number = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(project)}
      style={[styles.projectCard, { backgroundColor: colors.card }]}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectTitleRow}>
          <Text style={[styles.projectTitle, { color: colors.text }]}>
            {project.title}
          </Text>
          <View style={styles.projectActions}>
            {isAdmin && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => onEdit(project)}
              >
                <Icon name="edit" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => onDelete(project)}
              >
                <Icon name="delete" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
            {!isAdmin && canDevUpdate && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => onEdit(project)}
              >
                <Icon name="edit" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text
          style={[styles.projectDescription, { color: colors.textSecondary }]}
        >
          {truncateDescription(project.description || '')}
        </Text>
      </View>
      <View style={styles.projectMeta}>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${getStatusColor(project.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getStatusColor(project.status) },
              ]}
            >
              {project.status}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${getPriorityColor(project.priority)}20` },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: getPriorityColor(project.priority) },
              ]}
            >
              {project.priority}
            </Text>
          </View>
        </View>
        <View style={styles.projectInfo}>
          <View style={styles.infoItem}>
            <Icon name="account" size={14} tintColor={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {assigneeLabel}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Icon name="calendar" size={14} tintColor={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString()
                : 'No due date'}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Progress: {project.progress}%
          </Text>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${project.progress}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// (Removed AdminProjectTile in favor of a unified single-column card list)

interface ProjectListScreenProps {
  navigation: any;
  route?: any;
  userSpecific?: boolean;
  userId?: string;
}

const ProjectListScreen: React.FC<ProjectListScreenProps> = ({
  navigation,
  route,
  userSpecific = false,
  userId,
}) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects.projects);
  const loading = useAppSelector(state => state.projects.loading);
  const user = useAppSelector(state => state.auth.user);

  // local ui state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // visual filters/search for everyone (admin and user)
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState<
    'all' | 'active' | 'pending' | 'completed'
  >('active');
  // Developer edit modal removed (unified detail screen editing)

  const filter = route?.params?.filter;
  const isAdmin = user?.role === 'admin';
  const targetUserId = userId || user?.uid;

  const loadProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      let projectsData: Project[] = [];
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
  }, [dispatch, userSpecific, targetUserId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
            } catch (err) {
              console.error('Error deleting project:', err);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ],
    );
  };

  const handleEdit = (project: Project) => {
    // Allow admin or assigned developer to edit; navigate to detail screen for unified UI
    const isAssignedDeveloper =
      !isAdmin &&
      !!user?.uid &&
      Array.isArray(project.assignedTo) &&
      project.assignedTo.includes(user.uid);
    if (!isAdmin && !isAssignedDeveloper) {
      Alert.alert(
        'Permission Denied',
        'You are not allowed to edit this project',
      );
      return;
    }
    if (project.id) {
      navigation.navigate('ProjectDetailScreenNew', { projectId: project.id });
    }
  };

  const handleAdd = () => {
    // Allow admins only (business rule). If you want developers to create, adjust rules and remove this check.
    if (!isAdmin) {
      Alert.alert(
        'Permission Denied',
        'Only admins can create projects currently',
      );
      return;
    }
    setSelectedProject(null);
    setModalVisible(true);
  };

  const handleProjectPress = (project: Project) => {
    if (!project.id) {
      Alert.alert(
        'Error',
        'Project ID is missing. Cannot navigate to details.',
      );
      return;
    }
    navigation.navigate('ProjectDetailScreenNew', { projectId: project.id });
  };

  // Filtered list for admin visuals
  const adminVisuallyFiltered = useMemo(() => {
    let data = projects;
    if (isAdmin) {
      if (adminFilter !== 'all') {
        data = data.filter(p => {
          if (adminFilter === 'active') {
            return ['In Progress', 'Review', 'Testing'].includes(
              p.status as any,
            );
          }
          if (adminFilter === 'pending') return p.status === 'To Do';
          if (adminFilter === 'completed') return p.status === 'Done';
          return true;
        });
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    return data;
  }, [projects, isAdmin, adminFilter, search]);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'To Do':
        return '#FF3B30';
      case 'In Progress':
        return '#007AFF';
      case 'Review':
        return '#FF9500';
      case 'Testing':
        return '#30D158';
      case 'Done':
        return '#34C759';
      case 'Deployment':
        return '#5856D6';
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Low':
        return '#6B7280';
      case 'Medium':
        return '#2563EB';
      case 'High':
        return '#D97706';
      case 'Critical':
        return '#DC2626';
      default:
        return colors.textSecondary;
    }
  };

  const renderProjectItem = ({ item }: { item: Project }) => {
    const canDevUpdate =
      !isAdmin &&
      Array.isArray(item.assignedTo) &&
      !!user?.uid &&
      item.assignedTo.includes(user.uid);
    return (
      <ProjectCardItem
        project={item}
        colors={colors}
        isAdmin={!!isAdmin}
        canDevUpdate={canDevUpdate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPress={handleProjectPress}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading projects...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isAdmin && !userSpecific ? (
        <>
          {/* Admin header */}
          <View style={styles.adminHeader}>
            <View style={styles.adminHeaderLeft}>
              <Text style={[styles.adminTitle, { color: colors.text }]}>
                Projects
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Text style={[styles.countPillText, { color: colors.primary }]}>
                  {projects.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.newBtn, { backgroundColor: colors.primary }]}
            >
              <Icon name="add" size={18} tintColor="#fff" />
              <Text style={styles.newBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {/* Search and chips */}
          <View style={styles.controlsRow}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: colors.card },
                shadows.sm,
              ]}
            >
              <Icon name="search" size={16} tintColor={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search projects..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <View style={styles.chipsRow}>
              {(['all', 'active', 'pending', 'completed'] as const).map(k => (
                <TouchableOpacity
                  key={k}
                  style={[
                    styles.chip,
                    adminFilter === k && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setAdminFilter(k)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      adminFilter === k && styles.chipTextActive,
                    ]}
                  >
                    {k[0].toUpperCase() + k.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.content}>
            {adminVisuallyFiltered.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: colors.card },
                  shadows.sm,
                ]}
              >
                <Icon name="project" size={48} tintColor={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Projects Found
                </Text>
                <Text
                  style={[styles.emptyMessage, { color: colors.textSecondary }]}
                >
                  {search || adminFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'No projects have been created yet.'}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAdd}
                >
                  <Icon name="add" size={20} tintColor="#fff" />
                  <Text style={styles.createButtonText}>Create Project</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={adminVisuallyFiltered}
                key={'admin-list'}
                keyExtractor={item => item.id}
                renderItem={renderProjectItem}
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
        </>
      ) : (
        <>
          {/* Simple top row header without back button, add inline with title */}
          <View style={styles.topBar}>
            <View style={styles.placeholder} />
            <View style={styles.headerCenter}>
              <Text style={[styles.titleText, { color: colors.text }]}>
                All Projects ({projects.length})
              </Text>
              {isAdmin && !userSpecific && (
                <TouchableOpacity
                  style={[
                    styles.addInlineButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleAdd}
                >
                  <Icon name="add" size={18} tintColor="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* User: Search and chips (same as admin) */}
          <View style={styles.controlsRow}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: colors.card },
                shadows.sm,
              ]}
            >
              <Icon name="search" size={16} tintColor={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search projects..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <View style={styles.chipsRow}>
              {(['all', 'active', 'pending', 'completed'] as const).map(k => (
                <TouchableOpacity
                  key={k}
                  style={[
                    styles.chip,
                    adminFilter === k && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setAdminFilter(k)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      adminFilter === k && styles.chipTextActive,
                    ]}
                  >
                    {k[0].toUpperCase() + k.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.content}>
            {adminVisuallyFiltered.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: colors.card },
                  shadows.sm,
                ]}
              >
                <Icon name="project" size={48} tintColor={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Projects Found
                </Text>
                <Text
                  style={[styles.emptyMessage, { color: colors.textSecondary }]}
                >
                  {search || adminFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : userSpecific
                    ? 'No projects assigned to this user yet.'
                    : filter
                    ? `No ${filter} projects at the moment.`
                    : 'No projects have been created yet.'}
                </Text>
                {isAdmin && !userSpecific && (
                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleAdd}
                  >
                    <Icon name="add" size={20} tintColor="#fff" />
                    <Text style={styles.createButtonText}>Create Project</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <FlatList
                data={adminVisuallyFiltered}
                key={'user-list'}
                keyExtractor={item => item.id}
                renderItem={renderProjectItem}
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
        </>
      )}

      {/* No floating action button; bottom nav is present */}

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
              loadProjects();
            }}
            navigation={navigation}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, paddingBottom: 80 },
  loadingText: { marginTop: 12, fontSize: 16 },
  listContainer: { paddingBottom: 40 },
  listContainerGrid: { paddingBottom: 40, paddingTop: 8 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: { fontSize: 18, fontWeight: '700' },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addInlineButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: { width: 36, height: 36 },

  projectCard: { marginBottom: 16, padding: 16, borderRadius: 12 },
  projectHeader: { marginBottom: 12 },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 12 },
  projectActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectDescription: { fontSize: 14, lineHeight: 20 },
  projectMeta: { gap: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  projectInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12 },
  progressContainer: { gap: 4 },
  progressText: { fontSize: 12 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  tileProgressBar: { marginTop: 8 },

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
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Dev modal styles
  devModalContainer: { flex: 1, padding: 20 },
  devModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  devModalTitle: { fontSize: 18, fontWeight: '700' },
  devCloseBtn: { padding: 8 },
  devFieldGroup: { marginBottom: 16 },
  devLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  devInput: { borderWidth: 1, borderRadius: 8, padding: 12 },
  devActionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  // Admin UI additions
  adminHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminTitle: { fontSize: 22, fontWeight: '800' },
  countPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  countPillText: { fontSize: 12, fontWeight: '700' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  controlsRow: { paddingHorizontal: 20, gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#125ae92b',
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#031a49' },
  chipTextActive: { color: '#fff' },
  gridColumnWrapper: { gap: 12 },
  adminTile: {
    flex: 1,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  tileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tileTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  tileActions: { flexDirection: 'row', gap: 6 },
  tileActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDesc: { fontSize: 12, lineHeight: 18 },
  tileBadgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tileBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  tileBadgeText: { fontSize: 11, fontWeight: '700' },
});

export default ProjectListScreen;
