import { BaseEntity } from './api.types';

// Prioridade da tarefa (seguindo padrão do frontend)
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Tipo de tarefa (seguindo padrão do frontend)
export type TaskType = 'BUG' | 'ENHANCEMENT' | 'NEW_FEATURE' | '';

// Interface principal para Task (completa seguindo padrão do frontend)
export interface Task extends BaseEntity {
    id: number;
    code: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    taskType?: TaskType;
    requesterId: number | string;
    requesterName?: string;
    systemModule?: string;
    serverOrigin?: string;
    meetingLink?: string;
    link?: string;
    subTasks?: SubTask[];
}

// Subtarefa (simplificada)
export interface SubTask extends BaseEntity {
    id: number;
    taskId: number;
    title: string;
    description?: string;
    amount: number;
}

// Tipo para criação de tarefa (completo seguindo padrão do frontend)
export interface CreateTaskData {
    code: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    taskType?: TaskType;
    requesterId: number | string;
    systemModule?: string;
    serverOrigin?: string;
    meetingLink?: string;
    link?: string;
    hasSubTasks?: boolean;
    amount?: number;
    subTasks?: CreateSubTaskData[];
}

// Tipo para criação de subtarefa
export interface CreateSubTaskData {
    title: string;
    description?: string;
    amount: number;
    taskId?: number | null;
}

// Tipo para atualização de tarefa (completo seguindo padrão do frontend)
export interface UpdateTaskData {
    code?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    taskType?: TaskType;
    requesterId: number | string;
    systemModule?: string;
    serverOrigin?: string;
    meetingLink?: string;
    link?: string;
    subTasks?: UpdateSubTaskData[];
}

// Tipo para atualização de subtarefa
export interface UpdateSubTaskData {
    id?: number; // Para identificar subtarefa existente
    title: string;
    description?: string;
    amount: number;
}