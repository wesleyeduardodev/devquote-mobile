import { BaseEntity } from './api.types';

// Project interfaces
export interface Project extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  repositoryUrl?: string;
  active: boolean;
  tasks?: any[]; // Will be typed with task types if needed
  deliveryItems?: any[]; // Will be typed with delivery types if needed
}

// Create/Update types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  repositoryUrl?: string;
  active?: boolean;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: number;
}

// Filter types
export interface ProjectFilters {
  id?: number;
  name?: string;
  description?: string;
  repositoryUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Response types
export interface ProjectResponse extends Project {
  tasksCount?: number;
  deliveriesCount?: number;
}

// Form data
export interface ProjectFormData {
  name: string;
  description: string;
  repositoryUrl: string;
  active: boolean;
}

// Statistics
export interface ProjectStatistics {
  total: number;
  active: number;
  inactive: number;
  withTasks: number;
  withDeliveries: number;
}