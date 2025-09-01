import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';

interface Props {
  displayTasks: any[];
  navigation: any;
  getPriorityColor: (p: string) => string;
  getStatusColor: (s: string) => string;
  getAssigneeName: (id: string) => string;
  shadows?: any;
}

const AllTasksScrollSection: React.FC<Props> = ({
  displayTasks,
  navigation,
  getPriorityColor,
  getStatusColor,
  getAssigneeName,
  shadows,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          All Tasks ({displayTasks.length})
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TaskScreen')}
          style={styles.viewAllButton}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            Manage Tasks
          </Text>
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {displayTasks.length === 0 ? (
        <View style={styles.emptyProjectsState}>
          <Icon name="check" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Tasks Available
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            No tasks have been created yet
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tasksScroll}
          contentContainerStyle={styles.tasksScrollContainer}
        >
          {displayTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskScrollCard,
                {
                  backgroundColor: (colors as any).glass?.background || colors.card,
                  borderColor: (colors as any).glass?.border || colors.border,
                },
                shadows?.sm || theme.shadows.sm,
              ]}
              onPress={() => navigation.navigate('TaskScreen')}
            >
              <View style={styles.taskScrollHeader}>
                <Text
                  style={[styles.taskScrollTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <View
                  style={[
                    styles.taskScrollPriority,
                    { backgroundColor: getPriorityColor(task.priority) },
                  ]}
                >
                  <Text style={styles.taskScrollPriorityText} />
                </View>
              </View>
              <Text
                style={[
                  styles.taskScrollDescription,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={3}
              >
                {task.description}
              </Text>
              <View style={styles.taskScrollMeta}>
                <View
                  style={[
                    styles.taskScrollStatus,
                    { backgroundColor: getStatusColor(task.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.taskScrollStatusText,
                      { color: getStatusColor(task.status) },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.taskScrollFooter}>
                <Text
                  style={[
                    styles.taskScrollAssignee,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {task.assignedTo?.length > 0
                    ? getAssigneeName(task.assignedTo[0])
                    : 'Unassigned'}
                </Text>
                <Text
                  style={[styles.taskScrollDate, { color: colors.primary }]}
                >
                  {new Date(task.startDate).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: '600', marginRight: 4 },
  emptyProjectsState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  tasksScroll: { paddingLeft: 20 },
  tasksScrollContainer: { paddingRight: 20 },
  taskScrollCard: {
    width: 240,
    padding: 16,
    borderRadius: 16,
    marginRight: 16,
    minHeight: 180,
    borderWidth: 1,
  },
  taskScrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskScrollTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  taskScrollPriority: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskScrollPriorityText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  taskScrollDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
    minHeight: 54,
  },
  taskScrollMeta: { marginBottom: 12 },
  taskScrollStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  taskScrollStatusText: { fontSize: 12, fontWeight: '600' },
  taskScrollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  taskScrollAssignee: { fontSize: 12, flex: 1, marginRight: 8 },
  taskScrollDate: { fontSize: 12, fontWeight: '500' },
});

export default AllTasksScrollSection;
