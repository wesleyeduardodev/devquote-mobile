import { BaseEntity } from './api.types';

// Interface principal para Requester (baseada na API real)
export interface Requester extends BaseEntity {
    name: string;
    email: string;
    phone?: string;
}

// Tipo para criação de solicitante (baseado no RequesterRequest da API)
export interface CreateRequesterData {
    name: string;
    email: string;
    phone?: string;
}

// Tipo para atualização de solicitante
export interface UpdateRequesterData extends Partial<CreateRequesterData> {
    id?: never; // Impede atualização do ID
}

// Filtros para listagem de solicitantes
export interface RequesterFilters {
    name?: string;
    email?: string;
    phone?: string;
    search?: string;
}

// Form data para formulário (simplificado)
export interface RequesterFormData {
    name: string;
    email: string;
    phone: string;
}