import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Meeting } from '../../../types';
import { useTheme } from '../../../theme/useTheme';
import { Icon } from '../../base';
import { 
  getMeetingCountdown, 
  formatMeetingTime, 
  getMeetingDuration,
  getMeetingStatusColor 
} from '../../../utils/meetingUtils';

interface MeetingCardProps {
  meeting: Meeting;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  showCountdown?: boolean;
  compact?: boolean;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  showCountdown = true,
  compact = false 
}) => {
  const theme = useTheme();
  const styles = getStyles(theme, compact);
  
  const [countdown, setCountdown] = useState(getMeetingCountdown(meeting));

  useEffect(() => {
    if (!showCountdown) return;

    const updateCountdown = () => {
      const newCountdown = getMeetingCountdown(meeting);
      setCountdown(newCountdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [meeting.startTime, meeting.endTime, showCountdown]);

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'Scheduled':
        return theme.colors.primary;
      case 'In Progress':
        return theme.colors.success;
      case 'Completed':
        return theme.colors.textSecondary;
      case 'Cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Meeting['priority']) => {
    switch (priority) {
      case 'Critical':
        return '#D32F2F';
      case 'High':
        return '#F57C00';
      case 'Medium':
        return '#1976D2';
      case 'Low':
        return '#388E3C';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeColor = (type: Meeting['type']) => {
    switch (type) {
      case 'All Hands':
        return '#9C27B0';
      case 'Team':
        return theme.colors.primary;
      case 'Individual':
        return theme.colors.info;
      case 'Project Review':
        return '#FF5722';
      case 'Client Meeting':
        return '#4CAF50';
      case 'Training':
        return '#607D8B';
      default:
        return theme.colors.textSecondary;
    }
  };


  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.time}>
            {formatMeetingTime(meeting.startTime, false)}
          </Text>
          {showCountdown && (
            <View style={[
              styles.countdownBadge,
              { backgroundColor: getMeetingStatusColor(meeting) + '20' }
            ]}>
              <Text style={[
                styles.countdownText,
                { color: countdown.status === 'live' ? '#ffffff' : getMeetingStatusColor(meeting) }
              ]}>
                {countdown.displayText}
              </Text>
            </View>
          )}
        </View>
        
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Icon name="edit" size={16} tintColor={theme.colors.primary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Icon name="delete" size={16} tintColor={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
            {meeting.title}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(meeting.status) }]} />
            <Text style={styles.statusText}>{meeting.status}</Text>
          </View>
        </View>

        {!compact && (
          <Text style={styles.agenda} numberOfLines={2}>
            {truncateText(meeting.agenda, 120)}
          </Text>
        )}

        {/* Meeting Link */}
        {meeting.meetingLink && (
          <View style={styles.linkSection}>
            <Icon name="info" size={14} tintColor={theme.colors.primary} />
            <Text style={styles.linkText} numberOfLines={1}>
              {meeting.meetingLink.replace(/https?:\/\//, '')}
            </Text>
          </View>
        )}

        {/* Location */}
        {meeting.location && (
          <View style={styles.locationSection}>
            <Icon name="info" size={14} tintColor={theme.colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {meeting.location}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(meeting.type) + '20' }]}>
            <Text style={[styles.typeText, { color: getTypeColor(meeting.type) }]}>
              {meeting.type}
            </Text>
          </View>
          
          <View style={styles.priorityBadge}>
            <Text style={[styles.priorityText, { color: getPriorityColor(meeting.priority) }]}>
              {meeting.priority}
            </Text>
          </View>
        </View>

        <View style={styles.rightFooter}>
          <Text style={styles.dateText}>
            {formatMeetingTime(meeting.startTime, true).split(' at ')[0]}
          </Text>
          {meeting.endTime && (
            <Text style={styles.durationText}>
              Duration: {getMeetingDuration(meeting.startTime, meeting.endTime)}
            </Text>
          )}
          {meeting.assignedUsers && meeting.assignedUsers.length > 0 && (
            <Text style={styles.assigneeText}>
              {meeting.isAssignedToAll ? 'All users' : 
               meeting.assignedUsers.length === 1 ? 
               meeting.assignedUsers[0].name || 'Unknown' :
               `${meeting.assignedUsers.length} attendees`}
            </Text>
          )}
        </View>
      </View>

      {/* Comments indicator */}
      {meeting.comments && meeting.comments.length > 0 && (
        <View style={styles.commentsSection}>
          <Icon name="chat" size={14} tintColor={theme.colors.textSecondary} />
          <Text style={styles.commentsText}>
            {meeting.comments.length} comment{meeting.comments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme: any, compact: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: compact ? 12 : 16,
      marginHorizontal: 16,
      marginVertical: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    time: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
      marginRight: 12,
    },
    countdownBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      flexShrink: 1,
    },
    countdownText: {
      fontSize: 12,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 4,
    },
    content: {
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: compact ? 16 : 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text,
    },
    agenda: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    linkSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    linkText: {
      fontSize: 12,
      color: theme.colors.primary,
      marginLeft: 6,
      flex: 1,
      fontWeight: '500',
    },
    locationSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    locationText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 6,
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    leftFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    priorityBadge: {
      marginRight: 8,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    rightFooter: {
      alignItems: 'flex-end',
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    durationText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginBottom: 2,
      fontStyle: 'italic',
    },
    assigneeText: {
      fontSize: 11,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    commentsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    commentsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 6,
    },
  });

export default MeetingCard;