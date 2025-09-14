import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Task } from '../../types';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';

interface Props {
  task: Task;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: 'standard' | 'success' | 'action';
}

const priorityColor = (p: Task['priority']) =>
  ({
    High: '#ff4757',
    Medium: '#ffa502',
    Low: '#2ed573',
  }[p]);

const TaskCard: React.FC<Props> = ({
  task,
  onPress,
  onLongPress,
  variant = 'standard',
}) => {
  const { colors } = useTheme();
  const bg = variant === 'success' ? '#2ed573' : colors.card;
  const textColor = variant === 'success' ? '#fff' : colors.text;
  const statusTextStyle = useMemo(
    () => ({ color: variant === 'success' ? '#fff' : colors.primary }),
    [variant, colors.primary],
  );
  const descTextStyle = useMemo(
    () => ({
      color:
        variant === 'success' ? 'rgba(255,255,255,0.9)' : colors.textSecondary,
    }),
    [variant, colors.textSecondary],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: bg, borderColor: colors.border }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {task.title}
        </Text>
        <TouchableOpacity
          accessibilityLabel="More options"
          style={styles.moreBtn}
          onPress={onLongPress}
        >
          <Icon name="more" size={18} tintColor={textColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.badgesRow}>
        <View
          style={[
            styles.chip,
            {
              borderColor: priorityColor(task.priority),
              backgroundColor: priorityColor(task.priority) + '20',
            },
          ]}
        >
          <Text
            style={[styles.chipText, { color: priorityColor(task.priority) }]}
          >
            {task.priority}
          </Text>
        </View>
        <View
          style={[
            styles.chip,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primary + '24',
            },
          ]}
        >
          <Text style={[styles.chipText, statusTextStyle]} numberOfLines={1}>
            {task.status}
          </Text>
        </View>
      </View>

      {!!task.description && (
        <Text style={[styles.desc, descTextStyle]} numberOfLines={3}>
          {task.description}
        </Text>
      )}

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={14} tintColor={textColor} />
          <Text style={[styles.metaText, { color: textColor }]}>
            {' '}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="status" size={14} tintColor={textColor} />
          <Text style={[styles.metaText, { color: textColor }]}>
            {' '}
            {task.viewCount ?? 0}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="comment" size={14} tintColor={textColor} />
          <Text style={[styles.metaText, { color: textColor }]}>
            {' '}
            {task.comments?.length ?? 0}
          </Text>
        </View>
        <View style={styles.flexSpacer} />
        <View style={styles.avatars}>
          {(Array.isArray(task.assignedTo)
            ? task.assignedTo.slice(0, 3)
            : []
          ).map((id, idx) => (
            <View
              key={id + idx}
              style={[styles.avatarWrap, { left: idx * -12 }]}
            >
              <Image
                source={{
                  uri: `https://api.dicebear.com/7.x/initials/svg?seed=${id}`,
                }}
                style={styles.avatar}
              />
            </View>
          ))}
        </View>
      </View>

      {variant === 'action' && (
        <View style={styles.actionPlus}>
          <Icon name="add" size={18} tintColor="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16, fontWeight: '700', flex: 1, paddingRight: 8 },
  badges: { flexDirection: 'row', alignItems: 'center' },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  desc: { marginTop: 8, fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaText: { fontSize: 12, fontWeight: '600' },
  flexSpacer: { flex: 1 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  avatar: { width: 30, height: 30 },
  actionPlus: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBtn: { paddingLeft: 8, paddingVertical: 2 },
});

export default TaskCard;
