import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { ProjectComment } from '../../../types';
import { useTheme } from '../../../theme/useTheme';

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
      {/* Add Comment Card */}
      {canComment && (
        <View style={styles.addCommentCard}>
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
                    {isLoading ? 'Posting...' : 'Comment'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Show More/Less Button */}
      {comments.length > 3 && (
        <View style={styles.toggleButtonContainer}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowAllComments(!showAllComments)}
          >
            <Text style={styles.toggleButtonText}>
              {showAllComments ? 'Show Less Comments' : `Show All ${comments.length} Comments`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Individual Comment Cards */}
      {visibleComments.length === 0 ? (
        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateText}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      ) : (
        visibleComments.map((comment, index) => (
          <View key={comment.id || index} style={styles.commentCard}>
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
                <View style={styles.commentTimestamp}>
                  <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.createdAt)}
                  </Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.commentText}>
                {comment.text}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
    },
    // Add Comment Card
    addCommentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    // Toggle Button Container
    toggleButtonContainer: {
      alignItems: 'center',
      marginBottom: 12,
    },
    // Comment Card Styles
    commentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    
    // Empty State Card
    emptyStateCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    toggleButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    toggleButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text,
    },
    addCommentContainer: {
      flexDirection: 'row',
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
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    commentAvatarText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    commentAuthor: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    commentTimestamp: {
      alignItems: 'flex-end',
    },
    commentTime: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    commentDate: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    commentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 18,
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      opacity: 0.8,
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