import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SubTask, User } from '../../types';
import { useTheme } from '../../theme/useTheme';

interface SubTaskItemProps {
  subTask: SubTask;
  onStatusChange: (subTaskId: string, status: SubTask['status']) => void;
  onEdit?: (subTaskId: string, updates: Partial<SubTask>) => void;
  onDelete?: (subTaskId: string) => void;
  canEdit?: boolean;
  assignee?: User;
  isEditable?: boolean;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onStatusChange,
  onEdit,
  onDelete,
  canEdit = false,
  assignee,
  isEditable = false
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subTask.title);
  const [editedDescription, setEditedDescription] = useState(subTask.description || '');
  const styles = getStyles(theme);

  const getStatusColor = (status: SubTask['status']) => {
    switch (status) {
      case 'To Do':
        return theme.colors.warning;
      case 'In Progress':
        return theme.colors.primary;
      case 'Done':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority?: SubTask['priority']) => {
    switch (priority) {
      case 'High':
        return '#F57C00';
      case 'Medium':
        return theme.colors.primary;
      case 'Low':
        return '#388E3C';
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleStatusPress = () => {
    const statusOptions: SubTask['status'][] = ['To Do', 'In Progress', 'Done'];
    const currentIndex = statusOptions.indexOf(subTask.status);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
    onStatusChange(subTask.id, nextStatus);
  };

  const handleSaveEdit = () => {
    if (onEdit && (editedTitle.trim() !== subTask.title || editedDescription.trim() !== (subTask.description || ''))) {
      onEdit(subTask.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(subTask.title);
    setEditedDescription(subTask.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Subtask',
        'Are you sure you want to delete this subtask?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(subTask.id) }
        ]
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      <TouchableOpacity 
        style={styles.statusIndicator} 
        onPress={canEdit ? handleStatusPress : undefined}
        disabled={!canEdit}
      >
        <View style={[
          styles.statusDot, 
          { 
            backgroundColor: getStatusColor(subTask.status),
            opacity: subTask.status === 'Done' ? 1 : 0.7
          }
        ]}>
          {subTask.status === 'Done' && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editTitleInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Task title"
              multiline
              autoFocus
            />
            <TextInput
              style={styles.editDescriptionInput}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description (optional)"
              multiline
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.taskContent}
            onPress={isEditable ? () => setIsEditing(true) : undefined}
            onLongPress={canEdit ? handleDelete : undefined}
          >
            <Text style={[
              styles.title,
              subTask.status === 'Done' && styles.completedTitle
            ]} numberOfLines={2}>
              {subTask.title}
            </Text>
            
            {subTask.description && (
              <Text style={[
                styles.description,
                subTask.status === 'Done' && styles.completedText
              ]} numberOfLines={3}>
                {subTask.description}
              </Text>
            )}

            {/* Meta Information */}
            <View style={styles.metaContainer}>
              <View style={styles.leftMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subTask.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(subTask.status) }]}>
                    {subTask.status}
                  </Text>
                </View>

                {subTask.priority && (
                  <View style={styles.priorityBadge}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(subTask.priority) }]}>
                      {subTask.priority}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.rightMeta}>
                {subTask.dueDate && (
                  <Text style={styles.dueDateText}>
                    Due: {formatDate(subTask.dueDate)}
                  </Text>
                )}
                
                {assignee && (
                  <Text style={styles.assigneeText}>
                    {assignee.name || assignee.email}
                  </Text>
                )}
              </View>
            </View>

            {/* Estimated Hours */}
            {subTask.estimatedHours && (
              <View style={styles.hoursContainer}>
                <Text style={styles.hoursText}>
                  {subTask.estimatedHours}h estimated
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      {canEdit && !isEditing && (
        <View style={styles.actions}>
          {isEditable && (
            <TouchableOpacity 
              style={styles.editAction}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editActionText}>✏️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.deleteAction}
            onPress={handleDelete}
          >
            <Text style={styles.deleteActionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      marginVertical: 4,
      marginHorizontal: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    statusIndicator: {
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkMark: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
    },
    taskContent: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 4,
    },
    completedTitle: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    completedText: {
      textDecorationLine: 'line-through',
    },
    metaContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    leftMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightMeta: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginRight: 8,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    priorityBadge: {
      marginRight: 8,
    },
    priorityText: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    dueDateText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    assigneeText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '500',
      marginTop: 2,
    },
    hoursContainer: {
      marginTop: 4,
    },
    hoursText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    editContainer: {
      flex: 1,
    },
    editTitleInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      padding: 8,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    editDescriptionInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      padding: 8,
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 12,
      minHeight: 60,
      backgroundColor: theme.colors.background,
      textAlignVertical: 'top',
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 4,
      marginRight: 8,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 4,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      marginLeft: 8,
      justifyContent: 'center',
    },
    editAction: {
      padding: 4,
      marginBottom: 8,
    },
    editActionText: {
      fontSize: 16,
    },
    deleteAction: {
      padding: 4,
    },
    deleteActionText: {
      fontSize: 16,
    },
  });

export default SubTaskItem;