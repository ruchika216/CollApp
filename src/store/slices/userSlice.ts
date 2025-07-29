// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  uid: string | null;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'developer' | 'scrum' | null;
}

const initialState: UserState = {
  uid: null,
  name: null,
  email: null,
  photoURL: null,
  role: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return { ...action.payload };
    },
    clearUser() {
      return initialState;
    },
    updateRole(state, action: PayloadAction<UserState['role']>) {
      state.role = action.payload;
    },
  },
});

export const { setUser, clearUser, updateRole } = userSlice.actions;
export default userSlice.reducer;
