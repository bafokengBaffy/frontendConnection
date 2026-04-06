/* eslint-disable no-unused-vars */
/**
 * User-related Type Definitions
 */

import { Status, Gender, Country, Language, Currency, Permission } from './index';

// User roles
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
  INSTITUTE: 'institute',
  MENTOR: 'mentor',
  YOUTH: 'youth',
  ENTREPRENEUR: 'entrepreneur',
  PARENT: 'parent',
  ALUMNI: 'alumni',
  GUEST: 'guest',
};

// Account types
export const AccountType = {
  INDIVIDUAL: 'individual',
  ORGANIZATION: 'organization',
  INSTITUTION: 'institution',
  BUSINESS: 'business',
};

// Verification status
export const VerificationStatus = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Profile visibility
export const ProfileVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  CONNECTIONS_ONLY: 'connections_only',
  MENTORS_ONLY: 'mentors_only',
  INSTITUTE_ONLY: 'institute_only',
};

// Notification preferences
export const NotificationPreference = {
  ALL: 'all',
  IMPORTANT: 'important',
  NONE: 'none',
};

// Theme preferences
export const ThemePreference = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// User interface
export const User = {
  id: '',
  email: '',
  password: '',
  role: UserRole.GUEST,
  accountType: AccountType.INDIVIDUAL,
  status: Status.PENDING,
  verificationStatus: VerificationStatus.UNVERIFIED,
  profileVisibility: ProfileVisibility.PUBLIC,

  // Personal info
  firstName: '',
  lastName: '',
  middleName: '',
  displayName: '',
  gender: Gender.OTHER,
  dateOfBirth: null,
  nationality: Country.LESOTHO,

  // Contact info
  phoneNumber: '',
  alternatePhone: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: Country.LESOTHO,
  },

  // Professional info
  headline: '',
  bio: '',
  skills: [],
  languages: [Language.ENGLISH],

  // Preferences
  preferredLanguage: Language.ENGLISH,
  preferredCurrency: Currency.LSL,
  theme: ThemePreference.SYSTEM,
  timezone: '',

  // Social links
  socialLinks: {
    linkedin: '',
    twitter: '',
    facebook: '',
    github: '',
    portfolio: '',
  },

  // Media
  profilePicture: '',
  coverPhoto: '',
  resume: '',

  // Settings
  settings: {
    notifications: {
      email: NotificationPreference.ALL,
      push: NotificationPreference.IMPORTANT,
      sms: NotificationPreference.NONE,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
      showBirthday: false,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
    },
  },

  // Metadata
  permissions: [],
  createdAt: null,
  updatedAt: null,
  lastLoginAt: null,
  lastActiveAt: null,
  deletedAt: null,
};

// User profile
export const UserProfile = {
  userId: '',
  summary: '',
  experience: [],
  education: [],
  certifications: [],
  achievements: [],
  interests: [],
  goals: [],

  // Additional fields based on role
  ...{},
};

// Experience
export const Experience = {
  id: '',
  title: '',
  company: '',
  location: '',
  startDate: null,
  endDate: null,
  current: false,
  description: '',
  achievements: [],
};

// Education
export const Education = {
  id: '',
  institution: '',
  degree: '',
  field: '',
  startDate: null,
  endDate: null,
  current: false,
  grade: '',
  activities: '',
  description: '',
};

// Certification
export const Certification = {
  id: '',
  name: '',
  issuingOrganization: '',
  issueDate: null,
  expirationDate: null,
  credentialId: '',
  credentialUrl: '',
  doesNotExpire: false,
};

// Achievement
export const Achievement = {
  id: '',
  title: '',
  description: '',
  date: null,
  type: '',
  issuer: '',
};

// User connection
export const UserConnection = {
  id: '',
  userId: '',
  connectionId: '',
  connectionType: '', // mentor, colleague, friend, etc.
  status: 'pending', // pending, accepted, rejected, blocked
  createdAt: null,
  updatedAt: null,
};

// User session
export const UserSession = {
  id: '',
  userId: '',
  token: '',
  deviceInfo: {
    type: '',
    platform: '',
    browser: '',
    version: '',
  },
  ipAddress: '',
  location: '',
  createdAt: null,
  expiresAt: null,
  lastActivityAt: null,
};

