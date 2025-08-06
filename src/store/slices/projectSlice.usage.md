# Enhanced Project Slice Usage Guide

This document provides comprehensive examples of how to use the enhanced projectsSlice with async thunks for subtasks, comments, and file attachments functionality.

## Overview

The enhanced projectsSlice provides:
- Complete CRUD operations for projects
- Subtask management with Firestore sync
- Comment system with real-time updates
- File attachment system with Firebase Storage integration
- Automatic progress calculation based on subtask completion
- Comprehensive error handling and loading states

## State Structure

```typescript
interface ProjectState {
  projects: Project[];           // All projects (Admin view)
  selectedProject: Project | null; // Currently selected project
  userProjects: Project[];       // User-specific projects (Developer view)
  loading: boolean;             // Loading state for async operations
  error: string | null;         // Error messages
  filters: {                    // Filtering options
    status: string[];
    priority: string[];
    assignedTo: string[];
  };
}
```

## Async Thunks Usage

### 1. Project Operations

#### Fetch All Projects (Admin)
```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProjects } from '../store/slices/projectSlice';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector(state => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  if (loading) return <Text>Loading projects...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={projects}
      renderItem={({ item }) => <ProjectCard project={item} />}
    />
  );
};
```

#### Fetch User Projects (Developer)
```typescript
import { fetchUserProjects } from '../store/slices/projectSlice';

const DeveloperDashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const { userProjects, loading } = useAppSelector(state => state.projects);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserProjects(user.uid));
    }
  }, [dispatch, user?.uid]);

  return (
    <View>
      {userProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </View>
  );
};
```

#### Create New Project
```typescript
import { createProject } from '../store/slices/projectSlice';

const ProjectForm = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    // ... other fields
  });

  const handleSubmit = async () => {
    try {
      const newProject = await dispatch(createProject({
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        priority: formData.priority as Project['priority'],
        status: 'Pending',
        files: [],
        images: [],
        comments: [],
        subTasks: [],
        startDate: new Date().toISOString(),
        endDate: formData.endDate,
        progress: 0,
        estimatedHours: formData.estimatedHours,
        actualHours: 0,
        createdBy: user.uid,
      })).unwrap();
      
      Alert.alert('Success', 'Project created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
};
```

#### Update Project
```typescript
import { updateProjectAsync } from '../store/slices/projectSlice';

const ProjectEditor = ({ projectId }) => {
  const dispatch = useAppDispatch();

  const handleStatusUpdate = async (newStatus: Project['status']) => {
    try {
      await dispatch(updateProjectAsync({
        projectId,
        updates: { 
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      })).unwrap();
      
      Alert.alert('Success', 'Project status updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDescriptionUpdate = async (newDescription: string) => {
    try {
      await dispatch(updateProjectAsync({
        projectId,
        updates: { 
          description: newDescription,
          updatedAt: new Date().toISOString()
        }
      })).unwrap();
      
      Alert.alert('Success', 'Project description updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
};
```

### 2. SubTask Operations

#### Create SubTask
```typescript
import { createSubTaskAsync, updateProjectProgress } from '../store/slices/projectSlice';

const SubTaskManager = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);

  const handleCreateSubTask = async (title: string, description: string) => {
    try {
      await dispatch(createSubTaskAsync({
        projectId,
        subTaskData: {
          title,
          description,
          completed: false,
          assignedTo: user.uid,
          createdBy: user.uid,
        }
      })).unwrap();

      // Auto-update project progress
      dispatch(updateProjectProgress(projectId));
      
      Alert.alert('Success', 'Subtask created successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <Button title="Add SubTask" onPress={() => handleCreateSubTask(title, desc)} />
    </View>
  );
};
```

