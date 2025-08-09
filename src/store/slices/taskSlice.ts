import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, User } from '../../types';
import firestoreService from '../../firebase/firestoreService';

interface TaskState {
  tasks: Task[];
  userTasks: Task[]; // Tasks assigned to current user
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  realtimeListeners: {
    allTasks: (() => void) | null;
    userTasks: (() => void) | null;
  };
}

const initialState: TaskState = {
  tasks: [],
  userTasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  realtimeListeners: {
    allTasks: null,
    userTasks: null,
  },
};

// Async Thunks

/**
 * Fetch all tasks (Admin)
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchTasks: Attempting to fetch all tasks...');
      const tasks = await firestoreService.getTasks();
      console.log('fetchTasks: Successfully fetched', tasks.length, 'tasks');
      return tasks;
    } catch (error: any) {
      console.error('fetchTasks: Error occurred:', error);
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

/**
 * Fetch user-specific tasks
 */
export const fetchUserTasks = createAsyncThunk(
  'tasks/fetchUserTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const tasks = await firestoreService.getTasksForUser(userId);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user tasks');
    }
  }
);

/**
 * Fetch tasks by date
 */
export const fetchTasksByDate = createAsyncThunk(
  'tasks/fetchTasksByDate',
  async ({ userId, date }: { userId: string; date: string }, { rejectWithValue }) => {
    try {
      const tasks = await firestoreService.getTasksByDate(userId, date);
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks by date');
    }
  }
);

/**
 * Create a new task
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newTask = await firestoreService.createTask(taskData);
      return newTask;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

/**
 * Update task
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }, { rejectWithValue }) => {
    try {
      await firestoreService.updateTask(taskId, updates);
      const updatedTask = await firestoreService.getTask(taskId);
      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  }
);

/**
 * Delete task
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await firestoreService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  }
);

/**
 * Update task status (for developers)
 */
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }: { taskId: string; status: Task['status'] }, { rejectWithValue }) => {
    try {
      await firestoreService.updateTask(taskId, { status });
      const updatedTask = await firestoreService.getTask(taskId);
      if (!updatedTask) {
        throw new Error('Failed to fetch updated task');
      }
      return updatedTask;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  }
);

/**
 * Subscribe to real-time tasks updates (Admin)
 */
export const subscribeToTasks = createAsyncThunk(
  'tasks/subscribeToTasks',
  async (_, { dispatch, getState }) => {
    const state = getState() as any;
    
    // Unsubscribe from existing listener if any
    if (state.tasks.realtimeListeners.allTasks) {
      state.tasks.realtimeListeners.allTasks();
    }
    
    // Create new subscription
    const unsubscribe = firestoreService.onTasksChange((tasks) => {
      dispatch(setTasks(tasks));
    });
    
    return unsubscribe;
  }
);

/**
 * Subscribe to real-time user tasks updates
 */
export const subscribeToUserTasks = createAsyncThunk(
  'tasks/subscribeToUserTasks',
  async (userId: string, { dispatch, getState }) => {
    const state = getState() as any;
    
    // Unsubscribe from existing listener if any
    if (state.tasks.realtimeListeners.userTasks) {
      state.tasks.realtimeListeners.userTasks();
    }
    
    // Create new subscription
    const unsubscribe = firestoreService.onUserTasksChange((tasks) => {
      dispatch(setUserTasks(tasks));
    }, userId);
    
    return unsubscribe;
  }
);

/**
 * Unsubscribe from all real-time listeners
 */
export const unsubscribeFromTasks = createAsyncThunk(
  'tasks/unsubscribeFromTasks',
  async (_, { getState }) => {
    const state = getState() as any;
    
    if (state.tasks.realtimeListeners.allTasks) {
      state.tasks.realtimeListeners.allTasks();
    }
    
    if (state.tasks.realtimeListeners.userTasks) {
      state.tasks.realtimeListeners.userTasks();
    }
    
    return null;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserTasks: (state, action: PayloadAction<Task[]>) => {
      state.userTasks = action.payload;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTaskInState: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      
      // Update selected task if it's the same
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
      
      // Update user tasks
      const userIndex = state.userTasks.findIndex(t => t.id === action.payload.id);
      if (userIndex !== -1) {
        state.userTasks[userIndex] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.userTasks = state.userTasks.filter(t => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTasksListener: (state, action: PayloadAction<() => void>) => {
      state.realtimeListeners.allTasks = action.payload;
    },
    setUserTasksListener: (state, action: PayloadAction<() => void>) => {
      state.realtimeListeners.userTasks = action.payload;
    },
    clearListeners: (state) => {
      state.realtimeListeners.allTasks = null;
      state.realtimeListeners.userTasks = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.userTasks = action.payload;
        state.error = null;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Tasks By Date
      .addCase(fetchTasksByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.userTasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasksByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        
        // Update in tasks array
        const taskIndex = state.tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
        
        // Update selected task if it's the same
        if (state.selectedTask?.id === updatedTask.id) {
          state.selectedTask = updatedTask;
        }
        
        // Update in user tasks
        const userTaskIndex = state.userTasks.findIndex(t => t.id === updatedTask.id);
        if (userTaskIndex !== -1) {
          state.userTasks[userTaskIndex] = updatedTask;
        }
        
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;
        
        // Update in all relevant arrays
        const taskIndex = state.tasks.findIndex(t => t.id === updatedTask.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
        
        const userTaskIndex = state.userTasks.findIndex(t => t.id === updatedTask.id);
        if (userTaskIndex !== -1) {
          state.userTasks[userTaskIndex] = updatedTask;
        }
        
        if (state.selectedTask?.id === updatedTask.id) {
          state.selectedTask = updatedTask;
        }
        
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        state.tasks = state.tasks.filter(t => t.id !== taskId);
        state.userTasks = state.userTasks.filter(t => t.id !== taskId);
        if (state.selectedTask?.id === taskId) {
          state.selectedTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Subscribe to Tasks
      .addCase(subscribeToTasks.fulfilled, (state, action) => {
        state.realtimeListeners.allTasks = action.payload;
      })
      
      // Subscribe to User Tasks  
      .addCase(subscribeToUserTasks.fulfilled, (state, action) => {
        state.realtimeListeners.userTasks = action.payload;
      })
      
      // Unsubscribe from Tasks
      .addCase(unsubscribeFromTasks.fulfilled, (state) => {
        state.realtimeListeners.allTasks = null;
        state.realtimeListeners.userTasks = null;
      });
  },
});

export const {
  setTasks,
  setUserTasks,
  setSelectedTask,
  addTask,
  updateTaskInState,
  removeTask,
  setLoading,
  setError,
  clearError,
  setTasksListener,
  setUserTasksListener,
  clearListeners,
} = taskSlice.actions;

export default taskSlice.reducer;