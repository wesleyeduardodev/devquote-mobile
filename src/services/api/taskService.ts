import { apiClient, ApiClient } from './client';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters, 
  TaskStatistics,
  PaginatedResponse,
  BaseFilters,
  SubTask,
  CreateSubTaskRequest,
  UpdateSubTaskRequest 
} from '../../types';

export class TaskService {
  private client: ApiClient;
  
  constructor() {
    this.client = apiClient;
  }
  
  // Get all tasks with pagination and filters
  async getAllTasks(params: BaseFilters & { filters?: TaskFilters }): Promise<PaginatedResponse<Task>> {
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
      
      const response = await this.client.get<PaginatedResponse<Task>>(`/tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get task by ID
  async getTaskById(id: number): Promise<Task> {
    try {
      const response = await this.client.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Create new task
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    try {
      const response = await this.client.post<Task>('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Update task
  async updateTask(id: number, taskData: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await this.client.put<Task>(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Delete task
  async deleteTask(id: number): Promise<void> {
    try {
      await this.client.delete(`/tasks/${id}`);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Bulk delete tasks
  async bulkDeleteTasks(ids: number[]): Promise<void> {
    try {
      await this.client.delete('/tasks/bulk', { data: { ids } });
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get task statistics
  async getTaskStatistics(): Promise<TaskStatistics> {
    try {
      const response = await this.client.get<TaskStatistics>('/tasks/statistics');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // SubTask operations
  
  // Get subtasks by task ID
  async getSubTasksByTaskId(taskId: number): Promise<SubTask[]> {
    try {
      const response = await this.client.get<SubTask[]>(`/tasks/${taskId}/subtasks`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Create subtask
  async createSubTask(taskId: number, subTaskData: CreateSubTaskRequest): Promise<SubTask> {
    try {
      const response = await this.client.post<SubTask>(`/tasks/${taskId}/subtasks`, subTaskData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Update subtask
  async updateSubTask(taskId: number, subTaskId: number, subTaskData: UpdateSubTaskRequest): Promise<SubTask> {
    try {
      const response = await this.client.put<SubTask>(`/tasks/${taskId}/subtasks/${subTaskId}`, subTaskData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Delete subtask
  async deleteSubTask(taskId: number, subTaskId: number): Promise<void> {
    try {
      await this.client.delete(`/tasks/${taskId}/subtasks/${subTaskId}`);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Toggle subtask completion
  async toggleSubTaskCompletion(taskId: number, subTaskId: number): Promise<SubTask> {
    try {
      const response = await this.client.patch<SubTask>(`/tasks/${taskId}/subtasks/${subTaskId}/toggle`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();