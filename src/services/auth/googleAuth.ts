// src/services/auth/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { createOrUpdateUser } from './firestore';
import { User } from '../../types';

// configure once at module load
GoogleSignin.configure({
  webClientId:
    '217635740089-o1qp2cpvd8krvcf6tcekpeaj59un6hls.apps.googleusercontent.com',
});

/**
 * Complete sign-in result with user data
 */
export interface SignInResult {
  firebaseUser: FirebaseAuthTypes.User;
  appUser: User;
  isNewUser: boolean;
}

/**
 * Sign in with Google + Firebase and create/update user in Firestore
 */
export async function signInWithGoogle(): Promise<SignInResult> {
  try {
    // 1) ensure Play Services on Android
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // 2) optional: clear previous session
    await GoogleSignin.signOut();

    // 3) launch native Google dialog
    await GoogleSignin.signIn();

    // 4) grab the ID token
    const { idToken } = await GoogleSignin.getTokens();
    if (!idToken) {
      throw new Error('No Google ID token returned. Please try again.');
    }

    // 5) exchange for a Firebase credential & sign in
    const credential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(credential);
    
    if (!userCredential.user) {
      throw new Error('No user returned from Firebase authentication.');
    }

    // 6) Create or update user in Firestore
    const isNewUser = userCredential.additionalUserInfo?.isNewUser || false;
    const appUser = await createOrUpdateUser(userCredential.user);

    return {
      firebaseUser: userCredential.user,
      appUser,
      isNewUser,
    };
  } catch (error: any) {
    // map known errors to friendlier messages
    switch (error.code) {
      case 'SIGN_IN_CANCELLED':
        throw new Error('Sign-in was cancelled by the user.');
      case 'SIGN_IN_REQUIRED':
        throw new Error('Sign-in is required. Please try again.');
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        throw new Error(
          'Google Play Services is not available on this device.',
        );
      default:
        throw new Error(
          `Google Sign-In failed: ${error.message || 'Unknown error'}`,
        );
    }
  }
}

/**
 * Sign out of both Google & Firebase.
 */
export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
  await auth().signOut();
}

/**
 * Check if user is currently signed in
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) return null;
    
    // Get the app user data from Firestore
    const appUser = await createOrUpdateUser(firebaseUser);
    return appUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
