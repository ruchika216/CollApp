import { Dispatch } from 'redux';
import { taskService } from '../../services/TaskService';
import { setTasks, setLoading } from '../slices/taskSlice';
import { Task } from '../../types';
import { TaskFormData } from '../../types/tasks';

// Fetch tasks with optional filters
export const fetchTasks =
  (filters?: { projectId?: string; assignedTo?: string; status?: string }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setLoading(true));
      const tasks = await taskService.getTasks(filters);
      dispatch(setTasks(tasks));
      dispatch(setLoading(false));
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      dispatch(setLoading(false));
      return [];
    }
  };

// Setup a real-time listener for tasks
export const listenToTasks =
  (filters?: { projectId?: string; assignedTo?: string; status?: string }) =>
  (dispatch: Dispatch) => {
    dispatch(setLoading(true));

    const unsubscribe = taskService.listenToTasks((tasks: Task[]) => {
      dispatch(setTasks(tasks));
      dispatch(setLoading(false));
    }, filters);

    return unsubscribe;
  };

// Create a new task
export const createTask =
  (taskData: TaskFormData, userId: string) => async (_dispatch: Dispatch) => {
    try {
      const taskId = await taskService.createTask(taskData, userId);
      return { success: true, taskId };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error };
    }
  };

// Update an existing task
export const updateTask =
  (taskId: string, taskData: Partial<TaskFormData>) =>
  async (_dispatch: Dispatch) => {
    try {
      await taskService.updateTask(taskId, taskData);
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error };
    }
  };

// Delete a task
export const deleteTask = (taskId: string) => async (_dispatch: Dispatch) => {
  try {
    await taskService.deleteTask(taskId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error };
  }
};
