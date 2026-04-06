// Route constants for the entire application
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Dashboard Redirects
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  COMPANY_DASHBOARD: '/company/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  INSTITUTE_DASHBOARD: '/institute/dashboard',
  MENTOR_DASHBOARD: '/mentor/dashboard',
  YOUTH_DASHBOARD: '/youth/dashboard',
  ENTREPRENEUR_DASHBOARD: '/entrepreneur/dashboard',

  // Common Routes
  SETTINGS: '/settings',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',

  // Admin Routes
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
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
    INSTITUTES: '/admin/institutes',
    MENTORS: '/admin/mentors',
    ENTREPRENEURS: '/admin/entrepreneurs',
    YOUTH: '/admin/youth',
    SEARCH: {
      USERS: '/admin/search/users',
      COMPANIES: '/admin/search/companies',
      APPLICATIONS: '/admin/search/applications',
    },
  },

  // Student Routes
  STUDENT: {
    BASE: '/student',
    DASHBOARD: '/student/dashboard',
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
    DASHBOARD: '/company/dashboard',
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

  // Institute Routes
  INSTITUTE: {
    BASE: '/institute',
    DASHBOARD: '/institute/dashboard',
    PROFILE: '/institute/profile',
    INSTITUTION_PROFILE: '/institute/institution-profile',
    COURSES: '/institute/courses',
    FACULTIES: '/institute/faculties',
    FACULTIES_MANAGE: '/institute/faculties/manage',
    STUDENTS: '/institute/students',
    APPLICATIONS: '/institute/applications',
    SETTINGS: '/institute/settings',
    SETTINGS_CONFIG: '/institute/settings/config',
    ANALYTICS: '/institute/analytics',
    PLACEMENTS: '/institute/placements',
    ALUMNI: '/institute/alumni',
    EVENTS: '/institute/events',
    LEGACY_DASHBOARD: '/institution-dashboard',
  },

  // Mentor Routes
  MENTOR: {
    BASE: '/mentor',
    DASHBOARD: '/mentor/dashboard',
    PROFILE: '/mentor/profile',
    SESSIONS: '/mentor/sessions',
    APPLICATIONS: '/mentor/applications',
    EARNINGS: '/mentor/earnings',
    MENTEES: '/mentor/mentees',
    SCHEDULE: '/mentor/schedule',
    RESOURCES: '/mentor/resources',
    REVIEWS: '/mentor/reviews',
    SETTINGS: '/mentor/settings',
  },

  // Youth Routes
  YOUTH: {
    BASE: '/youth',
    DASHBOARD: '/youth/dashboard',
    PROFILE: '/youth/profile',
    PROFILE_DETAILS: '/youth/profile/details',
    ACHIEVEMENTS: '/youth/achievements',
    ACHIEVEMENT_BADGE: '/youth/achievements/badge',
    PORTFOLIO: '/youth/portfolio',
    SKILLS: '/youth/skills',
    PROGRESS: '/youth/progress',

    // Business
    BUSINESS: '/youth/business',
    BUSINESS_IDEAS: '/youth/business/ideas',
    BUSINESS_PLAN: '/youth/business/plan',
    BUSINESS_PITCH: '/youth/business/pitch',
    BUSINESS_MODEL: '/youth/business/model',
    BUSINESS_PROFILE: '/youth/business/profile',
    BUSINESS_PROGRESS: '/youth/business/progress',
    CUSTOMER_SEGMENTATION: '/youth/business/customer-segmentation',
    FINANCIAL_PROJECTIONS: '/youth/business/financial-projections',
    MARKET_ANALYSIS: '/youth/business/market-analysis',
    REVENUE_MODEL: '/youth/business/revenue-model',
    VALUE_PROPOSITION: '/youth/business/value-proposition',
    STARTUP_REGISTRATION: '/youth/startup/register',
    PITCH_DECK: '/youth/pitch-deck',

    // Funding
    FUNDING: '/youth/funding',
    FUNDING_OPPORTUNITIES: '/youth/funding/opportunities',
    GRANTS: '/youth/funding/grants',
    CROWDFUNDING: '/youth/funding/crowdfunding',
    INVESTORS: '/youth/funding/investors',
    LOANS: '/youth/funding/loans',
    PITCH_DECK_FUNDING: '/youth/funding/pitch-deck',

    // Mentorship
    MENTORS: '/youth/mentors',
    MENTORSHIP: '/youth/mentorship',

    // Resources & Learning
    RESOURCES: '/youth/resources',
    TRAINING: '/youth/training',
    WORKSHOPS: '/youth/workshops',
    SUCCESS_STORIES: '/youth/success-stories',
    NETWORK: '/youth/network',

    // Training Modules
    TRAINING_SIMULATIONS: '/youth/training/simulations',
    TRAINING_CERTIFICATION: '/youth/training/certification',
    TRAINING_COURSES: '/youth/training/courses',
    TRAINING_SKILLS: '/youth/training/skills',

    // Collaboration
    COLLABORATION_COWORKING: '/youth/collaboration/coworking',
    COLLABORATION_SPACES: '/youth/collaboration/spaces',
    COLLABORATION_PARTNERSHIPS: '/youth/collaboration/partnerships',
    COLLABORATION_TEAM: '/youth/collaboration/team',

    // Incubation
    INCUBATION_ACCELERATORS: '/youth/incubation/accelerators',
    INCUBATION_APPLY: '/youth/incubation/apply',
    INCUBATION_PROGRESS: '/youth/incubation/progress',
    INCUBATION_SUPPORT: '/youth/incubation/support',

    // Marketplace
    MARKETPLACE: '/youth/marketplace',
    MARKETPLACE_ORDERS: '/youth/marketplace/orders',
    MARKETPLACE_PRODUCTS: '/youth/marketplace/products',
    MARKETPLACE_SERVICES: '/youth/marketplace/services',

    // Networking
    NETWORKING_OPPORTUNITIES: '/youth/networking/opportunities',
    NETWORKING_FORUM: '/youth/networking/forum',
    NETWORKING_EVENTS: '/youth/networking/events',
    NETWORKING_MATCHING: '/youth/networking/matching',

    // Analytics
    ANALYTICS: '/youth/analytics',
    ANALYTICS_METRICS: '/youth/analytics/metrics',
    ANALYTICS_GROWTH: '/youth/analytics/growth',
    ANALYTICS_REVENUE: '/youth/analytics/revenue',
  },

  // Entrepreneur Routes
  ENTREPRENEUR: {
    BASE: '/entrepreneur',
    DASHBOARD: '/entrepreneur/dashboard',
    PROFILE: '/entrepreneur/profile',

    // Entrepreneur Hub
    HUB_DASHBOARD: '/entrepreneur-hub/dashboard',
    HUB_PROFILE: '/entrepreneur-hub/profile',
    HUB_ANALYTICS: '/entrepreneur-hub/analytics',
    HUB_ANALYTICS_DETAILS: '/entrepreneur-hub/analytics/details',
    HUB_APPLICATIONS: '/entrepreneur-hub/applications',
    HUB_APPLICATIONS_MANAGE: '/entrepreneur-hub/applications/manage',
    HUB_COMMUNICATIONS: '/entrepreneur-hub/communications',
    HUB_COMMUNICATIONS_MESSAGES: '/entrepreneur-hub/communications/messages',
    HUB_COMPANY: '/entrepreneur-hub/company',
    HUB_COMPANY_DETAILS: '/entrepreneur-hub/company/details',
    HUB_FUNDING: '/entrepreneur-hub/funding',
    HUB_PORTFOLIO: '/entrepreneur-hub/portfolio',
    HUB_MEDIA: '/entrepreneur-hub/media',
    HUB_MENTORS: '/entrepreneur-hub/mentors',
    HUB_REVIEW: '/entrepreneur-hub/review',

    // Business Management
    BUSINESS_PLAN: '/entrepreneur/business-plan',
    FINANCIALS: '/entrepreneur/financials',
    TEAM: '/entrepreneur/team',
    PRODUCTS: '/entrepreneur/products',
    CUSTOMERS: '/entrepreneur/customers',

    // Growth
    SCALING: '/entrepreneur/scaling',
    MARKET_EXPANSION: '/entrepreneur/market-expansion',
    PARTNERSHIPS: '/entrepreneur/partnerships',
    ACQUISITIONS: '/entrepreneur/acquisitions',
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
    MARKET_ANALYSIS: '/ai/market-analysis',
    TALENT_MATCHING: '/ai/talent-matching',
    SKILL_GAP_ANALYSIS: '/ai/skill-gap-analysis',
  },
};

