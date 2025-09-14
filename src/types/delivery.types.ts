import { BaseEntity } from './api.types';

// Delivery status
export type DeliveryStatus = 'PENDING' | 'DEVELOPMENT' | 'DELIVERED' | 'HOMOLOGATION' | 'APPROVED' | 'REJECTED' | 'PRODUCTION';

// Delivery interfaces
export interface Delivery extends BaseEntity {
  id: number;
  taskId: number;
  taskName?: string;
  taskCode?: string;
  status: DeliveryStatus;
  totalItems?: number;
  pendingCount?: number;
  developmentCount?: number;
  deliveredCount?: number;
  homologationCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  productionCount?: number;
  items?: DeliveryItem[];
}

export interface DeliveryItem extends BaseEntity {
  id: number;
  deliveryId: number;
  projectId: number;
  taskId: number;
  taskName?: string;
  taskCode?: string;
  projectName?: string;
  status: DeliveryStatus;
  branch?: string;
  sourceBranch?: string;
  pullRequest?: string;
  script?: string;
  startedAt?: string;
  finishedAt?: string;
}

// Status counters
export interface DeliveryStatusCount {
  pending: number;
  development: number;
  delivered: number;
  homologation: number;
  approved: number;
  rejected: number;
  production: number;
}

// Group response for listings
export interface DeliveryGroupResponse {
  taskId: number;
  taskName: string;
  taskCode: string;
  taskValue?: number;
  deliveryId?: number;
  deliveryStatus: DeliveryStatus;
  calculatedDeliveryStatus?: string;
  totalItems?: number;
  statusCounts: DeliveryStatusCount;
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  createdAt?: string;
  updatedAt?: string;
  deliveries: Delivery[];
}

// Create/Update types
export interface CreateDeliveryData {
  taskId: number;
  status?: DeliveryStatus;
  items: CreateDeliveryItemData[];
}

export interface CreateDeliveryItemData {
  projectId: number;
  status?: DeliveryStatus;
  branch?: string;
  sourceBranch?: string;
  pullRequest?: string;
  script?: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface UpdateDeliveryData {
  taskId?: number;
  status?: DeliveryStatus;
  items?: UpdateDeliveryItemData[];
}

export interface UpdateDeliveryItemData extends Partial<CreateDeliveryItemData> {
  id?: number;
}

// Filter types
export interface DeliveryFilters {
  status?: DeliveryStatus | string;
  deliveryStatus?: DeliveryStatus | string;
  taskId?: number;
  taskName?: string;
  taskCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryItemFilters {
  status?: DeliveryStatus[];
  deliveryId?: number;
  projectId?: number;
  taskId?: number;
  branch?: string;
  pullRequest?: string;
}

// Statistics
export interface DeliveryStats {
  total: number;
  byStatus: Record<DeliveryStatus, number>;
  delivered: number;
  approved: number;
  rejected: number;
  inProgress: number;
}

// Form data
export interface DeliveryFormData {
  selectedTask?: {
    id: number;
    title: string;
    code: string;
  };
  selectedProjects: number[];
  initialStatus: DeliveryStatus;
  itemsData: Map<number, DeliveryItemFormData>;
}

export interface DeliveryItemFormData {
  id?: number;
  deliveryId?: number;
  projectId: number;
  projectName?: string;
  status: DeliveryStatus;
  branch?: string;
  sourceBranch?: string;
  pullRequest?: string;
  script?: string;
  startedAt?: string;
  finishedAt?: string;
}

// Available data for creation
export interface AvailableTask {
  id: number;
  title: string;
  code: string;
  amount?: number;
  requester?: {
    name: string;
  };
  hasDelivery?: boolean;
}

export interface AvailableProject {
  id: number;
  name: string;
  description?: string;
  repositoryUrl?: string;
}

// Creation state
export interface DeliveryCreationState {
  step: 1 | 2 | 3 | 4;
  isLoading: boolean;
  selectedTask: AvailableTask | null;
  selectedProjects: AvailableProject[];
  deliveryId?: number;
  items: DeliveryItem[];
}

// Labels for display
export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Pendente',
  DEVELOPMENT: 'Desenvolvimento',
  DELIVERED: 'Entregue',
  HOMOLOGATION: 'Homologação',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  PRODUCTION: 'Produção',
};