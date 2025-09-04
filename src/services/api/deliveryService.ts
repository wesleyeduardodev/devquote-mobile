import { apiClient, ApiClient } from './client';
import { 
  Delivery, 
  DeliveryGroupResponse,
  CreateDeliveryData, 
  UpdateDeliveryData, 
  DeliveryFilters, 
  DeliveryStats,
  DeliveryStatusCount,
  PaginatedResponse,
  BaseFilters,
  AvailableTask,
  AvailableProject,
  DeliveryItem
} from '../../types';

export class DeliveryService {
  private client: ApiClient;
  
  constructor() {
    this.client = apiClient;
  }
  
  // Get all deliveries grouped by task
  async getAllGroupedByTask(params: BaseFilters & { filters?: DeliveryFilters }): Promise<PaginatedResponse<DeliveryGroupResponse>> {
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
      
      const response = await this.client.get<PaginatedResponse<DeliveryGroupResponse>>(`/deliveries/grouped-by-task?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get delivery by ID
  async getDeliveryById(id: number): Promise<Delivery> {
    try {
      const response = await this.client.get<Delivery>(`/deliveries/${id}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get delivery group details by task ID
  async getGroupDetailsByTaskId(taskId: number): Promise<DeliveryGroupResponse> {
    try {
      const response = await this.client.get<DeliveryGroupResponse>(`/deliveries/group/${taskId}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Create new delivery
  async createDelivery(deliveryData: CreateDeliveryData): Promise<Delivery> {
    try {
      const response = await this.client.post<Delivery>('/deliveries', deliveryData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Update delivery
  async updateDelivery(id: number, deliveryData: UpdateDeliveryData): Promise<Delivery> {
    try {
      const response = await this.client.put<Delivery>(`/deliveries/${id}`, deliveryData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Delete delivery
  async deleteDelivery(id: number): Promise<void> {
    try {
      await this.client.delete(`/deliveries/${id}`);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Bulk delete deliveries
  async bulkDeleteDeliveries(ids: number[]): Promise<void> {
    try {
      await this.client.delete('/deliveries/bulk', { data: { ids } });
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get global delivery statistics
  async getGlobalStatistics(): Promise<DeliveryStatusCount> {
    try {
      const response = await this.client.get<DeliveryStatusCount>('/deliveries/statistics');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get available tasks for delivery creation
  async getAvailableTasks(params: BaseFilters): Promise<PaginatedResponse<AvailableTask>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', (params.page || 0).toString());
      queryParams.append('size', (params.size || 50).toString());
      
      const response = await this.client.get<PaginatedResponse<AvailableTask>>(`/deliveries/available-tasks?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Get available projects for delivery creation
  async getAvailableProjects(): Promise<AvailableProject[]> {
    try {
      const response = await this.client.get<AvailableProject[]>('/deliveries/available-projects');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Delivery Items operations
  
  // Update delivery item
  async updateDeliveryItem(deliveryId: number, itemId: number, itemData: Partial<DeliveryItem>): Promise<DeliveryItem> {
    try {
      const response = await this.client.put<DeliveryItem>(`/deliveries/${deliveryId}/items/${itemId}`, itemData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Add delivery item
  async addDeliveryItem(deliveryId: number, itemData: Partial<DeliveryItem>): Promise<DeliveryItem> {
    try {
      const response = await this.client.post<DeliveryItem>(`/deliveries/${deliveryId}/items`, itemData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Remove delivery item
  async removeDeliveryItem(deliveryId: number, itemId: number): Promise<void> {
    try {
      await this.client.delete(`/deliveries/${deliveryId}/items/${itemId}`);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
}

// Export singleton instance
export const deliveryService = new DeliveryService();