/**
 * Company-related Type Definitions
 */

import { Status, Country, Currency, Permission } from './index';
import { UserRole } from './userTypes';

// Company size
export const CompanySize = {
  STARTUP: '1-10',
  SMALL: '11-50',
  MEDIUM: '51-200',
  LARGE: '201-500',
  ENTERPRISE: '500+',
};

// Company type
export const CompanyType = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  NON_PROFIT: 'non_profit',
  GOVERNMENT: 'government',
  EDUCATIONAL: 'educational',
  STARTUP: 'startup',
};

// Industry
export const Industry = {
  TECHNOLOGY: 'technology',
  FINANCE: 'finance',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  RETAIL: 'retail',
  MANUFACTURING: 'manufacturing',
  CONSTRUCTION: 'construction',
  TRANSPORTATION: 'transportation',
  HOSPITALITY: 'hospitality',
  REAL_ESTATE: 'real_estate',
  AGRICULTURE: 'agriculture',
  ENERGY: 'energy',
  TELECOMMUNICATIONS: 'telecommunications',
  MEDIA: 'media',
  CONSULTING: 'consulting',
  LEGAL: 'legal',
  MARKETING: 'marketing',
  OTHER: 'other',
};

// Job type
export const JobType = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
  FREELANCE: 'freelance',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
};

// Job level
export const JobLevel = {
  ENTRY: 'entry',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
  MANAGER: 'manager',
  DIRECTOR: 'director',
  EXECUTIVE: 'executive',
};

// Application status
export const ApplicationStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEWED: 'interviewed',
  OFFER_EXTENDED: 'offer_extended',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Interview type
export const InterviewType = {
  PHONE: 'phone',
  VIDEO: 'video',
  IN_PERSON: 'in_person',
  TECHNICAL: 'technical',
  PANEL: 'panel',
  GROUP: 'group',
  ASSESSMENT: 'assessment',
};

// Company interface
export const Company = {
  id: '',
  name: '',
  legalName: '',
  registrationNumber: '',
  taxId: '',
  type: CompanyType.PRIVATE,
  size: CompanySize.STARTUP,
  industry: Industry.OTHER,
  foundedYear: null,

  // Contact info
  email: '',
  phone: '',
  website: '',

  // Location
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: Country.LESOTHO,
  },

  // Social media
  socialMedia: {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
  },

  // Branding
  logo: '',
  coverImage: '',
  favicon: '',
  primaryColor: '',

  // Description
  description: '',
  mission: '',
  vision: '',
  values: [],

  // Benefits
  benefits: [],

  // Status
  status: Status.PENDING,
  verified: false,

  // Metadata
  createdBy: '',
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
};

// Company profile
export const CompanyProfile = {
  companyId: '',

  // Culture
  culture: '',
  workEnvironment: '',
  teamStructure: '',

  // Diversity & inclusion
  diversityPolicy: '',
  inclusionInitiatives: [],

  // Remote work
  remotePolicy: '',
  workHours: '',

  // Languages
  languages: [],

  // Certifications
  certifications: [],

  // Awards
  awards: [],

  // Partnerships
  partners: [],

  // Departments
  departments: [],

  // Gallery
  gallery: [],

  // Videos
  videos: [],
};

// Job posting
export const Job = {
  id: '',
  companyId: '',
  title: '',
  slug: '',
  type: JobType.FULL_TIME,
  level: JobLevel.MID,
  department: '',

  // Description
  summary: '',
  description: '',
  responsibilities: [],
  requirements: [],
  preferredQualifications: [],

  // Location
  location: '',
  remote: false,
  hybrid: false,

  // Compensation
  salary: {
    min: null,
    max: null,
    currency: Currency.LSL,
    period: 'monthly', // hourly, daily, monthly, yearly
    isNegotiable: false,
  },

  // Benefits
  benefits: [],

  // Skills
  requiredSkills: [],
  preferredSkills: [],

  // Experience
  experienceRequired: {
    min: 0,
    max: null,
    description: '',
  },

  // Education
  educationRequired: [],

  // Languages
  languagesRequired: [],

  // Application process
  applicationDeadline: null,
  startDate: null,
  duration: null,

  // Metadata
  status: Status.ACTIVE,
  views: 0,
  applications: 0,
  createdBy: '',
  createdAt: null,
  updatedAt: null,
  publishedAt: null,
  expiresAt: null,
};

// Job application
export const JobApplication = {
  id: '',
  jobId: '',
  userId: '',
  companyId: '',

  // Personal info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',

  // Application details
  coverLetter: '',
  resume: '',
  portfolio: '',
  linkedIn: '',
  github: '',

  // Additional info
  expectedSalary: null,
  startDate: null,
  willingToRelocate: false,
  workAuthorization: '',

  // Questions & answers
  answers: [],

  // Status
  status: ApplicationStatus.SUBMITTED,
  statusHistory: [],

  // Metadata
  submittedAt: null,
  reviewedAt: null,
  reviewedBy: '',
  createdAt: null,
  updatedAt: null,
};

// Interview
export const Interview = {
  id: '',
  applicationId: '',
  jobId: '',
  companyId: '',
  candidateId: '',

  // Interview details
  type: InterviewType.VIDEO,
  round: 1,
  title: '',
  description: '',

  // Schedule
  scheduledAt: null,
  duration: 60, // minutes
  timezone: '',

  // Location
  location: '',
  meetingLink: '',

  // Interviewers
  interviewers: [],

  // Status
  status: 'scheduled', // scheduled, completed, cancelled, rescheduled
  cancelledReason: '',

  // Feedback
  feedback: [],
  rating: null,
  notes: '',

  // Follow-up
  nextStep: '',
  nextInterviewId: '',

  // Metadata
  createdBy: '',
  createdAt: null,
  updatedAt: null,
  completedAt: null,
};

