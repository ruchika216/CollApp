import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTasksPage, createTask } from '../../store/slices/taskSlice';
import TaskFilters, { TaskCounts } from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import CreateTaskModal from '../components/CreateTaskModal';
import ProjectHeader from '../../screens/Project/components/ProjectHeader';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';
import { Task } from '../../types';
import firestoreService from '../../firebase/firestoreService';

type FilterKey = keyof TaskCounts;

export default function TaskListScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const user = useAppSelector(s => s.auth.user);
  const tasks = useAppSelector(s => s.tasks.tasks);
  const loading = useAppSelector(s => s.tasks.loading);
  const hasMore = useAppSelector(s => s.tasks.hasMore);
  const loadingMore = useAppSelector(s => s.tasks.loadingMore);
  const isAdmin = user?.role === 'admin';

  const [filter, setFilter] = useState<FilterKey>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'updated' | 'priority'>('updated');
  // server-backed pagination replaces client-visible slice

  useEffect(() => {
    // initial page with reset
    dispatch(fetchTasksPage({ reset: true }));
  }, [dispatch]);

  const counts: TaskCounts = useMemo(
    () => ({
      All: tasks.length,
      Completed: tasks.filter(t => t.status === 'Completed').length,
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      Review: tasks.filter(t => t.status === 'Review').length,
      Testing: tasks.filter(t => t.status === 'Testing').length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    const base =
      filter === 'All' ? tasks : tasks.filter(t => t.status === filter);
    const q = query.trim().toLowerCase();
    const searched = q
      ? base.filter(
          t =>
            t.title.toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q),
        )
      : base;
    const sorted = [...searched].sort((a, b) => {
      if (sort === 'updated')
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      const prioRank = { High: 0, Medium: 1, Low: 2 } as const;
      return prioRank[a.priority] - prioRank[b.priority];
    });
    return sorted;
  }, [tasks, filter, query, sort]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchTasksPage({ reset: true }));
    setRefreshing(false);
  }, [dispatch]);

  const openCreate = () => setModal(true);
  const [modal, setModal] = useState(false);

  const handleCreate = async (data: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }) => {
    try {
      if (!user || user.role !== 'admin') {
        Alert.alert('Permission denied', 'Only admins can create tasks.');
        return;
      }

      // Ensure the user document exists so Firestore rules can resolve role
      const existingUser = await firestoreService.getUser(user.uid);
      if (!existingUser) {
        await firestoreService.createUser({
          uid: user.uid,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
          name: (user as any).name || user.displayName || user.email || 'Admin',
          photoURL: null,
          providerId: 'firebase',
          role: 'admin',
          approved: true,
          projects: [],
        } as any);
      }

      const taskBase: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description,
        status: 'To Do',
        priority: data.priority,
        assignedTo: [],
        comments: [],
        createdBy: user.uid,
        dueDate: new Date().toISOString(),
        viewCount: 0,
        attachments: [],
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } as any;
      await dispatch(createTask(taskBase)).unwrap();
      setModal(false);
      // Refresh list so the new task appears immediately
      dispatch(fetchTasksPage({ reset: true }));
    } catch (e: any) {
      console.warn('Task creation failed:', e);
      Alert.alert('Failed to save the task', e?.message || 'Please try again.');
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() =>
        navigation?.navigate('TaskDetailScreen', { taskId: item.id })
      }
      onLongPress={() => {
        /* TODO: context menu */
      }}
      variant={item.status === 'Completed' ? 'success' : 'standard'}
    />
  );

  return (
    <SafeAreaView style={styles.root}>
      <ProjectHeader
        title="Task List"
        subtitle={`${filtered.length} tasks`}
        onBack={() => navigation?.goBack()}
        rightActions={[
          {
            icon: 'status',
            onPress: onRefresh,
            accessibilityLabel: 'Refresh tasks',
          },
          {
            icon: sort === 'updated' ? 'priority' : 'clock',
            onPress: () =>
              setSort(s => (s === 'updated' ? 'priority' : 'updated')),
            accessibilityLabel: `Sort by ${
              sort === 'updated' ? 'priority' : 'updated date'
            }`,
          },
        ]}
      />

      <View style={[styles.searchRow, { borderColor: colors.border }]}>
        <Icon name="magnifier" size={16} tintColor={colors.textSecondary} />
        <TextInput
          placeholder="Search tasks..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <TaskFilters selected={filter} counts={counts} onSelect={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={onRefresh}
          />
        }
        onEndReached={() => {
          if (!loading && !loadingMore && hasMore) {
            dispatch(fetchTasksPage({ reset: false }));
          }
        }}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Loading more…</Text>
            </View>
          ) : null
        }
      />

      {isAdmin && <FloatingActionButton onPress={openCreate} />}

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={modal}
        onClose={() => setModal(false)}
        onSubmit={handleCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { padding: 16 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: { flex: 1, height: 32 },
  footer: { padding: 16, alignItems: 'center' },
  footerText: { opacity: 0.6 },
});
