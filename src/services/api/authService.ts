import { apiClient, ApiClient } from './client';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  User 
} from '../../types';

export class AuthService {
  private client: ApiClient;
  
  constructor() {
    this.client = apiClient;
  }
  
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Refresh access token
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', refreshTokenData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error: any) {
      // Even if logout fails on server, we should clear local storage
      console.warn('Logout failed on server:', error);
    }
  }
  
  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await this.client.get<User>('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await this.client.put<User>('/auth/profile', userData);
      return response.data;
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    try {
      await this.client.post('/auth/change-password', data);
    } catch (error: any) {
      throw ApiClient.handleApiError(error);
    }
  }
  
  // Validate token
  async validateToken(): Promise<boolean> {
    try {
      await this.client.get('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();