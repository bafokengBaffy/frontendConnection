/**
 * Central Type Definitions Export
 * This file serves as the main entry point for all type definitions
 */

// Export all types from specialized files
export * from './userTypes';
export * from './companyTypes';
export * from './studentTypes';
export * from './mentorTypes';
export * from './apiTypes';

// Common shared types
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
};

export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
  ARCHIVED: 'archived',
};

export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

export const Environment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
};

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
};

export const DayOfWeek = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

export const Month = {
  JANUARY: 'january',
  FEBRUARY: 'february',
  MARCH: 'march',
  APRIL: 'april',
  MAY: 'may',
  JUNE: 'june',
  JULY: 'july',
  AUGUST: 'august',
  SEPTEMBER: 'september',
  OCTOBER: 'october',
  NOVEMBER: 'november',
  DECEMBER: 'december',
};

export const Country = {
  LESOTHO: 'ls',
  SOUTH_AFRICA: 'za',
  BOTSWANA: 'bw',
  NAMIBIA: 'na',
  ESWATINI: 'sz',
  ZIMBABWE: 'zw',
  MOZAMBIQUE: 'mz',
  ZAMBIA: 'zm',
  MALAWI: 'mw',
  TANZANIA: 'tz',
  KENYA: 'ke',
  UGANDA: 'ug',
  RWANDA: 'rw',
  NIGERIA: 'ng',
  GHANA: 'gh',
  OTHER: 'other',
};

export const Currency = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  ZAR: 'ZAR',
  LSL: 'LSL',
  BWP: 'BWP',
  NAD: 'NAD',
  SZL: 'SZL',
  KES: 'KES',
  NGN: 'NGN',
  GHS: 'GHS',
};

export const Language = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  PORTUGUESE: 'pt',
  SPANISH: 'es',
  ARABIC: 'ar',
  SWAHILI: 'sw',
  ZULU: 'zu',
  XHOSA: 'xh',
  SESOTHO: 'st',
  TSWANA: 'tn',
};

export const FileType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  ARCHIVE: 'archive',
  OTHER: 'other',
};

export const MimeType = {
  // Images
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',

  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  TXT: 'text/plain',

  // Videos
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  AVI: 'video/x-msvideo',

  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG: 'audio/ogg',

  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZ: 'application/gzip',
};

export const DeviceType = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  TV: 'tv',
  WATCH: 'watch',
  OTHER: 'other',
};

export const Platform = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
  WINDOWS: 'windows',
  MAC: 'mac',
  LINUX: 'linux',
};

export const Browser = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge',
  OPERA: 'opera',
  IE: 'ie',
  OTHER: 'other',
};

export const ConnectionType = {
  WIFI: 'wifi',
  CELLULAR: 'cellular',
  ETHERNET: 'ethernet',
  BLUETOOTH: 'bluetooth',
  OTHER: 'other',
};

export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  ALERT: 'alert',
};

export const NotificationChannel = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WHATSAPP: 'whatsapp',
  TELEGRAM: 'telegram',
};

export const ActionType = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  EXPORT: 'export',
  IMPORT: 'import',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  SHARE: 'share',
  ARCHIVE: 'archive',
  RESTORE: 'restore',
};

export const EventType = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILURE: 'payment.failure',
  SUBSCRIPTION_START: 'subscription.start',
  SUBSCRIPTION_END: 'subscription.end',
  APPLICATION_SUBMIT: 'application.submit',
  APPLICATION_UPDATE: 'application.update',
  JOB_CREATE: 'job.create',
  JOB_UPDATE: 'job.update',
  JOB_DELETE: 'job.delete',
  MENTOR_SESSION: 'mentor.session',
  COURSE_ENROLL: 'course.enroll',
  COURSE_COMPLETE: 'course.complete',
};

export const ReportType = {
  USER_ACTIVITY: 'user_activity',
  TRANSACTIONS: 'transactions',
  APPLICATIONS: 'applications',
  JOBS: 'jobs',
  MENTORSHIP: 'mentorship',
  COURSES: 'courses',
  REVENUE: 'revenue',
  SYSTEM: 'system',
};

export const ReportFormat = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
  HTML: 'html',
};

export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json',
  XML: 'xml',
  PDF: 'pdf',
  EXCEL: 'excel',
};

