
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectComment, ProjectFile, SubTask } from '../../types';
import firestoreService from '../../firebase/firestoreService';
import { uploadFileToStorage } from '../../services/fileUpload';
import {
  addSubTaskToProject,
  updateSubTaskInProject,
  deleteSubTaskFromProject,
  addCommentToProject,
  addImageToProject,
  addFileToProjectFiles,
  updateProjectInFirestore,
} from '../../firebase/firestore';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  userProjects: Project[]; // Projects assigned to current user
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    assignedTo: string[];
  };
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  userProjects: [],
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    assignedTo: [],
  },
};

// Async Thunks for Project Operations

/**
 * Fetch all projects (Admin)
 */
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await firestoreService.getProjects();
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

/**
 * Fetch user-specific projects (Developer)
 */
export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUserProjects',
  async (userId: string, { rejectWithValue }) => {
    try {
      const projects = await firestoreService.getProjects({ assignedTo: userId });
      return projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user projects');
    }
  }
);

/**
 * Fetch single project by ID
 */
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const project = await firestoreService.getProject(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    } catch (error: any) {
      console.error('Error in fetchProjectById:', error);
      return rejectWithValue(error.message || 'Failed to fetch project');
    }
  }
);

/**
 * Create a new project
 */
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newProject = await firestoreService.createProject(projectData);
      return newProject;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create project');
    }
  }
);

/**
 * Update project
 */
export const updateProjectAsync = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }, { rejectWithValue }) => {
    try {
      await firestoreService.updateProject(projectId, updates);
      const updatedProject = await firestoreService.getProject(projectId);
      if (!updatedProject) {
        throw new Error('Failed to fetch updated project');
      }
      return updatedProject;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update project');
    }
  }
);

/**
 * Delete project
 */
export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await firestoreService.deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete project');
    }
  }
);

// Async Thunks for SubTask Operations

/**
 * Create a new subtask
 */
export const createSubTaskAsync = createAsyncThunk(
  'projects/createSubTask',
  async ({ projectId, subTaskData }: { 
    projectId: string; 
    subTaskData: Omit<SubTask, 'id' | 'createdAt' | 'updatedAt'> 
  }, { rejectWithValue }) => {
    try {
      const newSubTask = await addSubTaskToProject(projectId, subTaskData);
      return { projectId, subTask: newSubTask };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create subtask');
    }
  }
);

/**
 * Update a subtask
 */
export const updateSubTaskAsync = createAsyncThunk(
  'projects/updateSubTask',
  async ({ projectId, subTaskId, updates }: { 
    projectId: string; 
    subTaskId: string; 
    updates: Partial<SubTask> 
  }, { rejectWithValue }) => {
    try {
      await updateSubTaskInProject(projectId, subTaskId, updates);
      return { projectId, subTaskId, updates };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subtask');
    }
  }
);

/**
 * Delete a subtask
 */
