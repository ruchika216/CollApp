import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * Check if Google Sign-In is properly configured and available
 */
export const checkGoogleSignInAvailability = async (): Promise<boolean> => {
  try {
    // Check if GoogleSignin module is available
    if (!GoogleSignin) {
      console.error('GoogleSignin module not available');
      return false;
    }

    // Check if Google Play Services are available (Android only)
    if (Platform.OS === 'android') {
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: false,
      });
      
      if (!hasPlayServices) {
        console.error('Google Play Services not available');
        return false;
      }
    }

    console.log('Google Sign-In is available');
    return true;
  } catch (error) {
    console.error('Error checking Google Sign-In availability:', error);
    return false;
  }
};

/**
 * Get current Google Sign-In status
 */
export const getCurrentSignInStatus = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    const currentUser = await GoogleSignin.getCurrentUser();
    
    return {
      isSignedIn,
      currentUser,
    };
  } catch (error) {
    console.error('Error getting sign-in status:', error);
    return {
      isSignedIn: false,
      currentUser: null,
    };
  }
};

/**
 * Clear any existing Google Sign-In session
 */
export const clearGoogleSignInSession = async () => {
  try {
    const { isSignedIn } = await getCurrentSignInStatus();
    
    if (isSignedIn) {
      await GoogleSignin.signOut();
      console.log('Cleared existing Google Sign-In session');
    }
  } catch (error) {
    console.error('Error clearing Google Sign-In session:', error);
  }
};