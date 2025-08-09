import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { COLLECTIONS, STORAGE_PATHS } from './firebaseConfig';
import { User, Project, Activity, Notification, ProjectComment, SubTask, Task, Meeting, Report } from '../types';

class FirestoreService {
  // User operations
  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const timestamp = firestore.Timestamp.now();
    const user: User = {
      ...userData,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await firestore().collection(COLLECTIONS.USERS).doc(user.uid).set(user);
    return user;
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .update({
        ...updates,
        updatedAt: firestore.Timestamp.now().toDate().toISOString(),
      });
  }

  async getUser(uid: string): Promise<User | null> {
    const doc = await firestore().collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async getPendingUsers(): Promise<User[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .where('approved', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as User);
  }

  async getApprovedUsers(): Promise<User[]> {
    try {
      console.log('getApprovedUsers: Starting Firestore query...');
      console.log('getApprovedUsers: Using collection:', COLLECTIONS.USERS);
      
      // Simplified query without orderBy to avoid index requirement
      const snapshot = await firestore()
        .collection(COLLECTIONS.USERS)
        .where('approved', '==', true)
        .get();

      console.log('getApprovedUsers: Query completed. Snapshot size:', snapshot.size);
      
      const users = snapshot.docs.map(doc => {
        const userData = doc.data() as User;
        console.log('getApprovedUsers: User data:', userData);
        return userData;
      });

      // Sort in memory instead of in the query
      users.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime(); // desc order
      });

      console.log('getApprovedUsers: Returning sorted users:', users);
      return users;
    } catch (error) {
      console.error('getApprovedUsers: Error occurred:', error);
      
      // If approved users query fails, try getting all users as fallback
      console.log('getApprovedUsers: Fallback - trying to get all users...');
      try {
        const allUsersSnapshot = await firestore()
          .collection(COLLECTIONS.USERS)
          .get();
        
        const allUsers = allUsersSnapshot.docs.map(doc => doc.data() as User);
        console.log('getApprovedUsers: Fallback successful. All users:', allUsers);
        return allUsers;
      } catch (fallbackError) {
        console.error('getApprovedUsers: Fallback also failed:', fallbackError);
        throw error; // throw original error
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as User);
  }

  async approveUser(uid: string): Promise<void> {
    await this.updateUser(uid, { approved: true });
    
    // Create approval notification
    await this.createNotification({
      title: 'Account Approved',
      message: 'Your account has been approved! You can now access the app.',
      type: 'success',
      userId: uid,
      actionType: 'account_approved',
      read: false,
    });
  }

  // Project operations
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const timestamp = firestore.Timestamp.now();
    const docRef = firestore().collection(COLLECTIONS.PROJECTS).doc();
    
    const project: Project = {
      ...projectData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await docRef.set(project);

    // Create activity for project creation
    await this.createActivity({
      type: 'project_created',
      message: `created project "${project.title}"`,
      userId: project.createdBy,
      userName: 'Admin', // You might want to fetch actual user name
      projectId: project.id,
      projectTitle: project.title,
      relatedUsers: [...project.assignedTo, project.createdBy],
    });

    // Notify assigned users
    for (const userId of project.assignedTo) {
      await this.createNotification({
        title: 'New Project Assigned',
        message: `You have been assigned to project "${project.title}"`,
        type: 'info',
        userId,
        projectId: project.id,
        actionType: 'project_assigned',
        read: false,
      });
    }

    return project;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore().collection(COLLECTIONS.PROJECTS).doc(projectId).update(updateData);

    // If status changed, create activity
    if (updates.status) {
      const project = await this.getProject(projectId);
      if (project) {
        await this.createActivity({
          type: 'status_updated',
          message: `updated project status to "${updates.status}"`,
          userId: updates.createdBy || project.createdBy,
          userName: 'User', // Fetch actual name
          projectId,
          projectTitle: project.title,
          relatedUsers: [...project.assignedTo, project.createdBy],
          metadata: {
            newStatus: updates.status,
          },
        });
      }
    }
  }

  async getProject(projectId: string): Promise<Project | null> {
    const doc = await firestore().collection(COLLECTIONS.PROJECTS).doc(projectId).get();
    return doc.exists ? (doc.data() as Project) : null;
  }

