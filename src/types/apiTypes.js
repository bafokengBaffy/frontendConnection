/**
 * API-related Type Definitions
 */

import { HttpMethod, HttpStatus, LogLevel } from './index';

// API endpoint
export const ApiEndpoint = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },

  // User endpoints
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    SETTINGS: '/api/users/settings',
    ACTIVITY: '/api/users/activity',
  },

  // Company endpoints
  COMPANIES: {
    BASE: '/api/companies',
    JOBS: '/api/companies/jobs',
    APPLICATIONS: '/api/companies/applications',
    CANDIDATES: '/api/companies/candidates',
  },

  // Job endpoints
  JOBS: {
    BASE: '/api/jobs',
    SEARCH: '/api/jobs/search',
    APPLY: '/api/jobs/apply',
    SAVE: '/api/jobs/save',
  },

  // Student endpoints
  STUDENTS: {
    BASE: '/api/students',
    COURSES: '/api/students/courses',
    TRANSCRIPT: '/api/students/transcript',
    APPLICATIONS: '/api/students/applications',
  },

  // Mentor endpoints
  MENTORS: {
    BASE: '/api/mentors',
    SESSIONS: '/api/mentors/sessions',
    REVIEWS: '/api/mentors/reviews',
    AVAILABILITY: '/api/mentors/availability',
  },

  // Payment endpoints
  PAYMENTS: {
    BASE: '/api/payments',
    TRANSACTIONS: '/api/payments/transactions',
    SUBSCRIPTIONS: '/api/payments/subscriptions',
    METHODS: '/api/payments/methods',
  },

  // Analytics endpoints
  ANALYTICS: {
    BASE: '/api/analytics',
    DASHBOARD: '/api/analytics/dashboard',
    REPORTS: '/api/analytics/reports',
    EXPORT: '/api/analytics/export',
  },

  // System endpoints
  SYSTEM: {
    HEALTH: '/api/system/health',
    METRICS: '/api/system/metrics',
    LOGS: '/api/system/logs',
    CONFIG: '/api/system/config',
  },
};

// API request
export const ApiRequest = {
  method: HttpMethod.GET,
  url: '',
  headers: {},
  params: {},
  query: {},
  body: null,
  timeout: 30000,
  withCredentials: true,
  responseType: 'json',
};

// API response
export const ApiResponse = {
  success: false,
  data: null,
  error: null,
  message: '',
  statusCode: HttpStatus.OK,
  timestamp: null,
  path: '',
  metadata: {
    page: null,
    limit: null,
    total: null,
    hasMore: false,
  },
};

// API error
export const ApiError = {
  code: '',
  message: '',
  details: null,
  stack: null,
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  timestamp: null,
  path: '',
};

// API pagination
export const ApiPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
  nextPage: null,
  previousPage: null,
};

// API sort
export const ApiSort = {
  field: '',
  order: 'asc',
};

// API filter
export const ApiFilter = {
  field: '',
  operator: 'eq', // eq, neq, gt, gte, lt, lte, in, nin, contains
  value: null,
};

// API range
export const ApiRange = {
  field: '',
  min: null,
  max: null,
};

// API search
export const ApiSearch = {
  query: '',
  fields: [],
  fuzzy: false,
};

// API metadata
export const ApiMetadata = {
  requestId: '',
  timestamp: null,
  duration: 0,
  version: '',
  environment: '',
};

// API webhook
export const ApiWebhook = {
  id: '',
  url: '',
  events: [],
  secret: '',
  active: true,
  retryCount: 3,
  timeout: 5000,
  headers: {},
  createdAt: null,
  updatedAt: null,
  lastTriggeredAt: null,
  lastResponse: null,
};

// API webhook delivery
export const ApiWebhookDelivery = {
  id: '',
  webhookId: '',
  event: '',
  payload: {},
  attempts: 0,
  status: 'pending', // pending, delivered, failed
  responseCode: null,
  responseBody: null,
  error: null,
  deliveredAt: null,
  createdAt: null,
};

// API rate limit
export const ApiRateLimit = {
  limit: 1000,
  remaining: 1000,
  reset: null,
  window: 3600000, // 1 hour in ms
};

