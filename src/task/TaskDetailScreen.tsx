import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import ProjectHeader from './Project/components/ProjectHeader';
import firestoreService from '../firebase/firestoreService';
import { Task, TaskComment } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateTask } from '../store/slices/taskSlice';

interface Props {
  route: { params: { taskId: string } };
}

const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAppSelector(s => s.auth.user);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const t = await firestoreService.getTask(route.params.taskId);
        setTask(t);
      } finally {
        setLoading(false);
      }
    })();
  }, [route.params.taskId]);

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ProjectHeader
          title={task?.title || 'Task Details'}
          subtitle={task ? `Status: ${task.status}` : undefined}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ProjectHeader
          title="Task Details"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.center}>
          <Text style={{ color: colors.text }}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ProjectHeader
        title={task.title}
        subtitle={`Status: ${task.status}`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={[styles.container]}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Status: {task.status}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          Priority: {task.priority}
        </Text>
        {!!task.dueDate && (
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Due: {new Date(task.dueDate).toLocaleString()}
          </Text>
        )}
        {!!task.description && (
          <Text style={[styles.desc, { color: colors.text }]}>
            {task.description}
          </Text>
        )}

        {/* Comments */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Comments
        </Text>
        {(task.comments || []).length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No comments yet.</Text>
        ) : (
          (task.comments || []).map((c: any, idx: number) => (
            <View key={c.id || idx} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {(c.userName || 'User').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.commentBody}>
                <Text style={[styles.commentAuthor, { color: colors.text }]}>
                  {c.userName || 'User'}
                </Text>
                <Text style={{ color: colors.text }}>{c.text}</Text>
                {!!c.createdAt && (
                  <Text
                    style={[
                      styles.commentTime,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {new Date(c.createdAt).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}

        {/* Add comment */}
        <View style={[styles.addComment, { borderColor: colors.border }]}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary}
            style={{ color: colors.text }}
            multiline
          />
          <View style={styles.addCommentActions}>
            <TouchableOpacity
              onPress={async () => {
                if (!task || !user || !commentText.trim()) return;
                setCommenting(true);
                try {
                  const newComment = {
                    id: Date.now().toString(),
                    text: commentText.trim(),
                    userId: user.uid,
                    userName:
                      user.name || user.displayName || user.email || 'User',
                    createdAt: new Date().toISOString(),
                  } as TaskComment;
                  const updates: Partial<Task> = {
                    comments: [...(task.comments || []), newComment],
                  };
                  // Update via Redux thunk so the list and other screens stay in sync
                  await dispatch(
                    updateTask({ taskId: task.id, updates }) as any,
                  );
                  // Refresh local view with latest from Firestore (keeps it robust)
                  const fresh = await firestoreService.getTask(task.id);
                  setTask(fresh);
                  setCommentText('');
                } finally {
                  setCommenting(false);
                }
              }}
              disabled={commenting || !commentText.trim()}
              style={[
                styles.commentBtn,
                styles.commentBtnPrimary,
                commenting || !commentText.trim()
                  ? styles.commentBtnDisabled
                  : null,
              ]}
            >
              <Text style={styles.commentBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  meta: { fontSize: 14, marginBottom: 4 },
  desc: { fontSize: 16, lineHeight: 22, marginTop: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  commentItem: { flexDirection: 'row', marginBottom: 12 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentAvatarText: { fontWeight: '700' },
  commentBody: { flex: 1 },
  commentAuthor: { fontWeight: '700', marginBottom: 2 },
  commentTime: { fontSize: 12, marginTop: 4 },
  addComment: { borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 8 },
  addCommentActions: { alignItems: 'flex-end', marginTop: 6 },
  commentBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  commentBtnPrimary: { backgroundColor: '#3b82f6' },
  commentBtnDisabled: { opacity: 0.6 },
  commentBtnText: { color: '#fff', fontWeight: '700' },
});

export default TaskDetailScreen;
