# User Slice Usage Guide

This document provides examples of how to use the enhanced userSlice with async thunks for Google Auth, user registration, approval status management, and fetching current user data.

## User Data Structure

The userSlice uses a simplified `UserData` interface with the exact fields requested:

```typescript
export interface UserData {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'developer';
  approved: boolean;
}
```

## State Structure

```typescript
export interface UserState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

## Async Thunks Usage

### 1. Google Sign-In

```typescript
import { useAppDispatch } from '../hooks';
import { signInWithGoogle } from '../slices/userSlice';

const LoginScreen = () => {
  const dispatch = useAppDispatch();

  const handleGoogleSignIn = async () => {
    try {
      const result = await dispatch(signInWithGoogle()).unwrap();
      console.log('User signed in:', result);
      // Navigate based on approval status
      if (result.approved) {
        navigation.navigate('Dashboard');
      } else {
        navigation.navigate('PendingApproval');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleGoogleSignIn}>
      <Text>Sign in with Google</Text>
    </TouchableOpacity>
  );
};
```

### 2. Sign Out

```typescript
import { signOut } from '../slices/userSlice';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      console.log('User signed out successfully');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Text>Sign Out</Text>
    </TouchableOpacity>
  );
};
```

### 3. Register New User

```typescript
import { registerUser } from '../slices/userSlice';
import auth from '@react-native-firebase/auth';

const useAuthListener = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const result = await dispatch(registerUser(firebaseUser)).unwrap();
          console.log('User registered/updated:', result);
        } catch (error) {
          console.error('User registration failed:', error);
        }
      }
    });

    return unsubscribe;
  }, [dispatch]);
};
```

### 4. Fetch Current User Data

```typescript
import { fetchCurrentUser } from '../slices/userSlice';

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for current user on app startup
    const checkCurrentUser = async () => {
      try {
        const result = await dispatch(fetchCurrentUser()).unwrap();
        if (result) {
          console.log('Current user found:', result);
          // Navigate to appropriate screen based on approval status
          if (result.approved) {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('PendingApproval');
          }
        } else {
          console.log('No current user, showing login');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        navigation.navigate('Login');
      }
    };

    checkCurrentUser();
  }, [dispatch]);

  return <AppNavigator />;
};
```

### 5. Update User Approval Status (Admin Only)

```typescript
import { updateUserApprovalStatus } from '../slices/userSlice';

const AdminUserManagement = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.user.user);

  const handleApproveUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      console.error('Only admins can approve users');
      return;
    }

    try {
      const result = await dispatch(updateUserApprovalStatus({
        userId,
        approved: true,
        adminUid: currentUser.uid
      })).unwrap();
      
      console.log('User approved:', result);
      Alert.alert('Success', 'User approved successfully');
    } catch (error) {
      console.error('Failed to approve user:', error);
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      console.error('Only admins can reject users');
      return;
    }

    try {
      await dispatch(updateUserApprovalStatus({
        userId,
        approved: false,
        adminUid: currentUser.uid
      })).unwrap();
      
      console.log('User rejected');
      Alert.alert('Success', 'User rejected successfully');
    } catch (error) {
      console.error('Failed to reject user:', error);
      Alert.alert('Error', 'Failed to reject user');
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => handleApproveUser('user-id')}>
        <Text>Approve User</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRejectUser('user-id')}>
        <Text>Reject User</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### 6. Refresh User Data

```typescript
import { refreshUserData } from '../slices/userSlice';

const PendingApprovalScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);

  const handleRefreshStatus = async () => {
    if (!user) return;

    try {
      const result = await dispatch(refreshUserData(user.uid)).unwrap();
      if (result && result.approved) {
        Alert.alert('Good News!', 'Your account has been approved!');
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Status Unchanged', 'Your account is still pending approval.');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      Alert.alert('Error', 'Failed to check approval status');
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleRefreshStatus}>
        <Text>Check Status</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Synchronous Actions

### Update User Role

```typescript
import { updateUserRole } from '../slices/userSlice';

const AdminPanel = () => {
  const dispatch = useAppDispatch();

  const makeUserAdmin = () => {
    dispatch(updateUserRole('admin'));
  };

  const makeUserDeveloper = () => {
    dispatch(updateUserRole('developer'));
  };
};
```

### Update Approval Status (Local State)

```typescript
import { updateApprovalStatus } from '../slices/userSlice';

const Component = () => {
  const dispatch = useAppDispatch();

  const approveLocally = () => {
    dispatch(updateApprovalStatus(true));
  };
};
```

### Error Handling

```typescript
import { clearError } from '../slices/userSlice';

const ErrorDisplay = () => {
  const error = useAppSelector(state => state.user.error);
  const dispatch = useAppDispatch();

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <TouchableOpacity onPress={() => dispatch(clearError())}>
          <Text>Clear Error</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};
```

## Complete Component Example

```typescript
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  signInWithGoogle,
  signOut,
  fetchCurrentUser,
  refreshUserData,
  clearError
} from '../store/slices/userSlice';

const AuthExample = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector(state => state.user);

  useEffect(() => {
    // Check for existing user on component mount
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await dispatch(signInWithGoogle()).unwrap();
      if (result.approved) {
        navigation.navigate('Dashboard');
      } else {
        navigation.navigate('PendingApproval');
      }
    } catch (error) {
      Alert.alert('Sign In Failed', error.toString());
    }
  };

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Sign Out Failed', error.toString());
    }
  };

  const handleRefreshUser = async () => {
    if (user) {
      try {
        await dispatch(refreshUserData(user.uid)).unwrap();
        Alert.alert('Success', 'User data refreshed');
      } catch (error) {
        Alert.alert('Refresh Failed', error.toString());
      }
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
        <TouchableOpacity onPress={() => dispatch(clearError())}>
          <Text>Clear Error</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View>
        <TouchableOpacity onPress={handleGoogleSignIn}>
          <Text>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {user.name || user.email}!</Text>
      <Text>Role: {user.role}</Text>
      <Text>Status: {user.approved ? 'Approved' : 'Pending Approval'}</Text>
      
      <TouchableOpacity onPress={handleRefreshUser}>
        <Text>Refresh User Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleSignOut}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthExample;
```

This enhanced userSlice provides complete authentication and user management functionality with proper error handling, loading states, and TypeScript support.