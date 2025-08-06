import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateProject } from '../store/slices/projectSlice';
import { 
  updateProjectStatus, 
  addCommentToProject, 
  updateProjectInFirestore 
} from '../firebase/firestore';
import { Project, ProjectComment } from '../types';
import Icon from '../components/common/Icon';
import { getStatusColor, getPriorityColor, createCardStyle } from '../theme/themeUtils';

interface Props {
  route: {
    params: {
      projectId: string;
    };
  };
  navigation: any;
}

const ProjectDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { projectId } = route.params;
  const { colors, gradients, spacing, isDark } = useTheme();
  const dispatch = useAppDispatch();
  
  // Get current user and project from Redux
  const user = useAppSelector(state => state.user.user);
  const projects = useAppSelector(state => state.projects.projects);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  
  // Find project from either projects or userProjects array
  const project = projects.find(p => p.id === projectId) || 
                  userProjects.find(p => p.id === projectId);

  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(project?.progress?.toString() || '0');
  const [showProgressInput, setShowProgressInput] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isAssignedUser = user?.uid === project?.assignedTo;

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Icon name="project" size={64} tintColor={colors.disabled} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Project not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.textOnPrimary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleStatusUpdate = async (newStatus: Project['status']) => {
    if (!isAssignedUser && !isAdmin) return;
    
    try {
      setLoading(true);
      await updateProjectStatus(project.id, newStatus);
      dispatch(updateProject({ ...project, status: newStatus }));
      Alert.alert('Success', 'Project status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async () => {
    if (!isAssignedUser && !isAdmin) return;
    
    const progress = parseInt(updateProgress, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert('Invalid Progress', 'Progress must be between 0 and 100');
      return;
    }

    try {
      setLoading(true);
      const updatedProject = { ...project, progress };
      await updateProjectInFirestore(updatedProject);
      dispatch(updateProject(updatedProject));
      setShowProgressInput(false);
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      setLoading(true);
      const comment: Omit<ProjectComment, 'id' | 'createdAt'> = {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.name || user.email || 'Unknown User',
      };
      
      await addCommentToProject(project.id, comment);
      
      // Update local project state
      const updatedProject = {
        ...project,
        comments: [
          ...project.comments,
          {
            ...comment,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          } as ProjectComment
        ]
      };
      dispatch(updateProject(updatedProject));
      setNewComment('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions: Project['status'][] = [
    'Pending', 'Development', 'Review', 'Testing', 'Done', 'Deployment', 'Fixing Bug'
  ];

  const getStatusIcon = (status: Project['status']) => {
    const statusIcons = {
      'Pending': 'calendar',
      'Development': 'dashboard',
      'Review': 'status',
      'Testing': 'notification',
      'Done': 'status',
      'Deployment': 'dashboard',
      'Fixing Bug': 'notification',
    };
    return statusIcons[status] || 'project';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={colors.primary} 
      />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={24} tintColor="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={styles.headerButton} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Info Card */}
        <View style={[createCardStyle(colors), { margin: spacing.lg }]}>
          <Text style={[styles.projectTitle, { color: colors.text }]}>
            {project.title}
          </Text>
          <Text style={[styles.projectDescription, { color: colors.textSecondary }]}>
            {project.description}
          </Text>
          
          {/* Status and Priority */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(project.status, colors) }
              ]}>
                <Icon 
                  name={getStatusIcon(project.status)} 
                  size={16} 
                  tintColor="#fff" 
                />
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
            </View>
            
            <View style={styles.metaItem}>
              <View style={[
                styles.priorityBadge, 
                { backgroundColor: `${getPriorityColor(project.priority, colors)}20` }
              ]}>
                <Text style={[
                  styles.priorityText, 
                  { color: getPriorityColor(project.priority, colors) }
                ]}>
                  {project.priority} Priority
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>
                Progress
              </Text>
              {(isAssignedUser || isAdmin) && (
                <TouchableOpacity
                  onPress={() => setShowProgressInput(!showProgressInput)}
                  style={styles.editButton}
                >
                  <Icon name="edit" size={16} tintColor={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {showProgressInput ? (
              <View style={styles.progressInputRow}>
                <TextInput
                  style={[styles.progressInput, { 
                    color: colors.text, 
                    borderColor: colors.border,
                    backgroundColor: colors.surface 
                  }]}
                  value={updateProgress}
                  onChangeText={setUpdateProgress}
                  keyboardType="numeric"
                  placeholder="0-100"
                  placeholderTextColor={colors.placeholder}
                />
                <TouchableOpacity
                  style={[styles.updateButton, { backgroundColor: colors.primary }]}
                  onPress={handleProgressUpdate}
                  disabled={loading}
                >
                  <Text style={[styles.updateButtonText, { color: colors.textOnPrimary }]}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { backgroundColor: colors.primary, width: `${project.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {project.progress}% Complete
                </Text>
              </>
            )}
          </View>

          {/* Dates */}
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                Start Date
              </Text>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {new Date(project.startDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                End Date
              </Text>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {new Date(project.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Hours */}
          <View style={styles.hoursRow}>
            <View style={styles.hourItem}>
              <Text style={[styles.hourLabel, { color: colors.textSecondary }]}>
                Estimated
              </Text>
              <Text style={[styles.hourText, { color: colors.text }]}>
                {project.estimatedHours}h
              </Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={[styles.hourLabel, { color: colors.textSecondary }]}>
                Actual
              </Text>
              <Text style={[styles.hourText, { color: colors.text }]}>
                {project.actualHours || 0}h
              </Text>
            </View>
          </View>
        </View>

        {/* Status Update Actions (for assigned user and admin) */}
        {(isAssignedUser || isAdmin) && (
          <View style={[createCardStyle(colors), { margin: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Update Status
            </Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    { 
                      backgroundColor: project.status === status 
                        ? colors.primary 
                        : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleStatusUpdate(status)}
                  disabled={loading || project.status === status}
                >
                  <Text style={[
                    styles.statusOptionText,
                    { 
                      color: project.status === status 
                        ? colors.textOnPrimary 
                        : colors.text 
                    }
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View style={[createCardStyle(colors), { margin: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Comments ({project.comments?.length || 0})
          </Text>
          
          {/* Add Comment */}
          <View style={styles.addCommentSection}>
            <TextInput
              style={[styles.commentInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.surface 
              }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.placeholder}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.addCommentButton, { backgroundColor: colors.primary }]}
              onPress={handleAddComment}
              disabled={loading || !newComment.trim()}
            >
              <Text style={[styles.addCommentButtonText, { color: colors.textOnPrimary }]}>
                Add Comment
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {project.comments && project.comments.length > 0 ? (
            project.comments.map((comment, index) => (
              <View 
                key={comment.id || index} 
                style={[styles.commentItem, { borderColor: colors.border }]}
              >
                <View style={styles.commentHeader}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>
                    {comment.userName}
                  </Text>
                  <Text style={[styles.commentDate, { color: colors.textSecondary }]}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: colors.textSecondary }]}>
                  {comment.text}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyComments}>
              <Text style={[styles.emptyCommentsText, { color: colors.textSecondary }]}>
                No comments yet. Be the first to add one!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  progressInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourItem: {
    flex: 1,
    alignItems: 'center',
  },
  hourLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  hourText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addCommentSection: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addCommentButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addCommentButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyComments: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ProjectDetailScreen;