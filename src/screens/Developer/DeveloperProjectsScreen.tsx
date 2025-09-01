import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  fetchUserProjects,
  updateProjectAsync,
  createSubTaskAsync,
  updateSubTaskAsync,
  addCommentAsync,
  uploadFileToProject as uploadFileToProjectThunk,
  updateProjectProgress,
  setLoading,
} from '../../store/slices/projectSlice';
import { validateFile } from '../../services/storage/fileUpload';
import Icon from '../../components/common/Icon';
import NotificationButton from '../../components/common/NotificationButton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Project, SubTask, ProjectComment } from '../../types';
import { getStatusColor, getPriorityColor } from '../../theme/themeUtils';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
  launchCamera,
} from 'react-native-image-picker';

const { width } = Dimensions.get('window');

interface DeveloperProjectsScreenProps {
  navigation: any;
}

type TabType = 'overview' | 'projects' | 'tasks';

const DeveloperProjectsScreen: React.FC<DeveloperProjectsScreenProps> = ({
  navigation,
}) => {
  const { colors, gradients, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const userProjects = useAppSelector(state => state.projects.userProjects);
  const loading = useAppSelector(state => state.projects.loading);

  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [subtaskModalVisible, setSubtaskModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  // Form states
  const [editedDescription, setEditedDescription] = useState('');
  const [newStatus, setNewStatus] = useState<Project['status']>('Development');
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });
  const [newComment, setNewComment] = useState('');

  // Available status workflow for developers
  const developerAllowedStatuses: Project['status'][] = [
    'Development',
    'Review',
    'Testing',
    'Done',
  ];

  const stats = useMemo(() => {
    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(p =>
      ['Development', 'Review', 'Testing'].includes(p.status),
    ).length;
    const completedProjects = userProjects.filter(
      p => p.status === 'Done',
    ).length;
    const pendingProjects = userProjects.filter(
      p => p.status === 'Pending',
    ).length;
    const totalSubtasks = userProjects.reduce(
      (acc, p) => acc + p.subTasks.length,
      0,
    );
    const completedSubtasks = userProjects.reduce(
      (acc, p) => acc + p.subTasks.filter(st => st.completed).length,
      0,
    );

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalSubtasks,
      completedSubtasks,
    };
  }, [userProjects]);

  useEffect(() => {
    loadUserProjects();
  }, [user]);

  const loadUserProjects = async () => {
    if (!user) return;

    try {
      await dispatch(fetchUserProjects(user.uid)).unwrap();
    } catch (error) {
      console.error('Error loading user projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProjects();
    setRefreshing(false);
  };

  const handleEditDescription = async () => {
    if (!selectedProject || !user) return;

    try {
      await dispatch(
        updateProjectAsync({
          projectId: selectedProject.id,
          updates: {
            description: editedDescription,
            updatedAt: new Date().toISOString(),
          },
        }),
      ).unwrap();

      setEditModalVisible(false);
      Alert.alert('Success', 'Project description updated successfully');
    } catch (error) {
      console.error('Error updating project description:', error);
      Alert.alert('Error', 'Failed to update project description');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedProject || !user) return;

    try {
      await dispatch(
        updateProjectAsync({
          projectId: selectedProject.id,
          updates: {
            status: newStatus,
            updatedAt: new Date().toISOString(),
          },
        }),
      ).unwrap();

      setStatusModalVisible(false);
      Alert.alert('Success', 'Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
      Alert.alert('Error', 'Failed to update project status');
    }
  };

  const handleCreateSubtask = async () => {
    if (!selectedProject || !user || !newSubtask.title.trim()) return;

    try {
      await dispatch(
        createSubTaskAsync({
          projectId: selectedProject.id,
          subTaskData: {
            title: newSubtask.title.trim(),
            description: newSubtask.description.trim(),
            completed: false,
            assignedTo: user.uid,
            createdBy: user.uid,
          },
        }),
      ).unwrap();

      // Update project progress
      dispatch(updateProjectProgress(selectedProject.id));

      setNewSubtask({ title: '', description: '' });
      setSubtaskModalVisible(false);
      Alert.alert('Success', 'Subtask created successfully');
    } catch (error) {
      console.error('Error creating subtask:', error);
      Alert.alert('Error', 'Failed to create subtask');
    }
  };

  const handleToggleSubtask = async (
    projectId: string,
    subtaskId: string,
    completed: boolean,
  ) => {
    try {
      await dispatch(
        updateSubTaskAsync({
          projectId,
          subTaskId: subtaskId,
          updates: {
            completed: !completed,
            updatedAt: new Date().toISOString(),
          },
        }),
      ).unwrap();

      // Update project progress
      dispatch(updateProjectProgress(projectId));
    } catch (error) {
      console.error('Error updating subtask:', error);
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const handleAddComment = async () => {
    if (!selectedProject || !user || !newComment.trim()) return;

    try {
      await dispatch(
        addCommentAsync({
          projectId: selectedProject.id,
          commentData: {
            text: newComment.trim(),
            userId: user.uid,
            userName: user.name || user.email || 'Unknown User',
          },
        }),
      ).unwrap();

      setNewComment('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleAttachFile = () => {
    const options = ['Camera', 'Photo Library', 'Cancel'];

    const showFilePicker = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: 2,
          },
          buttonIndex => {
            if (buttonIndex === 0) {
              openCamera();
            } else if (buttonIndex === 1) {
              openImageLibrary();
            }
          },
        );
      } else {
        Alert.alert('Select File', 'Choose an option', [
          { text: 'Camera', onPress: openCamera },
          { text: 'Photo Library', onPress: openImageLibrary },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    };

    showFilePicker();
  };

  const openCamera = () => {
    const options = {
      mediaType: 'mixed' as MediaType,
      quality: 0.7 as any, // Type assertion to handle PhotoQuality type
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to capture image');
      } else if (response.assets && response.assets[0]) {
        handleFileSelected(response.assets[0]);
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'mixed' as MediaType,
      quality: 0.7 as any, // Type assertion to handle PhotoQuality type
      maxWidth: 1000,
      maxHeight: 1000,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image library');
      } else if (response.errorMessage) {
        console.log('ImageLibrary Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select file');
      } else if (response.assets && response.assets[0]) {
        handleFileSelected(response.assets[0]);
      }
    });
  };

  const handleFileSelected = async (file: any) => {
    if (!selectedProject || !user) return;

    try {
      const fileName =
        file.fileName ||
        `file_${Date.now()}.${file.type?.split('/')[1] || 'unknown'}`;
      const fileSize = file.fileSize || 0;

      // Validate file
      const validation = validateFile(fileName, fileSize, 10); // 10MB limit
      if (!validation.isValid) {
        Alert.alert('Invalid File', validation.error);
        return;
      }

      // Show upload confirmation
      Alert.alert(
        'Upload File',
        `File: ${fileName}\nSize: ${(fileSize / 1024).toFixed(
          1,
        )} KB\n\nUpload this file to the project?`,
        [
          {
            text: 'Upload',
            onPress: () => uploadFile(file),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } catch (error) {
      console.error('Error handling file selection:', error);
      Alert.alert('Error', 'Failed to process selected file');
    }
  };

  const uploadFile = async (file: any) => {
    if (!selectedProject || !user) return;

    try {
      const fileName =
        file.fileName ||
        `file_${Date.now()}.${file.type?.split('/')[1] || 'unknown'}`;
      const fileType = file.type || 'unknown';
      const fileSize = file.fileSize || 0;
      const filePath = file.uri;

      // Use Redux thunk for file upload
      await dispatch(
        uploadFileToProjectThunk({
          projectId: selectedProject.id,
          fileData: {
            filePath,
            fileName,
            fileType,
            fileSize,
          },
          userId: user.uid,
        }),
      ).unwrap();

      const isImage = fileType.startsWith('image/');
      Alert.alert(
        'Success',
        `${isImage ? 'Image' : 'File'} uploaded successfully!`,
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
    }
  };

  const TabButton = ({
    label,
    tab,
    count,
  }: {
    label: string;
    tab: TabType;
    count?: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: activeTab === tab ? colors.primary : colors.card },
        shadows.sm,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: activeTab === tab ? '#fff' : colors.text },
        ]}
      >
        {label}
        {count !== undefined && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, color, icon }: any) => (
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
  );

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card style={[styles.projectCard, shadows.sm]}>
      <View style={styles.projectHeader}>
        <Text style={[styles.projectTitle, { color: colors.text }]}>
          {project.title}
        </Text>
        <View style={styles.projectMeta}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status, colors) },
            ]}
          >
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: `${getPriorityColor(
                  project.priority,
                  colors,
                )}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(project.priority, colors) },
              ]}
            >
              {project.priority}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[styles.projectDescription, { color: colors.textSecondary }]}
        numberOfLines={3}
      >
        {project.description}
      </Text>

      <View style={styles.projectDetails}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          Start Date:
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {new Date(project.startDate).toLocaleDateString()}
        </Text>

        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          End Date:
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {new Date(project.endDate).toLocaleDateString()}
        </Text>

        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          Estimated Hours:
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {project.estimatedHours}h
        </Text>

        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          Actual Hours:
        </Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>
          {project.actualHours}h
        </Text>
      </View>

      <View style={styles.progressSection}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          Progress
        </Text>
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

      <View style={styles.projectActions}>
        <Button
          title="Edit Description"
          size="small"
          variant="outline"
          onPress={() => {
            setSelectedProject(project);
            setEditedDescription(project.description);
            setEditModalVisible(true);
          }}
        />
        <Button
          title="Update Status"
          size="small"
          onPress={() => {
            setSelectedProject(project);
            setNewStatus(project.status);
            setStatusModalVisible(true);
          }}
        />
      </View>

      <View style={styles.projectStats}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setSelectedProject(project);
            setSubtaskModalVisible(true);
          }}
        >
          <Icon name="task" size={16} tintColor={colors.primary} />
          <Text style={[styles.statItemText, { color: colors.text }]}>
            {project.subTasks.length} Subtasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setSelectedProject(project);
            setCommentModalVisible(true);
          }}
        >
          <Icon name="comment" size={16} tintColor={colors.secondary} />
          <Text style={[styles.statItemText, { color: colors.text }]}>
            {project.comments.length} Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statItem} onPress={handleAttachFile}>
          <Icon name="attachment" size={16} tintColor={colors.success} />
          <Text style={[styles.statItemText, { color: colors.text }]}>
            {project.files.length} Files
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statItem} onPress={handleAttachFile}>
          <Icon name="image" size={16} tintColor={colors.warning} />
          <Text style={[styles.statItemText, { color: colors.text }]}>
            {project.images.length} Images
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderOverviewTab = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Projects Overview
      </Text>
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
          title="Pending"
          value={stats.pendingProjects}
          color={colors.warning}
          icon="clock"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Tasks Overview
      </Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Tasks"
          value={stats.totalSubtasks}
          color={colors.secondary}
          icon="task"
        />
        <StatCard
          title="Completed"
          value={stats.completedSubtasks}
          color={colors.success}
          icon="check"
        />
      </View>
    </View>
  );

  const renderProjectsTab = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        My Projects
      </Text>
      {userProjects.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="project" size={64} tintColor={colors.disabled} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Projects Assigned
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You don't have any projects assigned yet.
          </Text>
        </View>
      ) : (
        userProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))
      )}
    </View>
  );

  const renderTasksTab = () => {
    const allSubtasks = userProjects.flatMap(project =>
      project.subTasks.map(subtask => ({
        ...subtask,
        projectTitle: project.title,
        projectId: project.id,
      })),
    );

    return (
      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Subtasks
        </Text>
        {allSubtasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="task" size={64} tintColor={colors.disabled} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Subtasks
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Create subtasks to break down your projects into manageable
              pieces.
            </Text>
          </View>
        ) : (
          <FlatList
            data={allSubtasks}
            keyExtractor={item => `${item.projectId}-${item.id}`}
            renderItem={({ item }) => (
              <Card style={[styles.subtaskCard, shadows.sm]}>
                <View style={styles.subtaskHeader}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() =>
                      handleToggleSubtask(
                        item.projectId,
                        item.id,
                        !item.completed,
                      )
                    }
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: item.completed
                            ? colors.primary
                            : 'transparent',
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      {item.completed && (
                        <Icon name="check" size={16} tintColor="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.subtaskInfo}>
                    <Text
                      style={[
                        styles.subtaskTitle,
                        {
                          color: item.completed
                            ? colors.textSecondary
                            : colors.text,
                          textDecorationLine: item.completed
                            ? 'line-through'
                            : 'none',
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.projectLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Project: {item.projectTitle}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          styles.subtaskDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    );
  };

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
            <Icon name="arrow-left" size={24} tintColor="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Projects</Text>
          <NotificationButton
            onPress={() => navigation.navigate('NotificationScreen')}
            size={20}
            tintColor="#fff"
          />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View
        style={[styles.tabContainer, { backgroundColor: colors.background }]}
      >
        <TabButton label="Overview" tab="overview" />
        <TabButton
          label="Projects"
          tab="projects"
          count={userProjects.length}
        />
        <TabButton label="Tasks" tab="tasks" count={stats.totalSubtasks} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'projects' && renderProjectsTab()}
        {activeTab === 'tasks' && renderTasksTab()}
      </ScrollView>

      {/* Edit Description Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Description
            </Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Icon name="close" size={24} tintColor={colors.text} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={editedDescription}
            onChangeText={setEditedDescription}
            placeholder="Enter project description..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setEditModalVisible(false)}
            />
            <Button title="Save" onPress={handleEditDescription} />
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Update Status
            </Text>
            <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
              <Icon name="close" size={24} tintColor={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.statusOptions}>
            {developerAllowedStatuses.map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor:
                      newStatus === status ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setNewStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    { color: newStatus === status ? '#fff' : colors.text },
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setStatusModalVisible(false)}
            />
            <Button title="Update" onPress={handleUpdateStatus} />
          </View>
        </View>
      </Modal>

      {/* Subtask Modal */}
      <Modal
        visible={subtaskModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Subtask
            </Text>
            <TouchableOpacity onPress={() => setSubtaskModalVisible(false)}>
              <Icon name="close" size={24} tintColor={colors.text} />
            </TouchableOpacity>
          </View>
          <Input
            placeholder="Subtask title"
            value={newSubtask.title}
            onChangeText={text =>
              setNewSubtask(prev => ({ ...prev, title: text }))
            }
          />
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={newSubtask.description}
            onChangeText={text =>
              setNewSubtask(prev => ({ ...prev, description: text }))
            }
            placeholder="Subtask description (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setSubtaskModalVisible(false)}
            />
            <Button title="Create" onPress={handleCreateSubtask} />
          </View>
        </View>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Comment
            </Text>
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <Icon name="close" size={24} tintColor={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Existing Comments */}
          <ScrollView style={styles.commentsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Comments
            </Text>
            {selectedProject?.comments.map((comment, index) => (
              <View
                key={`comment-${index}`}
                style={[styles.commentCard, { backgroundColor: colors.card }]}
              >
                <Text style={[styles.commentAuthor, { color: colors.text }]}>
                  {comment.userName}
                </Text>
                <Text
                  style={[styles.commentDate, { color: colors.textSecondary }]}
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  {comment.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.commentActions}>
            <Button
              title="Attach File"
              variant="outline"
              onPress={handleAttachFile}
            />
            <Button title="Add Comment" onPress={handleAddComment} />
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Close"
              variant="outline"
              onPress={() => setCommentModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    marginBottom: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  projectMeta: {
    flexDirection: 'row',
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
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  projectDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: '50%',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    width: '50%',
    marginBottom: 4,
  },
  progressSection: {
    marginBottom: 16,
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
    textAlign: 'right',
  },
  projectActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  projectStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
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
  subtaskCard: {
    padding: 16,
    marginBottom: 12,
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskInfo: {
    flex: 1,
  },
  subtaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  subtaskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statusOptions: {
    marginBottom: 20,
  },
  statusOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  commentsSection: {
    maxHeight: 200,
    marginBottom: 20,
  },
  commentCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
});

export default DeveloperProjectsScreen;
