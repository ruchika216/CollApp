import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomIcon from './CustomIcon';
import { getTimeAgo } from '../../shared/helpers';

const ActivityItem = ({ activity, theme, onPress }) => {
  const getActivityIcon = type => {
    switch (type) {
      case 'project_created':
        return 'folder-plus';
      case 'status_updated':
        return 'refresh-cw';
      case 'comment_added':
        return 'message-circle';
      case 'user_assigned':
        return 'user-plus';
      case 'file_uploaded':
        return 'paperclip';
      case 'task_completed':
        return 'check-circle';
      default:
        return 'activity';
    }
  };

  const getActivityColor = type => {
    switch (type) {
      case 'project_created':
        return theme.colors.success;
      case 'status_updated':
        return theme.colors.primary;
      case 'comment_added':
        return theme.colors.info;
      case 'user_assigned':
        return theme.colors.secondary;
      case 'file_uploaded':
        return theme.colors.warning;
      case 'task_completed':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const styles = getStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getActivityColor(activity.type) + '20' },
        ]}
      >
        <CustomIcon
          name={getActivityIcon(activity.type)}
          size={16}
          color={getActivityColor(activity.type)}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>
          <Text style={styles.userName}>{activity.userName}</Text>{' '}
          {activity.message}
        </Text>
        <Text style={styles.time}>{getTimeAgo(activity.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    message: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: 4,
    },
    userName: {
      fontWeight: '600',
      color: theme.colors.text,
    },
    time: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

export default ActivityItem;
