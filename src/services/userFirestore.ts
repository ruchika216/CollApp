import { firestore } from '../firebase/firebaseConfig';

export async function saveUserToFirestore(user: {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'developer' | null;
}) {
  try {
    console.log('Writing user to Firestore:', user);

    const userData = {
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role || 'developer', // default to developer if null
      updatedAt: new Date(),
      createdAt: new Date(), // Add creation timestamp
    };

    await firestore()
      .collection('users')
      .doc(user.uid)
      .set(userData, { merge: true });

    console.log('Successfully wrote user to Firestore:', user.uid);
    return true;
  } catch (error) {
    console.error('Error writing user to Firestore:', error);
    throw error;
  }
}
