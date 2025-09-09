import { apiClient } from './api/client';
import { PaginatedResponse, QueryParams } from '../types/api.types';
import { 
    Task, 
    CreateTaskData, 
    UpdateTaskData 
} from '../types/task.types';

class TaskService {
    private readonly baseURL = '/tasks';

    // Listar tarefas com paginação
    async getAll(params?: QueryParams): Promise<PaginatedResponse<Task>> {
        if (!params) {
            const response = await apiClient.get<PaginatedResponse<Task>>(this.baseURL);
            return response.data;
        }

        // Constrói query string igual ao frontend
        const queryParams = new URLSearchParams({
            page: (params.page || 0).toString(),
            size: (params.size || 10).toString(),
        });

        // Adiciona parâmetros de ordenação no formato correto
        if (params.sort && params.sort.length > 0) {
            const sortParams = params.sort.map(s => `${s.field},${s.direction}`);
            sortParams.forEach(sortParam => {
                queryParams.append('sort', sortParam);
            });
        }

        // Adiciona parâmetros de filtro
        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value && value.toString().trim() !== '') {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const response = await apiClient.get<PaginatedResponse<Task>>(`${this.baseURL}?${queryParams.toString()}`);
        return response.data;
    }

    // Buscar tarefa por ID
    async getById(id: string | number): Promise<Task> {
        const response = await apiClient.get<Task>(`${this.baseURL}/${id}`);
        return response.data;
    }

    // Criar nova tarefa
    async create(data: CreateTaskData): Promise<Task> {
        const response = await apiClient.post<Task>(this.baseURL, data);
        return response.data;
    }

    // Atualizar tarefa
    async update(id: string | number, data: UpdateTaskData): Promise<Task> {
        const response = await apiClient.put<Task>(`${this.baseURL}/${id}`, data);
        return response.data;
    }

    // Deletar tarefa
    async delete(id: string | number): Promise<void> {
        await apiClient.delete(`${this.baseURL}/${id}`);
    }
}

export const taskService = new TaskService();