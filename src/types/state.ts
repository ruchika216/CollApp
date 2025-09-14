/**
 * APPLICATION STATE TYPES
 * Redux store state interfaces and related types
 */

import {
  User,
  Project,
  Meeting,
  Report,
  Notification,
  Activity,
} from './entities';

// =====================================================================================
// AUTH STATE
// =====================================================================================
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
}

// =====================================================================================
// UI STATE
// =====================================================================================
export interface UIState {
  isLoading: boolean;
  modals: {
    projectForm: boolean;
    userApproval: boolean;
    fileUpload: boolean;
    commentForm: boolean;
    taskForm: boolean;
    meetingForm: boolean;
    reportForm: boolean;
  };
  activeProject: string | null;
  sidebarOpen: boolean;
  notifications: {
    visible: boolean;
    count: number;
  };
}

// =====================================================================================
// PROJECT STATE
// =====================================================================================
export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    search?: string;
  };
}

// =====================================================================================
// TASK STATE
// =====================================================================================
// Task state removed

// =====================================================================================
// MEETING STATE
// =====================================================================================
export interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string[];
    type?: string[];
    priority?: string[];
    search?: string;
  };
}

// =====================================================================================
// REPORT STATE
// =====================================================================================
export interface ReportState {
  reports: Report[];
  currentReport: Report | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string[];
    reportType?: string[];
    priority?: string[];
    search?: string;
  };
}

// =====================================================================================
// NOTIFICATION STATE
// =====================================================================================
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// =====================================================================================
// ACTIVITY STATE
// =====================================================================================
export interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// =====================================================================================
// USER STATE
// =====================================================================================
export interface UserState {
  users: User[];
  pendingUsers: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// =====================================================================================
// THEME STATE
// =====================================================================================
export interface ThemeState {
  mode: 'light' | 'dark';
  systemTheme: boolean;
}

// =====================================================================================
// ROOT STATE
// =====================================================================================
export interface RootState {
  auth: AuthState;
  ui: UIState;
  projects: ProjectState;
  meetings: MeetingState;
  reports: ReportState;
  notifications: NotificationState;
  activities: ActivityState;
  users: UserState;
  theme: ThemeState;
}

// =====================================================================================
// ASYNC THUNK STATES
// =====================================================================================
export interface AsyncThunkState {
  loading: boolean;
  error: string | null;
}

export interface AsyncThunkConfig {
  state: RootState;
  rejectValue: string;
}

// =====================================================================================
// COMMON ACTION PAYLOADS
// =====================================================================================
export interface EntityCreatePayload<T> {
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface EntityUpdatePayload<T> {
  id: string;
  data: Partial<T>;
}

export interface EntityDeletePayload {
  id: string;
}
