import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import projectReducer from './slices/projectSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    theme: themeReducer,
    projects: projectReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