export const deleteSubTaskAsync = createAsyncThunk(
  'projects/deleteSubTask',
  async ({ projectId, subTaskId }: { 
    projectId: string; 
    subTaskId: string; 
  }, { rejectWithValue }) => {
    try {
      await deleteSubTaskFromProject(projectId, subTaskId);
      return { projectId, subTaskId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete subtask');
    }
  }
);

// Async Thunks for Comment Operations

/**
 * Add a comment to project
 */
export const addCommentAsync = createAsyncThunk(
  'projects/addComment',
  async ({ projectId, commentData }: { 
    projectId: string; 
    commentData: Omit<ProjectComment, 'id' | 'createdAt'> 
  }, { rejectWithValue }) => {
    try {
      const newComment = await addCommentToProject(projectId, commentData);
      return { projectId, comment: newComment };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

// Async Thunks for File Operations

/**
 * Upload and attach file to project
 */
export const uploadFileToProject = createAsyncThunk(
  'projects/uploadFileToProject',
  async ({ projectId, fileData, userId }: { 
    projectId: string; 
    fileData: {
      filePath: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    };
    userId: string;
  }, { rejectWithValue }) => {
    try {
      // Upload file to Firebase Storage
      const uploadedFile = await uploadFileToStorage({
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        fileSize: fileData.fileSize,
        projectId,
        userId,
      });

      // Add file to project in Firestore
      const fileForProject = {
        name: uploadedFile.name,
        url: uploadedFile.url,
        type: uploadedFile.type,
        size: uploadedFile.size,
      };

      const isImage = fileData.fileType.startsWith('image/');
      
      if (isImage) {
        await addImageToProject(projectId, fileForProject);
      } else {
        await addFileToProjectFiles(projectId, fileForProject);
      }

      return { 
        projectId, 
        file: uploadedFile, 
        fileType: isImage ? 'images' as const : 'files' as const 
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload file');
    }
  }
);

/**
 * Remove file from project
 */
export const removeFileFromProjectAsync = createAsyncThunk(
  'projects/removeFileFromProject',
  async ({ projectId, fileId, fileType }: { 
    projectId: string; 
    fileId: string; 
    fileType: 'files' | 'images';
  }, { rejectWithValue }) => {
    try {
      if (fileType === 'images') {
        // TODO: Implement removeImageFromProject
        console.warn('removeImageFromProject not implemented');
      } else {
        // TODO: Implement removeFileFromProject
        console.warn('removeFileFromProject not implemented');
      }
      
      return { projectId, fileId, fileType };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove file');
    }
  }
);

/**
 * Bulk update project progress based on subtask completion
 */
export const updateProjectProgress = createAsyncThunk(
  'projects/updateProjectProgress',
  async (projectId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const project = state.projects.projects.find((p: Project) => p.id === projectId) ||
                    state.projects.selectedProject;
      
      if (!project) {
        throw new Error('Project not found');
      }

      const totalSubTasks = project.subTasks.length;
      const completedSubTasks = project.subTasks.filter((st: SubTask) => st.status === 'Done').length;
      const progress = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

      const updatedProject = {
        ...project,
        progress,
        updatedAt: new Date().toISOString()
      };
      await updateProjectInFirestore(updatedProject);
      
      return { projectId, progress };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update project progress');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserProjects: (state, action: PayloadAction<Project[]>) => {
      state.userProjects = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      // Update selected project if it's the same
      if (state.selectedProject?.id === action.payload.id) {
        state.selectedProject = action.payload;
      }
      // Update user projects
      const userIndex = state.userProjects.findIndex(p => p.id === action.payload.id);
      if (userIndex !== -1) {
        state.userProjects[userIndex] = action.payload;
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      state.userProjects = state.userProjects.filter(p => p.id !== action.payload);
      if (state.selectedProject?.id === action.payload) {
        state.selectedProject = null;
      }
    },
    addComment: (state, action: PayloadAction<{projectId: string, comment: ProjectComment}>) => {
      const { projectId, comment } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.comments.push(comment);
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject.comments.push(comment);
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    addFile: (state, action: PayloadAction<{projectId: string, file: ProjectFile, type: 'files' | 'images'}>) => {
      const { projectId, file, type } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project[type].push(file);
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject[type].push(file);
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    updateProjectStatus: (state, action: PayloadAction<{projectId: string, status: Project['status']}>) => {
      const { projectId, status } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.status = status;
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject.status = status;
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<ProjectState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: [],
        priority: [],
        assignedTo: [],
      };
    },
    addSubTask: (state, action: PayloadAction<{projectId: string, subTask: SubTask}>) => {
      const { projectId, subTask } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.subTasks.push(subTask);
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject.subTasks.push(subTask);
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    updateSubTask: (state, action: PayloadAction<{projectId: string, subTaskId: string, updates: Partial<SubTask>}>) => {
      const { projectId, subTaskId, updates } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        const subTaskIndex = project.subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex !== -1) {
          project.subTasks[subTaskIndex] = { ...project.subTasks[subTaskIndex], ...updates, updatedAt: new Date().toISOString() };
          project.updatedAt = new Date().toISOString();
        }
      }
      if (state.selectedProject?.id === projectId) {
        const subTaskIndex = state.selectedProject.subTasks.findIndex(st => st.id === subTaskId);
        if (subTaskIndex !== -1) {
          state.selectedProject.subTasks[subTaskIndex] = { ...state.selectedProject.subTasks[subTaskIndex], ...updates, updatedAt: new Date().toISOString() };
          state.selectedProject.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteSubTask: (state, action: PayloadAction<{projectId: string, subTaskId: string}>) => {
      const { projectId, subTaskId } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.subTasks = project.subTasks.filter(st => st.id !== subTaskId);
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject.subTasks = state.selectedProject.subTasks.filter(st => st.id !== subTaskId);
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    // Enhanced reducers for file operations
    removeFile: (state, action: PayloadAction<{projectId: string, fileId: string, fileType: 'files' | 'images'}>) => {
      const { projectId, fileId, fileType } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project[fileType] = project[fileType].filter(f => f.id !== fileId);
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject[fileType] = state.selectedProject[fileType].filter(f => f.id !== fileId);
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    updateProjectProgress: (state, action: PayloadAction<{projectId: string, progress: number}>) => {
      const { projectId, progress } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        project.progress = progress;
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        state.selectedProject.progress = progress;
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
    // Batch operations
    updateMultipleSubTasks: (state, action: PayloadAction<{projectId: string, updates: {subTaskId: string, updates: Partial<SubTask>}[]}>) => {
      const { projectId, updates } = action.payload;
      const project = state.projects.find(p => p.id === projectId);
      if (project) {
        updates.forEach(({ subTaskId, updates: subTaskUpdates }) => {
          const subTaskIndex = project.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex !== -1) {
            project.subTasks[subTaskIndex] = { 
              ...project.subTasks[subTaskIndex], 
              ...subTaskUpdates, 
              updatedAt: new Date().toISOString() 
            };
          }
        });
        project.updatedAt = new Date().toISOString();
      }
      if (state.selectedProject?.id === projectId) {
        updates.forEach(({ subTaskId, updates: subTaskUpdates }) => {
          const subTaskIndex = state.selectedProject!.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex !== -1) {
            state.selectedProject!.subTasks[subTaskIndex] = { 
              ...state.selectedProject!.subTasks[subTaskIndex], 
              ...subTaskUpdates, 
              updatedAt: new Date().toISOString() 
            };
          }
        });
        state.selectedProject.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User Projects
      .addCase(fetchUserProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.userProjects = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Project By ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Project
      .addCase(updateProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProject = action.payload;
        
        // Update in projects array
        const projectIndex = state.projects.findIndex(p => p.id === updatedProject.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = updatedProject;
        }
        
        // Update selected project if it's the same
        if (state.selectedProject?.id === updatedProject.id) {
          state.selectedProject = updatedProject;
        }
        
        // Update in user projects
        const userProjectIndex = state.userProjects.findIndex(p => p.id === updatedProject.id);
        if (userProjectIndex !== -1) {
          state.userProjects[userProjectIndex] = updatedProject;
        }
        
        state.error = null;
      })
      .addCase(updateProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete Project
      .addCase(deleteProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedProjectId = action.payload;
        
        state.projects = state.projects.filter(p => p.id !== deletedProjectId);
        state.userProjects = state.userProjects.filter(p => p.id !== deletedProjectId);
        
        if (state.selectedProject?.id === deletedProjectId) {
          state.selectedProject = null;
        }
        
        state.error = null;
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create SubTask
      .addCase(createSubTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, subTask } = action.payload;
        
        // Add to projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.subTasks.push(subTask);
          project.updatedAt = new Date().toISOString();
        }
        
        // Add to selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject.subTasks.push(subTask);
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Add to user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject.subTasks.push(subTask);
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(createSubTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update SubTask
      .addCase(updateSubTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, subTaskId, updates } = action.payload;
        
        // Update in projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          const subTaskIndex = project.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex !== -1) {
            project.subTasks[subTaskIndex] = { 
              ...project.subTasks[subTaskIndex], 
              ...updates, 
              updatedAt: new Date().toISOString() 
            };
            project.updatedAt = new Date().toISOString();
          }
        }
        
        // Update in selected project
        if (state.selectedProject?.id === projectId) {
          const subTaskIndex = state.selectedProject.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex !== -1) {
            state.selectedProject.subTasks[subTaskIndex] = { 
              ...state.selectedProject.subTasks[subTaskIndex], 
              ...updates, 
              updatedAt: new Date().toISOString() 
            };
            state.selectedProject.updatedAt = new Date().toISOString();
          }
        }
        
        // Update in user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          const subTaskIndex = userProject.subTasks.findIndex(st => st.id === subTaskId);
          if (subTaskIndex !== -1) {
            userProject.subTasks[subTaskIndex] = { 
              ...userProject.subTasks[subTaskIndex], 
              ...updates, 
              updatedAt: new Date().toISOString() 
            };
            userProject.updatedAt = new Date().toISOString();
          }
        }
        
        state.error = null;
      })
      .addCase(updateSubTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete SubTask
      .addCase(deleteSubTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, subTaskId } = action.payload;
        
        // Remove from projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.subTasks = project.subTasks.filter(st => st.id !== subTaskId);
          project.updatedAt = new Date().toISOString();
        }
        
        // Remove from selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject.subTasks = state.selectedProject.subTasks.filter(st => st.id !== subTaskId);
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Remove from user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject.subTasks = userProject.subTasks.filter(st => st.id !== subTaskId);
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(deleteSubTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add Comment
      .addCase(addCommentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, comment } = action.payload;
        
        // Add to projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.comments.push(comment);
          project.updatedAt = new Date().toISOString();
        }
        
        // Add to selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject.comments.push(comment);
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Add to user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject.comments.push(comment);
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(addCommentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Upload File to Project
      .addCase(uploadFileToProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFileToProject.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, file, fileType } = action.payload;
        
        // Add to projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project[fileType].push(file);
          project.updatedAt = new Date().toISOString();
        }
        
        // Add to selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject[fileType].push(file);
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Add to user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject[fileType].push(file);
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(uploadFileToProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove File from Project
      .addCase(removeFileFromProjectAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFileFromProjectAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, fileId, fileType } = action.payload;
        
        // Remove from projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project[fileType] = project[fileType].filter(f => f.id !== fileId);
          project.updatedAt = new Date().toISOString();
        }
        
        // Remove from selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject[fileType] = state.selectedProject[fileType].filter(f => f.id !== fileId);
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Remove from user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject[fileType] = userProject[fileType].filter(f => f.id !== fileId);
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(removeFileFromProjectAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update Project Progress
      .addCase(updateProjectProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectProgress.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, progress } = action.payload;
        
        // Update in projects array
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.progress = progress;
          project.updatedAt = new Date().toISOString();
        }
        
        // Update selected project
        if (state.selectedProject?.id === projectId) {
          state.selectedProject.progress = progress;
          state.selectedProject.updatedAt = new Date().toISOString();
        }
        
        // Update in user projects
        const userProject = state.userProjects.find(p => p.id === projectId);
        if (userProject) {
          userProject.progress = progress;
          userProject.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      })
      .addCase(updateProjectProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setProjects, 
  setUserProjects,
  setSelectedProject,
  addProject, 
  updateProject, 
  deleteProject,
  addComment,
  addFile,
  updateProjectStatus,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  removeFile,
  updateProjectProgress: updateProjectProgressSync,
  updateMultipleSubTasks
} = projectSlice.actions;

export default projectSlice.reducer;
