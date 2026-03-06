// Route constants for the entire application
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESOURCES: '/resources',

  // Dashboard Redirects
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  COMPANY_DASHBOARD: '/company/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Common Routes
  SETTINGS: '/settings',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',

  // Admin Routes
  ADMIN: {
    BASE: '/admin',
    USERS: '/admin/users',
    COMPANIES: '/admin/companies',
    JOBS: '/admin/jobs',
    PENDING_APPROVALS: '/admin/pending-approvals',
    ANALYTICS: '/admin/analytics',
    SYSTEM_SETTINGS: '/admin/system-settings',
    PROFILE: '/admin/profile',
    SETTINGS: '/admin/settings',
    AUDIT: '/admin/audit',
    ADMISSIONS: '/admin/admissions',
    SEARCH: {
      USERS: '/admin/search/users',
      COMPANIES: '/admin/search/companies',
      APPLICATIONS: '/admin/search/applications',
    },
  },

  // Student Routes
  STUDENT: {
    BASE: '/student',
    PROFILE: '/student/profile',
    APPLICATIONS: '/student/applications',
    JOBS: '/student/jobs',
    COURSES: '/student/courses',
    DOCUMENTS: '/student/documents',
    ALL_DOCUMENTS: '/student/all-documents',
    ANALYTICS: '/student/analytics',
    CALENDAR: '/student/calendar',
    MENTORSHIP: '/student/mentorship',
    NOTIFICATIONS: '/student/notifications',
    APPLY_COURSE: '/student/courses/apply',
    APPLY_JOB: '/student/jobs/apply',
    DOCUMENTS_UPLOAD: '/student/documents/upload',
    SEARCH: {
      JOBS: '/student/search/jobs',
      COURSES: '/student/search/courses',
      INSTITUTIONS: '/student/search/institutions',
      INTERNSHIPS: '/student/search/internships',
    },
    // Extended Features
    JOB_MATCHES: '/student/job-matches',
    ADMISSION_SELECTION: '/student/admission-selection',
    ACTIVITY_FEED: '/student/activity',
    DEADLINES: '/student/deadlines',
    RECOMMENDATIONS: '/student/recommendations',
    PERFORMANCE: '/student/performance',
    QUICK_ACTIONS: '/student/quick-actions',
    BROWSE_COURSES: '/student/browse-courses',
    BROWSE_JOBS: '/student/browse-jobs',
    INSTITUTIONS: '/student/institutions',
    APPLICATION_DETAILS: '/student/application/:applicationId',
  },

  // Company Routes
  COMPANY: {
    BASE: '/company',
    PROFILE: '/company/profile',
    JOBS: '/company/jobs',
    APPLICATIONS: '/company/applications',
    CANDIDATES: '/company/candidates',
    ANALYTICS: '/company/analytics',
    CHAT: '/company/chat',
    TEAMS: '/company/teams',
    DOCUMENTS: '/company/documents',
    COMMUNICATION: '/company/communication',
    CREATE_JOB: '/company/jobs/create',
    SETTINGS: '/company/settings',
    SCHEDULE_INTERVIEW: '/company/schedule-interview',
    VIEW_ANALYTICS: '/company/analytics',
    COMPANY_ANALYTICS: '/company/company-analytics',
    BROWSE_CANDIDATES: '/company/browse-candidates',
    JOB_POSTING: '/company/job-posting',
    APPLICATION_DETAILS: '/company/application/:applicationId',
    SEARCH: {
      MARKET: '/company/search/market',
      PARTNERS: '/company/search/partners',
      STUDENTS: '/company/search/students',
      CANDIDATES: '/company/search/candidates',
    },
    // Extended Features
    AI_MATCHING: '/company/ai-matching',
    VIDEO_INTERVIEWS: '/company/video-interviews',
    BRANDING: '/company/branding',
    DIVERSITY_ANALYTICS: '/company/diversity-analytics',
    TALENT_POOL: '/company/talent-pool',
    ASSESSMENTS: '/company/assessments',
    REFERRALS: '/company/referrals',
    COMPETITOR_ANALYSIS: '/company/competitor-analysis',
    ONBOARDING: '/company/onboarding',
    PREDICTIVE_ANALYTICS: '/company/predictive-analytics',
    MARKETPLACE: '/company/marketplace',
    TEAM_WORKSPACE: '/company/team-workspace',
    FOLLOWERS: '/company/followers',
  },

  // AI Routes
  AI: {
    BASE: '/ai',
    DASHBOARD: '/ai/dashboard',
    BUSINESS_INSIGHTS: '/ai/business-insights',
    BUSINESS_INSIGHTS_ADVANCED: '/ai/business-insights-advanced',
    PREDICTIVE_ANALYTICS: '/ai/analytics',
    RECOMMENDATIONS: '/ai/recommendations',
    RECOMMENDATIONS_ADVANCED: '/ai/recommendations-advanced',
  },
};

export const USER_TYPES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
};

export const ROLE_BASED_REDIRECTS = {
  admin: '/admin',
  student: '/student',
  company: '/company',
};
