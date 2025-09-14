import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

// Utility function to sanitize user dates from Firestore
const sanitizeUserDates = (userData: any): User => {
  if (!userData) return userData;
  
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

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  isFirstTime: boolean;
  onboardingCompleted: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  isFirstTime: true,
  onboardingCompleted: false,
  approvalStatus: null,
};

// Async thunks for authentication
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { signInWithGoogle: signIn } = await import('../../services/auth/googleAuth');
      const result = await signIn();
      return sanitizeUserDates(result.appUser);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { signOutGoogle } = await import('../../services/auth/googleAuth');
      await signOutGoogle();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      const { getCurrentUser } = await import('../../services/auth/googleAuth');
      const user = await getCurrentUser();
      return user ? sanitizeUserDates(user) : null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload ? sanitizeUserDates(action.payload) : null;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    setIsFirstTime: (state, action: PayloadAction<boolean>) => {
      state.isFirstTime = action.payload;
    },
    setApprovalStatus: (state, action: PayloadAction<'pending' | 'approved' | 'rejected' | null>) => {
      state.approvalStatus = action.payload;
    },
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      state.approvalStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in with Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload ? sanitizeUserDates(action.payload) : null;
        state.isAuthenticated = true;
        state.error = null;
        state.approvalStatus = action.payload?.approved ? 'approved' : 'pending';
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Sign out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload ? sanitizeUserDates(action.payload) : null;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setLoading,
  setError,
  clearError,
  setOnboardingCompleted,
  setIsFirstTime,
  setApprovalStatus,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;