// User activity
export const UserActivity = {
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

// User preference
export const UserPreference = {
  userId: '',
  key: '',
  value: '',
  category: '',
  createdAt: null,
  updatedAt: null,
};

// User role definition
export const Role = {
  id: '',
  name: '',
  description: '',
  permissions: [],
  isDefault: false,
  isSystem: false,
  createdAt: null,
  updatedAt: null,
};

// Permission definition
export const PermissionDefinition = {
  id: '',
  name: '',
  description: '',
  resource: '',
  action: '',
  conditions: {},
  createdAt: null,
  updatedAt: null,
};

// User group
export const UserGroup = {
  id: '',
  name: '',
  description: '',
  members: [],
  permissions: [],
  createdAt: null,
  updatedAt: null,
};

// Login attempt
export const LoginAttempt = {
  id: '',
  email: '',
  ipAddress: '',
  userAgent: '',
  success: false,
  failureReason: '',
  timestamp: null,
};

// Password reset
export const PasswordReset = {
  id: '',
  userId: '',
  token: '',
  expiresAt: null,
  usedAt: null,
  createdAt: null,
};

// Email verification
export const EmailVerification = {
  id: '',
  userId: '',
  email: '',
  token: '',
  expiresAt: null,
  verifiedAt: null,
  createdAt: null,
};

// Two-factor authentication
export const TwoFactorAuth = {
  userId: '',
  enabled: false,
  secret: '',
  backupCodes: [],
  methods: [], // sms, authenticator, etc.
  updatedAt: null,
};

// User statistics
export const UserStats = {
  userId: '',
  totalLogins: 0,
  totalSessions: 0,
  totalConnections: 0,
  totalActivities: 0,
  lastActiveDate: null,
  averageSessionDuration: 0,
  accountAge: 0,
};

// User search filters
export const UserSearchFilters = {
  role: null,
  status: null,
  verificationStatus: null,
  location: null,
  skills: [],
  languages: [],
  dateJoined: {
    start: null,
    end: null,
  },
  lastActive: {
    start: null,
    end: null,
  },
  searchTerm: '',
};

// User sort options
export const UserSortOptions = {
  FIELD: {
    NAME: 'displayName',
    EMAIL: 'email',
    CREATED_AT: 'createdAt',
    LAST_ACTIVE: 'lastActiveAt',
    STATUS: 'status',
    ROLE: 'role',
  },
  ORDER: {
    ASC: 'asc',
    DESC: 'desc',
  },
};

// Bulk user operation
export const BulkUserOperation = {
  type: '', // create, update, delete, activate, deactivate
  userIds: [],
  data: {},
  options: {
    sendNotification: false,
    notificationMessage: '',
  },
};

// User export options
export const UserExportOptions = {
  format: 'json',
  fields: [],
  includeMetadata: true,
  dateRange: {
    start: null,
    end: null,
  },
};

// Type guards
export const UserTypeGuards = {
  /**
   * Check if user is admin
   */
  isAdmin: (user) => {
    return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user?.role);
  },

  /**
   * Check if user is super admin
   */
  isSuperAdmin: (user) => {
    return user?.role === UserRole.SUPER_ADMIN;
  },

  /**
   * Check if user is student
   */
  isStudent: (user) => {
    return user?.role === UserRole.STUDENT;
  },

  /**
   * Check if user is company
   */
  isCompany: (user) => {
    return user?.role === UserRole.COMPANY;
  },

  /**
   * Check if user is mentor
   */
  isMentor: (user) => {
    return user?.role === UserRole.MENTOR;
  },

  /**
   * Check if user is youth
   */
  isYouth: (user) => {
    return user?.role === UserRole.YOUTH;
  },

  /**
   * Check if user is entrepreneur
   */
  isEntrepreneur: (user) => {
    return user?.role === UserRole.ENTREPRENEUR;
  },

  /**
   * Check if user has permission
   */
  hasPermission: (user, permission) => {
    return user?.permissions?.includes(permission) || false;
  },

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission: (user, permissions) => {
    return permissions.some((p) => user?.permissions?.includes(p));
  },

  /**
   * Check if user has all permissions
   */
  hasAllPermissions: (user, permissions) => {
    return permissions.every((p) => user?.permissions?.includes(p));
  },

  /**
   * Check if user is verified
   */
  isVerified: (user) => {
    return user?.verificationStatus === VerificationStatus.VERIFIED;
  },

  /**
   * Check if user profile is complete
   */
  isProfileComplete: (user) => {
    const required = ['firstName', 'lastName', 'email', 'phoneNumber'];
    return required.every((field) => user[field]);
  },

  /**
   * Check if user is active
   */
  isActive: (user) => {
    return user?.status === Status.ACTIVE;
  },
};
