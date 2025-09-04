import { apiClient, ApiClient } from './client';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectFilters, 
  ProjectStatistics,
  PaginatedResponse,
  BaseFilters 
} from '../../types';

export class ProjectService {
  private client: ApiClient;
  
  constructor() {
    this.client = apiClient;
  }
  
  // Get all projects with pagination and filters
  async getAllProjects(params: BaseFilters & { filters?: ProjectFilters }): Promise<PaginatedResponse<Project>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      queryParams.append('page', (params.page || 0).toString());
      queryParams.append('size', (params.size || 10).toString());
      
      // Sorting
      if (params.sort) {
        params.sort.forEach(sort => {
          queryParams.append('sort', `${sort.field},${sort.direction}`);
        });
      }
      
      // Filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await this.client.get<PaginatedResponse<Project>>(`/projects?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get all projects (without pagination) - for dropdowns/selects
  async getAllProjectsSimple(): Promise<Project[]> {
    try {
      const response = await this.client.get<Project[]>('/projects/all');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get project by ID
  async getProjectById(id: number): Promise<Project> {
    try {
      const response = await this.client.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Create new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    try {
      const response = await this.client.post<Project>('/projects', projectData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Update project
  async updateProject(id: number, projectData: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await this.client.put<Project>(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Delete project
  async deleteProject(id: number): Promise<void> {
    try {
      await this.client.delete(`/projects/${id}`);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Bulk delete projects
  async bulkDeleteProjects(ids: number[]): Promise<void> {
    try {
      await this.client.delete('/projects/bulk', { data: { ids } });
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Toggle project active status
  async toggleProjectStatus(id: number): Promise<Project> {
    try {
      const response = await this.client.patch<Project>(`/projects/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get project statistics
  async getProjectStatistics(): Promise<ProjectStatistics> {
    try {
      const response = await this.client.get<ProjectStatistics>('/projects/statistics');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();