// API cache
export const ApiCache = {
  enabled: true,
  ttl: 300000, // 5 minutes
  strategy: 'memory',
  key: '',
  tags: [],
};

// API retry
export const ApiRetry = {
  attempts: 3,
  backoff: 'exponential', // fixed, exponential
  delay: 1000,
  maxDelay: 30000,
  retryCondition: (error) => {
    return error.statusCode >= 500 || error.statusCode === 429;
  },
};

// API circuit breaker
export const ApiCircuitBreaker = {
  enabled: true,
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  halfOpenTimeout: 5000,
  status: 'closed', // closed, open, half_open
};

// API monitoring
export const ApiMonitoring = {
  enabled: true,
  metrics: {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
  },
  alerts: [],
};

// API logging
export const ApiLogging = {
  enabled: true,
  level: LogLevel.INFO,
  format: 'json',
  destination: 'console', // console, file, remote
  includeRequestBody: false,
  includeResponseBody: false,
  includeHeaders: false,
};

// API security
export const ApiSecurity = {
  rateLimiting: true,
  cors: true,
  csrf: true,
  xss: true,
  sqlInjection: true,
  maxPayloadSize: '10mb',
  allowedOrigins: [],
};

// API version
export const ApiVersion = {
  current: 'v1',
  supported: ['v1'],
  deprecated: [],
  sunset: null,
};

// API documentation
export const ApiDocumentation = {
  title: '',
  description: '',
  version: '',
  baseUrl: '',
  endpoints: [],
  schemas: {},
  security: [],
};

// API health check
export const ApiHealthCheck = {
  status: 'healthy', // healthy, degraded, unhealthy
  checks: {
    database: {
      status: 'healthy',
      latency: 0,
      error: null,
    },
    cache: {
      status: 'healthy',
      latency: 0,
      error: null,
    },
    storage: {
      status: 'healthy',
      latency: 0,
      error: null,
    },
    external: {
      status: 'healthy',
      latency: 0,
      error: null,
    },
  },
  timestamp: null,
};

// API metrics
export const ApiMetrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    byEndpoint: {},
    byStatus: {},
    byMethod: {},
  },
  responses: {
    averageTime: 0,
    minTime: 0,
    maxTime: 0,
    p95Time: 0,
    p99Time: 0,
  },
  errors: {
    total: 0,
    byType: {},
    byCode: {},
  },
  users: {
    active: 0,
    total: 0,
    byRole: {},
  },
  timestamp: null,
};

// API audit log
export const ApiAuditLog = {
  id: '',
  userId: '',
  action: '',
  resource: '',
  resourceId: '',
  details: {},
  ipAddress: '',
  userAgent: '',
  timestamp: null,
};

// API request validation
export const ApiRequestValidation = {
  body: null,
  params: null,
  query: null,
  headers: null,
  strict: true,
};

// API response transformation
export const ApiResponseTransform = {
  pick: [],
  omit: [],
  rename: {},
  format: {},
};

// API batch request
export const ApiBatchRequest = {
  requests: [],
  concurrent: true,
  stopOnError: false,
};

// API batch response
export const ApiBatchResponse = {
  responses: [],
  successful: 0,
  failed: 0,
  errors: [],
};

// Type guards
export const ApiTypeGuards = {
  /**
   * Check if response is successful
   */
  isSuccessful: (response) => {
    return response?.statusCode >= 200 && response?.statusCode < 300;
  },

  /**
   * Check if response is client error
   */
  isClientError: (response) => {
    return response?.statusCode >= 400 && response?.statusCode < 500;
  },

  /**
   * Check if response is server error
   */
  isServerError: (response) => {
    return response?.statusCode >= 500;
  },

  /**
   * Check if response is redirect
   */
  isRedirect: (response) => {
    return response?.statusCode >= 300 && response?.statusCode < 400;
  },

  /**
   * Check if request can be retried
   */
  canRetry: (error, retryConfig) => {
    if (!retryConfig.retryCondition) return false;
    return retryConfig.retryCondition(error);
  },

  /**
   * Check if response has pagination
   */
  hasPagination: (response) => {
    return response?.metadata?.total !== undefined;
  },

  /**
   * Check if response has more pages
   */
  hasMorePages: (response) => {
    return response?.metadata?.hasMore === true;
  },
};
