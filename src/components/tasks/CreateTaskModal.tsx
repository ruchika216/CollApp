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
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import firestoreService from '../../firebase/firestoreService';
import { Task, User } from '../../types';
import Icon from '../common/Icon';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { createTask } from '../../store/slices/taskSlice';
import DatePicker from 'react-native-date-picker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<Props> = ({ onClose }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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

  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();

  // Load approved users when modal opens
  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const list = await firestoreService.getApprovedUsers();
        if (mounted) setUsers(list);
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
  }, []);

  const toggleAssignee = (uid: string) => {
    setAssignees(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid],
    );
  };

  const statusItems = useMemo(
    () => ['To Do', 'In Progress', 'Review', 'Testing', 'Completed'] as const,
    [],
  );

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

      let dueDateISO: string | undefined = undefined;
      if (dueDate) {
        dueDateISO = dueDate.toISOString();
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
      Alert.alert('Error', 'Failed to create task');
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
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (p: 'High' | 'Medium' | 'Low') => {
    switch (p) {
      case 'High':
        return '#EF4444';
      case 'Medium':
        return '#F59E0B';
      case 'Low':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  const getStatusColor = (s: Task['status']) => {
    switch (s) {
      case 'To Do':
        return '#6B7280';
      case 'In Progress':
        return '#2563EB';
      case 'Review':
        return '#9333EA';
      case 'Testing':
        return '#F59E0B';
      case 'Completed':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              marginTop: insets.top + 40,
              marginBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft} />
            <Text style={[styles.title, { color: colors.text }]}>
              Create New Task
            </Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: `${colors.textSecondary}10` },
              ]}
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Icon name="close" size={20} tintColor={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Task Title */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Task Title <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                placeholder="Enter task title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                placeholder="Enter task description"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: colors.text,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                returnKeyType="done"
              />
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Priority
              </Text>
              <View style={styles.chipRow}>
                {(['High', 'Medium', 'Low'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          priority === p
                            ? getPriorityColor(p)
                            : `${colors.textSecondary}10`,
                        borderColor:
                          priority === p ? getPriorityColor(p) : colors.border,
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: priority === p ? '#FFFFFF' : colors.text,
                          fontWeight: priority === p ? '600' : '500',
                        },
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statusScrollContainer}
              >
                {statusItems.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          status === s
                            ? getStatusColor(s)
                            : `${colors.textSecondary}10`,
                        borderColor:
                          status === s ? getStatusColor(s) : colors.border,
                      },
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: status === s ? '#FFFFFF' : colors.text,
                          fontWeight: status === s ? '600' : '500',
                        },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Due Date */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Due Date
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.datePickerButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    styles.dateText,
                    { color: dueDate ? colors.text : colors.textSecondary },
                  ]}
                >
                  {dueDate ? formatDate(dueDate) : 'Select due date'}
                </Text>
                <Icon name="calendar" size={20} tintColor={colors.primary} />
              </TouchableOpacity>

              {showDatePicker && (
                <DatePicker
                  modal
                  open={showDatePicker}
                  date={dueDate || new Date()}
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

            {/* Assignees */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Assignees{' '}
                {assignees.length > 0 && `(${assignees.length} selected)`}
              </Text>
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Loading users...
                  </Text>
                </View>
              ) : (
                <View style={styles.assigneeList}>
                  {users.map(u => (
                    <TouchableOpacity
                      key={u.uid}
                      style={[
                        styles.assigneeItem,
                        {
                          backgroundColor: assignees.includes(u.uid)
                            ? `${colors.primary}15`
                            : colors.card,
                          borderColor: assignees.includes(u.uid)
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      onPress={() => toggleAssignee(u.uid)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.assigneeInfo}>
                        <Text
                          style={[styles.assigneeName, { color: colors.text }]}
                        >
                          {u.displayName || 'User'}
                        </Text>
                        <Text
                          style={[
                            styles.assigneeEmail,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {u.email}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          assignees.includes(u.uid)
                            ? {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                              }
                            : {
                                backgroundColor: 'transparent',
                                borderColor: colors.border,
                              },
                        ]}
                      >
                        {assignees.includes(u.uid) && (
                          <Icon name="check" size={14} tintColor="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {users.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Text
                        style={[
                          styles.emptyText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        No users available for assignment
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
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
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 0,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    width: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  statusScrollContainer: {
    gap: 8,
    paddingRight: 20,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
  },
  chipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  assigneeList: {
    gap: 10,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  assigneeInfo: {
    flex: 1,
    marginRight: 12,
  },
  assigneeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assigneeEmail: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateTaskModal;
