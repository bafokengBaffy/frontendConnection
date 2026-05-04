/**
 * Application Constants
 */

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Career Connect Lesotho',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  baseUrl: import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000',
  apiUrl:
    import.meta.env.VITE_APP_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5001',
  wsUrl: import.meta.env.VITE_APP_WEBSOCKET_URL || 'ws://localhost:5002',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  STUDENT: 'student',
  COMPANY: 'company',
  INSTITUTE: 'institute',
  MENTOR: 'mentor',
  YOUTH: 'youth',
  ENTREPRENEUR: 'entrepreneur',
};

export const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // Content management
  CREATE_CONTENT: 'create_content',
  READ_CONTENT: 'read_content',
  UPDATE_CONTENT: 'update_content',
  DELETE_CONTENT: 'delete_content',

  // Application management
  CREATE_APPLICATION: 'create_application',
  READ_APPLICATION: 'read_application',
  UPDATE_APPLICATION: 'update_application',
  DELETE_APPLICATION: 'delete_application',
  REVIEW_APPLICATION: 'review_application',

  // Job management
  CREATE_JOB: 'create_job',
  READ_JOB: 'read_job',
  UPDATE_JOB: 'update_job',
  DELETE_JOB: 'delete_job',
  APPLY_JOB: 'apply_job',

  // Funding management
  CREATE_FUNDING: 'create_funding',
  READ_FUNDING: 'read_funding',
  UPDATE_FUNDING: 'update_funding',
  DELETE_FUNDING: 'delete_funding',
  APPLY_FUNDING: 'apply_funding',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',

  // System
  MANAGE_SYSTEM: 'manage_system',
  VIEW_LOGS: 'view_logs',
  MANAGE_ROLES: 'manage_roles',
};

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
  REMOTE: 'remote',
};

export const FUNDING_TYPES = {
  GRANT: 'grant',
  LOAN: 'loan',
  EQUITY: 'equity',
  CROWDFUNDING: 'crowdfunding',
  INCUBATION: 'incubation',
  ACCELERATOR: 'accelerator',
};

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const DATE_FORMATS = {
  DEFAULT: 'YYYY-MM-DD',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm:ss',
  TIME_SHORT: 'HH:mm',
};

export const STORAGE_KEYS = {
  AUTH: 'cc_auth',
  THEME: 'cc_theme',
  USER: 'cc_user',
  SETTINGS: 'cc_settings',
  CACHE_PREFIX: 'cc_cache_',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
  },
  JOBS: {
    BASE: '/jobs',
    APPLY: '/jobs/apply',
    SAVE: '/jobs/save',
    MATCHES: '/jobs/matches',
  },
  APPLICATIONS: {
    BASE: '/applications',
    REVIEW: '/applications/review',
    STATUS: '/applications/status',
  },
  COMPANIES: {
    BASE: '/companies',
    JOBS: '/companies/jobs',
    CANDIDATES: '/companies/candidates',
  },
  INSTITUTES: {
    BASE: '/institutes',
    COURSES: '/institutes/courses',
    STUDENTS: '/institutes/students',
  },
  FUNDING: {
    BASE: '/funding',
    APPLY: '/funding/apply',
    OPPORTUNITIES: '/funding/opportunities',
  },
  MENTORS: {
    BASE: '/mentors',
    SESSIONS: '/mentors/sessions',
    REQUESTS: '/mentors/requests',
  },
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
  },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_IN_USE: 'Email is already in use.',
  WEAK_PASSWORD: 'Password is too weak.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
};

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  LOGOUT: 'Successfully logged out.',
  REGISTER: 'Successfully registered.',
  PROFILE_UPDATE: 'Profile updated successfully.',
  APPLICATION_SUBMITTED: 'Application submitted successfully.',
  JOB_CREATED: 'Job created successfully.',
  FUNDING_APPLIED: 'Funding application submitted successfully.',
};
