// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'https://a99de7f1676d.ngrok-free.app/api' : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'DevQuote Mobile',
  VERSION: '1.0.0',
  DEVELOPER: 'DevQuote Team',
} as const;

// Colors (matching frontend theme)
export const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#1e40af',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  danger: '#dc2626',
  info: '#3b82f6',
  
  // Grayscale
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Gradients
  gradient: {
    primary: ['#3b82f6', '#8b5cf6'],
    secondary: ['#8b5cf6', '#ec4899'],
    success: ['#10b981', '#059669'],
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    heading: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      h5: 18,
      h6: 16,
    },
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Screen dimensions
export const SCREEN = {
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
} as const;

// Animation durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Status colors for tasks and deliveries
export const STATUS_COLORS = {
  PENDING: '#f59e0b',
  DEVELOPMENT: '#3b82f6',
  DELIVERED: '#10b981',
  HOMOLOGATION: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  PRODUCTION: '#8b5cf6',
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  URGENT: '#ef4444',
} as const;