#### Toggle SubTask Completion
```typescript
import { updateSubTaskAsync, updateProjectProgress } from '../store/slices/projectSlice';

const SubTaskItem = ({ projectId, subTask }) => {
  const dispatch = useAppDispatch();

  const handleToggleComplete = async () => {
    try {
      await dispatch(updateSubTaskAsync({
        projectId,
        subTaskId: subTask.id,
        updates: { 
          completed: !subTask.completed,
          updatedAt: new Date().toISOString()
        }
      })).unwrap();

      // Auto-update project progress
      dispatch(updateProjectProgress(projectId));
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  return (
    <TouchableOpacity onPress={handleToggleComplete}>
      <View style={styles.subtaskItem}>
        <Checkbox checked={subTask.completed} />
        <Text style={[
          styles.subtaskTitle,
          subTask.completed && styles.completedTask
        ]}>
          {subTask.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

#### Bulk SubTask Updates
```typescript
import { updateMultipleSubTasks } from '../store/slices/projectSlice';

const BulkSubTaskManager = ({ projectId, subTasks }) => {
  const dispatch = useAppDispatch();

  const handleMarkAllComplete = () => {
    const updates = subTasks
      .filter(st => !st.completed)
      .map(st => ({
        subTaskId: st.id,
        updates: { 
          completed: true,
          updatedAt: new Date().toISOString()
        }
      }));

    dispatch(updateMultipleSubTasks({ projectId, updates }));
    dispatch(updateProjectProgress(projectId));
  };

  const handleMarkAllIncomplete = () => {
    const updates = subTasks
      .filter(st => st.completed)
      .map(st => ({
        subTaskId: st.id,
        updates: { 
          completed: false,
          updatedAt: new Date().toISOString()
        }
      }));

    dispatch(updateMultipleSubTasks({ projectId, updates }));
    dispatch(updateProjectProgress(projectId));
  };
};
```

### 3. Comment Operations

#### Add Comment
```typescript
import { addCommentAsync } from '../store/slices/projectSlice';

const CommentSystem = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const [comment, setComment] = useState('');

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await dispatch(addCommentAsync({
        projectId,
        commentData: {
          text: comment.trim(),
          userId: user.uid,
          userName: user.name || user.email || 'Unknown User',
        }
      })).unwrap();

      setComment('');
      Alert.alert('Success', 'Comment added successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment..."
        multiline
      />
      <Button title="Add Comment" onPress={handleAddComment} />
    </View>
  );
};
```

#### Display Comments
```typescript
const CommentsList = ({ projectId }) => {
  const project = useAppSelector(state => 
    state.projects.projects.find(p => p.id === projectId) ||
    state.projects.selectedProject
  );

  const comments = project?.comments || [];

  return (
    <FlatList
      data={comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
      renderItem={({ item }) => (
        <View style={styles.commentItem}>
          <Text style={styles.commentAuthor}>{item.userName}</Text>
          <Text style={styles.commentDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      )}
      keyExtractor={item => item.id}
    />
  );
};
```

### 4. File Operations

#### Upload File
```typescript
import { uploadFileToProject } from '../store/slices/projectSlice';
import { launchImageLibrary } from 'react-native-image-picker';

const FileUploader = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);

  const handleFileUpload = () => {
    launchImageLibrary(
      { 
        mediaType: 'mixed',
        quality: 0.7 as any,
      },
      async (response) => {
        if (response.assets && response.assets[0]) {
          const file = response.assets[0];
          
          try {
            await dispatch(uploadFileToProject({
              projectId,
              fileData: {
                filePath: file.uri!,
                fileName: file.fileName || `file_${Date.now()}`,
                fileType: file.type || 'unknown',
                fileSize: file.fileSize || 0,
              },
              userId: user.uid,
            })).unwrap();

            Alert.alert('Success', 'File uploaded successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to upload file');
          }
        }
      }
    );
  };

  return (
    <TouchableOpacity onPress={handleFileUpload}>
      <Icon name="attach" size={24} />
      <Text>Upload File</Text>
    </TouchableOpacity>
  );
};
```

#### Remove File
```typescript
import { removeFileFromProjectAsync } from '../store/slices/projectSlice';

