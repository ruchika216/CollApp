import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';
import { Task } from '../../../types';

interface TaskInfoCardsProps {
  task: Task;
}

const TaskInfoCards: React.FC<TaskInfoCardsProps> = ({ task }) => {
  const { colors, shadows } = useTheme();

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View
          style={[styles.card, { backgroundColor: colors.card }, shadows.sm]}
        >
          <View style={styles.iconContainer}>
            <Icon name="calendar" size={24} tintColor={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Due Date
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {formatDate(task.dueDate)}
            </Text>
          </View>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.card }, shadows.sm]}
        >
          <View style={styles.iconContainer}>
            <Icon
              name="account-supervisor"
              size={24}
              tintColor={colors.primary}
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Assignees
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {task.assignedTo && task.assignedTo.length > 0
                ? `${task.assignedTo.length} Assigned`
                : 'Unassigned'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View
          style={[styles.card, { backgroundColor: colors.card }, shadows.sm]}
        >
          <View style={styles.iconContainer}>
            <Icon name="flag" size={24} tintColor={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Priority
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {task.priority || 'Medium'}
            </Text>
          </View>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.card }, shadows.sm]}
        >
          <View style={styles.iconContainer}>
            <Icon name="status" size={24} tintColor={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              Status
            </Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {task.status || 'To Do'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskInfoCards;
