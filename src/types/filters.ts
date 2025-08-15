/**
 * FILTER & SEARCH TYPES
 * Types for filtering and searching data
 */

// =====================================================================================
// FILTER INTERFACES
// =====================================================================================
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

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  projectId?: string[];
  search?: string;
}

// =====================================================================================
// SEARCH & SORT TYPES
// =====================================================================================
export interface SearchOptions {
  query: string;
  fields?: string[]; // Fields to search in
  exact?: boolean; // Exact match
  caseSensitive?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

// =====================================================================================
// FILTER RESULT TYPES
// =====================================================================================
export interface FilteredResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// =====================================================================================
// COMMON FILTER VALUES
// =====================================================================================
export const FILTER_VALUES = {
  PROJECT_STATUS: ['To Do', 'In Progress', 'Done', 'Testing', 'Review', 'Deployment'] as const,
  PROJECT_PRIORITY: ['Low', 'Medium', 'High', 'Critical'] as const,
  TASK_STATUS: ['Pending', 'In Progress', 'Done'] as const,
  TASK_PRIORITY: ['Low', 'Medium', 'High'] as const,
  MEETING_STATUS: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'] as const,
  MEETING_TYPE: ['Individual', 'Team', 'All Hands', 'Project Review', 'Client Meeting', 'Training'] as const,
  MEETING_PRIORITY: ['Low', 'Medium', 'High', 'Critical'] as const,
  REPORT_STATUS: ['Pending', 'In Progress', 'Under Review', 'Completed', 'Cancelled'] as const,
  REPORT_TYPE: ['Daily', 'Weekly', 'Monthly', 'Project Summary', 'Bug Report', 'Performance Review'] as const,
  REPORT_PRIORITY: ['Low', 'Medium', 'High', 'Critical'] as const,
} as const;