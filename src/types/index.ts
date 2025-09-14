export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  name: string;
  photoURL: string | null;
  providerId: string;
  role: 'admin' | 'developer';
  approved: boolean;
  projects: string[]; // Array of project IDs
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface ProjectComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  assignedTo?: string; // User ID
  assignee?: User; // Populated user data
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  estimatedHours?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  files: ProjectFile[];
  images: ProjectFile[];
  startDate: string;
  endDate: string;
  status:
    | 'To Do'
    | 'In Progress'
    | 'Done'
    | 'Testing'
    | 'Review'
    | 'Deployment';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  comments: ProjectComment[];
  subTasks: SubTask[];
  assignedTo: string[]; // Array of User IDs - supports multiple developers
  assignedUsers?: User[]; // Populated user data
  createdBy: string; // Admin user ID
  createdAt: string;
  updatedAt: string;
  progress: number; // 0-100
  estimatedHours: number;
  actualHours: number;
  tags?: string[];
  category?: string;
}

// Task entity
export interface TaskComment {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'Completed' | 'In Progress' | 'Review' | 'Testing';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string[]; // includes 'all' when for everyone
  comments?: TaskComment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  viewCount?: number;
  attachments?: string[];
}

export interface MeetingComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'pre_meeting' | 'post_meeting' | 'admin_note';
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  description?: string;
  meetingLink?: string; // Zoom, Teams, Meet, etc.
  location?: string; // Physical location or online platform
  startTime: string; // Full timestamp for meeting start
  endTime?: string; // Full timestamp for meeting end (optional)
  date: string; // Date in YYYY-MM-DD format for easy filtering
  assignedTo: string[]; // Array of User IDs - can be "all" for everyone
  assignedUsers?: User[]; // Populated user data
  isAssignedToAll: boolean; // If true, show to everyone
  type:
    | 'Individual'
    | 'Team'
    | 'All Hands'
    | 'Project Review'
    | 'Client Meeting'
    | 'Training';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  projectId?: string; // Optional reference to project
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Meeting-specific fields
  comments?: MeetingComment[];
  lastCommentAt?: string;
  lastCommentBy?: string;
  // Reminder settings
  reminders?: {
    '1day': boolean;
    '1hour': boolean;
    '15min': boolean;
  };
  // Meeting outcomes
  meetingNotes?: string;
  actionItems?: string[];
  recordingUrl?: string;
  attendees?: string[]; // Who actually attended
}

export interface ReportComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'feedback' | 'admin_note' | 'revision_request';
}

export interface Report {
  id: string;
  title: string;
  description: string;
  reportType:
    | 'Daily'
    | 'Weekly'
    | 'Monthly'
    | 'Project Summary'
    | 'Bug Report'
    | 'Performance Review';
  assignedTo: string[];
  assignedUsers?: User[]; // Populated user data
  isAssignedToAll: boolean; // If true, show to everyone
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status:
    | 'Pending'
    | 'In Progress'
    | 'Under Review'
    | 'Completed'
    | 'Cancelled';
  dueDate: string;
  submissionDate?: string; // When report was actually submitted
  projectId?: string;
  meetingId?: string; // Optional reference to related meeting
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Report-specific fields
  comments?: ReportComment[];
  lastCommentAt?: string;
  lastCommentBy?: string;
  // Report content
  content?: string; // Report text/content
  attachments?: ProjectFile[]; // Files attached to report
  tags?: string[];
  // Review fields
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  read: boolean;
  createdAt: string;
  projectId?: string;
  taskId?: string;
  meetingId?: string;
  reportId?: string;
  actionType?:
    | 'project_assigned'
    | 'status_changed'
    | 'comment_added'
    | 'file_uploaded'
    | 'user_approval_needed'
    | 'account_approved'
    | 'task_assigned'
    | 'meeting_scheduled'
    | 'report_assigned';
  metadata?: {
    newUserId?: string;
    newUserEmail?: string;
    newUserName?: string;
    [key: string]: any;
  };
}

// Activity tracking interface
export interface Activity {
  id: string;
  type:
    | 'project_created'
    | 'project_updated'
    | 'status_updated'
    | 'comment_added'
    | 'user_assigned'
    | 'file_uploaded'
    | 'task_completed'
    | 'subtask_added';
  message: string;
  userId: string;
  userName: string;
  projectId?: string;
  projectTitle?: string;
  createdAt: string;
  relatedUsers: string[]; // Users who should see this activity
  readBy: string[]; // Users who have read this activity
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    fileName?: string;
    [key: string]: any;
  };
}

// Filter and search interfaces
export interface ProjectFilters {
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
}

export interface MeetingFilters {
  status?: string[];
  type?: string[];
  priority?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ReportFilters {
  status?: string[];
  reportType?: string[];
  priority?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  search?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
}

// UI state interface
export interface UIState {
  isLoading: boolean;
  modals: {
    projectForm: boolean;
    userApproval: boolean;
    fileUpload: boolean;
    commentForm: boolean;
  };
  activeProject: string | null;
  sidebarOpen: boolean;
}

// Export navigation types
export * from './navigation';
