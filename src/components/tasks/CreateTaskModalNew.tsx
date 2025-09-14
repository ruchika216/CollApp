import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import firestoreService from '../../firebase/firestoreService';
import { Task, User } from '../../types';
import Icon from '../common/Icon';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createTask } from '../../store/slices/taskSlice';
import DatePicker from 'react-native-date-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [status, setStatus] = useState<
    'To Do' | 'In Progress' | 'Review' | 'Testing' | 'Completed'
  >('To Do');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const isAdmin = user?.role === 'admin';

  // Load approved users when modal opens
  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // Admins can see all users
          const list = await firestoreService.getApprovedUsers();
          if (mounted) setUsers(list);
        } else {
          // Developers can only assign to themselves
          if (user) {
            if (mounted) {
              setUsers([user]);
              setAssignees([user.uid]); // Auto-assign to themselves
            }
          }
        }
      } catch (e) {
        console.error('Error loading users:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      mounted = false;
    };
  }, [isAdmin, user]);

  const toggleAssignee = (uid: string) => {
    setAssignees(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid],
    );
  };

  const handleDropdownToggle = () => {
    if (showAssigneesDropdown) {
      // Closing dropdown, clear search
      setUserSearch('');
    }
    setShowAssigneesDropdown(!showAssigneesDropdown);
  };

  const statusOptions = useMemo(
    () => [
      { id: 'To Do', color: '#6B7280' },
      { id: 'In Progress', color: '#2563EB' },
      { id: 'Review', color: '#9333EA' },
      { id: 'Testing', color: '#F59E0B' },
      { id: 'Completed', color: '#10B981' },
    ],
    [],
  );

  const priorityOptions = useMemo(
    () => [
      { id: 'High', color: '#EF4444' },
      { id: 'Medium', color: '#F59E0B' },
      { id: 'Low', color: '#10B981' },
    ],
    [],
  );

  // Filtered users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;

    const searchLower = userSearch.toLowerCase().trim();
    return users.filter(
      user =>
        (user.displayName || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower),
    );
  }, [users, userSearch]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setSubmitting(true);

      // Validate due date
      let dueDateISO: string | undefined = undefined;
      if (dueDate) {
        try {
          dueDateISO = dueDate.toISOString();
        } catch (dateError) {
          console.error('Invalid due date:', dateError);
          Alert.alert('Error', 'Invalid due date selected');
          return;
        }
      }

      const result = await dispatch(
        createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate: dueDateISO,
          assignedTo: assignees,
          createdBy: user.uid,
        }),
      ).unwrap();

      if (result) {
        Alert.alert('Success', 'Task created successfully');
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create task';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setStatus('To Do');
    setDueDate(null);
    setAssignees([]);
    setUserSearch('');
    setShowAssigneesDropdown(false);
  };

  const getStatusColor = (statusId: string) => {
    const found = statusOptions.find(option => option.id === statusId);
    return found ? found.color : '#6B7280';
  };

  const getPriorityColor = (priorityId: string) => {
    const found = priorityOptions.find(option => option.id === priorityId);
    return found ? found.color : '#6B7280';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const createValidDate = (date?: Date | null): Date => {
    if (!date) return new Date();
    try {
      const timestamp = date.getTime();
      if (isNaN(timestamp)) return new Date();
      return date;
    } catch (error) {
      console.error('Error validating date:', error);
      return new Date();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Modal Header */}
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New Task
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={22} tintColor={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Title Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Task Title <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: `${colors.background}`,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoCapitalize="sentences"
              />
            </View>

            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: `${colors.background}`,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter task description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>

            {/* Priority Selection */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Priority
              </Text>
              <View style={styles.optionsContainer}>
                {priorityOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          priority === option.id
                            ? option.color
                            : `${option.color}20`,
                      },
                    ]}
                    onPress={() => setPriority(option.id as Task['priority'])}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: option.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              priority === option.id ? '#FFFFFF' : option.color,
                          },
                        ]}
                      >
                        {option.id}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Selection */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Status
              </Text>
              <View style={styles.optionsContainer}>
                {statusOptions.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          status === option.id
                            ? option.color
                            : `${option.color}20`,
                      },
                    ]}
                    onPress={() => setStatus(option.id as Task['status'])}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: option.color },
                        ]}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              status === option.id ? '#FFFFFF' : option.color,
                          },
                        ]}
                      >
                        {option.id}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Due Date Picker */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Due Date
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar" size={18} tintColor={colors.primary} />
                <Text
                  style={[
                    styles.dateText,
                    {
                      color: dueDate ? colors.text : colors.textSecondary,
                    },
                  ]}
                >
                  {dueDate ? formatDate(dueDate) : 'Select due date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DatePicker
                  modal
                  open={showDatePicker}
                  date={createValidDate(dueDate)}
                  mode="date"
                  minimumDate={new Date()}
                  onConfirm={date => {
                    setShowDatePicker(false);
                    setDueDate(date);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />
              )}
            </View>

            {/* Assignees Selection */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Assign To
              </Text>

              {isAdmin ? (
                <TouchableOpacity
                  style={[
                    styles.assigneesButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleDropdownToggle}
                >
                  <Text
                    style={[
                      styles.assigneesButtonText,
                      {
                        color:
                          assignees.length > 0
                            ? colors.text
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {assignees.length > 0
                      ? `${assignees.length} developer${
                          assignees.length > 1 ? 's' : ''
                        } selected`
                      : 'Select developers'}
                  </Text>
                  <Icon
                    name={showAssigneesDropdown ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    tintColor={colors.textSecondary}
                  />
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.assigneesButton,
                    {
                      backgroundColor: (colors as any).surface || '#f5f5f5',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.assigneesButtonText, { color: colors.text }]}
                  >
                    Assigned to: {user?.displayName || user?.email || 'You'}
                  </Text>
                  <Icon
                    name="user"
                    size={16}
                    tintColor={colors.textSecondary}
                  />
                </View>
              )}

              {/* Assignees dropdown - Admin only */}
              {isAdmin && showAssigneesDropdown && (
                <View
                  style={[
                    styles.assigneesDropdown,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* Search input for users */}
                  <View
                    style={[
                      styles.userSearchContainer,
                      {
                        backgroundColor: colors.background,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Icon
                      name="search"
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                    <TextInput
                      value={userSearch}
                      onChangeText={setUserSearch}
                      placeholder="Search developers..."
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.userSearchInput, { color: colors.text }]}
                      autoCapitalize="none"
                    />
                    {userSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setUserSearch('')}>
                        <Icon
                          name="close"
                          size={16}
                          tintColor={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary}
                      style={styles.loadingIndicator}
                    />
                  ) : filteredUsers.length === 0 ? (
                    <Text
                      style={[
                        styles.noUsersText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {userSearch.trim()
                        ? 'No developers match your search'
                        : 'No developers found'}
                    </Text>
                  ) : (
                    filteredUsers.map(user => (
                      <TouchableOpacity
                        key={user.uid}
                        style={[
                          styles.assigneeItem,
                          {
                            backgroundColor: assignees.includes(user.uid)
                              ? `${colors.primary}15`
                              : 'transparent',
                          },
                        ]}
                        onPress={() => toggleAssignee(user.uid)}
                      >
                        <View style={styles.assigneeInfo}>
                          <View
                            style={[
                              styles.assigneeAvatar,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <Text style={styles.assigneeInitial}>
                              {(user.displayName || user.email || 'U')
                                .charAt(0)
                                .toUpperCase()}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.assigneeName,
                              { color: colors.text },
                            ]}
                          >
                            {user.displayName ||
                              user.email ||
                              `User ${user.uid.substring(0, 4)}`}
                          </Text>
                        </View>
                        {assignees.includes(user.uid) && (
                          <Icon
                            name="check"
                            size={16}
                            tintColor={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {/* Selected assignees chips - Admin only */}
              {isAdmin && assignees.length > 0 && (
                <View style={styles.selectedAssignees}>
                  {assignees.map(assigneeId => {
                    const assigneeUser = users.find(
                      user => user.uid === assigneeId,
                    );
                    const name =
                      assigneeUser?.displayName ||
                      assigneeUser?.email ||
                      assigneeId.substring(0, 8);
                    return (
                      <View
                        key={assigneeId}
                        style={[
                          styles.assigneeChip,
                          { backgroundColor: `${colors.primary}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.assigneeChipText,
                            { color: colors.primary },
                          ]}
                        >
                          {name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleAssignee(assigneeId)}
                        >
                          <Icon
                            name="close"
                            size={14}
                            tintColor={colors.primary}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Modal Footer with Actions */}
          <View
            style={[
              styles.modalFooter,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: '#F1F1F1',
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: title.trim()
                    ? colors.primary
                    : `${colors.primary}80`,
                  opacity: submitting ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Create Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    maxHeight: '75%',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    height: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 15,
  },
  assigneesButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  assigneesButtonText: {
    fontSize: 15,
  },
  assigneesDropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 240,
    overflow: 'hidden',
  },
  userSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
    backgroundColor: '#F5F5F5',
  },
  userSearchInput: {
    flex: 1,
    fontSize: 14,
    height: 32,
    paddingVertical: 0,
    color: '#000000',
  },
  loadingIndicator: {
    padding: 16,
  },
  noUsersText: {
    padding: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  assigneeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  assigneeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assigneeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 14,
  },
  selectedAssignees: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  assigneeChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CreateTaskModal;