const FileItem = ({ projectId, file, fileType }) => {
  const dispatch = useAppDispatch();

  const handleRemoveFile = async () => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeFileFromProjectAsync({
                projectId,
                fileId: file.id,
                fileType,
              })).unwrap();

              Alert.alert('Success', 'File removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove file');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.fileItem}>
      <Text>{file.name}</Text>
      <TouchableOpacity onPress={handleRemoveFile}>
        <Icon name="delete" size={20} />
      </TouchableOpacity>
    </View>
  );
};
```

## Complete Component Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchUserProjects,
  createSubTaskAsync,
  updateSubTaskAsync,
  addCommentAsync,
  uploadFileToProject,
  updateProjectProgress
} from '../store/slices/projectSlice';

const EnhancedProjectManager = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const { userProjects, loading, error } = useAppSelector(state => state.projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserProjects(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleSubTaskToggle = async (projectId: string, subTaskId: string, completed: boolean) => {
    try {
      await dispatch(updateSubTaskAsync({
        projectId,
        subTaskId,
        updates: { completed: !completed }
      })).unwrap();

      // Update project progress
      dispatch(updateProjectProgress(projectId));
    } catch (error) {
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const handleAddComment = async (projectId: string, text: string) => {
    try {
      await dispatch(addCommentAsync({
        projectId,
        commentData: {
          text,
          userId: user.uid,
          userName: user.name || user.email || 'Unknown User',
        }
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleCreateSubTask = async (projectId: string, title: string) => {
    try {
      await dispatch(createSubTaskAsync({
        projectId,
        subTaskData: {
          title,
          description: '',
          completed: false,
          assignedTo: user.uid,
          createdBy: user.uid,
        }
      })).unwrap();

      dispatch(updateProjectProgress(projectId));
    } catch (error) {
      Alert.alert('Error', 'Failed to create subtask');
    }
  };

  if (loading) {
    return <Text>Loading projects...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        My Projects ({userProjects.length})
      </Text>
      
      <FlatList
        data={userProjects}
        renderItem={({ item: project }) => (
          <TouchableOpacity 
            style={styles.projectCard}
            onPress={() => setSelectedProject(project)}
          >
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectStatus}>Status: {project.status}</Text>
            <Text style={styles.projectProgress}>Progress: {project.progress}%</Text>
            
            {/* SubTasks Preview */}
            <View style={styles.subTasksPreview}>
              <Text>SubTasks: {project.subTasks.filter(st => st.completed).length}/{project.subTasks.length}</Text>
            </View>
            
            {/* Comments Preview */}
            <View style={styles.commentsPreview}>
              <Text>Comments: {project.comments.length}</Text>
            </View>
            
            {/* Files Preview */}
            <View style={styles.filesPreview}>
              <Text>Files: {project.files.length + project.images.length}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  projectProgress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subTasksPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  filesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EnhancedProjectManager;
```

## Error Handling

```typescript
const ProjectErrorHandler = () => {
  const error = useAppSelector(state => state.projects.error);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) {
      Alert.alert('Project Error', error, [
        { text: 'OK', onPress: () => dispatch(setError(null)) }
      ]);
    }
  }, [error, dispatch]);

  return null;
};
```

## Performance Optimizations

```typescript
// Use memoization for expensive calculations
const ProjectStats = React.memo(({ project }: { project: Project }) => {
  const stats = useMemo(() => ({
    totalSubTasks: project.subTasks.length,
    completedSubTasks: project.subTasks.filter(st => st.completed).length,
    totalComments: project.comments.length,
    totalFiles: project.files.length + project.images.length,
  }), [project.subTasks, project.comments, project.files, project.images]);

  return (
    <View>
      <Text>Tasks: {stats.completedSubTasks}/{stats.totalSubTasks}</Text>
      <Text>Comments: {stats.totalComments}</Text>
      <Text>Files: {stats.totalFiles}</Text>
    </View>
  );
});
```

This enhanced projectsSlice provides a comprehensive solution for managing projects with subtasks, comments, and file attachments, ensuring proper synchronization between Redux state and Firestore database.