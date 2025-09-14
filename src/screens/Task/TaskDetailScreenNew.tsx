import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';
import { Task, TaskComment, User } from '../../types';
import { useAppSelector } from '../../store/hooks';
import firestoreService from '../../firebase/firestoreService';
import { userService } from '../../services/UserService';
import {
  getTask,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  addCommentToTask,
} from '../../firebase/taskServices';
import TaskHeader from './components/TaskHeader';
import StatusPrioritySelector from './components/StatusPrioritySelector';
import ProgressSection from './components/ProgressSection';
import TaskInfoCards from './components/TaskInfoCards';
import TaskCommentBox from '../../components/tasks/TaskCommentBox';
import DatePicker from 'react-native-date-picker';

interface Props {
  route: { params: { taskId: string } };
}

const TaskDetailScreenNew: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assigneeModalVisible, setAssigneeModalVisible] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const user = useAppSelector(s => s.auth.user);
  const [commenting, setCommenting] = useState(false);
  const [showCreatedPicker, setShowCreatedPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  // Inline editing states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [titleChanged, setTitleChanged] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  const [editCreatedAt, setEditCreatedAt] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [createdChanged, setCreatedChanged] = useState(false);
  const [dueChanged, setDueChanged] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canEdit =
    isAdmin ||
    (task?.assignedTo?.includes(user?.uid || '') &&
      task?.status !== 'Completed');

  // Load task data
  useEffect(() => {
    (async () => {
      try {
        const t = await getTask(route.params.taskId);
        setTask(t);
        if (t) {
          setEditTitle(t.title);
          setEditDescription(t.description || '');
          setTitleChanged(false);
          setDescriptionChanged(false);
          setEditCreatedAt(t.createdAt);
          setEditDueDate(t.dueDate || '');
          setCreatedChanged(false);
          setDueChanged(false);
        }
        if (isAdmin) {
          const users = await firestoreService.getApprovedUsers();
          setAvailableUsers(users);
        }
      } catch (error) {
        console.error('Error loading task:', error);
        Alert.alert('Error', 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.taskId, isAdmin]);

  // Initialize selected assignees from task when it loads/changes
  useEffect(() => {
    if (task?.assignedTo) setSelectedAssignees(task.assignedTo);
    else setSelectedAssignees([]);
  }, [task?.assignedTo]);

  // Resolve assigned user IDs to user objects for display names
  useEffect(() => {
    let isActive = true;
    const loadAssignedUsers = async () => {
      try {
        const ids = task?.assignedTo || [];
        if (!ids.length) {
          if (isActive) setAssignedUsers([]);
          return;
        }
        const users = await userService.getUsersByIds(ids);
        if (isActive) setAssignedUsers(users);
      } catch (err) {
        console.error('Error loading assigned users:', err);
        if (isActive) setAssignedUsers([]);
      }
    };
    loadAssignedUsers();
    return () => {
      isActive = false;
    };
  }, [task?.assignedTo]);

  const toggleAssignee = (uid: string) => {
    setSelectedAssignees(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid],
    );
  };

  const handleSaveAssignees = async () => {
    if (!task) return;
    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, { assignedTo: selectedAssignees });
      setTask({ ...task, assignedTo: selectedAssignees });
      Alert.alert('Success', 'Assignees updated');
      setAssigneeModalVisible(false);
    } catch (e) {
      console.error('Error updating assignees:', e);
      Alert.alert('Error', 'Failed to update assignees');
    } finally {
      setUpdating(false);
    }
  };

  // Title/Description handlers
  const handleTitleChange = (text: string) => {
    setEditTitle(text);
    setTitleChanged(text !== task?.title);
  };
  const handleDescriptionChange = (text: string) => {
    setEditDescription(text);
    setDescriptionChanged(text !== task?.description);
  };

  // Status and priority functions
  const handleStatusChange = (newStatus: Task['status']) => {
    if (!task || !canEdit) return;
    try {
      setUpdating(true);
      updateTaskInFirestore(task.id, { status: newStatus })
        .then(() => {
          setTask({ ...task, status: newStatus });
          Alert.alert('Success', 'Task status updated');
        })
        .catch(error => {
          console.error('Error updating status:', error);
          Alert.alert('Error', 'Failed to update status');
        })
        .finally(() => setUpdating(false));
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdating(false);
    }
  };
  const handlePriorityChange = (newPriority: Task['priority']) => {
    if (!task || !canEdit) return;
    try {
      setUpdating(true);
      updateTaskInFirestore(task.id, { priority: newPriority })
        .then(() => {
          setTask({ ...task, priority: newPriority });
          Alert.alert('Success', 'Task priority updated');
        })
        .catch(error => {
          console.error('Error updating priority:', error);
          Alert.alert('Error', 'Failed to update priority');
        })
        .finally(() => setUpdating(false));
    } catch (error) {
      console.error('Error updating priority:', error);
      setUpdating(false);
    }
  };

  // Save inline edits
  const handleSaveTitle = async () => {
    if (!task || !editTitle.trim() || editTitle === task.title) {
      setTitleChanged(false);
      return;
    }
    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, { title: editTitle.trim() });
      setTask({ ...task, title: editTitle.trim() });
      setTitleChanged(false);
      Alert.alert('Success', 'Title updated successfully');
    } catch (error) {
      console.error('Error updating title:', error);
      Alert.alert('Error', 'Failed to update title');
      setEditTitle(task.title);
      setTitleChanged(false);
    } finally {
      setUpdating(false);
    }
  };
  const handleSaveDescription = async () => {
    if (!task || editDescription === task.description) {
      setDescriptionChanged(false);
      return;
    }
    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, {
        description: editDescription.trim(),
      });
      setTask({ ...task, description: editDescription.trim() });
      setDescriptionChanged(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description');
      setEditDescription(task.description || '');
      setDescriptionChanged(false);
    } finally {
      setUpdating(false);
    }
  };

  // Comments
  const handleAddComment = async (text: string) => {
    if (!task || !user || !text.trim()) return;
    try {
      setCommenting(true);
      const newComment: TaskComment = {
        id: Date.now().toString(),
        text: text.trim(),
        userId: user.displayName || user.email || 'User',
        createdAt: new Date().toISOString(),
      };
      await addCommentToTask(task.id, newComment);
      setTask({ ...task, comments: [...(task.comments || []), newComment] });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteTask = () => {
    if (!task) return;
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await deleteTaskFromFirestore(task.id);
              Alert.alert('Success', 'Task deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // Dates helpers
  const formatDisplayDate = (iso?: string) => {
    if (!iso) return 'Not set';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const dateToYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const createValidDate = (dateString?: string, fallback?: Date): Date => {
    if (!dateString) return fallback || new Date();
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      return fallback || new Date();
    }
    return parsedDate;
  };
  const handleCreatedChange = (text: string) => {
    setEditCreatedAt(text);
    setCreatedChanged(text !== task?.createdAt);
  };
  const handleDueChange = (text: string) => {
    setEditDueDate(text);
    setDueChanged(text !== (task?.dueDate || ''));
  };
  const handleSaveCreated = async () => {
    if (!task || !createdChanged) return;
    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, { createdAt: editCreatedAt });
      setTask({ ...task, createdAt: editCreatedAt });
      setCreatedChanged(false);
      Alert.alert('Success', 'Created date updated');
    } catch (e) {
      console.error('Error updating created date:', e);
      Alert.alert('Error', 'Failed to update created date');
      setEditCreatedAt(task.createdAt);
      setCreatedChanged(false);
    } finally {
      setUpdating(false);
    }
  };
  const handleSaveDue = async () => {
    if (!task || !dueChanged) return;
    try {
      setUpdating(true);
      await updateTaskInFirestore(task.id, {
        dueDate: editDueDate || undefined,
      });
      setTask({ ...task, dueDate: editDueDate || undefined });
      setDueChanged(false);
      Alert.alert('Success', 'Due date updated');
    } catch (e) {
      console.error('Error updating due date:', e);
      Alert.alert('Error', 'Failed to update due date');
      setEditDueDate(task.dueDate || '');
      setDueChanged(false);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading task details...
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View
        style={[styles.centerContent, { backgroundColor: colors.background }]}
      >
        <Icon name="error" size={48} tintColor={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          Task not found
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.textWhite]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TaskHeader
          title="Task Details"
          onBack={() => navigation.goBack()}
          onDelete={isAdmin ? handleDeleteTask : undefined}
        />

        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Project Title
          </Text>
          {canEdit ? (
            <View style={styles.inputWithSave}>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                value={editTitle}
                onChangeText={handleTitleChange}
                placeholder="Task title"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
              {titleChanged && (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.success },
                  ]}
                  onPress={handleSaveTitle}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="check" size={16} tintColor="#fff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.inputWithSave}>
              <View
                style={[
                  styles.readonlyInputBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  {task.title}
                </Text>
              </View>
            </View>
          )}

          {/* Status & Priority */}
          <View style={styles.mt12}>
            <StatusPrioritySelector
              status={task.status}
              priority={task.priority}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              readonly={!canEdit}
            />
          </View>

          {/* Description */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            Project Description
          </Text>
          <View style={styles.mt12}>
            {canEdit ? (
              <View style={styles.descriptionEditContainer}>
                <TextInput
                  style={[
                    styles.descriptionInput,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                  value={editDescription}
                  onChangeText={handleDescriptionChange}
                  placeholder="Add a description for this task..."
                  multiline
                  textAlignVertical="top"
                />
                {descriptionChanged && (
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={handleSaveDescription}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="check" size={16} tintColor="#fff" />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.descriptionEditContainer}>
                <View
                  style={[
                    styles.readonlyInputBox,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={[styles.description, { color: colors.text }]}>
                    {task.description || 'No description provided.'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Dates Box */}
        <View
          style={[
            styles.datesBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Icon name="time" size={20} tintColor={colors.textSecondary} />
              <View style={styles.dateTextContainer}>
                <Text
                  style={[styles.dateLabel, { color: colors.textSecondary }]}
                >
                  Created
                </Text>
                {isAdmin ? (
                  <View style={styles.inlineDateEditRow}>
                    <TouchableOpacity
                      style={[
                        styles.datePickerButton,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      onPress={() => setShowCreatedPicker(true)}
                    >
                      <Icon
                        name="calendar"
                        size={16}
                        tintColor={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: colors.text },
                        ]}
                      >
                        {editCreatedAt
                          ? formatDisplayDate(editCreatedAt)
                          : 'Pick date'}
                      </Text>
                    </TouchableOpacity>
                    {createdChanged && (
                      <TouchableOpacity
                        style={[
                          styles.smallSave,
                          { backgroundColor: colors.success },
                        ]}
                        onPress={handleSaveCreated}
                        disabled={updating}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="check" size={14} tintColor="#fff" />
                        )}
                      </TouchableOpacity>
                    )}
                    <DatePicker
                      modal
                      mode="date"
                      open={showCreatedPicker}
                      date={createValidDate(editCreatedAt || task.createdAt)}
                      onConfirm={date => {
                        setShowCreatedPicker(false);
                        handleCreatedChange(dateToYMD(date));
                      }}
                      onCancel={() => setShowCreatedPicker(false)}
                    />
                  </View>
                ) : (
                  <Text style={[styles.dateValue, { color: colors.text }]}>
                    {formatDisplayDate(task.createdAt)}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.verticalDivider,
                { backgroundColor: colors.border },
              ]}
            />

            <View style={styles.dateItem}>
              <Icon
                name="calendar"
                size={20}
                tintColor={colors.textSecondary}
              />
              <View style={styles.dateTextContainer}>
                <Text
                  style={[styles.dateLabel, { color: colors.textSecondary }]}
                >
                  Due
                </Text>
                {isAdmin ? (
                  <View style={styles.inlineDateEditRow}>
                    <TouchableOpacity
                      style={[
                        styles.datePickerButton,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                        },
                      ]}
                      onPress={() => setShowDuePicker(true)}
                    >
                      <Icon
                        name="calendar"
                        size={16}
                        tintColor={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.datePickerButtonText,
                          { color: colors.text },
                        ]}
                      >
                        {editDueDate
                          ? formatDisplayDate(editDueDate)
                          : 'Pick date'}
                      </Text>
                    </TouchableOpacity>
                    {dueChanged && (
                      <TouchableOpacity
                        style={[
                          styles.smallSave,
                          { backgroundColor: colors.success },
                        ]}
                        onPress={handleSaveDue}
                        disabled={updating}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="check" size={14} tintColor="#fff" />
                        )}
                      </TouchableOpacity>
                    )}
                    <DatePicker
                      modal
                      mode="date"
                      open={showDuePicker}
                      date={createValidDate(editDueDate || task.dueDate)}
                      onConfirm={date => {
                        setShowDuePicker(false);
                        handleDueChange(dateToYMD(date));
                      }}
                      onCancel={() => setShowDuePicker(false)}
                    />
                  </View>
                ) : (
                  <Text style={[styles.dateValue, { color: colors.text }]}>
                    {task.dueDate ? formatDisplayDate(task.dueDate) : 'Not set'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <TaskInfoCards task={task} />

        {/* Progress */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Progress
          </Text>
          <ProgressSection status={task.status} />
        </View>

        {/* Quick Actions */}
        {canEdit && (
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: colors.card },
                ]}
                onPress={() => handleStatusChange('Completed')}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.success + '20' },
                  ]}
                >
                  <Icon name="check" size={24} tintColor={colors.success} />
                </View>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  Mark Complete
                </Text>
                <Text
                  style={[
                    styles.actionCardSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Set status to Completed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: colors.card },
                ]}
                onPress={() =>
                  Alert.alert(
                    'Info',
                    'File upload functionality will be implemented',
                  )
                }
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Icon name="file" size={24} tintColor={colors.primary} />
                </View>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  Upload Files
                </Text>
                <Text
                  style={[
                    styles.actionCardSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Add documents
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionCard,
                  { backgroundColor: colors.card },
                ]}
                onPress={() =>
                  Alert.alert('Edit Details', 'Editing via inline fields above')
                }
              >
                <View
                  style={[
                    styles.actionIcon,
                    {
                      backgroundColor: (colors as any).warning
                        ? (colors as any).warning + '20'
                        : colors.primary + '20',
                    },
                  ]}
                >
                  <Icon
                    name="edit"
                    size={24}
                    tintColor={(colors as any).warning || colors.primary}
                  />
                </View>
                <Text style={[styles.actionCardTitle, { color: colors.text }]}>
                  Edit Details
                </Text>
                <Text
                  style={[
                    styles.actionCardSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Update description
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Assignees */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.rowWithIcon}>
              <Icon name="team" size={24} tintColor={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Assigned To
              </Text>
              {task.assignedTo?.length ? (
                <View
                  style={[
                    styles.subtasksBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.subtasksBadgeText,
                      { color: colors.primary },
                    ]}
                  >
                    {task.assignedTo.length}
                  </Text>
                </View>
              ) : null}
            </View>
            {isAdmin && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={() => setAssigneeModalVisible(true)}
              >
                <Icon name="edit" size={16} tintColor={colors.primary} />
                <Text
                  style={[styles.actionButtonText, { color: colors.primary }]}
                >
                  Manage
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <View style={styles.assigneesList}>
              {task.assignedTo.map((userId, index) => {
                const userObj =
                  assignedUsers.find(u => u.uid === userId) ||
                  availableUsers.find(u => u.uid === userId);
                const label =
                  userObj?.name ||
                  userObj?.displayName ||
                  userObj?.email ||
                  userId;
                const initial = (label || userId).substring(0, 1).toUpperCase();
                return (
                  <View
                    key={userId + index}
                    style={[
                      styles.assigneeItem,
                      { backgroundColor: `${colors.card}80` },
                    ]}
                  >
                    <View
                      style={[
                        styles.assigneeAvatar,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.assigneeInitial}>{initial}</Text>
                    </View>
                    <Text style={[styles.assigneeName, { color: colors.text }]}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No assignees
            </Text>
          )}
        </View>

        {/* Files & Images */}
        {task.attachments && task.attachments.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Files & Images
            </Text>
            <View
              style={[styles.filesContainer, { backgroundColor: colors.card }]}
            >
              <View style={styles.fileStats}>
                <Text style={[styles.fileStatText, { color: colors.text }]}>
                  {task.attachments.length} Attachments
                </Text>
              </View>
              <Text
                style={[styles.emptySubText, { color: colors.textSecondary }]}
              >
                File listing implementation pending
              </Text>
            </View>
          </View>
        )}

        {/* Comments */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.rowWithIcon}>
              <Icon name="chat" size={24} tintColor={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Activity & Comments
              </Text>
              <View
                style={[
                  styles.commentsBadge,
                  { backgroundColor: colors.success + '20' },
                ]}
              >
                <Text
                  style={[styles.commentsBadgeText, { color: colors.success }]}
                >
                  {task.comments ? task.comments.length : 0}
                </Text>
              </View>
            </View>
          </View>
          <TaskCommentBox
            comments={task.comments || []}
            onAddComment={handleAddComment}
            currentUserName={user?.displayName || user?.email || 'User'}
            isLoading={commenting}
            canComment={true}
          />
        </View>

        {/* Assignee Management Modal */}
        {isAdmin && (
          <Modal
            visible={assigneeModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setAssigneeModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.modalHeader,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Manage Assignees
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAssigneeModalVisible(false)}
                  >
                    <Icon name="close" size={22} tintColor={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScroll}>
                  {availableUsers.length === 0 ? (
                    <Text
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No users available
                    </Text>
                  ) : (
                    availableUsers.map(u => {
                      const label = u.name || u.displayName || u.email || u.uid;
                      const selected = selectedAssignees.includes(u.uid);
                      return (
                        <TouchableOpacity
                          key={u.uid}
                          style={[styles.userRow]}
                          onPress={() => toggleAssignee(u.uid)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              { borderColor: colors.border },
                            ]}
                          >
                            {selected && (
                              <Icon
                                name="check"
                                size={14}
                                tintColor={colors.primary}
                              />
                            )}
                          </View>
                          <Text
                            style={[styles.userLabel, { color: colors.text }]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: colors.border },
                    ]}
                    onPress={() => setAssigneeModalVisible(false)}
                  >
                    <Text
                      style={[styles.modalButtonText, { color: colors.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleSaveAssignees}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.modalButtonText,
                          styles.modalButtonTextInverted,
                        ]}
                      >
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  textWhite: { color: '#fff' },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 100 },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  heroSection: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
  },
  readonlyInputBox: {
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  fieldLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  inputWithSave: { position: 'relative', marginBottom: 8 },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mt12: { marginTop: 12 },
  description: { fontSize: 16, lineHeight: 24 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: { fontSize: 14, fontWeight: '500', marginLeft: 4 },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  descriptionEditContainer: { position: 'relative' },
  assigneesList: { marginTop: 8 },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assigneeInitial: { color: '#fff', fontSize: 16, fontWeight: '600' },
  assigneeName: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginVertical: 16, fontStyle: 'italic' },
  commentsBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commentsBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  datesBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dateTextContainer: { marginLeft: 10 },
  dateLabel: { fontSize: 12, marginBottom: 2 },
  dateValue: { fontSize: 16, fontWeight: '600' },
  verticalDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 12,
    opacity: 0.6,
  },
  inlineDateEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  datePickerButtonText: { fontSize: 14, fontWeight: '600' },
  smallSave: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickActionsSection: { marginBottom: 20 },
  actionGrid: { flexDirection: 'row', gap: 16 },
  quickActionCard: {
    flex: 1,
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
      android: { elevation: 2 },
    }),
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  actionCardSubtitle: { fontSize: 12, textAlign: 'center', opacity: 0.8 },
  filesContainer: { borderRadius: 12, padding: 16 },
  fileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  fileStatText: { fontSize: 14, fontWeight: '500' },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  subtasksBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  subtasksBadgeText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalScroll: { maxHeight: 360 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userLabel: { fontSize: 16 },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalButtonText: { fontSize: 14, fontWeight: '700' },
  modalButtonTextInverted: { color: '#fff' },
});

export default TaskDetailScreenNew;
