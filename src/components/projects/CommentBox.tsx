import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { ProjectComment } from '../../types';
import { useTheme } from '../../theme/useTheme';

interface CommentBoxProps {
  comments: ProjectComment[];
  onAddComment: (text: string) => void;
  currentUserName: string;
  isLoading?: boolean;
  canComment?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  comments,
  onAddComment,
  currentUserName,
  isLoading = false,
  canComment = true
}) => {
  const theme = useTheme();
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const styles = getStyles(theme);

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const visibleComments = showAllComments ? sortedComments : sortedComments.slice(0, 3);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Comments ({comments.length})
        </Text>
      </View>

      {/* Add Comment */}
      {canComment && (
        <View style={styles.addCommentContainer}>
          <View style={styles.currentUserAvatar}>
            <Text style={styles.avatarText}>
              {getInitials(currentUserName)}
            </Text>
          </View>
          <View style={styles.addCommentInputContainer}>
            <TextInput
              style={styles.addCommentInput}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <View style={styles.addCommentActions}>
              <Text style={styles.characterCount}>
                {commentText.length}/500
              </Text>
              <TouchableOpacity
                style={[
                  styles.addCommentButton,
                  { opacity: commentText.trim() && !isLoading ? 1 : 0.5 }
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || isLoading}
              >
                <Text style={styles.addCommentButtonText}>
                  {isLoading ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Comments List */}
      <ScrollView style={styles.commentsContainer} showsVerticalScrollIndicator={false}>
        {visibleComments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        ) : (
          visibleComments.map((comment, index) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {getInitials(comment.userName)}
                </Text>
              </View>
              
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.userName}
                  </Text>
                  <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                </View>
                
                <Text style={styles.commentText}>
                  {comment.text}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Show More/Less Button */}
        {comments.length > 3 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllComments(!showAllComments)}
          >
            <Text style={styles.showMoreText}>
              {showAllComments 
                ? 'Show less comments' 
                : `Show ${comments.length - 3} more comments`
              }
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      maxHeight: 400,
    },
    header: {
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    addCommentContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    currentUserAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    addCommentInputContainer: {
      flex: 1,
    },
    addCommentInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      minHeight: 40,
      maxHeight: 100,
      textAlignVertical: 'top',
    },
    addCommentActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    characterCount: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    addCommentButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    addCommentButtonText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    commentsContainer: {
      flex: 1,
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    commentAvatarText: {
      color: 'white',
      fontSize: 10,
      fontWeight: '600',
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    commentAuthor: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 8,
    },
    commentTime: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    commentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 18,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    showMoreButton: {
      alignItems: 'center',
      paddingVertical: 8,
      marginTop: 8,
    },
    showMoreText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

export default CommentBox;