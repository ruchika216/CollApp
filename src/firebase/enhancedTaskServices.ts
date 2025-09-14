// Enhanced task services for Task Management System
import { firestore } from './firebaseConfig';
import { Task } from '../types';

// Get all tasks with filters
export const getTasksWithFilters = async (
  filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
    assignedTo?: string[];
  },
  limit = 20,
): Promise<Task[]> => {
  try {
    let query = firestore().collection('tasks').orderBy('updatedAt', 'desc');

    // Apply status filter if provided
    if (filters?.status && filters.status.length > 0) {
      query = query.where('status', 'in', filters.status);
    }

    // Apply priority filter if provided
    if (filters?.priority && filters.priority.length > 0) {
      query = query.where('priority', 'in', filters.priority);
    }

    // Apply assignee filter if provided
    if (
      filters?.assignedTo &&
      filters.assignedTo.length > 0 &&
      filters.assignedTo.length === 1
    ) {
      // Firebase only supports a single 'array-contains' query, so we can only filter
      // by one assignee at a time in the query itself
      query = query.where(
        'assignedTo',
        'array-contains',
        filters.assignedTo[0],
      );
    }

    // Apply limit
    query = query.limit(limit);

    // Execute query
    const querySnapshot = await query.get();

    let tasks = querySnapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Task),
    );

    // Apply search filter client-side if provided
    if (filters?.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      tasks = tasks.filter(
        task =>
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm)),
      );
    }

    // Apply multiple assignee filters client-side if needed
    if (filters?.assignedTo && filters.assignedTo.length > 1) {
      tasks = tasks.filter(task =>
        filters.assignedTo!.some(userId => task.assignedTo?.includes(userId)),
      );
    }

    return tasks;
  } catch (error) {
    console.error('Error in getTasksWithFilters:', error);
    throw error;
  }
};

// Get tasks dashboard summary stats
export const getTasksSummary = async (
  userId?: string,
): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentlyUpdated: Task[];
}> => {
  try {
    // Base query - either all tasks or just user's tasks
    let query = firestore().collection('tasks');

    if (userId) {
      query = query.where('assignedTo', 'array-contains', userId);
    }

    const querySnapshot = await query.get();
    const tasks = querySnapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Task),
    );

    // Calculate summary data
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    tasks.forEach(task => {
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;

      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    });

    // Get recently updated tasks
    const recentlyUpdated = [...tasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      recentlyUpdated,
    };
  } catch (error) {
    console.error('Error in getTasksSummary:', error);
    throw error;
  }
};

// Subscribe to task updates with filters
export const subscribeToTasksWithFilters = (
  callback: (tasks: Task[]) => void,
  filters?: {
    status?: string[];
    priority?: string[];
    search?: string;
    assignedTo?: string[];
  },
  limit = 20,
) => {
  let query = firestore().collection('tasks').orderBy('updatedAt', 'desc');

  // Apply status filter if provided and not empty
  if (filters?.status && filters.status.length === 1) {
    query = query.where('status', '==', filters.status[0]);
  }

  // Apply priority filter if provided and not empty
  if (filters?.priority && filters.priority.length === 1) {
    query = query.where('priority', '==', filters.priority[0]);
  }

  // Apply assignee filter if provided and not empty
  if (filters?.assignedTo && filters.assignedTo.length === 1) {
    query = query.where('assignedTo', 'array-contains', filters.assignedTo[0]);
  }

  // Apply limit
  query = query.limit(limit);

  // Create the listener
  return query.onSnapshot(
    snapshot => {
      let tasks = snapshot.docs.map(
        doc =>
          ({
            ...doc.data(),
            id: doc.id,
          } as Task),
      );

      // Apply search filter client-side if provided
      if (filters?.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        tasks = tasks.filter(
          task =>
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description &&
              task.description.toLowerCase().includes(searchTerm)),
        );
      }

      // Apply multiple status filters client-side if needed
      if (filters?.status && filters.status.length > 1) {
        tasks = tasks.filter(task => filters.status!.includes(task.status));
      }

      // Apply multiple priority filters client-side if needed
      if (filters?.priority && filters.priority.length > 1) {
        tasks = tasks.filter(task => filters.priority!.includes(task.priority));
      }

      // Apply multiple assignee filters client-side if needed
      if (filters?.assignedTo && filters.assignedTo.length > 1) {
        tasks = tasks.filter(task =>
          filters.assignedTo!.some(userId => task.assignedTo?.includes(userId)),
        );
      }

      callback(tasks);
    },
    error => {
      console.error('Error in subscribeToTasksWithFilters:', error);
    },
  );
};

// Get task statistics for a specific time period
export const getTasksStats = async (
  startDate: string,
  endDate: string,
  userId?: string,
): Promise<{
  completed: number;
  created: number;
  inProgress: number;
  overdue: number;
}> => {
  try {
    // Base query - either all tasks or just user's tasks
    let query = firestore().collection('tasks');

    if (userId) {
      query = query.where('assignedTo', 'array-contains', userId);
    }

    const querySnapshot = await query.get();
    const tasks = querySnapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Task),
    );

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    // Filter tasks within the time period
    const filteredTasks = tasks.filter(task => {
      const createdTime = new Date(task.createdAt).getTime();
      return createdTime >= start && createdTime <= end;
    });

    // Calculate statistics
    const completed = filteredTasks.filter(
      task => task.status === 'Completed',
    ).length;
    const created = filteredTasks.length;
    const inProgress = filteredTasks.filter(
      task => task.status !== 'Completed' && task.status !== 'To Do',
    ).length;
    const overdue = filteredTasks.filter(
      task =>
        task.status !== 'Completed' &&
        task.dueDate &&
        new Date(task.dueDate).getTime() < now,
    ).length;

    return {
      completed,
      created,
      inProgress,
      overdue,
    };
  } catch (error) {
    console.error('Error in getTasksStats:', error);
    throw error;
  }
};

// Export the existing functions for backward compatibility
export * from './taskServices';
