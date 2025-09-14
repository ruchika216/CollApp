import { firebase } from '@react-native-firebase/firestore';
import { User } from '../types';

const firestore = firebase.firestore();
const usersCollection = firestore.collection('users');

class UserService {
  async getUserById(userId: string): Promise<User | null> {
    try {
      if (!userId) return null;

      const doc = await usersCollection.doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      return {
        uid: doc.id,
        email: data?.email || null,
        displayName: data?.displayName || null,
        name: data?.name || '',
        photoURL: data?.photoURL || null,
        providerId: data?.providerId || '',
        role: data?.role || 'developer',
        approved: data?.approved || false,
        projects: data?.projects || [],
        createdAt: data?.createdAt || '',
        updatedAt: data?.updatedAt || '',
        isOnline: data?.isOnline || false,
        lastSeen: data?.lastSeen || '',
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      if (!userIds.length) return [];

      // Firestore doesn't allow array-contains queries with arrays, so we need to do individual lookups
      const promises = userIds.map(id => this.getUserById(id));
      const results = await Promise.all(promises);

      return results.filter(user => user !== null) as User[];
    } catch (error) {
      console.error('Error getting users by IDs:', error);
      return [];
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      await usersCollection.doc(userId).update({
        ...userData,
        updatedAt: firebase.firestore.Timestamp.now().toDate().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }
}

export const userService = new UserService();
