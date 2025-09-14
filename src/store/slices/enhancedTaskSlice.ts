import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';
import {
  getTasksWithFilters,
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
  getTasksSummary,
  subscribeToTasksWithFilters,
} from '../../firebase/enhancedTaskServices';

// Types
interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error?: string;
  filters: {
    status: string[];
    priority: string[];
    search: string;
    assignedTo: string[];
  };
  summary: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    recentlyUpdated: Task[];
  } | null;
}

const initialState: TaskState = {
  tasks: [],
  filteredTasks: [],
  loading: false,
  filters: {
    status: [],
    priority: [],
    search: '',
    assignedTo: [],
  },
  summary: null,
};

// Create a task
export const createTask = createAsyncThunk(
  'enhancedTasks/create',
  async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue },
  ) => {
    try {
      const newTask = await addTaskToFirestore({
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return newTask;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create task');
    }
  },
);

// Update a task
export const updateTask = createAsyncThunk(
  'enhancedTasks/update',
  async (
    { taskId, updates }: { taskId: string; updates: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      await updateTaskInFirestore(taskId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Return combined data for the reducer
      return { id: taskId, ...updates };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to update task');
    }
  },
);

// Delete a task
export const deleteTask = createAsyncThunk(
  'enhancedTasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await deleteTaskFromFirestore(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to delete task');
    }
  },
);

// Fetch tasks with filters
export const fetchFilteredTasks = createAsyncThunk(
  'enhancedTasks/fetchFiltered',
  async (
    filters: {
      status?: string[];
      priority?: string[];
      search?: string;
      assignedTo?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const tasks = await getTasksWithFilters(filters);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch tasks');
    }
  },
);

// Fetch tasks summary
export const fetchTasksSummary = createAsyncThunk(
  'enhancedTasks/fetchSummary',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      const summary = await getTasksSummary(userId);
      return summary;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch tasks summary');
    }
  },
);

// Create the slice
const enhancedTaskSlice = createSlice({
  name: 'enhancedTasks',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<TaskState['filters']>>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: state => {
      state.filters = initialState.filters;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.filteredTasks = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Handle fetch filtered tasks
      .addCase(fetchFilteredTasks.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchFilteredTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredTasks = action.payload;
      })
      .addCase(fetchFilteredTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        // Update filtered tasks if it matches the current filters
        const newTask = action.payload;
        const { status, priority, search, assignedTo } = state.filters;

        let shouldInclude = true;

        // Check status filter
        if (status.length > 0 && !status.includes(newTask.status)) {
          shouldInclude = false;
        }

        // Check priority filter
        if (priority.length > 0 && !priority.includes(newTask.priority)) {
          shouldInclude = false;
        }

        // Check search filter
        if (search && search.trim() !== '') {
          const searchTerm = search.toLowerCase().trim();
          if (
            !newTask.title.toLowerCase().includes(searchTerm) &&
            !(
              newTask.description &&
              newTask.description.toLowerCase().includes(searchTerm)
            )
          ) {
            shouldInclude = false;
          }
        }

        // Check assignee filter
        if (assignedTo.length > 0) {
          const hasAssignee = assignedTo.some(userId =>
            newTask.assignedTo?.includes(userId),
          );
          if (!hasAssignee) {
            shouldInclude = false;
          }
        }

        if (shouldInclude) {
          state.filteredTasks.unshift(newTask);
        }
      })

      // Handle update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, ...updates } = action.payload as Task;

        // Update in tasks array
        const taskIndex = state.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            ...updates,
          };
        }

        // Update in filtered tasks array
        const filteredTaskIndex = state.filteredTasks.findIndex(
          t => t.id === id,
        );
        if (filteredTaskIndex !== -1) {
          state.filteredTasks[filteredTaskIndex] = {
            ...state.filteredTasks[filteredTaskIndex],
            ...updates,
          };
        }
      })

      // Handle delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskId = action.payload as string;
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        state.filteredTasks = state.filteredTasks.filter(t => t.id !== taskId);
      })

      // Handle fetch summary
      .addCase(fetchTasksSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

// Export actions and reducer
export const { setFilters, clearFilters, setTasks } = enhancedTaskSlice.actions;
export default enhancedTaskSlice.reducer;

// Set up a function to subscribe to tasks with filters
let unsubscribe: (() => void) | null = null;

export const startTasksSubscription = (
  dispatch: any,
  filters: TaskState['filters'],
  limit = 20,
) => {
  // Unsubscribe from previous subscription if it exists
  if (unsubscribe) {
    unsubscribe();
  }

  // Start new subscription
  unsubscribe = subscribeToTasksWithFilters(
    tasks => {
      dispatch(setTasks(tasks));
    },
    filters,
    limit,
  );

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
};
