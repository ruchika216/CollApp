import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Firebase collections
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  MEETINGS: 'meetings',
  REPORTS: 'reports',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
  COMMENTS: 'comments',
} as const;

// Firebase storage paths
export const STORAGE_PATHS = {
  PROJECT_FILES: 'projects/{projectId}/files',
  PROJECT_IMAGES: 'projects/{projectId}/images',
  USER_AVATARS: 'users/{userId}/avatar',
} as const;

export { auth, firestore, storage };
