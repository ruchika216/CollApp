import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setNotifications, markAsRead, clearNotifications } from '../store/slices/notificationSlice';
import firestoreService from '../firebase/firestoreService';
import { Notification } from '../types';
import Icon from '../components/common/Icon';
import Card from '../components/ui/Card';
import ScreenLayout from '../components/layout/ScreenLayout';

interface NotificationScreenProps {
  navigation: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const notifications = useAppSelector(state => state.notifications.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const userNotifications = await firestoreService.getUserNotifications(user.uid);
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
    if (!user?.uid) return;
    
    try {
      await firestoreService.markNotificationAsRead(notificationId);
      dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await firestoreService.markNotificationAsRead(notification.id);
        dispatch(markAsRead(notification.id));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
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
              // Remove from local state (we don't have a delete function in firestoreService)
              dispatch(setNotifications(notifications.filter(n => n.id !== notificationId)));
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project_assigned':
        return 'project';
      case 'status_update':
        return 'status';
      case 'comment_added':
        return 'comment';
      case 'file_shared':
        return 'file';
      default:
        switch (type) {
          case 'project_completed':
            return 'check';
          case 'priority_changed':
            return 'priority';
          case 'deadline_reminder':
            return 'close';
          default:
            return 'notification';
        }
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'project_assigned':
      case 'project_completed':
        return colors.success;
      case 'priority_changed':
        return colors.warning;
      case 'deadline_reminder':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const getTimeAgo = (timestamp: any) => {
    const now = new Date();
    const notificationTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    const hours = Math.floor(diffInMinutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (hours < 48) {
      return 'Yesterday';
    }
    return notificationTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: notificationTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: colors.surface },
        !item.read && { backgroundColor: colors.primary + '08' },
      ]}
      onPress={() => {
        if (!item.read) {
          handleMarkAsRead(item.id);
        }
        
        // Navigate based on notification type
        if (item.projectId) {
          navigation.navigate('ProjectDetailScreenNew', { projectId: item.projectId });
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationLeft}>
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: getNotificationColor(item.type) + '20' },
            ]}
          >
            <Icon
              name={getNotificationIcon(item.type)}
              size={20}
              tintColor={getNotificationColor(item.type)}
            />
          </View>
          
          <View style={styles.notificationText}>
            <Text
              style={[
                styles.notificationTitle,
                { color: colors.text },
                !item.read && { fontWeight: 'bold' },
              ]}
            >
              {item.title}
            </Text>
            <Text style={[styles.notificationBody, { color: colors.textSecondary }]}>
              {item.body}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
              {getTimeAgo(item.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.notificationActions}>
          {!item.read && (
            <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
          )}
          
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.deleteButton}
          >
            <Icon name="close" size={16} tintColor={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notification" size={64} tintColor={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No notifications yet
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {filter === 'unread' 
          ? 'All caught up! No unread notifications.'
          : filter === 'read' 
          ? 'No read notifications to show.'
          : 'You\'ll see project updates, assignments, and other important information here.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark All</Text>
        </TouchableOpacity>
      </View>

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
                  { backgroundColor: colors.surface },
                  filter === tab.key && { backgroundColor: colors.primary },
                ]}
                onPress={() => setFilter(tab.key as any)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: filter === tab.key ? colors.textOnPrimary : colors.text },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.filterTabBadge,
                      {
                        backgroundColor: filter === tab.key ? colors.textOnPrimary : colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabBadgeText,
                        {
                          color: filter === tab.key ? colors.primary : colors.textOnPrimary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 4,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterTabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationScreen;