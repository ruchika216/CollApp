import { Meeting, Notification } from '../../types';
import { 
  getMeetingCountdown, 
  shouldShowNotification,
  getNotificationTitle,
  getNotificationMessage 
} from '../../utils/meetingUtils';
import firestoreService from '../../firebase/firestoreService';

export interface MeetingNotificationService {
  checkMeetingNotifications: (userId: string, meetings: Meeting[]) => Promise<void>;
  createMeetingNotification: (meeting: Meeting, userId: string, type: 'reminder' | 'starting' | 'live') => Promise<void>;
  scheduleAllMeetingNotifications: (userId: string) => Promise<void>;
  clearMeetingNotifications: (meetingId: string, userId: string) => Promise<void>;
}

class MeetingNotificationServiceImpl implements MeetingNotificationService {
  private notificationHistory: Map<string, Set<string>> = new Map(); // meetingId -> set of notification types sent

  async checkMeetingNotifications(userId: string, meetings: Meeting[]): Promise<void> {
    try {
      for (const meeting of meetings) {
        // Skip if user is not assigned to this meeting
        if (!meeting.isAssignedToAll && !meeting.assignedTo.includes(userId)) {
          continue;
        }

        await this.processMeetingNotifications(meeting, userId);
      }
    } catch (error) {
      console.error('Error checking meeting notifications:', error);
    }
  }

  private async processMeetingNotifications(meeting: Meeting, userId: string): Promise<void> {
    const countdown = getMeetingCountdown(meeting);
    const meetingKey = `${meeting.id}-${userId}`;
    const sentNotifications = this.notificationHistory.get(meetingKey) || new Set();

    // Check for different notification triggers
    const { total } = countdown.timeLeft;
    const fifteenMin = 15 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;
    const tolerance = 2 * 60 * 1000; // 2 minute tolerance

    // 1 day reminder
    if (
      total <= oneDay + tolerance && 
      total >= oneDay - tolerance && 
      !sentNotifications.has('1day')
    ) {
      await this.createMeetingNotification(meeting, userId, 'reminder');
      sentNotifications.add('1day');
    }
    
    // 1 hour reminder
    else if (
      total <= oneHour + tolerance && 
      total >= oneHour - tolerance && 
      !sentNotifications.has('1hour')
    ) {
      await this.createMeetingNotification(meeting, userId, 'reminder');
      sentNotifications.add('1hour');
    }
    
    // 15 minute reminder
    else if (
      total <= fifteenMin + tolerance && 
      total >= fifteenMin - tolerance && 
      !sentNotifications.has('15min')
    ) {
      await this.createMeetingNotification(meeting, userId, 'starting');
      sentNotifications.add('15min');
    }
    
    // Meeting is live
    else if (countdown.status === 'live' && !sentNotifications.has('live')) {
      await this.createMeetingNotification(meeting, userId, 'live');
      sentNotifications.add('live');
    }

    // Update the history
    this.notificationHistory.set(meetingKey, sentNotifications);
  }

  async createMeetingNotification(
    meeting: Meeting, 
    userId: string, 
    type: 'reminder' | 'starting' | 'live'
  ): Promise<void> {
    try {
      let title = getNotificationTitle(meeting);
      let message = getNotificationMessage(meeting);
      let notificationType: Notification['type'] = 'info';

      // Customize based on notification type
      switch (type) {
        case 'reminder':
          notificationType = 'info';
          break;
        case 'starting':
          notificationType = 'warning';
          title = 'Meeting Starting Soon!';
          break;
        case 'live':
          notificationType = 'success';
          title = 'Meeting is Live';
          break;
      }

      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        title,
        message,
        type: notificationType,
        userId,
        read: false,
        meetingId: meeting.id,
        actionType: 'meeting_scheduled',
        metadata: {
          meetingTitle: meeting.title,
          meetingStartTime: meeting.startTime,
          meetingType: type,
          priority: meeting.priority,
        },
      };

      await firestoreService.createNotification(notification);
      console.log(`Meeting notification sent to ${userId}: ${title}`);
    } catch (error) {
      console.error('Error creating meeting notification:', error);
    }
  }

  async scheduleAllMeetingNotifications(userId: string): Promise<void> {
    try {
      // Get user's meetings for the next 7 days
      const meetings = await firestoreService.getMeetingsForUserAndAll(userId);
      const upcomingMeetings = meetings.filter(meeting => {
        const startTime = new Date(meeting.startTime);
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        
        return startTime > now && startTime <= sevenDaysFromNow && meeting.status === 'Scheduled';
      });

      await this.checkMeetingNotifications(userId, upcomingMeetings);
    } catch (error) {
      console.error('Error scheduling meeting notifications:', error);
    }
  }

  async clearMeetingNotifications(meetingId: string, userId: string): Promise<void> {
    try {
      const meetingKey = `${meetingId}-${userId}`;
      this.notificationHistory.delete(meetingKey);
      
      // Mark meeting-related notifications as read
      const notifications = await firestoreService.getUserNotifications(userId);
      const meetingNotifications = notifications.filter((n: any) => n.meetingId === meetingId);
      
      for (const notification of meetingNotifications) {
        if (!notification.read) {
          await firestoreService.markNotificationAsRead(notification.id);
        }
      }
    } catch (error) {
      console.error('Error clearing meeting notifications:', error);
    }
  }

  // Helper method to clear all notification history (useful for testing)
  clearAllHistory(): void {
    this.notificationHistory.clear();
  }

  // Helper method to get notification history (useful for debugging)
  getNotificationHistory(): Map<string, Set<string>> {
    return new Map(this.notificationHistory);
  }
}

// Create singleton instance
const meetingNotificationService = new MeetingNotificationServiceImpl();

// Export service and hooks for React components
export default meetingNotificationService;

// Hook for using meeting notifications in React components
export const useMeetingNotifications = () => {
  const checkNotifications = async (userId: string, meetings: Meeting[]) => {
    return meetingNotificationService.checkMeetingNotifications(userId, meetings);
  };

  const createNotification = async (meeting: Meeting, userId: string, type: 'reminder' | 'starting' | 'live') => {
    return meetingNotificationService.createMeetingNotification(meeting, userId, type);
  };

  const scheduleAll = async (userId: string) => {
    return meetingNotificationService.scheduleAllMeetingNotifications(userId);
  };

  const clearNotifications = async (meetingId: string, userId: string) => {
    return meetingNotificationService.clearMeetingNotifications(meetingId, userId);
  };

  return {
    checkNotifications,
    createNotification,
    scheduleAll,
    clearNotifications,
  };
};

// Utility function to start background notification checking
export const startMeetingNotificationService = (userId: string, intervalMs: number = 5 * 60 * 1000) => {
  const checkAndNotify = async () => {
    try {
      await meetingNotificationService.scheduleAllMeetingNotifications(userId);
    } catch (error) {
      console.error('Error in meeting notification service:', error);
    }
  };

  // Initial check
  checkAndNotify();

  // Set up interval for periodic checks
  const interval = setInterval(checkAndNotify, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};