import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import projectReducer from './slices/projectSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import activityReducer from './slices/activitySlice';
import taskReducer from './slices/taskSlice';
import enhancedTaskReducer from './slices/enhancedTaskSlice';
import meetingReducer from './slices/meetingSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    theme: themeReducer,
    projects: projectReducer,
    tasks: taskReducer,
    enhancedTasks: enhancedTaskReducer,
    meetings: meetingReducer,
    reports: reportReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    activities: activityReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'auth.user.lastSeen',
          'user.users',
          'user.approvedUsers',
          'user.pendingUsers',
          'user.allUsers',
          'projects.projects',
          'tasks.tasks',
          'enhancedTasks.tasks',
          'enhancedTasks.filteredTasks',
          'meetings.meetings',
          'reports.reports',
          'activities.activities',
          'notifications.notifications',
        ],
        ignoredActionsPaths: [
          'payload.createdAt',
          'payload.updatedAt',
          'payload.dueDate',
          'payload.lastSeen',
          'payload.date',
          'payload.startTime',
          'payload.endTime',
          'meta.arg',
          'meta.baseQueryMeta',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
