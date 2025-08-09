import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Project } from '../../types';
import { useTheme } from '../../theme/useTheme';

// const { width } = Dimensions.get('window');

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onLongPress?: () => void;
  showAssignees?: boolean;
  compact?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onPress, 
  onLongPress,
  showAssignees = true,
  compact = false 
}) => {
  const theme = useTheme();
  const styles = getStyles(theme, compact);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'To Do':
        return theme.colors.warning;
      case 'In Progress':
        return theme.colors.primary;
      case 'Done':
        return theme.colors.success;
      case 'Testing':
        return theme.colors.info;
      case 'Review':
        return '#9C27B0';
      case 'Deployment':
        return '#FF5722';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const completedSubtasks = project.subTasks.filter(task => task.status === 'Done').length;
  const totalSubtasks = project.subTasks.length;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
          {project.title}
        </Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>

      {/* Description */}
      {!compact && (
        <Text style={styles.description} numberOfLines={2}>
          {truncateText(project.description, 100)}
        </Text>
      )}

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>{project.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${project.progress}%`,
                backgroundColor: project.progress === 100 ? theme.colors.success : theme.colors.primary
              }
            ]} 
          />
        </View>
      </View>

      {/* Subtasks and Files */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{completedSubtasks}/{totalSubtasks}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{project.files.length}</Text>
          <Text style={styles.statLabel}>Files</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{project.comments.length}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <View style={styles.priorityBadge}>
            <Text style={[styles.priorityText, { color: getPriorityColor(project.priority) }]}>
              {project.priority}
            </Text>
          </View>
          <Text style={styles.dateText}>
            Due: {formatDate(project.endDate)}
          </Text>
        </View>
        
        {showAssignees && project.assignedUsers && (
          <View style={styles.assigneeSection}>
            <Text style={styles.assigneeCount}>
              {project.assignedUsers.length} assignee{project.assignedUsers.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {project.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {project.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{project.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme: any, compact: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
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
      marginBottom: compact ? 8 : 12,
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
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    progressSection: {
      marginBottom: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    progressLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
    },
    stat: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
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
    priorityBadge: {
      marginRight: 12,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    assigneeSection: {
      alignItems: 'flex-end',
    },
    assigneeCount: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    tag: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
      marginBottom: 4,
    },
    tagText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    moreTagsText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      alignSelf: 'center',
    },
  });

export default ProjectCard;