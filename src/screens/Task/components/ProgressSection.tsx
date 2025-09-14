import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Task } from '../../../types';

interface ProgressSectionProps {
  status: Task['status'];
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ status }) => {
  const { colors } = useTheme();

  const getStatusColor = (s: Task['status']) => {
    switch (s) {
      case 'To Do':
        return '#FF3B30';
      case 'In Progress':
        return '#007AFF';
      case 'Review':
        return '#FF9500';
      case 'Testing':
        return '#30D158';
      case 'Completed':
        return '#34C759';
      default:
        return colors.textSecondary;
    }
  };

  const getProgressFromStatus = (s: Task['status']): number => {
    switch (s) {
      case 'To Do':
        return 0; // Not started - 0%
      case 'In Progress':
        return 40; // Work in progress - 40%
      case 'Review':
        return 75; // Review phase - 75%
      case 'Testing':
        return 90; // Testing phase - 90%
      case 'Completed':
        return 100; // Done - 100%
      default:
        return 0;
    }
  };

  const progress = getProgressFromStatus(status);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        <Text style={[styles.percentage, { color: colors.text }]}>
          {progress}%
        </Text>
      </View>
      <View
        style={[styles.progressBar, { backgroundColor: `${colors.text}10` }]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: getStatusColor(status),
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <View style={styles.stagesContainer}>
        <View
          style={[
            styles.stage,
            {
              backgroundColor:
                progress >= 0 ? getStatusColor('To Do') : `${colors.text}10`,
            },
          ]}
        />
        <View
          style={[
            styles.stage,
            {
              backgroundColor:
                progress >= 40
                  ? getStatusColor('In Progress')
                  : `${colors.text}10`,
            },
          ]}
        />
        <View
          style={[
            styles.stage,
            {
              backgroundColor:
                progress >= 75 ? getStatusColor('Review') : `${colors.text}10`,
            },
          ]}
        />
        <View
          style={[
            styles.stage,
            {
              backgroundColor:
                progress >= 90 ? getStatusColor('Testing') : `${colors.text}10`,
            },
          ]}
        />
        <View
          style={[
            styles.stage,
            {
              backgroundColor:
                progress >= 100
                  ? getStatusColor('Completed')
                  : `${colors.text}10`,
            },
          ]}
        />
      </View>
      <View style={styles.labelsContainer}>
        <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>
          To Do
        </Text>
        <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>
          In Progress
        </Text>
        <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>
          Review
        </Text>
        <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>
          Testing
        </Text>
        <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>
          Complete
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stage: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageLabel: {
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 60,
  },
});

export default ProgressSection;