// Department
export const Department = {
  id: '',
  companyId: '',
  name: '',
  description: '',
  headId: '',
  parentDepartmentId: null,
  employees: [],
  budget: null,
  createdAt: null,
  updatedAt: null,
};

// Team
export const Team = {
  id: '',
  companyId: '',
  name: '',
  description: '',
  departmentId: '',
  leadId: '',
  members: [],
  projects: [],
  createdAt: null,
  updatedAt: null,
};

// Employee
export const Employee = {
  id: '',
  companyId: '',
  userId: '',
  departmentId: '',
  teamId: null,

  // Employment details
  employeeId: '',
  jobTitle: '',
  jobType: JobType.FULL_TIME,
  level: JobLevel.MID,

  // Dates
  startDate: null,
  endDate: null,
  probationEndDate: null,

  // Compensation
  salary: null,
  currency: Currency.LSL,
  paymentFrequency: 'monthly',
  bankDetails: {},

  // Benefits
  benefits: [],

  // Reporting
  reportsTo: null,
  directReports: [],

  // Performance
  performanceReviews: [],
  currentRating: null,

  // Status
  status: Status.ACTIVE,

  // Metadata
  createdBy: '',
  createdAt: null,
  updatedAt: null,
};

// Company review
export const CompanyReview = {
  id: '',
  companyId: '',
  userId: '',

  // Ratings (1-5)
  overallRating: 0,
  cultureRating: 0,
  workLifeBalanceRating: 0,
  compensationRating: 0,
  managementRating: 0,
  careerOpportunitiesRating: 0,

  // Review
  title: '',
  pros: '',
  cons: '',
  advice: '',

  // Employment status
  isCurrentEmployee: false,
  employmentStatus: 'former', // current, former
  jobTitle: '',
  duration: '',

  // Verification
  verified: false,
  verifiedBy: '',

  // Metadata
  helpful: 0,
  notHelpful: 0,
  reports: 0,
  status: Status.ACTIVE,
  createdAt: null,
  updatedAt: null,
};

// Job alert
export const JobAlert = {
  id: '',
  userId: '',
  name: '',

  // Filters
  keywords: [],
  locations: [],
  jobTypes: [],
  industries: [],
  salary: {
    min: null,
    max: null,
  },

  // Schedule
  frequency: 'daily', // daily, weekly, instant
  lastSentAt: null,

  // Settings
  active: true,
  emailNotifications: true,
  pushNotifications: false,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Saved job
export const SavedJob = {
  id: '',
  userId: '',
  jobId: '',
  companyId: '',
  notes: '',
  createdAt: null,
};

// Company follower
export const CompanyFollower = {
  id: '',
  companyId: '',
  userId: '',
  notificationPreference: 'all',
  createdAt: null,
};

// Company analytics
export const CompanyAnalytics = {
  companyId: '',

  // Job metrics
  totalJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  averageApplicationsPerJob: 0,

  // Hiring metrics
  totalHires: 0,
  timeToHire: 0, // average days
  costPerHire: 0,

  // Candidate metrics
  totalCandidates: 0,
  qualifiedCandidates: 0,
  interviewConversionRate: 0,
  offerAcceptanceRate: 0,

  // Engagement metrics
  profileViews: 0,
  jobViews: 0,
  followers: 0,

  // Demographics
  candidateDemographics: {},
  hireDemographics: {},

  // Time-based
  daily: [],
  weekly: [],
  monthly: [],
};

// Company search filters
export const CompanySearchFilters = {
  name: '',
  industries: [],
  sizes: [],
  types: [],
  locations: [],
  verified: null,
  hiring: null,
  rating: null,
  createdAfter: null,
  createdBefore: null,
};

// Job search filters
export const JobSearchFilters = {
  title: '',
  company: '',
  location: '',
  remote: null,
  jobTypes: [],
  jobLevels: [],
  industries: [],
  salary: {
    min: null,
    max: null,
  },
  skills: [],
  postedAfter: null,
  postedBefore: null,
  applicationDeadline: null,
};

// Candidate search filters
export const CandidateSearchFilters = {
  skills: [],
  experience: {
    min: null,
    max: null,
  },
  education: [],
  locations: [],
  availability: null,
  expectedSalary: {
    min: null,
    max: null,
  },
  languages: [],
  willingToRelocate: null,
};

// Company export options
export const CompanyExportOptions = {
  format: 'json',
  fields: [],
  includeJobs: true,
  includeEmployees: true,
  includeAnalytics: false,
  dateRange: {
    start: null,
    end: null,
  },
};

// Type guards
export const CompanyTypeGuards = {
  /**
   * Check if company is verified
   */
  isVerified: (company) => {
    return company?.verified === true;
  },

  /**
   * Check if company is hiring
   */
  isHiring: (company) => {
    return company?.activeJobs > 0;
  },

  /**
   * Check if job is accepting applications
   */
  isJobAcceptingApplications: (job) => {
    if (job?.status !== Status.ACTIVE) return false;
    if (job?.applicationDeadline) {
      return new Date(job.applicationDeadline) > new Date();
    }
    return true;
  },

  /**
   * Check if user has applied to job
   */
  hasUserApplied: (applications, userId, jobId) => {
    return applications.some((app) => app.userId === userId && app.jobId === jobId);
  },

  /**
   * Check if user has saved job
   */
  hasUserSavedJob: (savedJobs, userId, jobId) => {
    return savedJobs.some((job) => job.userId === userId && job.jobId === jobId);
  },

  /**
   * Check if user follows company
   */
  doesUserFollowCompany: (followers, userId, companyId) => {
    return followers.some((f) => f.userId === userId && f.companyId === companyId);
  },
};
