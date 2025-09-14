// src/services/auth/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { createOrUpdateUser } from './firestore';
import { User } from '../../types';

// configure once at module load
GoogleSignin.configure({
  // Explicit scopes help ensure idToken is included on Android
  scopes: ['profile', 'email', 'openid'],
  webClientId:
    '217635740089-o1qp2cpvd8krvcf6tcekpeaj59un6hls.apps.googleusercontent.com',
  // offlineAccess: false, // not needed unless you need refresh tokens for your server
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

    // 3) launch native Google dialog and prefer idToken from signIn result
    const signInResult: any = await GoogleSignin.signIn();
    let idToken: string | null = signInResult?.idToken ?? null;

    // 4) Fallback to getTokens() for older devices/configs if needed
    if (!idToken) {
      try {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens?.idToken ?? null;
      } catch (e) {
        // Ignore here; we'll handle missing idToken below
      }
    }

    if (!idToken) {
      throw new Error(
        'No Google ID token returned. Check your network and try again.',
      );
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
    const code = error?.code || error?.status || error?.message;
    switch (code) {
      case 'DEVELOPER_ERROR':
        throw new Error(
          'Configuration error. Verify your webClientId and SHA-1 in Firebase.',
        );
      case 'SIGN_IN_CANCELLED':
        throw new Error('Sign-in was cancelled by the user.');
      case 'SIGN_IN_REQUIRED':
        throw new Error('Sign-in is required. Please try again.');
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        throw new Error(
          'Google Play Services is not available on this device.',
        );
      case 'NETWORK_ERROR':
      case 7:
        throw new Error(
          'Network error during Google Sign-In. Please check your internet connection and try again.',
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
