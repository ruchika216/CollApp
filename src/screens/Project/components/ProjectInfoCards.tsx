import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Project } from '../../../types';
import Icon from '../../../components/common/Icon';
import EditableField from './EditableField';

interface ProjectInfoCardsProps {
  project: Project;
  canEdit: boolean;
  
  // Editable values
  editStartDate: string;
  editEndDate: string;
  editEstimatedHours: string;
  editCategory: string;
  
  // Change handlers
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onEstimatedHoursChange: (hours: string) => void;
  onCategoryChange: (category: string) => void;
  
  // Save handlers
  onSaveStartDate: () => void;
  onSaveEndDate: () => void;
  onSaveEstimatedHours: () => void;
  onSaveCategory: () => void;
  
  // Change flags
  startDateChanged: boolean;
  endDateChanged: boolean;
  estimatedHoursChanged: boolean;
  categoryChanged: boolean;
}

const ProjectInfoCards: React.FC<ProjectInfoCardsProps> = ({
  project,
  canEdit,
  editStartDate,
  editEndDate,
  editEstimatedHours,
  editCategory,
  onStartDateChange,
  onEndDateChange,
  onEstimatedHoursChange,
  onCategoryChange,
  onSaveStartDate,
  onSaveEndDate,
  onSaveEstimatedHours,
  onSaveCategory,
  startDateChanged,
  endDateChanged,
  estimatedHoursChanged,
  categoryChanged,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = () => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' };
    if (diffDays === 0) return { days: 0, status: 'today' };
    if (diffDays <= 7) return { days: diffDays, status: 'urgent' };
    return { days: diffDays, status: 'normal' };
  };

  const timeRemaining = getDaysRemaining();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project Information</Text>
      
      <View style={styles.cardsGrid}>
        {/* Timeline Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="calendar" size={22} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Timeline</Text>
            <View style={[
              styles.timelineBadge,
              {
                backgroundColor: 
                  timeRemaining.status === 'overdue' ? '#FF3B30' + '20' :
                  timeRemaining.status === 'today' ? '#FF9500' + '20' :
                  timeRemaining.status === 'urgent' ? '#FF9500' + '20' :
                  theme.colors.success + '20'
              }
            ]}>
              <Text style={[
                styles.timelineBadgeText,
                {
                  color: 
                    timeRemaining.status === 'overdue' ? '#FF3B30' :
                    timeRemaining.status === 'today' ? '#FF9500' :
                    timeRemaining.status === 'urgent' ? '#FF9500' :
                    theme.colors.success
                }
              ]}>
                {timeRemaining.status === 'overdue' ? `${timeRemaining.days}d overdue` :
                 timeRemaining.status === 'today' ? 'Due today' :
                 `${timeRemaining.days}d left`}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <EditableField
              label="Start Date"
              value={canEdit ? editStartDate : formatDate(project.startDate)}
              onChangeText={onStartDateChange}
              onSave={onSaveStartDate}
              canEdit={canEdit}
              hasChanged={startDateChanged}
              placeholder="YYYY-MM-DD"
              maxLength={10}
            />
            
            <EditableField
              label="End Date"
              value={canEdit ? editEndDate : formatDate(project.endDate)}
              onChangeText={onEndDateChange}
              onSave={onSaveEndDate}
              canEdit={canEdit}
              hasChanged={endDateChanged}
              placeholder="YYYY-MM-DD"
              maxLength={10}
            />
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={22} color={theme.colors.info} />
            <Text style={styles.cardTitle}>Project Details</Text>
          </View>
          
          <View style={styles.cardContent}>
            <EditableField
              label="Estimated Hours"
              value={canEdit ? editEstimatedHours : project.estimatedHours?.toString() || '0'}
              onChangeText={onEstimatedHoursChange}
              onSave={onSaveEstimatedHours}
              canEdit={canEdit}
              hasChanged={estimatedHoursChanged}
              keyboardType="numeric"
              suffix="hours"
              placeholder="0"
            />

            <EditableField
              label="Category"
              value={canEdit ? editCategory : project.category || 'General'}
              onChangeText={onCategoryChange}
              onSave={onSaveCategory}
              canEdit={canEdit}
              hasChanged={categoryChanged}
              placeholder="Enter category..."
              maxLength={50}
            />

            {/* Static Project Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Subtasks</Text>
                <Text style={styles.statValue}>
                  {project.subTasks.filter(st => st.status === 'Done').length} / {project.subTasks.length}
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Comments</Text>
                <Text style={styles.statValue}>{project.comments.length}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Files</Text>
                <Text style={styles.statValue}>
                  {(project.files?.length || 0) + (project.images?.length || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tags Card (only show if tags exist) */}
        {project.tags && project.tags.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="priority" size={22} color={theme.colors.accent} />
              <Text style={styles.cardTitle}>Tags</Text>
              <Text style={styles.tagCount}>{project.tags.length}</Text>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.tagsContainer}>
                {project.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    cardsGrid: {
      gap: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 10,
      flex: 1,
      letterSpacing: 0.3,
    },
    timelineBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    timelineBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tagCount: {
      backgroundColor: theme.colors.accent + '20',
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      minWidth: 20,
      textAlign: 'center',
    },
    cardContent: {
      gap: 16,
    },

    // Stats Styles
    statsRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: theme.colors.border,
      marginHorizontal: 12,
    },

    // Tags Styles
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: theme.colors.primary + '15',
      borderColor: theme.colors.primary + '30',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.primary,
    },
  });

export default ProjectInfoCards;