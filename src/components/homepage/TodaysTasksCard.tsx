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
  todaysTasks: any[];
  navigation: any;
  shadows?: any;
}

const TodaysTasksCard: React.FC<Props> = ({
  todaysTasks,
  navigation,
  shadows,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface }, shadows?.md]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Icon name="check" size={24} color={colors.primary} />
        </View>
        <TouchableOpacity
          style={styles.allTasksButton}
          onPress={() => navigation.navigate('TaskScreen')}
        >
          <Icon name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {todaysTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check" size={32} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No tasks scheduled for today
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.todaysTasksScroll}
          contentContainerStyle={styles.todaysTasksScrollContainer}
        >
          {todaysTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.todaysTaskCard,
                { backgroundColor: colors.background },
                shadows?.sm,
              ]}
              onPress={() => navigation.navigate('TaskScreen')}
            >
              {/* Add per-task content as needed */}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  allTasksButton: { flexDirection: 'row', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  todaysTasksScroll: { paddingLeft: 4 },
  todaysTasksScrollContainer: { paddingRight: 16 },
  todaysTaskCard: {
    width: 200,
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    minHeight: 140,
  },
});

export default TodaysTasksCard;
