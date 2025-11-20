import apiClient from './api';
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
  ApiResponse,
  ProjectFilters
} from '../types/api';

/**
 * Projects API Service
 * Handles all project-related API calls
 */
class ProjectsService {
  private readonly basePath = '/projects';

  /**
   * Get all projects
   */
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sourceSystem) params.append('sourceSystem', filters.sourceSystem);
    if (filters?.targetSystem) params.append('targetSystem', filters.targetSystem);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<Project[]>>(
      `${this.basePath}${params.toString() ? '?' + params.toString() : ''}`
    );
    
    return response.data.data || [];
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: number): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(
      `${this.basePath}/${id}`
    );
    
    if (!response.data.data) {
      throw new Error('Project not found');
    }
    
    return response.data.data;
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(
      this.basePath,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create project');
    }
    
    return response.data.data;
  }

  /**
   * Update an existing project
   */
  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(
      `${this.basePath}/${id}`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update project');
    }
    
    return response.data.data;
  }

  /**
   * Update project status
   */
  async updateProjectStatus(id: number, status: ProjectStatus): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `${this.basePath}/${id}/status`,
      { status }
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update project status');
    }
    
    return response.data.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
  }

  /**
   * Get project statistics
   */
  async getProjectStats(id: number): Promise<{
    connectionCount: number;
    migrationJobCount: number;
    totalMappings: number;
    completedMappings: number;
  }> {
    const project = await this.getProject(id);
    
    return {
      connectionCount: project.connection_count || 0,
      migrationJobCount: project.migration_job_count || 0,
      totalMappings: 0, // TODO: Get from mappings API
      completedMappings: 0
    };
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
export default projectsService;
