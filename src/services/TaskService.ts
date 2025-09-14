import { firebase } from '@react-native-firebase/firestore';
import { Task } from '../types';
import { TaskFormData } from '../types/tasks';

const firestore = firebase.firestore();
const taskCollection = firestore.collection('tasks');

class TaskService {
  async getTasks(filters?: {
    projectId?: string;
    assignedTo?: string;
    status?: string;
  }): Promise<Task[]> {
    try {
      let query: any = taskCollection;

      if (filters) {
        if (filters.projectId) {
          query = query.where('projectId', '==', filters.projectId);
        }

        if (filters.assignedTo) {
          query = query.where(
            'assignedTo',
            'array-contains',
            filters.assignedTo,
          );
        }

        if (filters.status && filters.status !== 'all') {
          query = query.where('status', '==', filters.status);
        }
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();

      const tasks: Task[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();

        tasks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo || [],
          comments: data.comments || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          dueDate: data.dueDate,
          viewCount: data.viewCount || 0,
          attachments: data.attachments || [],
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const doc = await taskCollection.doc(taskId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();

      return {
        id: doc.id,
        title: data?.title,
        description: data?.description,
        status: data?.status,
        priority: data?.priority,
        assignedTo: data?.assignedTo || [],
        comments: data?.comments || [],
        createdBy: data?.createdBy,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
        dueDate: data?.dueDate,
        viewCount: data?.viewCount || 0,
        attachments: data?.attachments || [],
      };
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  }

  async createTask(taskData: TaskFormData, creatorId: string): Promise<string> {
    try {
      const now = firebase.firestore.Timestamp.now();

      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        priority: taskData.priority || 'Medium',
        assignedTo: taskData.assignedTo || [],
        comments: [],
        createdBy: creatorId,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : null,
        viewCount: 0,
        attachments: [],
      };

      const docRef = await taskCollection.add(newTask);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(
    taskId: string,
    taskData: Partial<TaskFormData>,
  ): Promise<void> {
    try {
      const now = firebase.firestore.Timestamp.now();

      const updateData: any = {
        ...taskData,
        updatedAt: now.toDate().toISOString(),
      };

      // Convert JavaScript Date to ISO string for dueDate if it exists
      if (taskData.dueDate) {
        updateData.dueDate = taskData.dueDate.toISOString();
      }

      await taskCollection.doc(taskId).update(updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await taskCollection.doc(taskId).delete();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Setup a real-time listener for tasks
  listenToTasks(
    callback: (tasks: Task[]) => void,
    filters?: {
      projectId?: string;
      assignedTo?: string;
      status?: string;
    },
  ) {
    let query: any = taskCollection;

    if (filters) {
      if (filters.projectId) {
        query = query.where('projectId', '==', filters.projectId);
      }

      if (filters.assignedTo) {
        query = query.where('assignedTo', 'array-contains', filters.assignedTo);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.where('status', '==', filters.status);
      }
    }

    return query.orderBy('createdAt', 'desc').onSnapshot(
      (snapshot: any) => {
        const tasks: Task[] = [];

        snapshot.forEach((doc: any) => {
          const data = doc.data();

          tasks.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assignedTo: data.assignedTo || [],
            comments: data.comments || [],
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            dueDate: data.dueDate,
            viewCount: data.viewCount || 0,
            attachments: data.attachments || [],
          });
        });

        callback(tasks);
      },
      (error: any) => {
        console.error('Error listening to tasks:', error);
      },
    );
  }
}

export const taskService = new TaskService();
