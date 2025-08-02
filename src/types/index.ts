
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  role: 'admin' | 'developer';
  approved: boolean;
  projects: string[]; // Array of project IDs
  createdAt: string;
  updatedAt: string;
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

export interface Project {
  id: string;
  title: string;
  description: string;
  files: ProjectFile[];
  images: ProjectFile[];
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Development' | 'Done' | 'Deployment' | 'Fixing Bug' | 'Review' | 'Testing';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  comments: ProjectComment[];
  assignedTo: string; // User ID
  assignedUser?: User; // Populated user data
  createdBy: string; // Admin user ID
  createdAt: string;
  updatedAt: string;
  progress: number; // 0-100
  estimatedHours: number;
  actualHours: number;
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
  actionType?: 'project_assigned' | 'status_changed' | 'comment_added' | 'file_uploaded';
}
