import { apiClient } from './api';
import { PaginatedResponse, QueryParams } from '../types/api.types';
import { 
    Requester, 
    CreateRequesterData, 
    UpdateRequesterData 
} from '../types/requester.types';

class RequesterService {
    private readonly baseURL = '/requesters';

    // Listar solicitantes com paginação
    async getAll(params?: QueryParams): Promise<PaginatedResponse<Requester>> {
        const response = await apiClient.get<PaginatedResponse<Requester>>(this.baseURL, { params });
        return response.data;
    }

    // Buscar solicitante por ID
    async getById(id: string | number): Promise<Requester> {
        const response = await apiClient.get<Requester>(`${this.baseURL}/${id}`);
        return response.data;
    }

    // Criar novo solicitante
    async create(data: CreateRequesterData): Promise<Requester> {
        const response = await apiClient.post<Requester>(this.baseURL, data);
        return response.data;
    }

    // Atualizar solicitante
    async update(id: string | number, data: UpdateRequesterData): Promise<Requester> {
        const response = await apiClient.put<Requester>(`${this.baseURL}/${id}`, data);
        return response.data;
    }

    // Deletar solicitante
    async delete(id: string | number): Promise<void> {
        await apiClient.delete(`${this.baseURL}/${id}`);
    }


}

export const requesterService = new RequesterService();