import { BaseEntity } from './api.types';

// Interface principal para Project (simplificada para mobile - seguindo padrão do frontend)
export interface Project extends BaseEntity {
  id: number;
  name: string;
  repositoryUrl?: string;
}

// Tipo para criação de projeto
export interface CreateProjectData {
  name: string;
  repositoryUrl?: string;
}

// Tipo para atualização de projeto  
export interface UpdateProjectData {
  name: string;
  repositoryUrl?: string;
}