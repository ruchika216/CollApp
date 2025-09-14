import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Task, User } from '../../types';
import Icon from '../common/Icon';
import { userService } from '../../services/UserService';

// Define ThemeColors type
type ThemeColors = {
  text: string;
  textSecondary: string;
  primary: string;
  background: string;
  card: string;
  error: string;
  border: string;
  notification: string;
  // Add any other colors you have in your theme
};

interface TaskCardItemProps {
  task: Task;
  colors: ThemeColors;
  isAdmin: boolean;
  canDevUpdate?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPress: (task: Task) => void;
  getStatusColor: (s: Task['status']) => string;
  getPriorityColor: (p: Task['priority']) => string;
  getProgressFromStatus: (status: Task['status']) => number;
}

const TaskCardItem: React.FC<TaskCardItemProps> = ({
  task,
  colors,
  isAdmin,
  canDevUpdate,
  onEdit,
  onDelete,
  onPress,
  getStatusColor,
  getPriorityColor,
  getProgressFromStatus,
}) => {
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch user data for assigned users
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!task.assignedTo || task.assignedTo.length === 0) return;

      setLoadingUsers(true);
      try {
        const users = await userService.getUsersByIds(task.assignedTo);
        setAssignedUsers(users);
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAssignedUsers();
  }, [task.assignedTo]);

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if task is overdue
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    // Set hours to 0 to compare just the dates
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'Completed';
  };

  // Truncate description to around 15-20 words
  const truncateDescription = (text: string, wordLimit: number = 15) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      style={[
        styles.taskCard,
        {
          backgroundColor: colors.card,
          shadowColor: colors.text,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>
            {task.title}
          </Text>
        </View>

        {/* Action Buttons - Only visible for admins or assigned developers */}
        {(isAdmin || canDevUpdate) && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => onEdit(task)}
            >
              <Icon name="edit" size={16} tintColor="#fff" />
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => onDelete(task)}
              >
                <Icon name="delete" size={16} tintColor="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Description */}
      {task.description && (
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {truncateDescription(task.description)}
        </Text>
      )}

      {/* Status & Priority Badges */}
      <View style={styles.badgeContainer}>
        {/* Status Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: `${getStatusColor(task.status)}20` },
          ]}
        >
          <Text
            style={[styles.badgeText, { color: getStatusColor(task.status) }]}
          >
            {task.status}
          </Text>
        </View>

        {/* Priority Badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: `${getPriorityColor(task.priority)}20` },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: getPriorityColor(task.priority) },
            ]}
          >
            {task.priority}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Progress
          </Text>
          <Text style={[styles.progressValue, { color: colors.text }]}>
            {getProgressFromStatus(task.status)}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: `${colors.text}15` },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: getStatusColor(task.status),
                width: `${getProgressFromStatus(task.status)}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        {/* Due Date */}
        {task.dueDate && (
          <View style={styles.footerItem}>
            <Icon
              name="clock"
              size={14}
              tintColor={
                isOverdue(task.dueDate) ? colors.error : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.footerText,
                {
                  color: isOverdue(task.dueDate)
                    ? colors.error
                    : colors.textSecondary,
                  fontWeight: isOverdue(task.dueDate) ? '600' : 'normal',
                },
              ]}
            >
              Due: {formatDate(task.dueDate)}
            </Text>
          </View>
        )}

        {/* Comments Count */}
        <View style={styles.footerItem}>
          <Icon name="chat" size={14} tintColor={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {task.comments?.length || 0}
          </Text>
        </View>

        {/* Assignee Avatars */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <View style={styles.avatarContainer}>
            {assignedUsers.length > 0 ? (
              // Display users with profile images when loaded
              <>
                {assignedUsers.slice(0, 2).map((user, index) => (
                  <View
                    key={user.uid}
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: user.photoURL
                          ? 'transparent'
                          : colors.primary,
                        marginLeft: index > 0 ? -8 : 0,
                        zIndex: 2 - index,
                      },
                    ]}
                  >
                    {user.photoURL ? (
                      <Image
                        source={{ uri: user.photoURL }}
                        style={styles.avatarImage}
                        defaultSource={{
                          uri:
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(
                              user.displayName || user.email || 'U',
                            ),
                        }}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {(user.displayName || user.email || user.uid)
                          ?.substring(0, 1)
                          .toUpperCase()}
                      </Text>
                    )}
                  </View>
                ))}
                {assignedUsers.length > 2 && (
                  <View
                    style={[
                      styles.extraAvatarCount,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        marginLeft: -8,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.extraAvatarCountText,
                        { color: colors.text },
                      ]}
                    >
                      +{assignedUsers.length - 2}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Fallback to UIDs if users aren't loaded yet
              <>
                {task.assignedTo.slice(0, 2).map((uid, index) => (
                  <View
                    key={uid}
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: colors.primary,
                        marginLeft: index > 0 ? -8 : 0,
                        zIndex: 2 - index,
                      },
                    ]}
                  >
                    <Text style={styles.avatarText}>
                      {uid.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ))}
                {task.assignedTo.length > 2 && (
                  <View
                    style={[
                      styles.extraAvatarCount,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        marginLeft: -8,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.extraAvatarCountText,
                        { color: colors.text },
                      ]}
                    >
                      +{task.assignedTo.length - 2}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  footerText: {
    fontSize: 12,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  extraAvatarCount: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 0,
  },
  extraAvatarCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default TaskCardItem;
