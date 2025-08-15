/**
 * PROJECT API SERVICE
 * Handles all project-related API operations
 */

import { Project, ProjectFilters, EntityCreatePayload, EntityUpdatePayload } from '../../types';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { BaseApiService, retry } from './base';

export class ProjectApiService extends BaseApiService {
  private readonly endpoint = '/projects';

  /**
   * Get all projects with optional filtering
   */
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const response = await retry(() =>
      this.get<Project[]>(this.endpoint, filters)
    );
    
    // Convert to paginated response if needed
    if ('pagination' in response) {
      return response as PaginatedResponse<Project>;
    }
    
    return {
      data: response.data as Project[],
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  /**
   * Get a specific project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    return retry(() => this.get<Project>(`${this.endpoint}/${id}`));
  }

  /**
   * Create a new project
   */
  async createProject(data: EntityCreatePayload<Project>): Promise<ApiResponse<Project>> {
    return retry(() => this.post<Project>(this.endpoint, data));
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, data: EntityUpdatePayload<Project>): Promise<ApiResponse<Project>> {
    return retry(() => this.put<Project>(`${this.endpoint}/${id}`, data.data));
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return retry(() => this.delete<void>(`${this.endpoint}/${id}`));
  }

  /**
   * Add comment to project
   */
  async addComment(projectId: string, comment: string): Promise<ApiResponse<Project>> {
    return retry(() =>
      this.post<Project>(`${this.endpoint}/${projectId}/comments`, { comment })
    );
  }

  /**
   * Update project status
   */
  async updateStatus(
    projectId: string,
    status: Project['status']
  ): Promise<ApiResponse<Project>> {
    return retry(() =>
      this.patch<Project>(`${this.endpoint}/${projectId}/status`, { status })
    );
  }

  /**
   * Assign users to project
   */
  async assignUsers(
    projectId: string,
    userIds: string[]
  ): Promise<ApiResponse<Project>> {
    return retry(() =>
      this.patch<Project>(`${this.endpoint}/${projectId}/assign`, { userIds })
    );
  }

  /**
   * Upload project file
   */
  async uploadFile(
    projectId: string,
    file: File,
    type: 'file' | 'image' = 'file'
  ): Promise<ApiResponse<Project>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return retry(() =>
      this.post<Project>(`${this.endpoint}/${projectId}/files`, formData)
    );
  }

  /**
   * Get project analytics
   */
  async getProjectAnalytics(projectId: string): Promise<ApiResponse<any>> {
    return retry(() =>
      this.get<any>(`${this.endpoint}/${projectId}/analytics`)
    );
  }
}

// Singleton instance
export const projectApiService = new ProjectApiService();