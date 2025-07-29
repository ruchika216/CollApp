// src/services/auth/firestore.ts
import { firestore } from '../../firebase/firebaseConfig';

/** The three roles you support in your app */
export type UserRole = 'admin' | 'developer' | 'scrum' | null;

/**
 * Returns the `role` field from users/{uid}, or null if not set.
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const doc = await firestore().collection('users').doc(uid).get();
    if (!doc.exists) return null;
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
    return doc.exists;
  } catch (e) {
    console.error('Error checking user existence:', e);
    return false;
  }
}
