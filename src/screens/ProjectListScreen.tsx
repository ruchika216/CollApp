import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  FlatList,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setProjects } from '../store/slices/projectSlice';
import { getUserProjects, getAllProjects } from '../firebase/firestore';
import { Project } from '../types';
import Icon from '../components/common/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { spacing, borderRadius } from '../constants/spacing';

interface ProjectListScreenProps {
  navigation: any;
}

const ProjectListScreen: React.FC<ProjectListScreenProps> = ({ navigation }) => {
  const { colors, gradients } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const projects = useAppSelector(state => state.projects.projects);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'pending' | 'development' | 'done'>('all');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user?.uid) return;

    try {
      const userProjects = isAdmin 
        ? await getAllProjects() 
        : await getUserProjects(user.uid);
      dispatch(setProjects(userProjects));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return colors.success;
      case 'Development': return colors.primary;
      case 'Review': return colors.warning;
      case 'Testing': return colors.info;
      case 'Pending': return colors.error;
      case 'Deployment': return colors.secondary;
      case 'Fixing Bug': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return colors.error;
      case 'High': return colors.warning;
      case 'Medium': return colors.info;
      case 'Low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = (() => {
      switch (filter) {
        case 'assigned':
          return project.assignedTo === user?.uid;
        case 'pending':
          return project.status === 'Pending';
        case 'development':
          return project.status === 'Development';
        case 'done':
          return project.status === 'Done';
        case 'all':
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const renderProject = ({ item: project }: { item: Project }) => (
    <Card
      variant="elevated"
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectScreen', { projectId: project.id })}
    >
      <View style={styles.projectHeader}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(project.priority)}20` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
              {project.priority}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>
          {project.title}
        </Text>
        
        <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={3}>
          {project.description}
        </Text>
      </View>

      <View style={styles.projectMeta}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
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
          <Text style={[styles.progressText, { color: colors.text }]}>
            {project.progress}%
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Icon name="user" size={14} tintColor={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
            Assigned to: {project.assignedUserName || 'Unassigned'}
          </Text>
        </View>
        
        <View style={styles.metaRow}>
          <Icon name="calendar" size={14} tintColor={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Due: {new Date(project.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="project" size={64} tintColor={colors.textLight} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {filter === 'all' ? 'No Projects Found' : `No ${filter} Projects`}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {isAdmin
          ? 'Create a new project to get started with project management.'
          : 'You have no projects assigned yet. Contact your admin for project assignments.'}
      </Text>
      {isAdmin && (
        <Button
          title="Create Project"
          onPress={() => navigation.navigate('ProjectForm')}
          icon="add"
          style={styles.emptyButton}
        />
      )}
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
          <Text style={styles.headerTitle}>Projects</Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProjectForm')}
              style={styles.addButton}
            >
              <Icon name="add" size={24} tintColor="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
          <Icon name="search" size={20} tintColor={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search projects..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'All' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'pending', label: 'Pending' },
              { key: 'development', label: 'Development' },
              { key: 'done', label: 'Done' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && { backgroundColor: colors.primary },
                ]}
                onPress={() => setFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.text },
                    filter === tab.key && { color: '#fff' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  projectCard: {
    marginBottom: spacing.lg,
  },
  projectHeader: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  projectMeta: {
    gap: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    minWidth: 160,
  },
});

export default ProjectListScreen;