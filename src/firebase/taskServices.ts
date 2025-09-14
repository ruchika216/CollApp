// Functions to handle Task operations in Firestore
import { firestore } from './firebaseConfig';
import { Task, TaskComment } from '../types';

// Get all tasks
export const getTasks = async (): Promise<Task[]> => {
  try {
    const querySnapshot = await firestore()
      .collection('tasks')
      .orderBy('updatedAt', 'desc')
      .get();
    return querySnapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Task),
    );
  } catch (error) {
    console.error('Error in getTasks:', error);
    throw error;
  }
};

// Get tasks for a specific user
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    const querySnapshot = await firestore()
      .collection('tasks')
      .where('assignedTo', 'array-contains', userId)
      .get();

    const tasks = querySnapshot.docs.map(
      doc =>
        ({
          ...doc.data(),
          id: doc.id,
        } as Task),
    );

    // Sort tasks by updatedAt in descending order on the client side
    return tasks.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error in getUserTasks:', error);
    throw error;
  }
};

// Delete a task
export const deleteTaskFromFirestore = async (
  taskId: string,
): Promise<boolean> => {
  try {
    await firestore().collection('tasks').doc(taskId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Create a new task
export const addTaskToFirestore = async (
  task: Omit<Task, 'id'>,
): Promise<Task> => {
  const taskRef = firestore().collection('tasks').doc();
  const taskWithId = { ...task, id: taskRef.id };

  try {
    await taskRef.set(taskWithId);
    return taskWithId;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update a task
export const updateTaskInFirestore = async (
  taskId: string,
  taskData: Partial<Task>,
): Promise<boolean> => {
  try {
    const updatedData = {
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    await firestore().collection('tasks').doc(taskId).update(updatedData);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  try {
    const doc = await firestore().collection('tasks').doc(taskId).get();
    if (!doc.exists) return null;

    return {
      ...doc.data(),
      id: doc.id,
    } as Task;
  } catch (error) {
    console.error('Error getting task by ID:', error);
    throw error;
  }
};

// Alias for getTaskById for backward compatibility
export const getTask = getTaskById;

// Alias for addTaskToFirestore for backward compatibility
export const createTask = addTaskToFirestore;

// Add a comment to a task
export const addCommentToTask = async (
  taskId: string,
  comment: Omit<TaskComment, 'id'>,
): Promise<TaskComment> => {
  try {
    // Generate a unique ID for the comment
    const commentId = firestore().collection('tasks').doc().id;
    const newComment = { ...comment, id: commentId };

    // Get the current task
    const taskDoc = await firestore().collection('tasks').doc(taskId).get();
    if (!taskDoc.exists) {
      throw new Error('Task not found');
    }

    const taskData = taskDoc.data() as Task;
    const comments = taskData.comments || [];

    // Add the new comment
    const updatedComments = [...comments, newComment];

    // Update the task with the new comment
    await firestore().collection('tasks').doc(taskId).update({
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    });

    return newComment;
  } catch (error) {
    console.error('Error adding comment to task:', error);
    throw error;
  }
};
