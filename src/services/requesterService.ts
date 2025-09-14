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
        if (!params) {
            const response = await apiClient.get<PaginatedResponse<Requester>>(this.baseURL);
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

        const response = await apiClient.get<PaginatedResponse<Requester>>(`${this.baseURL}?${queryParams.toString()}`);
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