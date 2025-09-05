// Base types for API responses
export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
  errors?: Record<string, string[]>;
}

// HTTP response wrapper
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Generic filter interface
export interface BaseFilters {
  page?: number;
  size?: number;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
}

// Query parameters for API calls
export interface QueryParams extends BaseFilters {
  search?: string;
  status?: string | string[];
  [key: string]: any;
}

// Sort interface
export interface SortInfo {
  field: string;
  direction: 'asc' | 'desc';
}

// Pagination info
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}