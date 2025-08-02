import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setNotifications, markAsRead, clearNotifications } from '../store/slices/notificationSlice';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../firebase/firestore';
import { Notification } from '../types';
import Icon from '../components/common/Icon';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { spacing, borderRadius } from '../constants/spacing';

interface NotificationScreenProps {
  navigation: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const { colors, gradients } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const notifications = useAppSelector(state => state.notifications.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.uid) return;

    try {
      const userNotifications = await getUserNotifications(user.uid);
      dispatch(setNotifications(userNotifications));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      dispatch(clearNotifications());
      await loadNotifications();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              await loadNotifications();
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.projectId) {
      navigation.navigate('ProjectScreen', { projectId: notification.projectId });
    }
  };

  const getNotificationIcon = (type: Notification['type'], actionType?: string) => {
    switch (actionType) {
      case 'project_assigned':
        return 'project';
      case 'status_changed':
        return 'status';
      case 'comment_added':
        return 'comment';
      case 'file_uploaded':
        return 'file';
      default:
        switch (type) {
          case 'success':
            return 'check';
          case 'warning':
            return 'priority';
          case 'error':
            return 'close';
          case 'info':
          default:
            return 'notification';
        }
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'info':
      default:
        return colors.info;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      case 'all':
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item: notification }: { item: Notification }) => (
    <Card
      variant="outlined"
      style={[
        styles.notificationCard,
        !notification.read && { backgroundColor: `${colors.primary}05` },
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${getNotificationColor(notification.type)}20` },
              ]}
            >
              <Icon
                name={getNotificationIcon(notification.type, notification.actionType)}
                size={20}
                tintColor={getNotificationColor(notification.type)}
              />
            </View>
            <View style={styles.notificationInfo}>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !notification.read && { fontWeight: 'bold' },
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text
                style={[
                  styles.notificationMessage,
                  { color: colors.textSecondary },
                  !notification.read && { color: colors.text },
                ]}
                numberOfLines={2}
              >
                {notification.message}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.textLight }]}>
                {formatDateTime(notification.createdAt)}
              </Text>
            </View>
          </View>
          
          <View style={styles.notificationActions}>
            {!notification.read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
            <TouchableOpacity
              onPress={() => handleDeleteNotification(notification.id)}
              style={styles.deleteButton}
            >
              <Icon name="close" size={16} tintColor={colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notification" size={64} tintColor={colors.textLight} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {filter === 'unread'
          ? 'All caught up! Check back later for new updates.'
          : 'You\'ll see project updates, assignments, and other important information here.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="back" size={24} tintColor="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Icon name="check" size={20} tintColor="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterTabs}>
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && { backgroundColor: colors.primary },
                ]}
                onPress={() => setFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.text },
                    filter === tab.key && { color: '#fff' },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.filterTabBadge,
                      {
                        backgroundColor: filter === tab.key ? '#fff' : colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabBadgeText,
                        {
                          color: filter === tab.key ? colors.primary : '#fff',
                        },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  unreadBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4423a9',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingVertical: spacing.md,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterTabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  notificationCard: {
    marginBottom: spacing.md,
  },
  notificationContent: {
    padding: spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationScreen;
