import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchProjectById,
  addCommentAsync,
  createSubTaskAsync,
  updateSubTaskAsync,
  updateProjectAsync,
} from '../../store/slices/projectSlice';
import { useTheme } from '../../theme/useTheme';
import { Project, SubTask, ProjectComment, User } from '../../types';
import Icon from '../../components/common/Icon';
import ProjectCard from '../../components/projects/ProjectCard';
import SubTaskItem from '../../components/projects/SubTaskItem';
import CommentBox from '../../components/projects/CommentBox';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';

interface ProjectDetailScreenProps {
  route: {
    params: {
      projectId: string;
      canEdit?: boolean;
    };
  };
  navigation: any;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId, canEdit = false } = route.params;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const currentUser = useAppSelector(state => state.auth.user);
  const project = useAppSelector(state => state.projects.selectedProject);
  const loading = useAppSelector(state => state.projects.loading);

  // Modal states
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // SubTask form
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskDescription, setSubTaskDescription] = useState('');
  const [subTaskPriority, setSubTaskPriority] =
    useState<SubTask['priority']>('Medium');

  // Edit form
  const [editDescription, setEditDescription] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const isDeveloper = currentUser?.role === 'developer';
  const isAssigned =
    project?.assignedTo.includes(currentUser?.uid || '') || false;
  const canEditProject = isAdmin || (isDeveloper && isAssigned);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setEditDescription(project.description);
    }
  }, [project]);

  const loadProject = async () => {
    try {
      await dispatch(fetchProjectById(projectId)).unwrap();
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project details');
      navigation.goBack();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProject();
    setRefreshing(false);
  };

  const handleAddComment = async (commentText: string) => {
    try {
      if (!currentUser) return;

      const commentData = {
        text: commentText,
        userId: currentUser.uid,
        userName: currentUser.name || currentUser.email || 'Unknown User',
      };

      await dispatch(addCommentAsync({ projectId, commentData })).unwrap();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', error?.message || 'Failed to add comment');
    }
  };

  const handleAddSubTask = async () => {
    if (!subTaskTitle.trim()) {
      Alert.alert('Validation Error', 'Subtask title is required');
      return;
    }

    try {
      if (!currentUser) return;

      const subTaskData = {
        title: subTaskTitle.trim(),
        description: subTaskDescription.trim() || undefined,
        status: 'To Do' as SubTask['status'],
        priority: subTaskPriority,
        assignedTo: currentUser.uid,
        createdBy: currentUser.uid,
      };

      await dispatch(createSubTaskAsync({ projectId, subTaskData })).unwrap();

      setSubTaskTitle('');
      setSubTaskDescription('');
      setSubTaskPriority('Medium');
      setShowSubTaskModal(false);
      Alert.alert('Success', 'Subtask added successfully');
    } catch (error: any) {
      console.error('Error adding subtask:', error);
      Alert.alert('Error', error?.message || 'Failed to add subtask');
    }
  };

  const handleSubTaskStatusChange = async (
    subTaskId: string,
    status: SubTask['status'],
  ) => {
    try {
      await dispatch(
        updateSubTaskAsync({
          projectId,
          subTaskId,
          updates: { status },
        }),
      ).unwrap();
    } catch (error: any) {
      console.error('Error updating subtask:', error);
      Alert.alert('Error', error?.message || 'Failed to update subtask');
    }
  };

  const handleSubTaskEdit = async (
    subTaskId: string,
    updates: Partial<SubTask>,
  ) => {
    try {
      await dispatch(
        updateSubTaskAsync({
          projectId,
          subTaskId,
          updates,
        }),
      ).unwrap();
    } catch (error: any) {
      console.error('Error updating subtask:', error);
      Alert.alert('Error', error?.message || 'Failed to update subtask');
    }
  };

  const handleEditDescription = async () => {
    if (!editDescription.trim() || editDescription === project?.description) {
      setShowEditModal(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { description: editDescription.trim() },
        }),
      ).unwrap();
      setShowEditModal(false);
      Alert.alert('Success', 'Project description updated');
    } catch (error: any) {
      console.error('Error updating description:', error);
      Alert.alert('Error', error?.message || 'Failed to update description');
    }
  };

  const handleFileUpload = () => {
    Alert.alert('Upload File', 'Choose an option', [
      { text: 'Document', onPress: handleDocumentUpload },
      { text: 'Photo/Video', onPress: handleImageUpload },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
      });

      if (result && result.length > 0) {
        const file = result[0];
        // TODO: Implement file upload using uploadFileToProject action
        console.log('Document selected:', file);
        Alert.alert('Info', 'File upload functionality will be implemented');
      }
    } catch (error: any) {
      // Check if the error is due to user cancellation
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Document picker error:', error);
      }
    }
  };

  const handleImageUpload = () => {
    Alert.alert('Select Image/Video', 'Choose an option', [
      { text: 'Camera', onPress: () => openImagePicker('camera') },
      { text: 'Gallery', onPress: () => openImagePicker('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openImagePicker = (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'mixed' as const,
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    const callback = (response: any) => {
      if (response.assets && response.assets.length > 0) {
        // TODO: Implement image upload
        console.log('Images selected:', response.assets);
        Alert.alert('Info', 'Image upload functionality will be implemented');
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'To Do':
        return theme.colors.warning;
      case 'In Progress':
        return theme.colors.primary;
      case 'Done':
        return theme.colors.success;
      case 'Testing':
        return theme.colors.info;
      case 'Review':
        return '#9C27B0';
      case 'Deployment':
        return '#FF5722';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return '#D32F2F';
      case 'High':
        return '#F57C00';
      case 'Medium':
        return '#1976D2';
      case 'Low':
        return '#388E3C';
      default:
        return theme.colors.textSecondary;
    }
  };

  const styles = getStyles(theme);

  if (loading && !project) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Project not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
        translucent={Platform.OS === 'ios'}
      />
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        {canEditProject && isAdmin && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProjectFormNew', { project })}
          >
            <Icon name="edit" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {!isAdmin && <View style={{ width: 24 }} />}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Project Overview */}
        <View style={styles.section}>
          <ProjectCard
            project={project}
            onPress={() => {}}
            showAssignees={true}
            compact={false}
          />
        </View>

        {/* Action Buttons */}
        {canEditProject && (
          <View style={styles.section}>
            <View style={styles.actionButtons}>
              {isDeveloper && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowEditModal(true)}
                >
                  <Icon name="edit" size={20} color={theme.colors.primary} />
                  <Text style={styles.actionButtonText}>Edit Description</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleFileUpload}
              >
                <Icon name="upload" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Upload Files</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowSubTaskModal(true)}
              >
                <Icon name="plus" size={20} color={theme.colors.primary} />
                <Text style={styles.actionButtonText}>Add Subtask</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Project Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(project.status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(project.status) },
                  ]}
                >
                  {project.status}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Priority:</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: getPriorityColor(project.priority) },
                ]}
              >
                {project.priority}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Progress:</Text>
              <Text style={styles.infoValue}>{project.progress}%</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Hours:</Text>
              <Text style={styles.infoValue}>{project.estimatedHours}h</Text>
            </View>

            {project.category && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category:</Text>
                <Text style={styles.infoValue}>{project.category}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Start Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(project.startDate).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>End Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(project.endDate).toLocaleDateString()}
              </Text>
            </View>

            {project.tags && project.tags.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {project.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Subtasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Subtasks (
            {project.subTasks.filter(st => st.status === 'Done').length}/
            {project.subTasks.length})
          </Text>
          {project.subTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="list" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No subtasks yet</Text>
              <Text style={styles.emptySubText}>
                Add subtasks to break down your project into manageable pieces
              </Text>
            </View>
          ) : (
            project.subTasks.map(subTask => (
              <SubTaskItem
                key={subTask.id}
                subTask={subTask}
                onStatusChange={handleSubTaskStatusChange}
                onEdit={handleSubTaskEdit}
                canEdit={canEditProject}
                isEditable={
                  canEditProject && subTask.createdBy === currentUser?.uid
                }
              />
            ))
          )}
        </View>

        {/* File and Image Section */}
        {(project.files.length > 0 || project.images.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Files & Images</Text>
            <View style={styles.filesContainer}>
              <View style={styles.fileStats}>
                <Text style={styles.fileStatText}>
                  {project.files.length} Documents
                </Text>
                <Text style={styles.fileStatText}>
                  {project.images.length} Images
                </Text>
              </View>
              <Text style={styles.emptySubText}>
                File listing implementation pending
              </Text>
            </View>
          </View>
        )}

        {/* Comments */}
        <CommentBox
          comments={project.comments}
          onAddComment={handleAddComment}
          currentUserName={
            currentUser?.name || currentUser?.email || 'Unknown User'
          }
          canComment={true}
        />
      </ScrollView>

      {/* Subtask Modal */}
      <Modal
        visible={showSubTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSubTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Subtask</Text>
              <TouchableOpacity onPress={() => setShowSubTaskModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter subtask title"
                value={subTaskTitle}
                onChangeText={setSubTaskTitle}
                maxLength={100}
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="Enter subtask description (optional)"
                value={subTaskDescription}
                onChangeText={setSubTaskDescription}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['Low', 'Medium', 'High'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      subTaskPriority === priority &&
                        styles.priorityButtonSelected,
                    ]}
                    onPress={() => setSubTaskPriority(priority)}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        subTaskPriority === priority &&
                          styles.priorityButtonTextSelected,
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleAddSubTask}
              >
                <Text style={styles.modalSubmitButtonText}>Add Subtask</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Description Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Description</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Project Description</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="Enter project description"
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={8}
                maxLength={1000}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleEditDescription}
                >
                  <Text style={styles.modalSubmitButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 12 : 20,
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      gap: 6,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      minHeight: 32,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-end',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    tagsContainer: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 4,
    },
    tag: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    tagText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      marginHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 12,
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    filesContainer: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      padding: 16,
    },
    fileStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    fileStatText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    errorText: {
      fontSize: 18,
      color: theme.colors.text,
      marginBottom: 20,
    },
    backButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    backButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    modalContent: {
      padding: 20,
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    modalTextArea: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      minHeight: 100,
    },
    priorityButtons: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    priorityButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    priorityButtonText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    priorityButtonTextSelected: {
      color: '#fff',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    modalCancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: theme.colors.textSecondary,
    },
    modalCancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalSubmitButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    modalSubmitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default ProjectDetailScreen;
