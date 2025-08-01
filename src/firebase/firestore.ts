import { firestore } from './firebaseConfig';
import FirestoreModule from '@react-native-firebase/firestore';
import { Project, User, Notification, ProjectComment, ProjectFile } from '../types';

// User operations
export const addUserToFirestore = async (user: Omit<User, 'createdAt' | 'updatedAt'>) => {
  const userRef = firestore.collection('users').doc(user.uid);
  const timestamp = new Date().toISOString();
  const userData = {
    ...user,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await userRef.set(userData, { merge: true });
  return userData;
};

export const getUsers = async (): Promise<User[]> => {
  const querySnapshot = await firestore.collection('users').get();
  return querySnapshot.docs.map(doc => doc.data() as User);
};

export const getDevelopers = async (): Promise<User[]> => {
  const querySnapshot = await firestore
    .collection('users')
    .where('role', '==', 'developer')
    .where('approved', '==', true)
    .get();
  return querySnapshot.docs.map(doc => doc.data() as User);
};

export const getPendingUsers = async (): Promise<User[]> => {
  const querySnapshot = await firestore
    .collection('users')
    .where('approved', '==', false)
    .get();
  return querySnapshot.docs.map(doc => doc.data() as User);
};

export const approveUser = async (uid: string) => {
  await firestore.collection('users').doc(uid).update({
    approved: true,
    updatedAt: new Date().toISOString(),
  });
};

export const getUserById = async (uid: string): Promise<User | null> => {
  const userSnap = await firestore.collection('users').doc(uid).get();
  if (userSnap.exists) {
    return userSnap.data() as User;
  }
  return null;
};

export const getUserRole = async (uid: string): Promise<User['role'] | null> => {
  const userSnap = await firestore.collection('users').doc(uid).get();
  if (userSnap.exists) {
    return (userSnap.data() as User).role || null;
  }
  return null;
};

export const checkUserExists = async (uid: string): Promise<boolean> => {
  const userSnap = await firestore.collection('users').doc(uid).get();
  return userSnap.exists;
};

export const updateUserRole = async (uid: string, role: User['role']) => {
  await firestore.collection('users').doc(uid).update({
    role,
    updatedAt: new Date().toISOString(),
  });
};

// Project operations
export const addProjectToFirestore = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = new Date().toISOString();
  const projectData = {
    ...project,
    createdAt: timestamp,
    updatedAt: timestamp,
    comments: [],
    files: [],
    images: [],
    progress: 0,
    actualHours: 0,
  };
  
  const docRef = await firestore.collection('projects').add(projectData);
  
  // Update user's projects array
  await firestore.collection('users').doc(project.assignedTo).update({
    projects: FirestoreModule.FieldValue.arrayUnion(docRef.id),
    updatedAt: timestamp,
  });
  
  // Create notification for assigned user
  await addNotificationToFirestore({
    title: 'New Project Assigned',
    message: `You have been assigned to project: ${project.title}`,
    type: 'info',
    userId: project.assignedTo,
    read: false,
    projectId: docRef.id,
    actionType: 'project_assigned',
  });
  
  return docRef.id;
};

export const getProjects = async (): Promise<Project[]> => {
  const querySnapshot = await firestore.collection('projects').orderBy('createdAt', 'desc').get();
  const projects = await Promise.all(
    querySnapshot.docs.map(async doc => {
      const data = doc.data();
      const assignedUser = await getUserById(data.assignedTo);
      return {
        id: doc.id,
        ...data,
        assignedUser,
      } as Project;
    })
  );
  return projects;
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
  const querySnapshot = await firestore
    .collection('projects')
    .where('assignedTo', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Project));
};

export const updateProjectInFirestore = async (project: Project) => {
  const projectRef = firestore.collection('projects').doc(project.id);
  const updateData = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  await projectRef.update(updateData);
};

