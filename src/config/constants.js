/**
 * Application-wide constants
 * Centralized for easy maintenance and consistency
 */

export const USER_TYPES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
  MENTOR: 'mentor',
  INSTITUTION: 'institution',
  ENTREPRENEUR: 'entrepreneur',
};

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Career Connect Lesotho',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5173',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

export const SECURITY_CONFIG = {
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 3600000, // 1 hour
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
  lockoutDuration: parseInt(import.meta.env.VITE_LOCKOUT_DURATION) || 900000, // 15 minutes
  enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
  enableStrictSecurity: import.meta.env.VITE_ENABLE_STRICT_SECURITY === 'true',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Protected routes
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  COMPANY_DASHBOARD: '/company/dashboard',
  MENTOR_DASHBOARD: '/mentor/dashboard',
  INSTITUTION_DASHBOARD: '/institution/dashboard',
  ENTREPRENEUR_DASHBOARD: '/entrepreneur/dashboard',

  // Common routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  SEARCH: '/search',

  // AI routes
  AI_DASHBOARD: '/ai/dashboard',
  AI_INSIGHTS: '/ai/insights',
  AI_RECOMMENDATIONS: '/ai/recommendations',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'career_connect_auth_token',
  USER_PREFERENCES: 'career_connect_preferences',
  THEME: 'career_connect_theme',
  SESSION_DATA: 'career_connect_session',
};

export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER,
};

export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  phone: {
    pattern: /^\+?[0-9]{8,15}$/, // FIXED: Added escape for + character
  },
};

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
};
