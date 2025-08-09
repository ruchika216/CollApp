import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { 
  pick,
  types 
} from '@react-native-documents/picker';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createProject, updateProjectAsync } from '../../store/slices/projectSlice';
import { useTheme } from '../../theme/useTheme';
import { Project, User, ProjectFile } from '../../types';
import Icon from '../../components/common/Icon';
import firestoreService from '../../firebase/firestoreService';

interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
  navigation?: any;
}

const ProjectFormNew: React.FC<ProjectFormProps> = ({ project, onClose, navigation }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const currentUser = useAppSelector(state => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [assignedTo, setAssignedTo] = useState<string[]>(project?.assignedTo || []);
  const [priority, setPriority] = useState<Project['priority']>(project?.priority || 'Medium');
  const [status, setStatus] = useState<Project['status']>(project?.status || 'To Do');
  const [estimatedHours, setEstimatedHours] = useState(project?.estimatedHours?.toString() || '40');
  const [category, setCategory] = useState(project?.category || '');
  const [tags, setTags] = useState(project?.tags?.join(', ') || '');
  const [startDate, setStartDate] = useState(project ? new Date(project.startDate) : new Date());
  const [endDate, setEndDate] = useState(project ? new Date(project.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // UI state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const approvedUsers = await firestoreService.getApprovedUsers();
      setUsers(approvedUsers.filter(user => user.role === 'developer'));
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load developers. Please try again.');
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Project title is required');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Project description is required');
      return false;
    }
    if (assignedTo.length === 0) {
      Alert.alert('Validation Error', 'Please assign the project to at least one developer');
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert('Validation Error', 'End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Add assigned user details to the project data
      const assignedUsers = users
        .filter(user => assignedTo.includes(user.uid))
        .map(user => ({
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role
        }));

      const projectData = {
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        assignedUsers,
        priority,
        status,
        estimatedHours: parseInt(estimatedHours) || 40,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        category: category.trim() || 'General',
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdBy: currentUser?.uid || '',
        files: project?.files || [],
        images: project?.images || [],
        comments: project?.comments || [],
        subTasks: project?.subTasks || [],
        progress: project?.progress || 0,
        actualHours: project?.actualHours || 0,
      };

      let result;
      if (project) {
        result = await dispatch(updateProjectAsync({ 
          projectId: project.id, 
          updates: projectData 
        })).unwrap();
        
        Alert.alert(
          'Success', 
          'Project updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                if (navigation) {
                  navigation.navigate('AdminDashboard');
                }
              }
            }
          ]
        );
      } else {
        result = await dispatch(createProject(projectData as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)).unwrap();
        
        Alert.alert(
          'Success', 
          'Project created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                if (navigation) {
                  // Navigate to admin dashboard to see the new project
                  navigation.navigate('AdminDashboard');
                }
              }
            }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('Error saving project:', error);
      let errorMessage = 'Failed to save project. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.code) {
        // Handle Firebase specific errors
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Permission denied. Please check your access rights.';
            break;
          case 'network-error':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'invalid-argument':
            errorMessage = 'Invalid project data. Please check all fields.';
            break;
          default:
            errorMessage = `Firebase error: ${error.code}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAssignment = (userId: string) => {
    setAssignedTo(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleFileUpload = () => {
    Alert.alert(
      'Upload File',
      'Choose an option',
      [
        { text: 'Document', onPress: handleDocumentPick },
        { text: 'Photo/Video', onPress: handleImagePick },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDocumentPick = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });
      // Handle document upload here
      console.log('Documents selected:', result);
    } catch (error: any) {
      // Check if the error is due to user cancellation
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Document picker error:', error);
      }
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Select Image/Video',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openImagePicker('camera') },
        { text: 'Gallery', onPress: () => openImagePicker('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openImagePicker = (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'mixed' as MediaType,
      quality: 0.7,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    const callback = (response: ImagePickerResponse) => {
      if (response.assets && response.assets.length > 0) {
        // Handle image upload here
        console.log('Images selected:', response.assets);
      }
    };

    if (source === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const priorityOptions: Project['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions: Project['status'][] = ['To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Deployment'];
  const categoryOptions = ['Web Development', 'Mobile App', 'UI/UX Design', 'Backend', 'DevOps', 'Testing', 'Research', 'Bug Fix', 'Feature', 'Other'];

  const getAssignedUserNames = () => {
    const assignedUsers = users.filter(user => assignedTo.includes(user.uid));
    return assignedUsers.map(user => user.name || user.email).join(', ');
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.primary} 
        translucent={Platform.OS === 'ios'}
      />
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16 }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {project ? 'Edit Project' : 'Create Project'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Project Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project title"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter detailed project description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>

          {/* Assign to Developers */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assign to Developers * ({assignedTo.length} selected)</Text>
            <TouchableOpacity 
              style={styles.assignButton}
              onPress={() => setShowUserModal(true)}
            >
              <Text style={styles.assignButtonText}>
                {assignedTo.length === 0 ? 'Select Developers' : getAssignedUserNames()}
              </Text>
              <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                {categoryOptions.map(option => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={styles.picker}
              >
                {priorityOptions.map(option => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Status (for editing only) */}
          {project && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}
                >
                  {statusOptions.map(option => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Estimated Hours */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter estimated hours"
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              keyboardType="numeric"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. urgent, frontend, api"
              value={tags}
              onChangeText={setTags}
              maxLength={200}
            />
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, styles.dateInput]}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.dateInput]}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* File Upload Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Files & Images</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileUpload}
            >
              <Icon name="upload" size={24} color={theme.colors.primary} />
              <Text style={styles.uploadButtonText}>Upload Files</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* User Selection Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Developers</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.userList}>
              {users.map(user => (
                <TouchableOpacity
                  key={user.uid}
                  style={styles.userItem}
                  onPress={() => toggleUserAssignment(user.uid)}
                >
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name || 'No name'}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    assignedTo.includes(user.uid) && styles.checkboxChecked
                  ]}>
                    {assignedTo.includes(user.uid) && (
                      <Icon name="check" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowUserModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
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
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    textArea: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      minHeight: 100,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    assignButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    assignButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    picker: {
      height: 50,
      color: theme.colors.text,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    dateInput: {
      flex: 1,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      backgroundColor: theme.colors.primary + '10',
      gap: 8,
    },
    uploadButtonText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
      gap: 16,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.textSecondary,
    },
    cancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.5,
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
    userList: {
      maxHeight: 400,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    userAvatarText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    modalButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      margin: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default ProjectFormNew;