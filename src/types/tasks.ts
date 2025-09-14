import { Task } from './index';

// This extends the basic Task interface with form-specific fields
export interface TaskFormData {
  title: string;
  description?: string;
  status?: 'To Do' | 'Completed' | 'In Progress' | 'Review' | 'Testing';
  priority?: 'High' | 'Medium' | 'Low';
  assigneeId?: string;
  assignedTo?: string[];
  dueDate?: Date | null;
  projectId?: string;
  projectName?: string;
}
