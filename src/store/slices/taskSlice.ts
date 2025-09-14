import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import firestoreService from '../../firebase/firestoreService';
import { Task } from '../../types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Utility function to ensure all date fields are strings
const sanitizeTaskDates = (task: any): Task => {
  return {
    ...task,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
    dueDate: task.dueDate && task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
  };
};

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error?: string;
  // pagination flags (cursor kept module-local to avoid non-serializable state)
  hasMore: boolean;
  loadingMore: boolean;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  hasMore: true,
  loadingMore: false,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await firestoreService.getTasks();
      return tasks.map(task => sanitizeTaskDates(task));
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch tasks');
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    { rejectWithValue },
  ) => {
    try {
      const result = await firestoreService.createTask(taskData);
      return sanitizeTaskDates(result);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to create task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (
    { taskId, updates }: { taskId: string; updates: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      await firestoreService.updateTask(taskId, updates);
      const t = await firestoreService.getTask(taskId);
      if (!t) throw new Error('Task not found after update');
      return sanitizeTaskDates(t);
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to update task');
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await firestoreService.deleteTask(taskId);
      return taskId;
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to delete task');
    }
  },
);

let unsubscribeAll: null | (() => void) = null;
export const subscribeToTasks = createAsyncThunk(
  'tasks/subscribe',
  async (_, { dispatch }) => {
    if (unsubscribeAll) unsubscribeAll();
    unsubscribeAll = firestoreService.onTasksChange(tasks => {
      dispatch(setTasks(tasks));
    });
  },
);

export const unsubscribeFromTasks = createAsyncThunk(
  'tasks/unsubscribe',
  async () => {
    if (unsubscribeAll) {
      unsubscribeAll();
      unsubscribeAll = null;
    }
  },
);

// Module-level pagination cursor to keep Redux state serializable
let lastTaskDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null = null;
const DEFAULT_PAGE_SIZE = 20;

export const fetchTasksPage = createAsyncThunk(
  'tasks/fetchPage',
  async (
    args: { reset?: boolean; pageSize?: number } | undefined,
    { rejectWithValue },
  ) => {
    const reset = args?.reset === true;
    const pageSize = args?.pageSize ?? DEFAULT_PAGE_SIZE;
    try {
      const { tasks, lastDoc } = await firestoreService.getTasksPaginated(
        pageSize,
        reset ? undefined : lastTaskDoc ?? undefined,
      );
      lastTaskDoc = lastDoc;
      const sanitizedTasks = tasks.map(task => sanitizeTaskDates(task));
      return { tasks: sanitizedTasks, reset, pageSize } as {
        tasks: Task[];
        reset: boolean;
        pageSize: number;
      };
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Failed to fetch tasks page');
    }
  },
);

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload.map(task => sanitizeTaskDates(task));
      // reset pagination flags when tasks are set via subscription
      state.hasMore = false;
      state.loadingMore = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, s => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.tasks = (a.payload as Task[]).map(task => sanitizeTaskDates(task));
        // infer pagination flags
        s.hasMore = (a.payload as Task[]).length >= DEFAULT_PAGE_SIZE;
        s.loadingMore = false;
      })
      .addCase(fetchTasks.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(fetchTasksPage.pending, (s, action) => {
        const reset = (action.meta.arg as any)?.reset === true;
        if (reset) {
          s.loading = true;
        } else {
          s.loadingMore = true;
        }
        s.error = undefined;
      })
      .addCase(fetchTasksPage.fulfilled, (s, a) => {
        const { tasks, reset, pageSize } = a.payload as {
          tasks: Task[];
          reset: boolean;
          pageSize: number;
        };
        if (reset) {
          s.tasks = tasks.map(task => sanitizeTaskDates(task));
          s.loading = false;
        } else {
          // append while avoiding duplicates by id
          const existingIds = new Set(s.tasks.map(t => t.id));
          const toAppend = tasks.filter(t => !existingIds.has(t.id)).map(task => sanitizeTaskDates(task));
          s.tasks = [...s.tasks, ...toAppend];
          s.loadingMore = false;
        }
        s.hasMore = tasks.length >= pageSize;
      })
      .addCase(fetchTasksPage.rejected, (s, a) => {
        s.loading = false;
        s.loadingMore = false;
        s.error = a.payload as string;
      })
      .addCase(createTask.fulfilled, (s, a) => {
        s.tasks.unshift(sanitizeTaskDates(a.payload as Task));
      })
      .addCase(updateTask.fulfilled, (s, a) => {
        const updated = sanitizeTaskDates(a.payload as Task);
        const idx = s.tasks.findIndex(t => t.id === updated.id);
        if (idx !== -1) s.tasks[idx] = updated;
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.tasks = s.tasks.filter(t => t.id !== (a.payload as string));
      });
  },
});

export const { setTasks } = slice.actions;
export default slice.reducer;
