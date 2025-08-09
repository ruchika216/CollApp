// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { signInWithGoogle as googleSignIn, signOutGoogle, getCurrentUser } from '../../services/auth/googleAuth';
import { createOrUpdateUser, approveUser as firestoreApproveUser, rejectUser as firestoreRejectUser, getUserById } from '../../services/auth/firestore';
import firestoreService from '../../firebase/firestoreService';
import { User } from '../../types';

// User interface with exact fields requested
export interface UserData {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'developer';
  approved: boolean;
}

export interface UserState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  // Admin functionality
  allUsers: User[];
  approvedUsers: User[];
  pendingUsers: User[];
  selectedUser: User | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  allUsers: [],
  approvedUsers: [],
  pendingUsers: [],
  selectedUser: null,
};

// Async Thunks

/**
 * Google Sign-In Thunk
 */
export const signInWithGoogle = createAsyncThunk(
  'user/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const result = await googleSignIn();
      
      // Convert to UserData format
      const userData: UserData = {
        uid: result.appUser.uid,
        name: result.appUser.displayName,
        email: result.appUser.email,
        photoURL: result.appUser.photoURL,
        role: result.appUser.role,
        approved: result.appUser.approved,
      };
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Google sign-in failed');
    }
  }
);

/**
 * Sign Out Thunk
 */
export const signOut = createAsyncThunk(
  'user/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOutGoogle();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sign out failed');
    }
  }
);

/**
 * Register New User Thunk
 */
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (firebaseUser: FirebaseAuthTypes.User, { rejectWithValue }) => {
    try {
      const appUser = await createOrUpdateUser(firebaseUser);
      
      // Convert to UserData format
      const userData: UserData = {
        uid: appUser.uid,
        name: appUser.displayName,
        email: appUser.email,
        photoURL: appUser.photoURL,
        role: appUser.role,
        approved: appUser.approved,
      };
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'User registration failed');
    }
  }
);

/**
 * Fetch Current User Data Thunk
 */
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        return null;
      }
      
      // Convert to UserData format
      const userData: UserData = {
        uid: currentUser.uid,
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        role: currentUser.role,
        approved: currentUser.approved,
      };
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  }
);

/**
 * Update User Approval Status Thunk
 */
export const updateUserApprovalStatus = createAsyncThunk(
  'user/updateApprovalStatus',
  async (params: { userId: string; approved: boolean; adminUid: string }, { rejectWithValue }) => {
    try {
      const { userId, approved, adminUid } = params;
      
      if (approved) {
        await firestoreApproveUser(userId, adminUid);
      } else {
        await firestoreRejectUser(userId);
      }
      
      // Fetch updated user data
      const updatedUser = await getUserById(userId);
      
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      // Convert to UserData format
      const userData: UserData = {
        uid: updatedUser.uid,
        name: updatedUser.displayName,
        email: updatedUser.email,
        photoURL: updatedUser.photoURL,
        role: updatedUser.role,
        approved: updatedUser.approved,
      };
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update approval status');
    }
  }
);

/**
 * Refresh User Data Thunk
 */
export const refreshUserData = createAsyncThunk(
  'user/refreshUserData',
  async (uid: string, { rejectWithValue }) => {
    try {
      const user = await getUserById(uid);
      
      if (!user) {
        return null;
      }
      
      // Convert to UserData format
      const userData: UserData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        approved: user.approved,
      };
      
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh user data');
    }
  }
);

/**
 * Fetch Pending Users (Admin)
 */
export const fetchPendingUsers = createAsyncThunk(
  'user/fetchPendingUsers',
  async (_, { rejectWithValue }) => {
    try {
      const pendingUsers = await firestoreService.getPendingUsers();
      return pendingUsers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending users');
    }
  }
);

/**
 * Approve User (Admin)
 */
export const approveUser = createAsyncThunk(
  'user/approveUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await firestoreService.approveUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve user');
    }
  }
);

/**
 * Reject User (Admin)
 */
export const rejectUser = createAsyncThunk(
  'user/rejectUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await firestoreRejectUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject user');
    }
  }
);

/**
 * Fetch All Users (for dropdowns, etc.)
 */
export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const allUsers = await firestoreService.getAllUsers();
      return allUsers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all users');
    }
  }
);

/**
 * Fetch Approved Users (for task assignments)
 */
export const fetchApprovedUsers = createAsyncThunk(
  'user/fetchApprovedUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchApprovedUsers: Starting fetch...');
      let approvedUsers = await firestoreService.getApprovedUsers();
      console.log('fetchApprovedUsers: Fetched approved users:', approvedUsers);
      console.log('fetchApprovedUsers: Number of approved users:', approvedUsers.length);
      
      // If no approved users found, fetch all users as fallback for development
      if (approvedUsers.length === 0) {
        console.log('fetchApprovedUsers: No approved users found, fetching all users as fallback...');
        approvedUsers = await firestoreService.getAllUsers();
        console.log('fetchApprovedUsers: Fetched all users as fallback:', approvedUsers);
      }
      
      return approvedUsers;
    } catch (error: any) {
      console.error('fetchApprovedUsers: Error occurred:', error);
      return rejectWithValue(error.message || 'Failed to fetch approved users');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Synchronous actions
    setUser(state, action: PayloadAction<UserData | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateUserRole(state, action: PayloadAction<UserData['role']>) {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    updateApprovalStatus(state, action: PayloadAction<boolean>) {
      if (state.user) {
        state.user.approved = action.payload;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    // Admin actions
    setPendingUsers(state, action: PayloadAction<User[]>) {
      state.pendingUsers = action.payload;
    },
    setAllUsers(state, action: PayloadAction<User[]>) {
      state.allUsers = action.payload;
    },
    setApprovedUsers(state, action: PayloadAction<User[]>) {
      state.approvedUsers = action.payload;
    },
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    removePendingUser(state, action: PayloadAction<string>) {
      state.pendingUsers = state.pendingUsers.filter(user => user.uid !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In with Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      
      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Update Approval Status
      .addCase(updateUserApprovalStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserApprovalStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && action.payload && state.user.uid === action.payload.uid) {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserApprovalStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Refresh User Data
      .addCase(refreshUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Pending Users
      .addCase(fetchPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Approve User
      .addCase(approveUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = state.pendingUsers.filter(user => user.uid !== action.payload);
        state.error = null;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reject User
      .addCase(rejectUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = state.pendingUsers.filter(user => user.uid !== action.payload);
        state.error = null;
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Approved Users
      .addCase(fetchApprovedUsers.pending, (state) => {
        console.log('fetchApprovedUsers.pending: Setting loading state...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovedUsers.fulfilled, (state, action) => {
        console.log('fetchApprovedUsers.fulfilled: Updating state with users:', action.payload);
        state.loading = false;
        state.approvedUsers = action.payload;
        state.error = null;
        console.log('fetchApprovedUsers.fulfilled: State updated. approvedUsers length:', state.approvedUsers.length);
      })
      .addCase(fetchApprovedUsers.rejected, (state, action) => {
        console.log('fetchApprovedUsers.rejected: Error occurred:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setUser, 
  clearUser, 
  updateUserRole, 
  updateApprovalStatus,
  setLoading,
  setError,
  clearError,
  setPendingUsers,
  setAllUsers,
  setApprovedUsers,
  setSelectedUser,
  removePendingUser
} = userSlice.actions;

export default userSlice.reducer;
