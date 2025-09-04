import { BaseEntity } from './api.types';

// Task status and types
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'BUG' | 'ENHANCEMENT' | 'NEW_FEATURE';

// Task interfaces
export interface Task extends BaseEntity {
  id: number;
  title: string;
  description?: string;
  code: string;
  priority: TaskPriority;
  taskType: TaskType;
  systemModule?: string;
  amount?: number;
  link?: string;
  meetingLink?: string;
  requester?: Requester;
  requesterId: number;
  requesterName?: string;
  subTasks?: SubTask[];
  deliveries?: any[]; // Will be typed with delivery types
}

export interface SubTask extends BaseEntity {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  taskId: number;
  task?: Task;
}

export interface Requester extends BaseEntity {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

// Create/Update types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  code: string;
  priority: TaskPriority;
  taskType: TaskType;
  systemModule?: string;
  amount?: number;
  link?: string;
  meetingLink?: string;
  requesterId: number;
  subTasks?: CreateSubTaskRequest[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: number;
}

export interface CreateSubTaskRequest {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateSubTaskRequest extends Partial<CreateSubTaskRequest> {
  id: number;
}

// Filter types
export interface TaskFilters {
  id?: number;
  title?: string;
  code?: string;
  priority?: TaskPriority;
  taskType?: TaskType;
  systemModule?: string;
  requesterName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Response types
export interface TaskResponse extends Task {
  subTasksCount?: number;
  completedSubTasks?: number;
  pendingSubTasks?: number;
}

// Statistics
export interface TaskStatistics {
  total: number;
  byPriority: Record<TaskPriority, number>;
  byType: Record<TaskType, number>;
  completed: number;
  pending: number;
}

// Form data
export interface TaskFormData {
  title: string;
  description: string;
  code: string;
  priority: TaskPriority;
  taskType: TaskType;
  systemModule: string;
  amount: string; // String for form input
  link: string;
  meetingLink: string;
  requesterId: number | null;
  subTasks: SubTaskFormData[];
}

export interface SubTaskFormData {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
}

// Labels for display
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: '🟢 Baixa',
  MEDIUM: '🟡 Média',
  HIGH: '🟠 Alta',
  URGENT: '🔴 Urgente',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  BUG: '🐛 Bug',
  ENHANCEMENT: '📈 Melhoria',
  NEW_FEATURE: '✨ Nova Funcionalidade',
};