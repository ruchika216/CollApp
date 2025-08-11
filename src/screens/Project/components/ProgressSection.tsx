import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';

interface ProgressSectionProps {
  progress: number;
  canEdit: boolean;
  editProgress: string;
  onProgressChange: (progress: string) => void;
  onSaveProgress: () => void;
  hasChanged: boolean;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  progress,
  canEdit,
  editProgress,
  onProgressChange,
  onSaveProgress,
  hasChanged,
}) => {
  const theme = useTheme();
  const progressValue = canEdit ? parseInt(editProgress) || 0 : progress;
  
  const styles = getStyles(theme);

  // Progress bar animation would go here if needed
  const getProgressColor = (progress: number) => {
    if (progress < 25) return '#FF3B30'; // Red
    if (progress < 50) return '#FF9500'; // Orange
    if (progress < 75) return '#007AFF'; // Blue
    if (progress < 100) return '#30D158'; // Green
    return '#34C759'; // Completed Green
  };

  const getProgressGradient = (progress: number) => {
    const color = getProgressColor(progress);
    return [color, color + 'CC'];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Project Progress</Text>
        {canEdit ? (
          <View style={styles.editContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.progressInput}
                value={editProgress}
                onChangeText={onProgressChange}
                keyboardType="numeric"
                maxLength={3}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary + '80'}
              />
              <Text style={styles.percentSign}>%</Text>
            </View>
            {hasChanged && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={onSaveProgress}
                activeOpacity={0.8}
              >
                <Icon name="check" size={12} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.displayContainer}>
            <Text style={styles.progressValue}>{progress}%</Text>
            <View style={[
              styles.progressBadge,
              { backgroundColor: getProgressColor(progress) + '20' }
            ]}>
              <Text style={[
                styles.progressBadgeText,
                { color: getProgressColor(progress) }
              ]}>
                {progress === 100 ? 'Complete' : 
                 progress >= 75 ? 'Almost Done' :
                 progress >= 50 ? 'In Progress' :
                 progress >= 25 ? 'Getting Started' : 'Just Started'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(0, Math.min(100, progressValue))}%`,
                backgroundColor: getProgressColor(progressValue),
              },
            ]}
          />
        </View>
        
        {/* Progress Markers */}
        <View style={styles.progressMarkers}>
          {[25, 50, 75].map((marker) => (
            <View
              key={marker}
              style={[
                styles.progressMarker,
                {
                  left: `${marker}%`,
                  backgroundColor: progressValue >= marker 
                    ? getProgressColor(progressValue)
                    : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        
        {/* Progress Labels */}
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>0%</Text>
          <Text style={styles.progressLabelText}>25%</Text>
          <Text style={styles.progressLabelText}>50%</Text>
          <Text style={styles.progressLabelText}>75%</Text>
          <Text style={styles.progressLabelText}>100%</Text>
        </View>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progressValue}%</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{100 - progressValue}%</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
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
        android: {
          elevation: 6,
        },
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    label: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    editContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    progressInput: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      minWidth: 40,
      textAlign: 'center',
      paddingVertical: 0,
    },
    percentSign: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    displayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    progressBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    progressBadgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: theme.colors.success,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    // Progress Bar Styles
    progressBarContainer: {
      position: 'relative',
      marginBottom: 20,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBar: {
      height: '100%',
      borderRadius: 4,
      minWidth: 8,
    },
    progressMarkers: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 8,
    },
    progressMarker: {
      position: 'absolute',
      top: -2,
      width: 4,
      height: 12,
      borderRadius: 2,
      transform: [{ translateX: -2 }],
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    progressLabelText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    // Stats Styles
    statsContainer: {
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
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: theme.colors.border,
      marginHorizontal: 16,
    },
  });

export default ProgressSection;