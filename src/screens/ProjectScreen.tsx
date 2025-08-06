import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateProject } from '../store/slices/projectSlice';
import { 
  updateProjectStatus, 
  addCommentToProject, 
  getUserById,
  updateProjectInFirestore 
} from '../firebase/firestore';
import { Project, ProjectComment, User } from '../types';
import Icon from '../components/common/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { spacing, borderRadius } from '../constants/spacing';

interface ProjectScreenProps {
  route: any;
  navigation: any;
}

const ProjectScreen: React.FC<ProjectScreenProps> = ({ route, navigation }) => {
  const { projectId } = route.params || {};
  const { colors, gradients } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const projects = useAppSelector(state => state.projects.projects);
  
  const [project, setProject] = useState<Project | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [progressValue, setProgressValue] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'developer';
  const isAssignedUser = project?.assignedTo === user?.uid;

  useEffect(() => {
    if (projectId) {
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        setProgressValue(foundProject.progress.toString());
        loadAssignedUser(foundProject.assignedTo);
      }
    }
  }, [projectId, projects]);

  const loadAssignedUser = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      setAssignedUser(userData);
    } catch (error) {
      console.error('Error loading assigned user:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Reload project data if needed
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

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project) return;

    try {
      await updateProjectStatus(project.id, newStatus);
      const updatedProject = { ...project, status: newStatus };
      setProject(updatedProject);
      dispatch(updateProject(updatedProject));
      setStatusModalVisible(false);
      Alert.alert('Success', 'Project status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update project status');
    }
  };

  const handleProgressUpdate = async () => {
    if (!project) return;

    const progress = parseInt(progressValue);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert('Error', 'Please enter a valid progress value (0-100)');
      return;
    }

    try {
      const updatedProject = { ...project, progress };
      await updateProjectInFirestore(updatedProject);
      setProject(updatedProject);
      dispatch(updateProject(updatedProject));
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const handleAddComment = async () => {
    if (!project || !user || !newComment.trim()) return;

    try {
      const comment: Omit<ProjectComment, 'id' | 'createdAt'> = {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.name || user.email || 'Unknown User',
      };

      const addedComment = await addCommentToProject(project.id, comment);
      const updatedProject = {
        ...project,
        comments: [...project.comments, addedComment],
      };
      
      setProject(updatedProject);
      dispatch(updateProject(updatedProject));
      setNewComment('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions: Project['status'][] = [
    'Pending', 'Development', 'Review', 'Testing', 'Done', 'Deployment', 'Fixing Bug'
  ];

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Icon name="project" size={64} tintColor={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {projectId ? 'Project not found' : 'Select a project to view details'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {projectId ? 'This project may have been deleted or you may not have access to it.' : 'Choose a project from the list to see its details and manage it.'}
          </Text>
        </View>
      </View>
    );
  }

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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="back" size={24} tintColor="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {project.title}
          </Text>
          
          {isAdmin && (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProjectForm', { project })}
              style={styles.editButton}
            >
              <Icon name="edit" size={24} tintColor="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Project Info */}
        <Card variant="elevated" style={styles.projectInfo}>
          <View style={styles.projectHeader}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
                <Text style={styles.statusText}>{project.status}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(project.priority)}20` }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
                  {project.priority} Priority
                </Text>
              </View>
            </View>
            
            <Text style={[styles.projectTitle, { color: colors.text }]}>
              {project.title}
            </Text>
            
            <Text style={[styles.projectDescription, { color: colors.textSecondary }]}>
              {project.description}
            </Text>
          </View>

          <View style={styles.projectMeta}>
            <View style={styles.metaRow}>
              <Icon name="user" size={16} tintColor={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Assigned to: {assignedUser?.name || assignedUser?.email || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <Icon name="calendar" size={16} tintColor={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </Text>
            </View>
            
            <View style={styles.metaRow}>
              <Icon name="time" size={16} tintColor={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                Est: {project.estimatedHours}h | Actual: {project.actualHours}h
              </Text>
            </View>
          </View>
        </Card>

        {/* Progress Section */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress</Text>
            {(isAdmin || isAssignedUser) && (
              <TouchableOpacity
                onPress={handleProgressUpdate}
                style={[styles.updateButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            )}
          </View>
          
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
              {project.progress}% Complete
            </Text>
          </View>

          {(isAdmin || isAssignedUser) && (
            <Input
              placeholder="Enter progress (0-100)"
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
              containerStyle={styles.progressInput}
            />
          )}
        </Card>

        {/* Status Management */}
        {(isAdmin || isAssignedUser) && (
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Status Management
            </Text>
            <Button
              title="Change Status"
              onPress={() => setStatusModalVisible(true)}
              variant="outline"
              icon="status"
            />
          </Card>
        )}

        {/* Comments Section */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comments ({project.comments.length})
            </Text>
            <Button
              title="Add"
              onPress={() => setCommentModalVisible(true)}
              size="small"
              icon="comment"
            />
          </View>

          {project.comments.length > 0 ? (
            project.comments.map((comment, index) => (
              <View key={comment.id || index} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Icon name="account" size={20} tintColor={colors.primary} />
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>
                    {comment.userName}
                  </Text>
                  <Text style={[styles.commentDate, { color: colors.textSecondary }]}>
                    {formatDateTime(comment.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.commentText, { color: colors.textSecondary }]}>
                  {comment.text}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No comments yet. Be the first to add one!
            </Text>
          )}
        </Card>

        {/* Files Section */}
        {(project.files.length > 0 || project.images.length > 0) && (
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Attachments
            </Text>
            
            {project.files.length > 0 && (
              <View style={styles.attachmentGroup}>
                <Text style={[styles.attachmentGroupTitle, { color: colors.textSecondary }]}>
                  Files ({project.files.length})
                </Text>
                {project.files.map((file, index) => (
                  <View key={file.id || index} style={styles.attachmentItem}>
                    <Icon name="file" size={20} tintColor={colors.primary} />
                    <Text style={[styles.attachmentName, { color: colors.text }]}>
                      {file.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {project.images.length > 0 && (
              <View style={styles.attachmentGroup}>
                <Text style={[styles.attachmentGroupTitle, { color: colors.textSecondary }]}>
                  Images ({project.images.length})
                </Text>
                {project.images.map((image, index) => (
                  <View key={image.id || index} style={styles.attachmentItem}>
                    <Icon name="add" size={20} tintColor={colors.secondary} />
                    <Text style={[styles.attachmentName, { color: colors.text }]}>
                      {image.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Comment
            </Text>
            
            <Input
              placeholder="Enter your comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
              containerStyle={styles.commentInput}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setCommentModalVisible(false);
                  setNewComment('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Comment"
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Status Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Change Status
            </Text>
            
            <View style={styles.statusOptions}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    { backgroundColor: colors.surface },
                    project.status === status && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      { color: colors.text },
                      project.status === status && { color: '#fff' },
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Cancel"
              onPress={() => setStatusModalVisible(false)}
              variant="outline"
              style={styles.modalCancelButton}
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  projectInfo: {
    marginTop: 20,
  },
  projectHeader: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  projectMeta: {
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: 14,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressInput: {
    marginTop: spacing.md,
  },
  commentItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  commentDate: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  attachmentGroup: {
    marginBottom: spacing.md,
  },
  attachmentGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  attachmentName: {
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  commentInput: {
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  statusOptions: {
    marginBottom: spacing.lg,
  },
  statusOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: spacing.md,
  },
});

export default ProjectScreen;