export const USER_TYPES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
  INSTITUTE: 'institute',
  MENTOR: 'mentor',
  YOUTH: 'youth',
  ENTREPRENEUR: 'entrepreneur',
  PARENT: 'parent',
  ALUMNI: 'alumni',
};

export const USER_TYPE_LABELS = {
  [USER_TYPES.ADMIN]: 'Administrator',
  [USER_TYPES.STUDENT]: 'Student / Graduate',
  [USER_TYPES.COMPANY]: 'Company / Employer',
  [USER_TYPES.INSTITUTE]: 'Educational Institute',
  [USER_TYPES.MENTOR]: 'Mentor / Advisor',
  [USER_TYPES.YOUTH]: 'Youth Entrepreneur',
  [USER_TYPES.ENTREPRENEUR]: 'Entrepreneur',
  [USER_TYPES.PARENT]: 'Parent / Guardian',
  [USER_TYPES.ALUMNI]: 'Alumni',
};

export const ROLE_BASED_REDIRECTS = {
  [USER_TYPES.ADMIN]: '/admin/dashboard',
  [USER_TYPES.STUDENT]: '/student/dashboard',
  [USER_TYPES.COMPANY]: '/company/dashboard',
  [USER_TYPES.INSTITUTE]: '/institute/dashboard',
  [USER_TYPES.MENTOR]: '/mentor/dashboard',
  [USER_TYPES.YOUTH]: '/youth/dashboard',
  [USER_TYPES.ENTREPRENEUR]: '/entrepreneur/dashboard',
  [USER_TYPES.PARENT]: '/parent/dashboard',
  [USER_TYPES.ALUMNI]: '/alumni/dashboard',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  VERIFICATION_REQUIRED: 'verification_required',
  PENDING_APPROVAL: 'pending_approval',
};
