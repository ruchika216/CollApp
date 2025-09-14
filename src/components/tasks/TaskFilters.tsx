import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

type FilterKey =
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
  const onPrimaryText = (colors as any).textOnPrimary || '#fff';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.wrap}
      contentContainerStyle={styles.inner}
    >
      {items.map(key => {
        const active = key === selected;
        const bg = active ? colors.primary : (colors.card as string);
        const border = active ? colors.primary : colors.border;
        const text = active ? onPrimaryText : colors.text;
        const counterBg = active
          ? onPrimaryText
          : ((colors.primary + '20') as any);
        const counterText = active ? colors.primary : colors.primary;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            style={[styles.badge, { backgroundColor: bg, borderColor: border }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${key} filter`}
          >
            <Text style={[styles.badgeText, { color: text }]}>{key}</Text>
            {counts[key] !== undefined && (
              <View style={[styles.counter, { backgroundColor: counterBg }]}>
                <Text style={[styles.counterText, { color: counterText }]}>
                  {counts[key]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  inner: { paddingRight: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  badgeText: { fontSize: 14, fontWeight: '700' },
  counter: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: { fontSize: 12, fontWeight: '800' },
});

export default TaskFilters;
