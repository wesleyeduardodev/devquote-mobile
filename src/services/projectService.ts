import { apiClient } from './api/client';
import { PaginatedResponse, QueryParams } from '../types/api.types';
import { 
    Project, 
    CreateProjectData, 
    UpdateProjectData 
} from '../types/project.types';

class ProjectService {
    private readonly baseURL = '/projects';

    // Listar projetos com paginação
    async getAll(params?: QueryParams): Promise<PaginatedResponse<Project>> {
        const response = await apiClient.get<PaginatedResponse<Project>>(this.baseURL, { params });
        return response.data;
    }

    // Buscar projeto por ID
    async getById(id: string | number): Promise<Project> {
        const response = await apiClient.get<Project>(`${this.baseURL}/${id}`);
        return response.data;
    }

    // Criar novo projeto
    async create(data: CreateProjectData): Promise<Project> {
        const response = await apiClient.post<Project>(this.baseURL, data);
        return response.data;
    }

    // Atualizar projeto
    async update(id: string | number, data: UpdateProjectData): Promise<Project> {
        const response = await apiClient.put<Project>(`${this.baseURL}/${id}`, data);
        return response.data;
    }

    // Deletar projeto
    async delete(id: string | number): Promise<void> {
        await apiClient.delete(`${this.baseURL}/${id}`);
    }
}

export const projectService = new ProjectService();