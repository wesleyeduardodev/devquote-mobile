import { BaseEntity } from './api.types';

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// User types
export interface User extends BaseEntity {
  id: number;
  username: string;
  email: string;
  name?: string;
  active: boolean;
  profiles: Profile[];
}

export interface Profile extends BaseEntity {
  id: number;
  name: string;
  description?: string;
  profileType: ProfileType;
  permissions: Permission[];
}

export interface Permission extends BaseEntity {
  id: number;
  resource: Resource;
  operation: Operation;
  fieldPermissions?: FieldPermission[];
}

export interface Resource {
  id: number;
  name: string;
  description?: string;
}

export interface Operation {
  id: number;
  name: string;
  description?: string;
}

export interface FieldPermission {
  id: number;
  fieldName: string;
  permissionType: FieldPermissionType;
}

// Enums
export type ProfileType = 'ADMIN' | 'MANAGER' | 'USER' | 'CUSTOM';

export type FieldPermissionType = 'READ_ONLY' | 'EDITABLE' | 'HIDDEN';

// Auth state
export interface AuthState {
  user: User | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context
export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  hasProfile: (profileType: ProfileType) => boolean;
  hasPermission: (resource: string, operation: string) => boolean;
  updateUser: (user: User) => void;
  clearError: () => void;
}