export const updateProjectStatus = async (projectId: string, status: Project['status']) => {
  const timestamp = new Date().toISOString();
  await firestore.collection('projects').doc(projectId).update({
    status,
    updatedAt: timestamp,
  });
  
  // Get project details for notification
  const projectDoc = await firestore.collection('projects').doc(projectId).get();
  const project = projectDoc.data() as Project;
  
  // Notify admin about status change
  const adminUsers = await firestore.collection('users').where('role', '==', 'admin').get();
  const notificationPromises = adminUsers.docs.map(adminDoc => 
    addNotificationToFirestore({
      title: 'Project Status Updated',
      message: `${project.title} status changed to ${status}`,
      type: 'info',
      userId: adminDoc.id,
      read: false,
      projectId,
      actionType: 'status_changed',
    })
  );
  
  await Promise.all(notificationPromises);
};

export const addCommentToProject = async (projectId: string, comment: Omit<ProjectComment, 'id' | 'createdAt'>) => {
  const commentId = firestore.collection('projects').doc().id;
  const commentData = {
    ...comment,
    id: commentId,
    createdAt: new Date().toISOString(),
  };
  
  await firestore.collection('projects').doc(projectId).update({
    comments: FirestoreModule.FieldValue.arrayUnion(commentData),
    updatedAt: new Date().toISOString(),
  });
  
  // Get project details for notification
  const projectDoc = await firestore.collection('projects').doc(projectId).get();
  const project = projectDoc.data() as Project;
  
  // Notify assigned user and admin
  const notificationPromises = [];
  
  if (comment.userId !== project.assignedTo) {
    notificationPromises.push(
      addNotificationToFirestore({
        title: 'New Comment',
        message: `New comment on ${project.title}`,
        type: 'info',
        userId: project.assignedTo,
        read: false,
        projectId,
        actionType: 'comment_added',
      })
    );
  }
  
  if (comment.userId !== project.createdBy) {
    notificationPromises.push(
      addNotificationToFirestore({
        title: 'New Comment',
        message: `New comment on ${project.title}`,
        type: 'info',
        userId: project.createdBy,
        read: false,
        projectId,
        actionType: 'comment_added',
      })
    );
  }
  
  await Promise.all(notificationPromises);
  return commentData;
};

export const addFileToProject = async (projectId: string, file: Omit<ProjectFile, 'id' | 'uploadedAt'>, type: 'files' | 'images') => {
  const fileId = firestore.collection('projects').doc().id;
  const fileData = {
    ...file,
    id: fileId,
    uploadedAt: new Date().toISOString(),
  };
  
  await firestore.collection('projects').doc(projectId).update({
    [type]: FirestoreModule.FieldValue.arrayUnion(fileData),
    updatedAt: new Date().toISOString(),
  });
  
  return fileData;
};

export const deleteProjectFromFirestore = async (projectId: string) => {
  const projectRef = firestore.collection('projects').doc(projectId);
  const projectDoc = await projectRef.get();
  const project = projectDoc.data() as Project;
  
  // Remove project from user's projects array
  await firestore.collection('users').doc(project.assignedTo).update({
    projects: FirestoreModule.FieldValue.arrayRemove(projectId),
    updatedAt: new Date().toISOString(),
  });
  
  // Delete project
  await projectRef.delete();
  
  // Delete related notifications
  const notificationsSnapshot = await firestore
    .collection('notifications')
    .where('projectId', '==', projectId)
    .get();
  
  const deletePromises = notificationsSnapshot.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
};

// Notification operations
export const addNotificationToFirestore = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  const notificationData = {
    ...notification,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await firestore.collection('notifications').add(notificationData);
  return docRef.id;
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  const querySnapshot = await firestore
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Notification));
};

export const markNotificationAsRead = async (notificationId: string) => {
  await firestore.collection('notifications').doc(notificationId).update({
    read: true,
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const querySnapshot = await firestore
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();
  
  const updatePromises = querySnapshot.docs.map(doc => 
    doc.ref.update({ read: true })
  );
  
  await Promise.all(updatePromises);
};

export const deleteNotification = async (notificationId: string) => {
  await firestore.collection('notifications').doc(notificationId).delete();
};