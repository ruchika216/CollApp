import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type FilterKey =
  | 'All'
  | 'Completed'
  | 'To Do'
  | 'In Progress'
  | 'Review'
  | 'Testing';

export interface TaskCounts {
  All: number;
  Completed: number;
  'To Do': number;
  'In Progress': number;
  Review: number;
  Testing: number;
}

interface Props {
  selected: FilterKey;
  counts: TaskCounts;
  onSelect: (k: FilterKey) => void;
}

const TaskFilters: React.FC<Props> = ({ selected, counts, onSelect }) => {
  const { colors } = useTheme();
  const items: FilterKey[] = [
    'All',
    'Completed',
    'To Do',
    'In Progress',
    'Review',
    'Testing',
  ];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.wrap}
      contentContainerStyle={styles.inner}
    >
      {items.map(key => {
        const active = key === selected;
        const isComplete = key === 'Completed';
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            style={[
              styles.badge,
              {
                backgroundColor: isComplete
                  ? colors.text
                  : ((colors.primary + '14') as any),
                borderColor: active ? colors.primary : 'transparent',
              },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isComplete ? '#fff' : colors.text },
                active && { fontWeight: '800' },
              ]}
            >
              {key} {counts[key] !== undefined ? `(${counts[key]})` : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  inner: { paddingRight: 16 },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
  },
  badgeText: { fontSize: 14, fontWeight: '700' },
});

export default TaskFilters;
