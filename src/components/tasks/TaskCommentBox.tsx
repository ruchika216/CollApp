import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { TaskComment } from '../../types';
import { useTheme } from '../../theme/useTheme';
import Icon from '../../components/common/Icon';

interface TaskCommentBoxProps {
  comments: TaskComment[];
  onAddComment: (text: string) => void;
  currentUserName: string;
  isLoading?: boolean;
  canComment?: boolean;
}

const TaskCommentBox: React.FC<TaskCommentBoxProps> = ({
  comments,
  onAddComment,
  currentUserName,
  isLoading = false,
  canComment = true,
}) => {
  const { colors } = useTheme();
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Sort comments by newest first
  const sortedComments = [...(comments || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Show only 3 most recent comments if not expanded
  const displayComments = showAllComments
    ? sortedComments
    : sortedComments.slice(0, 3);
  const hasMoreComments = sortedComments.length > 3;

  return (
    <View style={styles.container}>
      {/* Comments List */}
      <View style={styles.commentsList}>
        {displayComments.map((comment, index) => (
          <View
            key={comment.id || index}
            style={[
              styles.commentItem,
              { backgroundColor: `${colors.card}80` },
            ]}
          >
            <View style={styles.commentHeader}>
              <View style={styles.userInfo}>
                <View
                  style={[
                    styles.userAvatar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.userInitial}>
                    {comment.userId.substring(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {comment.userId === currentUserName
                      ? 'You'
                      : comment.userId}
                  </Text>
                  <Text
                    style={[styles.timeAgo, { color: colors.textSecondary }]}
                  >
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.commentText, { color: colors.text }]}>
              {comment.text}
            </Text>
          </View>
        ))}

        {/* Show more/less button if needed */}
        {hasMoreComments && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllComments(!showAllComments)}
          >
            <Text style={[styles.showMoreText, { color: colors.primary }]}>
              {showAllComments
                ? 'Show fewer comments'
                : `Show ${sortedComments.length - 3} more comments`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Empty state */}
        {comments.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        )}
      </View>

      {/* Comment Input */}
      {canComment && (
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: `${colors.card}80`,
                borderColor: colors.border,
              },
            ]}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: commentText.trim()
                  ? colors.primary
                  : `${colors.primary}50`,
                opacity: commentText.trim() ? 1 : 0.7,
              },
            ]}
            onPress={handleAddComment}
            disabled={!commentText.trim() || isLoading}
          >
            {isLoading ? (
              <Text style={styles.sendButtonText}>...</Text>
            ) : (
              <Icon name="edit" size={20} tintColor="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  commentsList: {
    marginBottom: 8,
  },
  commentItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  showMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TaskCommentBox;
