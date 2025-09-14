import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import Icon from '../components/common/Icon';
// import { ProjectHeader } from './Project/components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchTasks,
  subscribeToTasks,
  unsubscribeFromTasks,
} from '../store/slices/taskSlice';
import { fetchApprovedUsers } from '../store/slices/userSlice';
import { Task, User } from '../types';

type FilterKey = 'all' | 'todo' | 'inprogress' | 'done';

function getStatusLabel(status: Task['status']) {
  switch (status) {
    case 'Pending':
      return 'To Do';
    case 'In Progress':
      return 'In Progress';
    case 'Done':
      return 'Completed';
    default:
      return status;
  }
}

type FilterPillProps = {
  label: string;
  count?: number;
  active?: boolean;
  onPress: () => void;
  activeBg: string;
  inactiveBg: string;
  inactiveBorder: string;
  activeText: string;
  inactiveText: string;
  counterActiveBg: string;
  counterInactiveBg: string;
  counterActiveText: string;
  counterInactiveText: string;
};

const FilterPill = memo(function FilterPill({
  label,
  count,
  active,
  onPress,
  activeBg,
  inactiveBg,
  inactiveBorder,
  activeText,
  inactiveText,
  counterActiveBg,
  counterInactiveBg,
  counterActiveText,
  counterInactiveText,
}: FilterPillProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterPill,
        active
          ? { backgroundColor: activeBg, borderColor: activeBg }
          : { backgroundColor: inactiveBg, borderColor: inactiveBorder },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          { color: active ? activeText : inactiveText },
        ]}
      >
        {label}
      </Text>
      {typeof count === 'number' && (
        <View
          style={[
            styles.counter,
            { backgroundColor: active ? counterActiveBg : counterInactiveBg },
          ]}
        >
          <Text
            style={[
              styles.counterText,
              { color: active ? counterActiveText : counterInactiveText },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function TaskListModern({ navigation }: any) {
  const { colors, gradients, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(s => s.tasks.tasks);
  // const loading = useAppSelector(s => s.tasks.loading);
  const approvedUsers = useAppSelector(s => s.user.approvedUsers);
  // const authUser = useAppSelector(s => s.auth.user);

  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchApprovedUsers());
    dispatch(subscribeToTasks());
    return () => {
      dispatch(unsubscribeFromTasks());
    };
  }, [dispatch]);

  const counts = useMemo(() => {
    const all = tasks.length;
    const todo = tasks.filter(t => t.status === 'Pending').length;
    const inprogress = tasks.filter(t => t.status === 'In Progress').length;
    const done = tasks.filter(t => t.status === 'Done').length;
    return { all, todo, inprogress, done };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'todo':
        return tasks.filter(t => t.status === 'Pending');
      case 'inprogress':
        return tasks.filter(t => t.status === 'In Progress');
      case 'done':
        return tasks.filter(t => t.status === 'Done');
      default:
        return tasks;
    }
  }, [filter, tasks]);

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return {
          bg: `${colors.error}20`,
          border: `${colors.error}40`,
          text: colors.error,
        };
      case 'Medium':
        return {
          bg: `${colors.warning}20`,
          border: `${colors.warning}40`,
          text: colors.warning,
        };
      case 'Low':
        return {
          bg: `${colors.success}20`,
          border: `${colors.success}40`,
          text: colors.success,
        };
      default:
        return { bg: '#e5e7eb', border: '#d1d5db', text: colors.textSecondary };
    }
  };

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'Pending':
        return {
          bg: `${colors.primary}18`,
          border: `${colors.primary}30`,
          text: colors.primary,
        };
      case 'In Progress':
        return {
          bg: `${colors.secondary || colors.primary}18`,
          border: `${colors.secondary || colors.primary}30`,
          text: colors.secondary || colors.primary,
        };
      case 'Done':
        return {
          bg: `${colors.success}22`,
          border: `${colors.success}40`,
          text: colors.success,
        };
      default:
        return { bg: '#e5e7eb', border: '#d1d5db', text: colors.textSecondary };
    }
  };

  const dynamic = useMemo(
    () =>
      StyleSheet.create({
        headerIconBg: { backgroundColor: isDark ? '#2a2758' : '#f1eaff' },
        listContent: { paddingHorizontal: 16, paddingBottom: 160 },
        emptyWrap: { alignItems: 'center', marginTop: 48 },
        emptyText: { marginTop: 8 },
        assigneesRow: { flexDirection: 'row' },
        avatar: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: isDark ? '#2a2758' : '#ede9fe',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDark ? '#1b1740' : '#fff',
        },
        avatarMore: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: isDark ? '#2a2758' : '#ede9fe',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isDark ? '#1b1740' : '#fff',
        },
        avatarText: { fontSize: 10, fontWeight: '700', color: colors.primary },
        avatarMargin: { marginLeft: 0 },
        avatarMarginOverlap: { marginLeft: -8 },
        dotText18: { fontSize: 18, color: colors.text },
        spacer12: { width: 12 },
        filterActiveBg: {
          backgroundColor: colors.text,
          borderColor: colors.text,
        },
        filterInactiveBg: {
          backgroundColor: isDark ? '#232238' : '#f3f4f6',
          borderColor: isDark ? '#2e2c54' : '#e5e7eb',
        },
        chipPriorityHigh: {
          backgroundColor: `${colors.error}20`,
          borderColor: `${colors.error}40`,
        },
        chipPriorityMedium: {
          backgroundColor: `${colors.warning}20`,
          borderColor: `${colors.warning}40`,
        },
        chipPriorityLow: {
          backgroundColor: `${colors.success}20`,
          borderColor: `${colors.success}40`,
        },
        chipStatusPending: {
          backgroundColor: `${colors.primary}18`,
          borderColor: `${colors.primary}30"`,
        },
        chipStatusInProgress: {
          backgroundColor: `${(colors as any).secondary || colors.primary}18`,
          borderColor: `${(colors as any).secondary || colors.primary}30`,
        },
        chipStatusDone: {
          backgroundColor: `${colors.success}22`,
          borderColor: `${colors.success}40"`,
        },
      }),
    [colors, isDark],
  );

  const renderAssignees = (assignedIds: string[]) => {
    const users: User[] = assignedIds
      .map(id => approvedUsers.find(u => u.uid === id))
      .filter(Boolean) as User[];

    if (users.length === 0) return null;

    return (
      <View style={dynamic.assigneesRow}>
        {users.slice(0, 3).map((u, idx) => (
          <View
            key={u.uid}
            style={[
              dynamic.avatar,
              idx === 0 ? dynamic.avatarMargin : dynamic.avatarMarginOverlap,
            ]}
          >
            <Text style={dynamic.avatarText}>
              {(u.name || u.email || '?').slice(0, 2).toUpperCase()}
            </Text>
          </View>
        ))}
        {users.length > 3 && (
          <View style={[dynamic.avatarMore, dynamic.avatarMarginOverlap]}>
            <Text style={dynamic.avatarText}>+{users.length - 3}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCard = ({ item }: { item: Task }) => {
    const p = getPriorityStyle(item.priority);
    const s = getStatusStyle(item.status);

    return (
      <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
        <View style={styles.cardHeader}>
          <Text
            style={[styles.cardTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <TouchableOpacity style={styles.dotsBtn}>
            <Text style={dynamic.dotText18}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          <View
            style={[
              styles.chip,
              { backgroundColor: p.bg, borderColor: p.border },
            ]}
          >
            <Text style={[styles.chipText, { color: p.text }]}>
              {item.priority}
            </Text>
          </View>
          <View
            style={[
              styles.chip,
              { backgroundColor: s.bg, borderColor: s.border },
            ]}
          >
            <Text style={[styles.chipText, { color: s.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Icon name="calendar" size={16} tintColor={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {' '}
              {new Date(item.startDate).toDateString()}
            </Text>
            <View style={dynamic.spacer12} />
            <Icon name="comment" size={16} tintColor={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {' '}
              {item.comments?.length || 0}
            </Text>
          </View>
          <View style={styles.metaRight}>
            {renderAssignees(item.assignedTo)}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Intentionally using local header here until types are harmonized */}
      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, dynamic.headerIconBg]}>
            <Icon name="project" size={18} tintColor={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Task List
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Icon name="filter" size={18} tintColor={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Icon name="search" size={18} tintColor={colors.text} />
          </TouchableOpacity>
        </View>
      </View> */}

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FilterPill
          label="Complete"
          count={counts.done}
          active={filter === 'done'}
          onPress={() => setFilter('done')}
          activeBg={colors.text}
          inactiveBg={isDark ? '#232238' : '#f3f4f6'}
          inactiveBorder={isDark ? '#2e2c54' : '#e5e7eb'}
          activeText="#fff"
          inactiveText={colors.text}
          counterActiveBg="#fff"
          counterInactiveBg={`${colors.primary}20`}
          counterActiveText={colors.text}
          counterInactiveText={colors.primary}
        />
        <FilterPill
          label="To Do"
          count={counts.todo}
          active={filter === 'todo'}
          onPress={() => setFilter('todo')}
          activeBg={colors.text}
          inactiveBg={isDark ? '#232238' : '#f3f4f6'}
          inactiveBorder={isDark ? '#2e2c54' : '#e5e7eb'}
          activeText="#fff"
          inactiveText={colors.text}
          counterActiveBg="#fff"
          counterInactiveBg={`${colors.primary}20`}
          counterActiveText={colors.text}
          counterInactiveText={colors.primary}
        />
        <FilterPill
          label="In Progress"
          count={counts.inprogress}
          active={filter === 'inprogress'}
          onPress={() => setFilter('inprogress')}
          activeBg={colors.text}
          inactiveBg={isDark ? '#232238' : '#f3f4f6'}
          inactiveBorder={isDark ? '#2e2c54' : '#e5e7eb'}
          activeText="#fff"
          inactiveText={colors.text}
          counterActiveBg="#fff"
          counterInactiveBg={`${colors.primary}20`}
          counterActiveText={colors.text}
          counterInactiveText={colors.primary}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={t => t.id}
        renderItem={renderCard}
        contentContainerStyle={dynamic.listContent}
        ListEmptyComponent={
          <View style={dynamic.emptyWrap}>
            <Icon name="check" size={48} tintColor={colors.textSecondary} />
            <Text style={[dynamic.emptyText, { color: colors.textSecondary }]}>
              No tasks
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation?.navigate('TaskScreen')}
        style={[styles.fab, { bottom: (insets.bottom || 16) + 24 }]}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGrad}
        >
          <Icon name="add" size={20} tintColor="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerActions: { flexDirection: 'row' },
  headerActionBtn: { padding: 8, marginLeft: 8 },

  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  filterText: { fontWeight: '700' },
  counter: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  counterText: { fontWeight: '700', fontSize: 12 },

  card: {
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 8,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },
  cardLight: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef0f5',
  },
  cardDark: {
    backgroundColor: '#1c1a33',
    borderWidth: 1,
    borderColor: '#2a2758',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 8 },
  dotsBtn: { paddingHorizontal: 4, paddingVertical: 4 },

  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },

  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLeft: { flexDirection: 'row', alignItems: 'center' },
  metaRight: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12 },

  fab: {
    position: 'absolute',
    right: 20,
  },
  fabGrad: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
  },
});
