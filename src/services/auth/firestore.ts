// src/services/auth/firestore.ts
import { firestore } from '../../firebase/firebaseConfig';
import { User } from '../../types';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Utility function to sanitize user data and convert any Firestore Timestamps to ISO strings
const sanitizeUserDates = (userData: any): User => {
  const convertTimestamp = (field: any): string => {
    if (field && typeof field === 'object' && field._seconds !== undefined) {
      // This is a Firestore Timestamp
      return new Date(field._seconds * 1000 + field._nanoseconds / 1000000).toISOString();
    }
    if (field instanceof Date) {
      return field.toISOString();
    }
    return field;
  };

  return {
    ...userData,
    createdAt: convertTimestamp(userData.createdAt),
    updatedAt: convertTimestamp(userData.updatedAt),
    lastSeen: convertTimestamp(userData.lastSeen),
  } as User;
};

/** The three roles you support in your app */
export type UserRole = 'admin' | 'developer' | 'scrum' | null;

// List of admin emails - you can configure these
const ADMIN_EMAILS = [
  'admin@collapp.com',
  'ruchika@example.com', // Add your admin emails here
];

/**
 * Determines user role based on email
 */
export function determineUserRole(email: string | null): 'admin' | 'developer' {
  if (!email) return 'developer';
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'developer';
}

/**
 * Creates or updates user in Firestore after Google sign-in
 */
export async function createOrUpdateUser(
  firebaseUser: FirebaseAuthTypes.User,
): Promise<User> {
  const db = firestore();
  const userRef = db.collection('users').doc(firebaseUser.uid);
  const timestamp = new Date().toISOString();

  try {
    const existingDoc = await userRef.get();

    if (existingDoc.exists()) {
      // User exists, update their info but keep their role and approved status
      const existingData = existingDoc.data();
      if (!existingData) {
        throw new Error('User data is corrupted');
      }

      const updatedUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: firebaseUser.displayName || firebaseUser.email || 'Unknown User',
        photoURL: firebaseUser.photoURL,
        providerId: firebaseUser.providerId,
        role: existingData.role,
        approved: existingData.approved,
        projects: existingData.projects || [],
        createdAt: existingData.createdAt,
        updatedAt: timestamp,
        isOnline: true,
        lastSeen: timestamp,
      };

      await userRef.update({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: firebaseUser.displayName || firebaseUser.email || 'Unknown User',
        photoURL: firebaseUser.photoURL,
        updatedAt: timestamp,
        isOnline: true,
        lastSeen: timestamp,
      });

      return sanitizeUserDates(updatedUser);
    } else {
      // New user, create with default settings
      const role = determineUserRole(firebaseUser.email);
      const isAdmin = role === 'admin';

      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: firebaseUser.displayName || firebaseUser.email || 'Unknown User',
        photoURL: firebaseUser.photoURL,
        providerId: firebaseUser.providerId,
        role,
        approved: isAdmin, // Auto-approve admins, others need approval
        projects: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        isOnline: true,
        lastSeen: timestamp,
      };

      await userRef.set(newUser);

      // Create notification for admins about new user (if user is not admin)
      if (!isAdmin) {
        await createNewUserNotification(newUser);
      }

      return sanitizeUserDates(newUser);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

/**
 * Creates notification for admins about new user registration
 */
async function createNewUserNotification(user: User): Promise<void> {
  const db = firestore();
  //
  try {
    // Get all admin users
    const adminQuery = await db
      .collection('users')
      .where('role', '==', 'admin')
      .get();

    const notificationPromises = adminQuery.docs.map(adminDoc => {
      const notificationRef = db.collection('notifications').doc();
      return notificationRef.set({
        id: notificationRef.id,
        title: 'New User Registration',
        message: `${user.name || user.email} has registered and needs approval`,
        type: 'info',
        userId: adminDoc.id,
        read: false,
        createdAt: new Date().toISOString(),
        actionType: 'user_approval_needed',
        metadata: {
          newUserId: user.uid,
          newUserEmail: user.email,
          newUserName: user.displayName,
        },
      });
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating new user notification:', error);
  }
}

/**
 * Returns the user document from Firestore
 */
export async function getUserById(uid: string): Promise<User | null> {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    if (!doc.exists()) return null;
    const userData = doc.data();
    return userData ? sanitizeUserDates(userData) : null;
  } catch (e) {
    console.error('Error fetching user:', e);
    return null;
  }
}

/**
 * Returns the `role` field from users/{uid}, or null if not set.
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    if (!doc.exists()) return null;
    return (doc.data()?.role as UserRole) ?? null;
  } catch (e) {
    console.error('Error fetching user role:', e);
    return null;
  }
}

/**
 * Returns true if users/{uid} exists, false otherwise.
 */
export async function checkUserExists(uid: string): Promise<boolean> {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    return doc.exists();
  } catch (e) {
    console.error('Error checking user existence:', e);
    return false;
  }
}

/**
 * Approves a user and creates notification
 */
export async function approveUser(
  uid: string,
  _approvedByUid: string,
): Promise<void> {
  const db = firestore();
  const timestamp = new Date().toISOString();

  try {
    // Update user approval status
    await db.collection('users').doc(uid).update({
      approved: true,
      updatedAt: timestamp,
    });

    // Get user details for notification
    const userDoc = await db.collection('users').doc(uid).get();
    const user = userDoc.data() as User;

    // Create notification for the approved user
    const notificationRef = db.collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      title: 'Account Approved!',
      message:
        'Your account has been approved. You can now access the application.',
      type: 'success',
      userId: uid,
      read: false,
      createdAt: timestamp,
      actionType: 'account_approved',
    });

    console.log(`User ${user.email} approved successfully`);
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
}

/**
 * Rejects/deletes a user account
 */
export async function rejectUser(uid: string): Promise<void> {
  try {
    await firestore().collection('users').doc(uid).delete();
    console.log(`User ${uid} rejected and deleted successfully`);
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
}
