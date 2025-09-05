// Re-export all types for easy importing
export * from './api.types';
export * from './auth.types';
export * from './task.types';
export * from './delivery.types';
export * from './project.types';
export * from './requester.types';

// Navigation types
export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  
  // Main App Stack  
  MainTabs: undefined;
  
  // Task Stack
  TaskList: undefined;
  TaskDetails: { taskId: number };
  TaskCreate: undefined;
  TaskEdit: { taskId: number };
  
  // Delivery Stack
  DeliveryList: undefined;
  DeliveryDetails: { deliveryId: number };
  DeliveryCreate: undefined;
  DeliveryEdit: { deliveryId: number };
  
  // Project Stack
  ProjectList: undefined;
  ProjectDetails: { projectId: number };
  ProjectCreate: undefined;
  ProjectEdit: { id: string | number };
  
  // Requester Stack
  RequesterList: undefined;
  RequesterDetails: { id: string | number };
  RequesterCreate: undefined;
  RequesterEdit: { id: string | number };
  
  // Profile Stack
  Profile: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Deliveries: undefined;
  Projects: undefined;
  Requesters: undefined;
  Profile: undefined;
};

// Common component props
export interface CommonProps {
  testID?: string;
  accessibilityLabel?: string;
}

// Theme types
export interface Theme {
  colors: typeof import('../constants').COLORS;
  spacing: typeof import('../constants').SPACING;
  typography: typeof import('../constants').TYPOGRAPHY;
  animation: typeof import('../constants').ANIMATION;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic list state
export interface ListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    hasMore: boolean;
  };
  refreshing: boolean;
}