export const CacheStrategy = {
  MEMORY: 'memory',
  LOCAL_STORAGE: 'local_storage',
  SESSION_STORAGE: 'session_storage',
  INDEXED_DB: 'indexed_db',
  SERVICE_WORKER: 'service_worker',
};

export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
};

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
};

export const HttpStatus = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const TimeUnit = {
  MILLISECOND: 'ms',
  SECOND: 's',
  MINUTE: 'm',
  HOUR: 'h',
  DAY: 'd',
  WEEK: 'w',
  MONTH: 'mo',
  YEAR: 'y',
};

export const Frequency = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

export const Permission = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_LIST: 'user:list',

  // Role permissions
  ROLE_CREATE: 'role:create',
  ROLE_READ: 'role:read',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_LIST: 'role:list',
  ROLE_ASSIGN: 'role:assign',

  // Company permissions
  COMPANY_CREATE: 'company:create',
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_LIST: 'company:list',
  COMPANY_APPROVE: 'company:approve',

  // Job permissions
  JOB_CREATE: 'job:create',
  JOB_READ: 'job:read',
  JOB_UPDATE: 'job:update',
  JOB_DELETE: 'job:delete',
  JOB_LIST: 'job:list',
  JOB_APPLY: 'job:apply',
  JOB_REVIEW: 'job:review',

  // Application permissions
  APPLICATION_CREATE: 'application:create',
  APPLICATION_READ: 'application:read',
  APPLICATION_UPDATE: 'application:update',
  APPLICATION_DELETE: 'application:delete',
  APPLICATION_LIST: 'application:list',
  APPLICATION_REVIEW: 'application:review',

  // Mentor permissions
  MENTOR_CREATE: 'mentor:create',
  MENTOR_READ: 'mentor:read',
  MENTOR_UPDATE: 'mentor:update',
  MENTOR_DELETE: 'mentor:delete',
  MENTOR_LIST: 'mentor:list',
  MENTOR_SESSION: 'mentor:session',

  // Payment permissions
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_READ: 'payment:read',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_DELETE: 'payment:delete',
  PAYMENT_LIST: 'payment:list',
  PAYMENT_REFUND: 'payment:refund',

  // Analytics permissions
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  ANALYTICS_LIST: 'analytics:list',

  // System permissions
  SYSTEM_READ: 'system:read',
  SYSTEM_UPDATE: 'system:update',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',
};

/**
 * Type validation functions
 */
export const TypeValidators = {
  /**
   * Check if value is a valid email
   */
  isEmail: (value) => {
    const re = /^[^.@]+@[^.@]+.[^.@]+$/;
    return re.test(String(value).toLowerCase());
  },

  /**
   * Check if value is a valid phone number
   */
  isPhone: (value) => {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-..]?[0-9]{3}[-..]?[0-9]{4,6}$/;
    return re.test(String(value));
  },

  /**
   * Check if value is a valid URL
   */
  isUrl: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if value is a valid date
   */
  isDate: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Check if value is a valid UUID
   */
  isUuid: (value) => {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return re.test(String(value));
  },

  /**
   * Check if value is a valid ISO date string
   */
  isIsoDate: (value) => {
    const re = /^.{4}-.{2}-.{2}T.{2}:.{2}:.{2}(..{3})?Z$/;
    return re.test(String(value));
  },

  /**
   * Check if value is a valid hex color
   */
  isHexColor: (value) => {
    const re = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return re.test(String(value));
  },

  /**
   * Check if value is a valid credit card number
   */
  isCreditCard: (value) => {
    const re = /^.{13,19}$/;
    return re.test(String(value).replace(/./g, ''));
  },
};

/**
 * Type conversion functions
 */
export const TypeConverters = {
  /**
   * Convert string to boolean
   */
  toBoolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return Boolean(value);
  },

  /**
   * Convert value to number
   */
  toNumber: (value, defaultValue = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
  },

  /**
   * Convert value to string
   */
  toString: (value, defaultValue = '') => {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  },

  /**
   * Convert value to date
   */
  toDate: (value, defaultValue = null) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date) ? defaultValue : date;
    }
    return defaultValue;
  },

  /**
   * Convert value to array
   */
  toArray: (value, defaultValue = []) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return defaultValue;
    return [value];
  },

  /**
   * Convert value to object
   */
  toObject: (value, defaultValue = {}) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  },
};
