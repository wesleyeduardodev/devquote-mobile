import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  AuthState, 
  LoginRequest, 
  User, 
  ProfileType 
} from '../types';
import { authService } from '../services/api';
import { storageService } from '../services/storage';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  
  // Computed properties
  hasProfile: (profileType: ProfileType) => boolean;
  hasPermission: (resource: string, operation: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    tokens: {
      accessToken: null,
      refreshToken: null,
    },
    isAuthenticated: false,
    isLoading: false,
    error: null,
    
    // Actions
    login: async (credentials: LoginRequest) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await authService.login(credentials);
        
        // Store tokens in secure storage
        await storageService.storeTokens(
          response.access_token,
          response.refresh_token
        );
        
        // Store user data
        await storageService.storeUserData(response.user);
        
        set({
          user: response.user,
          tokens: {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao fazer login',
        });
        throw error;
      }
    },
    
    logout: async () => {
      try {
        set({ isLoading: true });
        
        // Call logout endpoint (optional - continues even if fails)
        try {
          await authService.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
        
        // Clear local storage
        await storageService.clearUserSession();
        
        set({
          user: null,
          tokens: {
            accessToken: null,
            refreshToken: null,
          },
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Erro ao fazer logout',
        });
        throw error;
      }
    },
    
    refreshAccessToken: async () => {
      try {
        const { refreshToken } = await storageService.getTokens();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await authService.refreshToken({
          refresh_token: refreshToken,
        });
        
        // Store new tokens
        await storageService.storeTokens(
          response.access_token,
          response.refresh_token
        );
        
        set(state => ({
          tokens: {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          },
        }));
      } catch (error: any) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, logout user
        get().logout();
        throw error;
      }
    },
    
    loadStoredAuth: async () => {
      try {
        set({ isLoading: true });
        
        const [tokens, userData] = await Promise.all([
          storageService.getTokens(),
          storageService.getUserData(),
        ]);
        
        if (tokens.accessToken && userData) {
          // Validate token with server
          const isValid = await authService.validateToken();
          
          if (isValid) {
            set({
              user: userData,
              tokens,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, try to refresh
            if (tokens.refreshToken) {
              await get().refreshAccessToken();
            } else {
              // No valid tokens, clear storage
              await storageService.clearUserSession();
            }
          }
        }
        
        set({ isLoading: false });
      } catch (error: any) {
        console.error('Failed to load stored auth:', error);
        await storageService.clearUserSession();
        set({
          user: null,
          tokens: { accessToken: null, refreshToken: null },
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
    
    updateUser: (user: User) => {
      set({ user });
      storageService.storeUserData(user).catch(console.error);
    },
    
    clearError: () => {
      set({ error: null });
    },
    
    // Computed properties
    hasProfile: (profileType: ProfileType) => {
      const { user } = get();
      if (!user?.profiles) return false;
      
      return user.profiles.some(profile => 
        profile.profileType === profileType || profile.profileType === 'ADMIN'
      );
    },
    
    hasPermission: (resource: string, operation: string) => {
      const { user } = get();
      if (!user?.profiles) return false;
      
      // Admin has all permissions
      if (user.profiles.some(p => p.profileType === 'ADMIN')) {
        return true;
      }
      
      return user.profiles.some(profile =>
        profile.permissions?.some(permission =>
          permission.resource.name.toUpperCase() === resource.toUpperCase() &&
          permission.operation.name.toUpperCase() === operation.toUpperCase()
        )
      );
    },
  }))
);

// Subscribe to auth state changes for automatic token refresh
useAuthStore.subscribe(
  (state) => state.tokens.accessToken,
  (accessToken, previousAccessToken) => {
    if (accessToken && accessToken !== previousAccessToken) {
      console.log('Access token updated');
    }
  }
);