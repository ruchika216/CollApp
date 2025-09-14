import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { COLLECTIONS, STORAGE_PATHS } from './firebaseConfig';
import {
  User,
  Project,
  Activity,
  Notification,
  ProjectComment,
  SubTask,
  Meeting,
  Report,
  Task,
} from '../types';

// Some RNFirebase typings expose `exists` as a method, others as a boolean property.
function docExists(doc: FirebaseFirestoreTypes.DocumentSnapshot): boolean {
  const e: any = (doc as any).exists;
  return typeof e === 'function' ? !!e.call(doc) : !!e;
}

// Helper function to ensure document data includes the document ID
function mapDocToData<T extends { id: string }>(
  doc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
): T {
  const data = doc.data() as T;
  return {
    ...data,
    id: doc.id, // Always ensure the document ID is included
  };
}

class FirestoreService {
  // User operations
  async createUser(
    userData: Omit<User, 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
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
    return docExists(doc) ? (doc.data() as User) ?? null : null;
  }

  async getPendingUsers(): Promise<User[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.USERS)
      .where('approved', '==', false)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data() as User;
      return {
        ...data,
        uid: data.uid || doc.id, // Users use uid as ID, fallback to doc.id
      };
    });
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

      console.log(
        'getApprovedUsers: Query completed. Snapshot size:',
        snapshot.size,
      );

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
        console.log(
          'getApprovedUsers: Fallback successful. All users:',
          allUsers,
        );
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

    return snapshot.docs.map(doc => {
      const data = doc.data() as User;
      return {
        ...data,
        uid: data.uid || doc.id, // Users use uid as ID, fallback to doc.id
      };
    });
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
  async createProject(
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Project> {
    // Validate current user is admin (defensive – rules enforce too, but gives clearer error client-side)
    const authUid = auth().currentUser?.uid;
    if (!authUid) {
      throw new Error('Not authenticated');
    }
    const userSnap = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(authUid)
      .get();
    let userExists: any = (userSnap as any).exists;
    if (typeof userExists === 'function')
      userExists = userExists.call(userSnap);
    const userData: any = userExists ? userSnap.data() : null; // supports both property & function styles
    if (!userData || userData.role !== 'admin') {
      throw new Error('Only admins can create projects');
    }
    if (projectData.createdBy !== authUid) {
      // Align with security rule requirement
      projectData = { ...projectData, createdBy: authUid } as any;
    }
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

  async updateProject(
    projectId: string,
    updates: Partial<Project>,
  ): Promise<void> {
    const authUid = auth().currentUser?.uid;
    if (!authUid) throw new Error('Not authenticated');

    // Fetch user role for filtering
    const userSnap = await firestore()
      .collection(COLLECTIONS.USERS)
      .doc(authUid)
      .get();
    let userExists: any = (userSnap as any).exists;
    if (typeof userExists === 'function')
      userExists = userExists.call(userSnap);
    const userData: any = userExists ? userSnap.data() : null;
    const role = userData?.role;

    // Defensive: never allow client to change immutable fields via this method
    const forbiddenAlways = new Set(['id', 'createdAt', 'createdBy']);

    let cleaned: Record<string, any> = {};
    // Allow all fields for both admins and developers, except immutable ones
    Object.keys(updates).forEach(k => {
      if (!forbiddenAlways.has(k)) {
        cleaned[k] = (updates as any)[k];
      }
    });

    // If developer tried to modify assignment or createdBy, it will silently ignore.
    const updateData = {
      ...cleaned,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
      updatedBy: authUid,
    } as any;

    console.log(
      '[updateProject] role=',
      role,
      'projectId=',
      projectId,
      'finalFields=',
      Object.keys(updateData),
    );

    try {
      await firestore()
        .collection(COLLECTIONS.PROJECTS)
        .doc(projectId)
        .update(updateData);
      console.log('Project updated successfully');

      if (cleaned.assignedTo && Array.isArray(cleaned.assignedTo)) {
        await this.syncProjectWithUsers(projectId, cleaned.assignedTo);
      }
    } catch (error: any) {
      console.error('Error updating project:', error?.code, error?.message);
      throw error;
    }

    // If status changed, create activity
    if (updates.status) {
      // Use original requested updates to decide activity
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
    try {
      const doc = await firestore()
        .collection(COLLECTIONS.PROJECTS)
        .doc(projectId)
        .get();

      if (docExists(doc)) {
        const data = doc.data() as Project;
        return {
          ...data,
          id: doc.id, // Ensure the document ID is included
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching project from Firestore:', error);
      throw error;
    }
  }

  async getProjects(filters?: { assignedTo?: string }): Promise<Project[]> {
    let query = firestore()
      .collection(COLLECTIONS.PROJECTS)
      .orderBy('updatedAt', 'desc');

    if (filters?.assignedTo) {
      query = query.where('assignedTo', 'array-contains', filters.assignedTo);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => mapDocToData<Project>(doc));
  }

  async deleteProject(projectId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.PROJECTS).doc(projectId).delete();
  }

  async syncProjectWithUsers(
    projectId: string,
    assignedUserIds: string[],
  ): Promise<void> {
    try {
      console.log('Syncing project with users:', projectId, assignedUserIds);

      // Update each user's document to include this project in their projects array
      const updatePromises = assignedUserIds.map(async userId => {
        try {
          await firestore()
            .collection(COLLECTIONS.USERS)
            .doc(userId)
            .update({
              projects: firestore.FieldValue.arrayUnion(projectId),
              updatedAt: firestore.Timestamp.now().toDate().toISOString(),
            });
          console.log(`Updated user ${userId} with project ${projectId}`);
        } catch (error) {
          console.warn(`Failed to update user ${userId}:`, error);
          // Don't throw here, continue with other users
        }
      });

      await Promise.all(updatePromises);
      console.log('Finished syncing project with users');
    } catch (error) {
      console.error('Error syncing project with users:', error);
      // Don't throw here, the main project update should still succeed
    }
  }

  // Comment operations
  async addComment(
    projectId: string,
    comment: Omit<ProjectComment, 'id' | 'createdAt'>,
  ): Promise<ProjectComment> {
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
  async addSubTask(
    projectId: string,
    subTask: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<SubTask> {
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

  async updateSubTask(
    projectId: string,
    subTaskId: string,
    updates: Partial<SubTask>,
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const updatedSubTasks = project.subTasks.map(subTask =>
      subTask.id === subTaskId
        ? {
            ...subTask,
            ...updates,
            updatedAt: firestore.Timestamp.now().toDate().toISOString(),
          }
        : subTask,
    );

    await firestore()
      .collection(COLLECTIONS.PROJECTS)
      .doc(projectId)
      .update({ subTasks: updatedSubTasks });
  }

  // Activity operations
  async createActivity(
    activityData: Omit<Activity, 'id' | 'createdAt' | 'readBy'>,
  ): Promise<Activity> {
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
    return snapshot.docs.map(doc => mapDocToData<Activity>(doc));
  }

  // Notification operations
  async createNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt'>,
  ): Promise<Notification> {
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

    return snapshot.docs.map(doc => mapDocToData<Notification>(doc));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(notificationId)
      .update({ read: true });
  }

  // File upload operations
  async uploadFile(
    filePath: string,
    fileName: string,
    projectId: string,
    type: 'files' | 'images',
  ): Promise<string> {
    const storagePath = STORAGE_PATHS.PROJECT_FILES.replace(
      '{projectId}',
      projectId,
    ).replace('files', type);

    const reference = storage().ref(`${storagePath}/${fileName}`);
    await reference.putFile(filePath);
    return await reference.getDownloadURL();
  }

  // Task operations
  async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Task> {
    const docRef = firestore().collection(COLLECTIONS.TASKS).doc();
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    } as Task;
    await docRef.set(task);
    return task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await firestore()
      .collection(COLLECTIONS.TASKS)
      .doc(taskId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  }

  async getTask(taskId: string): Promise<Task | null> {
    const doc = await firestore()
      .collection(COLLECTIONS.TASKS)
      .doc(taskId)
      .get();
    return docExists(doc) ? { ...(doc.data() as Task), id: doc.id } : null;
  }

  async getTasks(): Promise<Task[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.TASKS)
      .orderBy('updatedAt', 'desc')
      .get();
    return snapshot.docs.map(doc => mapDocToData<Task>(doc));
  }

  async getTasksPaginated(
    limitCount: number,
    startAfterDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Promise<{
    tasks: Task[];
    lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
  }> {
    let query = firestore()
      .collection(COLLECTIONS.TASKS)
      .orderBy('updatedAt', 'desc')
      .limit(limitCount);
    if (startAfterDoc) query = query.startAfter(startAfterDoc);
    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => mapDocToData<Task>(doc));
    const lastDoc = snapshot.docs.length
      ? snapshot.docs[snapshot.docs.length - 1]
      : null;
    return { tasks, lastDoc };
  }

  async deleteTask(taskId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.TASKS).doc(taskId).delete();
  }

  onTasksChange(callback: (tasks: Task[]) => void): () => void {
    return firestore()
      .collection(COLLECTIONS.TASKS)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => mapDocToData<Task>(doc));
        callback(tasks);
      });
  }

  // Meeting operations
  async createMeeting(
    meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Meeting> {
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
        message: `Meeting "${meeting.title}" scheduled for ${new Date(
          meeting.date,
        ).toLocaleDateString()}`,
        type: 'info',
        userId,
        meetingId: meeting.id,
        actionType: 'meeting_scheduled',
        read: false,
      });
    }

    return meeting;
  }

  async updateMeeting(
    meetingId: string,
    updates: Partial<Meeting>,
  ): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore()
      .collection(COLLECTIONS.MEETINGS)
      .doc(meetingId)
      .update(updateData);
  }

  async getMeeting(meetingId: string): Promise<Meeting | null> {
    const doc = await firestore()
      .collection(COLLECTIONS.MEETINGS)
      .doc(meetingId)
      .get();
    return docExists(doc) ? { ...(doc.data() as Meeting), id: doc.id } : null;
  }

  async getMeetings(): Promise<Meeting[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.MEETINGS)
        .orderBy('date', 'asc')
        .get();

      return snapshot.docs.map(doc => mapDocToData<Meeting>(doc));
    } catch (error) {
      console.warn('Error fetching all meetings:', error);
      return [];
    }
  }

  async getMeetingsForUser(userId: string): Promise<Meeting[]> {
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
        allMeetingsQuery.get(),
      ]);

      const userMeetings = userSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );
      const allMeetings = allSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );

      // Combine and deduplicate
      const combinedMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = combinedMeetings.filter(
        (meeting, index, self) =>
          index === self.findIndex(m => m.id === meeting.id),
      );

      return uniqueMeetings.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
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

      // Get meetings assigned to user
      const userMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('assignedTo', 'array-contains', userId);

      // Get meetings assigned to all
      const allMeetingsQuery = firestore()
        .collection(COLLECTIONS.MEETINGS)
        .where('isAssignedToAll', '==', true);

      const [userSnapshot, allSnapshot] = await Promise.all([
        userMeetingsQuery.get(),
        allMeetingsQuery.get(),
      ]);

      const userMeetings = userSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );
      const allMeetings = allSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );

      // Combine and deduplicate
      const combinedMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = combinedMeetings.filter(
        (meeting, index, self) =>
          index === self.findIndex(m => m.id === meeting.id),
      );

      // Filter by date in memory
      const filteredMeetings = uniqueMeetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= startOfDay && meetingDate <= endOfDay;
      });

      // Sort by date
      filteredMeetings.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

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
  async createReport(
    reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Report> {
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
      type: 'comment_added', // Use a valid existing activity type
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

  async updateReport(
    reportId: string,
    updates: Partial<Report>,
  ): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    };

    await firestore()
      .collection(COLLECTIONS.REPORTS)
      .doc(reportId)
      .update(updateData);
  }

  async getReport(reportId: string): Promise<Report | null> {
    const doc = await firestore()
      .collection(COLLECTIONS.REPORTS)
      .doc(reportId)
      .get();
    return docExists(doc) ? { ...(doc.data() as Report), id: doc.id } : null;
  }

  async getReports(): Promise<Report[]> {
    const snapshot = await firestore()
      .collection(COLLECTIONS.REPORTS)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => mapDocToData<Report>(doc));
  }

  async getReportsForUser(userId: string): Promise<Report[]> {
    try {
      // Get reports assigned to user
      const userReportsQuery = firestore()
        .collection(COLLECTIONS.REPORTS)
        .where('assignedTo', 'array-contains', userId)
        .orderBy('createdAt', 'desc');

      // Get reports assigned to all
      const allReportsQuery = firestore()
        .collection(COLLECTIONS.REPORTS)
        .where('isAssignedToAll', '==', true)
        .orderBy('createdAt', 'desc');

      const [userSnapshot, allSnapshot] = await Promise.all([
        userReportsQuery.get(),
        allReportsQuery.get(),
      ]);

      const userReports = userSnapshot.docs.map(doc =>
        mapDocToData<Report>(doc),
      );
      const allReports = allSnapshot.docs.map(doc => mapDocToData<Report>(doc));

      // Combine and deduplicate
      const combinedReports = [...userReports, ...allReports];
      const uniqueReports = combinedReports.filter(
        (report, index, self) =>
          index === self.findIndex(r => r.id === report.id),
      );

      return uniqueReports.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.warn('Error fetching user reports:', error);
      return [];
    }
  }

  async getReportsByDate(userId: string, date: string): Promise<Report[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get reports assigned to user
      const userReportsQuery = firestore()
        .collection(COLLECTIONS.REPORTS)
        .where('assignedTo', 'array-contains', userId);

      // Get reports assigned to all
      const allReportsQuery = firestore()
        .collection(COLLECTIONS.REPORTS)
        .where('isAssignedToAll', '==', true);

      const [userSnapshot, allSnapshot] = await Promise.all([
        userReportsQuery.get(),
        allReportsQuery.get(),
      ]);

      const userReports = userSnapshot.docs.map(doc =>
        mapDocToData<Report>(doc),
      );
      const allReports = allSnapshot.docs.map(doc => mapDocToData<Report>(doc));

      // Combine and deduplicate
      const combinedReports = [...userReports, ...allReports];
      const uniqueReports = combinedReports.filter(
        (report, index, self) =>
          index === self.findIndex(r => r.id === report.id),
      );

      // Filter by date in memory
      const filteredReports = uniqueReports.filter(report => {
        const reportDate = new Date(report.dueDate); // Changed from startDate to dueDate as reports use dueDate
        return reportDate >= startOfDay && reportDate <= endOfDay;
      });

      // Sort by dueDate
      filteredReports.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );

      return filteredReports;
    } catch (error) {
      console.warn('Error fetching reports by date:', error);
      return [];
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    await firestore().collection(COLLECTIONS.REPORTS).doc(reportId).delete();
  }

  // Real-time listeners
  onProjectsChange(
    callback: (projects: Project[]) => void,
    filters?: { assignedTo?: string },
  ): () => void {
    let query = firestore()
      .collection(COLLECTIONS.PROJECTS)
      .orderBy('updatedAt', 'desc');

    if (filters?.assignedTo) {
      query = query.where('assignedTo', 'array-contains', filters.assignedTo);
    }

    return query.onSnapshot(snapshot => {
      const projects = snapshot.docs.map(doc => mapDocToData<Project>(doc));
      callback(projects);
    });
  }

  onActivitiesChange(
    callback: (activities: Activity[]) => void,
    userId?: string,
  ): () => void {
    let query = firestore()
      .collection(COLLECTIONS.ACTIVITIES)
      .orderBy('createdAt', 'desc')
      .limit(50);

    if (userId) {
      query = query.where('relatedUsers', 'array-contains', userId);
    }

    return query.onSnapshot(snapshot => {
      const activities = snapshot.docs.map(doc => mapDocToData<Activity>(doc));
      callback(activities);
    });
  }

  onNotificationsChange(
    callback: (notifications: Notification[]) => void,
    userId: string,
  ): () => void {
    return firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const notifications = snapshot.docs.map(doc =>
          mapDocToData<Notification>(doc),
        );
        callback(notifications);
      });
  }

  // Real-time tasks listeners removed

  // Enhanced Meeting operations
  async getUpcomingMeetingsForUser(
    userId: string,
    limit: number = 10,
  ): Promise<Meeting[]> {
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
        allMeetingsQuery.get(),
      ]);

      const userMeetings = userSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );
      const allMeetings = allSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );

      // Combine and deduplicate
      const allUpcomingMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = allUpcomingMeetings.filter(
        (meeting, index, self) =>
          index === self.findIndex(m => m.id === meeting.id),
      );

      return uniqueMeetings
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )
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
        allMeetingsQuery.get(),
      ]);

      const userMeetings = userSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );
      const allMeetings = allSnapshot.docs.map(doc =>
        mapDocToData<Meeting>(doc),
      );

      // Combine and deduplicate
      const combinedMeetings = [...userMeetings, ...allMeetings];
      const uniqueMeetings = combinedMeetings.filter(
        (meeting, index, self) =>
          index === self.findIndex(m => m.id === meeting.id),
      );

      return uniqueMeetings.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    } catch (error) {
      console.warn('Error fetching meetings for user and all:', error);
      return [];
    }
  }

  // Real-time meetings listeners
  private meetingsUnsubscriber: (() => void) | null = null;

  async subscribeToMeetings(
    userId: string,
    callback: (meetings: Meeting[]) => void,
  ): Promise<() => void> {
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
          const allMeetings = snapshot.docs.map(doc =>
            mapDocToData<Meeting>(doc),
          );

          // Filter meetings for the user (assigned to user OR assigned to all)
          const userMeetings = allMeetings.filter(
            meeting =>
              meeting.isAssignedToAll || meeting.assignedTo.includes(userId),
          );

          callback(userMeetings);
        },
        error => {
          console.warn('Error in meetings subscription:', error);
          callback([]);
        },
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
  async addMeetingComment(
    meetingId: string,
    comment: Omit<NonNullable<Meeting['comments']>[number], 'id' | 'timestamp'>,
  ): Promise<void> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const newComment = {
      ...comment,
      id: firestore().collection('temp').doc().id, // Generate unique ID
      timestamp: firestore.Timestamp.now().toDate().toISOString(),
    };

    const updatedComments = [...(meeting.comments || []), newComment];

    await firestore().collection(COLLECTIONS.MEETINGS).doc(meetingId).update({
      comments: updatedComments,
      lastCommentAt: newComment.timestamp,
      lastCommentBy: comment.userId,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    });
  }

  // Meeting attendance tracking
  async markAttendance(
    meetingId: string,
    userId: string,
    attended: boolean = true,
  ): Promise<void> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    let attendees = meeting.attendees || [];

    if (attended && !attendees.includes(userId)) {
      attendees.push(userId);
    } else if (!attended && attendees.includes(userId)) {
      attendees = attendees.filter(id => id !== userId);
    }

    await firestore().collection(COLLECTIONS.MEETINGS).doc(meetingId).update({
      attendees,
      updatedAt: firestore.Timestamp.now().toDate().toISOString(),
    });
  }

  // Update meeting status (for starting/completing meetings)
  async updateMeetingStatus(
    meetingId: string,
    status: Meeting['status'],
    notes?: string,
  ): Promise<void> {
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
