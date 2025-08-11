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
  Platform,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchProjectById,
  addCommentAsync,
  createSubTaskAsync,
  updateSubTaskAsync,
  updateProjectAsync,
} from '../../store/slices/projectSlice';
import { useTheme } from '../../theme/useTheme';
import { Project, SubTask } from '../../types';
import Icon from '../../components/common/Icon';
import SubTaskItem from '../../components/projects/SubTaskItem';
import CommentBox from '../../components/projects/CommentBox';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';

// Import new components
import ProjectHeader from './components/ProjectHeader';
import StatusPrioritySelector from './components/StatusPrioritySelector';
import EditableField from './components/EditableField';
import ProgressSection from './components/ProgressSection';
import ProjectInfoCards from './components/ProjectInfoCards';

interface ProjectDetailScreenProps {
  route: {
    params: {
      projectId: string;
    };
  };
  navigation: any;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { projectId } = route.params;
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const currentUser = useAppSelector(state => state.auth.user);
  const project = useAppSelector(state => state.projects.selectedProject);
  const loading = useAppSelector(state => state.projects.loading);

  // Modal states
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Inline editing states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('To Do');
  const [editPriority, setEditPriority] =
    useState<Project['priority']>('Medium');
  const [editEstimatedHours, setEditEstimatedHours] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editProgress, setEditProgress] = useState(0);

  // Track changes to show save buttons
  const [titleChanged, setTitleChanged] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [priorityChanged, setPriorityChanged] = useState(false);
  const [estimatedHoursChanged, setEstimatedHoursChanged] = useState(false);
  const [categoryChanged, setCategoryChanged] = useState(false);
  const [startDateChanged, setStartDateChanged] = useState(false);
  const [endDateChanged, setEndDateChanged] = useState(false);
  const [progressChanged, setProgressChanged] = useState(false);

  // SubTask form
  const [subTaskTitle, setSubTaskTitle] = useState('');
  const [subTaskDescription, setSubTaskDescription] = useState('');
  const [subTaskPriority, setSubTaskPriority] =
    useState<SubTask['priority']>('Medium');

  const isAdmin = currentUser?.role === 'admin';
  const isDeveloper = currentUser?.role === 'developer';
  const isAssigned =
    project?.assignedTo.includes(currentUser?.uid || '') || false;
  const canEditProject = isAdmin || (isDeveloper && isAssigned);

  // Helper functions for status change modal (still needed)
  const getStatusColor = (status: Project['status']) => {
    // Align with progress colors for consistency
    switch (status) {
      case 'To Do':
        return '#FF3B30'; // Red (like early progress)
      case 'In Progress':
        return '#007AFF'; // Blue (like mid progress)
      case 'Review':
        return '#FF9500'; // Orange (like low-mid progress)
      case 'Testing':
        return '#30D158'; // Green (like high progress)
      case 'Done':
        return '#34C759'; // Completed Green
      case 'Deployment':
        return '#5856D6'; // Purple (special state)
      default:
        return theme.colors.textSecondary;
    }
  };

  // Map status to progress percentage
  const getProgressFromStatus = (status: Project['status']): number => {
    switch (status) {
      case 'To Do':
        return 0; // Backlog/Created - 0%
      case 'In Progress':
        return 25; // Started development - 25%
      case 'Review':
        return 60; // Code review phase - 60%
      case 'Testing':
        return 80; // Testing phase - 80%
      case 'Done':
        return 100; // Completed - 100%
      case 'Deployment':
        return 95; // Ready for deployment - 95%
      default:
        return 0;
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setEditDescription(project.description);
      setEditStatus(project.status);
      setEditPriority(project.priority);
      setEditEstimatedHours(project.estimatedHours?.toString() || '');
      setEditCategory(project.category || '');
      setEditStartDate(project.startDate);
      setEditEndDate(project.endDate);
      setEditProgress(project.progress || 0);

      // Reset change tracking
      setTitleChanged(false);
      setDescriptionChanged(false);
      setStatusChanged(false);
      setPriorityChanged(false);
      setEstimatedHoursChanged(false);
      setCategoryChanged(false);
      setStartDateChanged(false);
      setEndDateChanged(false);
      setProgressChanged(false);
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

  const handleSaveProgress = async () => {
    if (editProgress === project?.progress) {
      setProgressChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { progress: editProgress },
        }),
      ).unwrap();
      setProgressChanged(false);
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error: any) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', error?.message || 'Failed to update progress');
      setEditProgress(project?.progress || 0);
      setProgressChanged(false);
    }
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

  // Handle text changes and track modifications
  const handleTitleChange = (text: string) => {
    setEditTitle(text);
    setTitleChanged(text !== project?.title);
  };

  const handleDescriptionChange = (text: string) => {
    setEditDescription(text);
    setDescriptionChanged(text !== project?.description);
  };

  const handleEstimatedHoursChange = (text: string) => {
    setEditEstimatedHours(text);
    setEstimatedHoursChanged(text !== project?.estimatedHours?.toString());
  };

  const handleCategoryChange = (text: string) => {
    setEditCategory(text);
    setCategoryChanged(text !== project?.category);
  };

  const handleStatusChange = (status: Project['status']) => {
    setEditStatus(status);
    setStatusChanged(status !== project?.status);
  };

  const handlePriorityChange = (priority: Project['priority']) => {
    setEditPriority(priority);
    setPriorityChanged(priority !== project?.priority);
  };

  const handleStartDateChange = (date: string) => {
    setEditStartDate(date);
    setStartDateChanged(date !== project?.startDate);
  };

  const handleEndDateChange = (date: string) => {
    setEditEndDate(date);
    setEndDateChanged(date !== project?.endDate);
  };

  const handleProgressChange = (progressText: string) => {
    const progress = parseInt(progressText) || 0;
    const clampedProgress = Math.max(0, Math.min(100, progress));
    setEditProgress(clampedProgress);
    setProgressChanged(clampedProgress !== project?.progress);
  };

  // Save functions
  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle === project?.title) {
      setTitleChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { title: editTitle.trim() },
        }),
      ).unwrap();
      setTitleChanged(false);
      Alert.alert('Success', 'Title updated successfully');
    } catch (error: any) {
      console.error('Error updating title:', error);
      Alert.alert('Error', error?.message || 'Failed to update title');
      setEditTitle(project?.title || '');
      setTitleChanged(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!editDescription.trim() || editDescription === project?.description) {
      setDescriptionChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { description: editDescription.trim() },
        }),
      ).unwrap();
      setDescriptionChanged(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error: any) {
      console.error('Error updating description:', error);
      Alert.alert('Error', error?.message || 'Failed to update description');
      setEditDescription(project?.description || '');
      setDescriptionChanged(false);
    }
  };

  const handleSaveEstimatedHours = async () => {
    const hours = parseInt(editEstimatedHours) || 0;
    if (hours === project?.estimatedHours) {
      setEstimatedHoursChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { estimatedHours: hours },
        }),
      ).unwrap();
      setEstimatedHoursChanged(false);
      Alert.alert('Success', 'Estimated hours updated successfully');
    } catch (error: any) {
      console.error('Error updating estimated hours:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update estimated hours',
      );
      setEditEstimatedHours(project?.estimatedHours?.toString() || '');
      setEstimatedHoursChanged(false);
    }
  };

  const handleSaveCategory = async () => {
    if (editCategory === project?.category) {
      setCategoryChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { category: editCategory.trim() },
        }),
      ).unwrap();
      setCategoryChanged(false);
      Alert.alert('Success', 'Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      Alert.alert('Error', error?.message || 'Failed to update category');
      setEditCategory(project?.category || '');
      setCategoryChanged(false);
    }
  };

  const handleSaveStatus = async () => {
    if (editStatus === project?.status) {
      setStatusChanged(false);
      return;
    }

    // Debug logging to help identify permission issue
    console.log('=== Status Update Debug Info ===');
    console.log('Current user:', {
      uid: currentUser?.uid,
      role: currentUser?.role,
      approved: currentUser?.approved,
      email: currentUser?.email,
    });
    console.log('Project info:', {
      id: projectId,
      assignedTo: project?.assignedTo,
      createdBy: project?.createdBy,
    });
    console.log('Permission checks:', {
      isAdmin,
      isDeveloper,
      isAssigned,
      canEditProject,
    });
    console.log('Update data:', {
      status: editStatus,
      oldStatus: project?.status,
    });

    try {
      // Calculate new progress based on status
      const newProgress = getProgressFromStatus(editStatus);
      const shouldUpdateProgress = newProgress !== project?.progress;

      // Update both status and progress if needed
      const updates: Partial<Project> = { status: editStatus };
      if (shouldUpdateProgress) {
        updates.progress = newProgress;
        setEditProgress(newProgress);
        setProgressChanged(false); // Auto-sync, so no pending changes
      }

      console.log('Updating project with:', updates);

      await dispatch(
        updateProjectAsync({
          projectId,
          updates,
        }),
      ).unwrap();

      setStatusChanged(false);

      // Show success message with progress update info
      const message = shouldUpdateProgress
        ? `Status updated to "${editStatus}" and progress set to ${newProgress}%`
        : 'Status updated successfully';
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error?.message || 'Failed to update status');
      setEditStatus(project?.status || 'To Do');
      setStatusChanged(false);
    }
  };

  const handleSavePriority = async () => {
    if (editPriority === project?.priority) {
      setPriorityChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { priority: editPriority },
        }),
      ).unwrap();
      setPriorityChanged(false);
      Alert.alert('Success', 'Priority updated successfully');
    } catch (error: any) {
      console.error('Error updating priority:', error);
      Alert.alert('Error', error?.message || 'Failed to update priority');
      setEditPriority(project?.priority || 'Medium');
      setPriorityChanged(false);
    }
  };

  const handleSaveStartDate = async () => {
    if (editStartDate === project?.startDate) {
      setStartDateChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { startDate: editStartDate },
        }),
      ).unwrap();
      setStartDateChanged(false);
      Alert.alert('Success', 'Start date updated successfully');
    } catch (error: any) {
      console.error('Error updating start date:', error);
      Alert.alert('Error', error?.message || 'Failed to update start date');
      setEditStartDate(project?.startDate || '');
      setStartDateChanged(false);
    }
  };

  const handleSaveEndDate = async () => {
    if (editEndDate === project?.endDate) {
      setEndDateChanged(false);
      return;
    }

    try {
      await dispatch(
        updateProjectAsync({
          projectId,
          updates: { endDate: editEndDate },
        }),
      ).unwrap();
      setEndDateChanged(false);
      Alert.alert('Success', 'End date updated successfully');
    } catch (error: any) {
      console.error('Error updating end date:', error);
      Alert.alert('Error', error?.message || 'Failed to update end date');
      setEditEndDate(project?.endDate || '');
      setEndDateChanged(false);
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
      quality: 0.7 as any,
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
      {/* Header */}
      <ProjectHeader
        title="Project Details"
        subtitle={project.title}
        onBack={() => navigation.goBack()}
        onAddSubtask={() => setShowSubTaskModal(true)}
        showAddButton={canEditProject}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Main Project Info */}
        <View style={styles.heroSection}>
          {/* Project Title */}
          <EditableField
            label="Project Title"
            value={editTitle}
            onChangeText={handleTitleChange}
            onSave={handleSaveTitle}
            canEdit={canEditProject}
            hasChanged={titleChanged}
            placeholder="Enter project title..."
            maxLength={100}
            isTitle={true}
          />

          {/* Status & Priority */}
          <StatusPrioritySelector
            status={editStatus}
            priority={editPriority}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            canEdit={canEditProject}
            statusChanged={statusChanged}
            priorityChanged={priorityChanged}
            onSaveStatus={handleSaveStatus}
            onSavePriority={handleSavePriority}
          />

          {/* Project Description */}
          <EditableField
            label="Project Description"
            value={editDescription}
            onChangeText={handleDescriptionChange}
            onSave={handleSaveDescription}
            canEdit={canEditProject}
            hasChanged={descriptionChanged}
            placeholder="Enter detailed project description..."
            multiline={true}
            numberOfLines={4}
            maxLength={1000}
            isDescription={true}
          />

          {/* Progress Section */}
          <ProgressSection
            progress={project.progress}
            canEdit={canEditProject}
            editProgress={editProgress.toString()}
            onProgressChange={handleProgressChange}
            onSaveProgress={handleSaveProgress}
            hasChanged={progressChanged}
          />
        </View>

        {/* Quick Actions */}
        {canEditProject && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setShowSubTaskModal(true)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.colors.primary + '20' },
                  ]}
                >
                  <Icon name="add" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.actionCardTitle}>Add Subtask</Text>
                <Text style={styles.actionCardSubtitle}>
                  Create new subtask
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={handleFileUpload}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.colors.success + '20' },
                  ]}
                >
                  <Icon name="file" size={24} color={theme.colors.success} />
                </View>
                <Text style={styles.actionCardTitle}>Upload Files</Text>
                <Text style={styles.actionCardSubtitle}>Add documents</Text>
              </TouchableOpacity>

              {isDeveloper && (
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setShowEditModal(true)}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: theme.colors.warning + '20' },
                    ]}
                  >
                    <Icon name="edit" size={24} color={theme.colors.warning} />
                  </View>
                  <Text style={styles.actionCardTitle}>Edit Details</Text>
                  <Text style={styles.actionCardSubtitle}>
                    Update description
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Project Information Cards */}
        <ProjectInfoCards
          project={project}
          canEdit={canEditProject}
          editStartDate={editStartDate}
          editEndDate={editEndDate}
          editEstimatedHours={editEstimatedHours}
          editCategory={editCategory}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onEstimatedHoursChange={handleEstimatedHoursChange}
          onCategoryChange={handleCategoryChange}
          onSaveStartDate={handleSaveStartDate}
          onSaveEndDate={handleSaveEndDate}
          onSaveEstimatedHours={handleSaveEstimatedHours}
          onSaveCategory={handleSaveCategory}
          startDateChanged={startDateChanged}
          endDateChanged={endDateChanged}
          estimatedHoursChanged={estimatedHoursChanged}
          categoryChanged={categoryChanged}
        />

        {/* Subtasks Section */}
        <View style={styles.subtasksTitleRow}>
          <Icon name="project" size={24} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Subtasks</Text>
          <View style={styles.subtasksBadge}>
            <Text style={styles.subtasksBadgeText}>
              {project.subTasks.filter(st => st.status === 'Done').length} /{' '}
              {project.subTasks.length}
            </Text>
          </View>
          {canEditProject && (
            <TouchableOpacity
              style={styles.addSubtaskButton}
              onPress={() => setShowSubTaskModal(true)}
            >
              <Icon name="add" size={16} color="#fff" />
              <Text style={styles.addSubtaskText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {project.subTasks.length === 0 ? (
          <View style={styles.emptySubtasksCard}>
            <View style={styles.emptyIcon}>
              <Icon
                name="project"
                size={32}
                color={theme.colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No subtasks yet</Text>
            <Text style={styles.emptySubtext}>
              Break down your project into smaller, manageable tasks
            </Text>
            {canEditProject && (
              <TouchableOpacity
                style={styles.createSubtaskButton}
                onPress={() => setShowSubTaskModal(true)}
              >
                <Text style={styles.createSubtaskText}>
                  Create First Subtask
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          project.subTasks.map(subTask => (
            <View key={subTask.id} style={styles.subtaskCard}>
              <SubTaskItem
                subTask={subTask}
                onStatusChange={handleSubTaskStatusChange}
                onEdit={handleSubTaskEdit}
                canEdit={canEditProject}
                isEditable={
                  canEditProject && subTask.createdBy === currentUser?.uid
                }
              />
            </View>
          ))
        )}

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

        {/* Activity & Comments Section */}
        <View style={styles.activityTitleRow}>
          <Icon name="chat" size={24} color={theme.colors.success} />
          <Text style={styles.sectionTitle}>Activity & Comments</Text>
          <View style={styles.commentsBadge}>
            <Text style={styles.commentsBadgeText}>
              {project.comments.length}
            </Text>
          </View>
        </View>
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

      {/* Status Change Modal */}
      <Modal
        visible={isEditingStatus}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsEditingStatus(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Project Status</Text>
              <TouchableOpacity onPress={() => setIsEditingStatus(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Select New Status</Text>
              {(
                [
                  'To Do',
                  'In Progress',
                  'Review',
                  'Testing',
                  'Done',
                  'Deployment',
                ] as const
              ).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    project?.status === status && styles.statusOptionSelected,
                    {
                      backgroundColor:
                        project?.status === status
                          ? getStatusColor(status) + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      {
                        color:
                          project?.status === status
                            ? getStatusColor(status)
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {status}
                  </Text>
                  {project?.status === status && (
                    <Icon
                      name="check"
                      size={16}
                      color={getStatusColor(status)}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Note: Status and Priority modals are now handled by StatusPrioritySelector component */}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 20,
    },

    // Hero Section Styles
    heroSection: {
      backgroundColor: theme.colors.surface,
      marginTop: 8,
      marginBottom: 20,
      borderRadius: 20,
      padding: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },

    // Section Styles
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      letterSpacing: 0.5,
    },
    // Quick Actions Styles
    quickActionsSection: {
      marginBottom: 20,
    },
    actionGrid: {
      flexDirection: 'row',
      gap: 16,
    },
    quickActionCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    actionIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    actionCardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 6,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    actionCardSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      opacity: 0.8,
    },

    // Subtasks Section Styles - individual cards design
    subtasksTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },

    subtaskCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    emptySubtasksCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      marginBottom: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    subtasksBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    subtasksBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    addSubtaskButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      gap: 6,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    addSubtaskText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
    },
    emptySubtasks: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 32,
    },
    createSubtaskButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 24,
      alignItems: 'center',
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    createSubtaskText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0.3,
    },
    subtasksList: {
      gap: 8,
    },

    // Activity Section Styles
    activitySection: {
      margin: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },

    // Activity Section Styles
    activityTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    commentsBadge: {
      backgroundColor: theme.colors.success + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    commentsBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.success,
    },

    // File section styles
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

    // Loading/Error states
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

    // Inline editing styles
    statusSection: {
      marginBottom: 16,
    },
    statusSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    statusSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      minWidth: 120,
    },
    statusSelectorText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },

    // New inline editing styles
    editableFieldContainer: {
      marginBottom: 20,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    inputWithSave: {
      position: 'relative',
    },
    titleInput: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      minHeight: 50,
    },
    descriptionInput: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    readOnlyField: {
      flex: 1,
    },
    saveButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.colors.success,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },

    // Detail item editing styles
    editableDetailItem: {
      marginBottom: 12,
    },
    detailInputWithSave: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    detailUnit: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    smallSaveButton: {
      backgroundColor: theme.colors.success,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },

    // Status change modal styles
    statusOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    statusOptionSelected: {
      borderColor: theme.colors.primary,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    statusOptionText: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },

    // New inline editing dropdown styles
    statusPriorityRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    halfWidthContainer: {
      flex: 1,
    },
    dropdownWithSave: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      zIndex: 100,
    },
    dropdown: {
      flex: 1,
      position: 'relative',
      zIndex: 100,
    },
    dropdownButton: {
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 40,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    dropdownButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
      flex: 1,
      marginLeft: 8,
    },
    dropdownOptions: {
      position: 'absolute',
      top: 42,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      zIndex: 9999,
      maxHeight: 150,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 15,
    },
    dropdownOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    dropdownOptionSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    dropdownOptionIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    dropdownOptionText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    readOnlyFieldContainer: {
      marginBottom: 16,
    },
    priorityIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
    },

    // Missing styles
    section: {
      margin: 16,
    },
    emptySubText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 20,
      lineHeight: 20,
    },

    // Mobile optimized styles
    descriptionSection: {
      marginBottom: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    descriptionReadOnly: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    mobileOptimized: {
      fontSize: 16,
      lineHeight: 24,
      minHeight: 60,
    },

    // Enhanced mobile date input styles
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    dateInputText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    datePickerButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
    },
    datePickerButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },

    // Progress editing styles
    progressEditContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    progressInput: {
      backgroundColor: theme.colors.inputBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      width: 50,
      textAlign: 'center',
    },
    progressPercentSign: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginRight: 8,
    },

    // Dropdown Modal Styles
    dropdownModalContainer: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 16,
      position: 'absolute',
      left: 0,
      right: 0,
      maxHeight: 300,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        android: {
          elevation: 16,
        },
      }),
    },
    dropdownModalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    dropdownModalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    dropdownModalOptionSelected: {
      backgroundColor: theme.colors.primary + '20',
      borderWidth: 1,
      borderColor: theme.colors.primary + '50',
    },
    dropdownModalOptionText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
    },
  });

export default ProjectDetailScreen;
