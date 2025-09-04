import axios, { 
  AxiosInstance, 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../constants';
import { ApiError, HttpResponse } from '../../types';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add authentication token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get access token from storage:', error);
    }
    
    // Log requests in development
    if (__DEV__) {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('📤 Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (__DEV__) {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`, {
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Log errors in development
    if (__DEV__) {
      console.error('📥 Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          // Try to refresh the access token
          const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
          
          // Store new tokens
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          if (newRefreshToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        
        // You might want to trigger a logout event here
        // EventEmitter.emit('LOGOUT');
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Client class
export class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axiosInstance;
  }
  
  // Generic HTTP methods
  async get<T = any>(url: string, config?: any): Promise<HttpResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return this.formatResponse(response);
  }
  
  async post<T = any>(url: string, data?: any, config?: any): Promise<HttpResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return this.formatResponse(response);
  }
  
  async put<T = any>(url: string, data?: any, config?: any): Promise<HttpResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return this.formatResponse(response);
  }
  
  async patch<T = any>(url: string, data?: any, config?: any): Promise<HttpResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return this.formatResponse(response);
  }
  
  async delete<T = any>(url: string, config?: any): Promise<HttpResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return this.formatResponse(response);
  }
  
  // Helper method to format response
  private formatResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }
  
  // Helper method to handle API errors
  static handleApiError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'Erro interno do servidor',
      status: error.response?.status || 500,
      timestamp: new Date().toISOString(),
      path: error.config?.url || 'unknown',
    };
    
    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      if (typeof errorData === 'string') {
        apiError.message = errorData;
      } else if (errorData.message) {
        apiError.message = errorData.message;
      } else if (errorData.error) {
        apiError.message = errorData.error;
      }
      
      if (errorData.errors) {
        apiError.errors = errorData.errors;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      apiError.message = 'Erro de rede. Verifique sua conexão.';
    } else if (error.code === 'TIMEOUT') {
      apiError.message = 'Tempo limite excedido. Tente novamente.';
    }
    
    return apiError;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();