  async getProjects(filters?: { assignedTo?: string }): Promise<Project[]> {
    let query = firestore().collection(COLLECTIONS.PROJECTS).orderBy('updatedAt', 'desc');

    if (filters?.assignedTo) {
      query = query.where('assignedTo', 'array-contains', filters.assignedTo);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Project);
  }

  async deleteProject(projectId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.PROJECTS).doc(projectId).delete();
  }

  // Comment operations
  async addComment(projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt'>): Promise<ProjectComment> {
    const timestamp = firestore.Timestamp.now();
    const commentData: ProjectComment = {
      ...comment,
      id: firestore().collection('dummy').doc().id,
      createdAt: timestamp.toDate().toISOString(),
    };

    await firestore()
      .collection(COLLECTIONS.PROJECTS)
      .doc(projectId)
      .update({
        comments: firestore.FieldValue.arrayUnion(commentData),
      });

    // Create activity
    const project = await this.getProject(projectId);
    if (project) {
      await this.createActivity({
        type: 'comment_added',
        message: `added a comment on "${project.title}"`,
        userId: comment.userId,
        userName: comment.userName,
        projectId,
        projectTitle: project.title,
        relatedUsers: [...project.assignedTo, project.createdBy],
      });
    }

    return commentData;
  }

  // SubTask operations
  async addSubTask(projectId: string, subTask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubTask> {
    const timestamp = firestore.Timestamp.now();
    const subTaskData: SubTask = {
      ...subTask,
      id: firestore().collection('dummy').doc().id,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await firestore()
      .collection(COLLECTIONS.PROJECTS)
      .doc(projectId)
      .update({
        subTasks: firestore.FieldValue.arrayUnion(subTaskData),
      });

    return subTaskData;
  }

  async updateSubTask(projectId: string, subTaskId: string, updates: Partial<SubTask>): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const updatedSubTasks = project.subTasks.map(subTask =>
      subTask.id === subTaskId
        ? { ...subTask, ...updates, updatedAt: firestore.Timestamp.now().toDate().toISOString() }
        : subTask
    );

    await firestore()
      .collection(COLLECTIONS.PROJECTS)
      .doc(projectId)
      .update({ subTasks: updatedSubTasks });
  }

  // Activity operations
  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt' | 'readBy'>): Promise<Activity> {
    const timestamp = firestore.Timestamp.now();
    const docRef = firestore().collection(COLLECTIONS.ACTIVITIES).doc();

    const activity: Activity = {
      ...activityData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
      readBy: [],
    };

    await docRef.set(activity);
    return activity;
  }

  async getActivities(userId?: string): Promise<Activity[]> {
    let query = firestore()
      .collection(COLLECTIONS.ACTIVITIES)
      .orderBy('createdAt', 'desc')
      .limit(50);

    if (userId) {
      query = query.where('relatedUsers', 'array-contains', userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as Activity);
  }

  // Notification operations
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const timestamp = firestore.Timestamp.now();
    const docRef = firestore().collection(COLLECTIONS.NOTIFICATIONS).doc();

    const notification: Notification = {
      ...notificationData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
    };

    await docRef.set(notification);
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Notification);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(notificationId)
      .update({ read: true });
  }

  // File upload operations
  async uploadFile(filePath: string, fileName: string, projectId: string, type: 'files' | 'images'): Promise<string> {
    const storagePath = STORAGE_PATHS.PROJECT_FILES
      .replace('{projectId}', projectId)
      .replace('files', type);
    
    const reference = storage().ref(`${storagePath}/${fileName}`);
    await reference.putFile(filePath);
    return await reference.getDownloadURL();
  }

  // Task operations
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const docRef = firestore().collection(COLLECTIONS.TASKS).doc();
    const timestamp = firestore.Timestamp.now();
    const task: Task = {
      ...taskData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await docRef.set(task);

    // Get creator's name for better notifications
    const creator = await this.getUser(task.createdBy);
    const creatorName = creator?.name || creator?.displayName || creator?.email?.split('@')[0] || 'Admin';

    // Create activity
    await this.createActivity({
      type: 'task_assigned',
      message: `assigned task "${task.title}"`,
      userId: task.createdBy,
      userName: creatorName,
      relatedUsers: [...task.assignedTo, task.createdBy],
      metadata: { taskId: task.id },
    });

    // Notify assigned users with better messaging
    for (const userId of task.assignedTo) {
      const assignedUser = await this.getUser(userId);
      const assignedUserName = assignedUser?.name || assignedUser?.displayName || assignedUser?.email?.split('@')[0] || 'User';
      
      await this.createNotification({
        title: 'New Task Assigned! 🎯',
        message: `Hi ${assignedUserName}, you have been assigned task "${task.title}" by ${creatorName}. Priority: ${task.priority}`,
        type: 'info',
        userId,
        taskId: task.id,
        actionType: 'task_assigned',
        read: false,
      });
    }

    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore().collection(COLLECTIONS.TASKS).doc(taskId).update(updateData);

    // If task is being updated, create activity and notify assigned users
    const task = await this.getTask(taskId);
    if (task) {
      // Get updater's information
      const updaterId = updates.updatedBy || updates.createdBy || task.createdBy;
      const updater = await this.getUser(updaterId);
      const updaterName = updater?.name || updater?.displayName || updater?.email?.split('@')[0] || 'User';

      // Create activity for task update
      await this.createActivity({
        type: 'task_assigned', // Using existing type, could add 'task_updated'
        message: `updated task "${task.title}"`,
        userId: updaterId,
        userName: updaterName,
        relatedUsers: [...task.assignedTo, task.createdBy],
        metadata: { taskId: task.id, updateType: 'task_updated' },
      });

      // Notify all assigned users and admin about the update (except the person who made the update)
      const usersToNotify = [...new Set([...task.assignedTo, task.createdBy])]; // Unique users
      
      for (const userId of usersToNotify) {
        if (userId !== updaterId) { // Don't notify the person who made the update
          const notifyUser = await this.getUser(userId);
          const notifyUserName = notifyUser?.name || notifyUser?.displayName || notifyUser?.email?.split('@')[0] || 'User';
          
          let message = `Hi ${notifyUserName}, task "${task.title}" has been updated by ${updaterName}`;
          let notificationTitle = 'Task Updated! 📝';
          let notificationType: 'info' | 'success' | 'warning' = 'info';
          
          // Special handling for task completion
          if (updates.status === 'Done') {
            notificationTitle = 'Task Completed! 🎉';
            message = `Great news ${notifyUserName}! Task "${task.title}" has been marked as DONE by ${updaterName}`;
            notificationType = 'success';
          } else if (updates.status === 'In Progress') {
            notificationTitle = 'Task In Progress! ⚡';
            message = `${notifyUserName}, task "${task.title}" is now IN PROGRESS by ${updaterName}`;
            notificationType = 'info';
          } else if (updates.status) {
            message += `. Status changed to: ${updates.status}`;
          }
          
          // Add comment info if it exists
          if (updates.comments && Array.isArray(updates.comments) && updates.comments.length > 0) {
            const latestComment = updates.comments[updates.comments.length - 1];
            message += `. New comment: "${latestComment.text}"`;
          }

          await this.createNotification({
            title: notificationTitle,
            message,
            type: notificationType,
            userId,
            taskId: task.id,
            actionType: updates.status === 'Done' ? 'task_completed' : 'task_updated',
            read: false,
          });
        }
      }

      // If admin updated the task and it has assigned users, notify them too
      if (updater?.role === 'admin' && task.assignedTo.length > 0) {
        for (const userId of task.assignedTo) {
          if (userId !== updaterId) {
            await this.createNotification({
              title: 'Admin Task Update! ⚡',
              message: `Task "${task.title}" has been updated by admin ${updaterName}. Please check the latest details.`,
              type: 'warning',
              userId,
              taskId: task.id,
              actionType: 'admin_task_update',
              read: false,
            });
          }
        }
      }
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
    const doc = await firestore().collection(COLLECTIONS.TASKS).doc(taskId).get();
    return doc.exists ? (doc.data() as Task) : null;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.TASKS)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.warn('Error fetching all tasks:', error);
      return [];
    }
  }

  async getTasksForUser(userId: string): Promise<Task[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.TASKS)
        .where('assignedTo', 'array-contains', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.warn('Error fetching user tasks:', error);
      return [];
    }
  }

  async getTasksByDate(userId: string, date: string): Promise<Task[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all user tasks first, then filter by date in memory
      // This avoids compound index requirement
      const snapshot = await firestore()
        .collection(COLLECTIONS.TASKS)
        .where('assignedTo', 'array-contains', userId)
        .get();

      const tasks = snapshot.docs.map(doc => doc.data() as Task);
      
      // Filter by date in memory
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.startDate);
        return taskDate >= startOfDay && taskDate <= endOfDay;
      });

      // Sort by startDate
      filteredTasks.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      return filteredTasks;
    } catch (error) {
      console.warn('Error fetching tasks by date:', error);
      return []; // Return empty array on error
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.TASKS).doc(taskId).delete();
  }

  // Meeting operations
  async createMeeting(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const docRef = firestore().collection(COLLECTIONS.MEETINGS).doc();
    const timestamp = firestore.Timestamp.now();
    const meeting: Meeting = {
      ...meetingData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await docRef.set(meeting);

    // Notify assigned users
    for (const userId of meeting.assignedTo) {
      await this.createNotification({
        title: 'Meeting Scheduled',
        message: `Meeting "${meeting.title}" scheduled for ${new Date(meeting.date).toLocaleDateString()}`,
        type: 'info',
        userId,
        meetingId: meeting.id,
        actionType: 'meeting_scheduled',
        read: false,
      });
    }

    return meeting;
  }

  async updateMeeting(meetingId: string, updates: Partial<Meeting>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore().collection(COLLECTIONS.MEETINGS).doc(meetingId).update(updateData);
  }

  async getMeeting(meetingId: string): Promise<Meeting | null> {
    const doc = await firestore().collection(COLLECTIONS.MEETINGS).doc(meetingId).get();
    return doc.exists ? (doc.data() as Meeting) : null;
  }

  async getMeetings(): Promise<Meeting[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.MEETINGS)
        .orderBy('date', 'asc')
        .get();

      return snapshot.docs.map(doc => doc.data() as Meeting);
    } catch (error) {
      console.warn('Error fetching all meetings:', error);
      return [];
    }
  }

  async getMeetingsForUser(userId: string): Promise<Meeting[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('assignedTo', 'array-contains', userId)
        .orderBy('date', 'asc')
        .get();

      return snapshot.docs.map(doc => doc.data() as Meeting);
    } catch (error) {
      console.warn('Error fetching user meetings:', error);
      return [];
    }
  }

  async getMeetingsByDate(userId: string, date: string): Promise<Meeting[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all user meetings first, then filter by date in memory
      // This avoids compound index requirement
      const snapshot = await firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('assignedTo', 'array-contains', userId)
        .get();

      const meetings = snapshot.docs.map(doc => doc.data() as Meeting);
      
      // Filter by date in memory
      const filteredMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= startOfDay && meetingDate <= endOfDay;
      });

      // Sort by date
      filteredMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return filteredMeetings;
    } catch (error) {
      console.warn('Error fetching meetings by date:', error);
      return []; // Return empty array on error
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.MEETINGS).doc(meetingId).delete();
  }

  // Report operations
  async createReport(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    const docRef = firestore().collection(COLLECTIONS.REPORTS).doc();
    const timestamp = firestore.Timestamp.now();
    const report: Report = {
      ...reportData,
      id: docRef.id,
      createdAt: timestamp.toDate().toISOString(),
      updatedAt: timestamp.toDate().toISOString(),
    };

    await docRef.set(report);

    // Create activity
    await this.createActivity({
      type: 'task_assigned', // Using existing type, could add 'report_assigned'
      message: `assigned report "${report.title}"`,
      userId: report.createdBy,
      userName: 'Admin', // Should fetch actual name
      relatedUsers: [...report.assignedTo, report.createdBy],
      metadata: { reportId: report.id },
    });

    // Notify assigned users
    for (const userId of report.assignedTo) {
      await this.createNotification({
        title: 'New Report Assigned',
        message: `You have been assigned report "${report.title}"`,
        type: 'info',
        userId,
        reportId: report.id,
        actionType: 'report_assigned',
        read: false,
      });
    }

    return report;
  }

  async updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore().collection(COLLECTIONS.REPORTS).doc(reportId).update(updateData);
  }

  async getReport(reportId: string): Promise<Report | null> {
    const doc = await firestore().collection(COLLECTIONS.REPORTS).doc(reportId).get();
    return doc.exists ? (doc.data() as Report) : null;
  }

  async getReports(): Promise<Report[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.REPORTS)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Report);
  }

  async getReportsForUser(userId: string): Promise<Report[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.REPORTS)
      .where('assignedTo', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Report);
  }

  async getReportsByDate(userId: string, date: string): Promise<Report[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all user reports first, then filter by date in memory
    // This avoids compound index requirement
    const snapshot = await firestore()
      .collection(COLLECTIONS.REPORTS)
      .where('assignedTo', 'array-contains', userId)
      .get();

    const reports = snapshot.docs.map(doc => doc.data() as Report);
    
    // Filter by date in memory
    const filteredReports = reports.filter(report => {
      const reportDate = new Date(report.startDate);
      return reportDate >= startOfDay && reportDate <= endOfDay;
    });

    // Sort by startDate
    filteredReports.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return filteredReports;
  }

  async deleteReport(reportId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.REPORTS).doc(reportId).delete();
  }

  // Real-time listeners
  onProjectsChange(callback: (projects: Project[]) => void, filters?: { assignedTo?: string }): () => void {
    let query = firestore().collection(COLLECTIONS.PROJECTS).orderBy('updatedAt', 'desc');

    if (filters?.assignedTo) {
      query = query.where('assignedTo', 'array-contains', filters.assignedTo);
    }

    return query.onSnapshot(snapshot => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      callback(projects);
    });
  }

  onActivitiesChange(callback: (activities: Activity[]) => void, userId?: string): () => void {
    let query = firestore()
      .collection(COLLECTIONS.ACTIVITIES)
      .orderBy('createdAt', 'desc')
      .limit(50);

    if (userId) {
      query = query.where('relatedUsers', 'array-contains', userId);
    }

    return query.onSnapshot(snapshot => {
      const activities = snapshot.docs.map(doc => doc.data() as Activity);
      callback(activities);
    });
  }

  onNotificationsChange(callback: (notifications: Notification[]) => void, userId: string): () => void {
    return firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const notifications = snapshot.docs.map(doc => doc.data() as Notification);
        callback(notifications);
      });
  }

  // Real-time tasks listeners
  onTasksChange(callback: (tasks: Task[]) => void): () => void {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => doc.data() as Task);
        callback(tasks);
      });
  }

  onUserTasksChange(callback: (tasks: Task[]) => void, userId: string): () => void {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .where('assignedTo', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => doc.data() as Task);
        callback(tasks);
      });
  }

  // Enhanced Meeting operations
  async getUpcomingMeetingsForUser(userId: string, limit: number = 10): Promise<Meeting[]> {
    try {
      const now = firestore.Timestamp.now();
      
      // Get meetings assigned to user
      const userMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('assignedTo', 'array-contains', userId)
        .where('startTime', '>', now)
        .where('status', '==', 'Scheduled')
        .orderBy('startTime', 'asc')
        .limit(limit);

      // Get meetings assigned to all
      const allMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('isAssignedToAll', '==', true)
        .where('startTime', '>', now)
        .where('status', '==', 'Scheduled')
        .orderBy('startTime', 'asc')
        .limit(limit);

      const [userSnapshot, allSnapshot] = await Promise.all([
        userMeetingsQuery.get(),
        allMeetingsQuery.get()
      ]);

      const userMeetings = userSnapshot.docs.map(doc => doc.data() as Meeting);
      const allMeetings = allSnapshot.docs.map(doc => doc.data() as Meeting);

      // Combine and deduplicate
      const allUpcomingMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = allUpcomingMeetings.filter((meeting, index, self) => 
        index === self.findIndex(m => m.id === meeting.id)
      );

      return uniqueMeetings
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit);
    } catch (error) {
      console.warn('Error fetching upcoming meetings for user:', error);
      return [];
    }
  }

  async getMeetingsForUserAndAll(userId: string): Promise<Meeting[]> {
    try {
      // Get meetings assigned to user
      const userMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('assignedTo', 'array-contains', userId)
        .orderBy('startTime', 'asc');

      // Get meetings assigned to all
      const allMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('isAssignedToAll', '==', true)
        .orderBy('startTime', 'asc');

      const [userSnapshot, allSnapshot] = await Promise.all([
        userMeetingsQuery.get(),
        allMeetingsQuery.get()
      ]);

      const userMeetings = userSnapshot.docs.map(doc => doc.data() as Meeting);
      const allMeetings = allSnapshot.docs.map(doc => doc.data() as Meeting);

      // Combine and deduplicate
      const combinedMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = combinedMeetings.filter((meeting, index, self) => 
        index === self.findIndex(m => m.id === meeting.id)
      );

      return uniqueMeetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    } catch (error) {
      console.warn('Error fetching meetings for user and all:', error);
      return [];
    }
  }

  // Real-time meetings listeners
  private meetingsUnsubscriber: (() => void) | null = null;

  async subscribeToMeetings(userId: string, callback: (meetings: Meeting[]) => void): Promise<() => void> {
    // Unsubscribe from previous listener if exists
    if (this.meetingsUnsubscriber) {
      this.meetingsUnsubscriber();
    }

    // Subscribe to all meetings - we'll filter on the client side
    this.meetingsUnsubscriber = firestore()
      .collection(COLLECTIONS.MEETINGS)
      .orderBy('startTime', 'asc')
      .onSnapshot(
        snapshot => {
          const allMeetings = snapshot.docs.map(doc => doc.data() as Meeting);
          
          // Filter meetings for the user (assigned to user OR assigned to all)
          const userMeetings = allMeetings.filter(meeting => 
            meeting.isAssignedToAll || meeting.assignedTo.includes(userId)
          );
          
          callback(userMeetings);
        },
        error => {
          console.warn('Error in meetings subscription:', error);
          callback([]);
        }
      );

    return this.meetingsUnsubscriber;
  }

  async unsubscribeFromMeetings(): Promise<void> {
    if (this.meetingsUnsubscriber) {
      this.meetingsUnsubscriber();
      this.meetingsUnsubscriber = null;
    }
  }

  // Meeting comments operations
  async addMeetingComment(meetingId: string, comment: Omit<Meeting['comments'][0], 'id' | 'timestamp'>): Promise<void> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const newComment = {
      ...comment,
      id: firestore().collection('temp').doc().id, // Generate unique ID
      timestamp: firestore.Timestamp.now().toDate().toISOString(),
    };

    const updatedComments = [...(meeting.comments || []), newComment];

    await firestore()
      .collection(COLLECTIONS.MEETINGS)
      .doc(meetingId)
      .update({
        comments: updatedComments,
        lastCommentAt: newComment.timestamp,
        lastCommentBy: comment.userId,
        updatedAt: firestore.Timestamp.now().toDate().toISOString(),
      });
  }

  // Meeting attendance tracking
  async markAttendance(meetingId: string, userId: string, attended: boolean = true): Promise<void> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    let attendees = meeting.attendees || [];
    
    if (attended && !attendees.includes(userId)) {
      attendees.push(userId);
    } else if (!attended && attendees.includes(userId)) {
      attendees = attendees.filter(id => id !== userId);
    }

    await firestore()
      .collection(COLLECTIONS.MEETINGS)
      .doc(meetingId)
      .update({
        attendees,
        updatedAt: firestore.Timestamp.now().toDate().toISOString(),
      });
  }

  // Update meeting status (for starting/completing meetings)
  async updateMeetingStatus(meetingId: string, status: Meeting['status'], notes?: string): Promise<void> {
    const updates: any = {
      status,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    if (notes) {
      updates.meetingNotes = notes;
    }

    if (status === 'Completed') {
      updates.endTime = firestore.Timestamp.now().toDate().toISOString();
    }

    await firestore()
      .collection(COLLECTIONS.MEETINGS)
      .doc(meetingId)
      .update(updates);
  }
}

export default new FirestoreService();