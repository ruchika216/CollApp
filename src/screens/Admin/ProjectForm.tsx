
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme/useTheme';
import { addProject, updateProject } from '../../store/slices/projectSlice';
import { addProjectToFirestore, updateProjectInFirestore, getDevelopers } from '../../firebase/firestore';
import { Project, User } from '../../types';
import { Picker } from '@react-native-picker/picker';
import Icon from '../../components/common/Icon';
import { useAppSelector } from '../../store/hooks';

interface Props {
  project?: Project | null;
  onClose: () => void;
  navigation?: any;
}

const ProjectForm: React.FC<Props> = ({ project, onClose, navigation }) => {
  const dispatch = useDispatch();
  const { colors, theme } = useTheme();
  const currentUser = useAppSelector(state => state.user.user);
  
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [assignedTo, setAssignedTo] = useState(project?.assignedTo || '');
  const [priority, setPriority] = useState<Project['priority']>(project?.priority || 'Medium');
  const [status, setStatus] = useState<Project['status']>(project?.status || 'Pending');
  const [estimatedHours, setEstimatedHours] = useState(project?.estimatedHours?.toString() || '40');
  const [startDate, setStartDate] = useState(project ? new Date(project.startDate) : new Date());
  const [endDate, setEndDate] = useState(project ? new Date(project.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getDevelopers();
        setUsers(userList);
        if (!project && userList.length > 0) {
          setAssignedTo(userList[0].uid);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [project]);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Project title is required');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Project description is required');
      return false;
    }
    if (!assignedTo) {
      Alert.alert('Validation Error', 'Please assign the project to a developer');
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
      if (project) {
        const updatedProject = {
          ...project,
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          priority,
          status,
          estimatedHours: parseInt(estimatedHours) || 40,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };
        await updateProjectInFirestore(updatedProject);
        dispatch(updateProject(updatedProject));
        Alert.alert('Success', 'Project updated successfully');
      } else {
        const newProject = {
          title: title.trim(),
          description: description.trim(),
          assignedTo,
          priority,
          status,
          estimatedHours: parseInt(estimatedHours) || 40,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          createdBy: currentUser?.uid || '',
          files: [],
          images: [],
          comments: [],
          progress: 0,
          actualHours: 0,
        } as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
        
        const id = await addProjectToFirestore(newProject);
        dispatch(addProject({ ...newProject, id } as Project));
        Alert.alert('Success', 'Project created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions: Project['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions: Project['status'][] = ['Pending', 'Development', 'Review', 'Testing', 'Done', 'Deployment', 'Fixing Bug'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Icon name="back" size={24} tintColor="#fff" />
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
            <Text style={[styles.label, { color: colors.text }]}>Project Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter project title"
              placeholderTextColor={colors.placeholder}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter project description"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Assigned Developer */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Assign to Developer *</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Picker
                selectedValue={assignedTo}
                onValueChange={setAssignedTo}
                style={[styles.picker, { color: colors.text }]}
              >
                <Picker.Item label="Select Developer" value="" />
                {users.map(user => (
                  <Picker.Item 
                    key={user.uid} 
                    label={user.displayName || user.email || 'Unknown'} 
                    value={user.uid} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={[styles.picker, { color: colors.text }]}
              >
                {priorityOptions.map(option => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Status (only for editing) */}
          {project && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View style={[styles.pickerContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={[styles.picker, { color: colors.text }]}
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
            <Text style={[styles.label, { color: colors.text }]}>Estimated Hours</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter estimated hours"
              placeholderTextColor={colors.placeholder}
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              keyboardType="numeric"
            />
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>
                {startDate.toLocaleDateString()}
              </Text>
              <Icon name="calendar" size={20} tintColor={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>
                {endDate.toLocaleDateString()}
              </Text>
              <Icon name="calendar" size={20} tintColor={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.error }]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : project ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  dateText: {
    fontSize: 16,
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
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectForm;
