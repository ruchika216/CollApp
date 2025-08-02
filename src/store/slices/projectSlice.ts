
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectComment, ProjectFile } from '../../types';

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
  clearFilters
} = projectSlice.actions;
export default projectSlice.reducer;
