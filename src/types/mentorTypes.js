/**
 * Mentor-related Type Definitions
 */

import { Status, Currency } from './index';

// Mentor status
export const MentorStatus = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away',
  OFFLINE: 'offline',
  ON_LEAVE: 'on_leave',
};

// Mentorship type
export const MentorshipType = {
  ONE_ON_ONE: 'one_on_one',
  GROUP: 'group',
  WORKSHOP: 'workshop',
  WEBINAR: 'webinar',
  COURSE: 'course',
  DROP_IN: 'drop_in',
};

// Session status
export const SessionStatus = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
  NO_SHOW: 'no_show',
};

// Expertise level
export const ExpertiseLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

// Mentor interface
export const Mentor = {
  id: '',
  userId: '',

  // Professional info
  title: '',
  company: '',
  yearsOfExperience: 0,

  // Expertise
  expertise: [],
  industries: [],
  skills: [],

  // Bio
  bio: '',
  shortBio: '',
  achievements: [],

  // Mentorship
  mentorshipTypes: [MentorshipType.ONE_ON_ONE],
  maxMentees: 5,
  currentMentees: 0,

  // Availability
  availability: {
    timezone: '',
    hours: [], // Available hours
    daysOff: [],
  },

  // Rates
  rates: {
    hourly: 0,
    session: 0,
    package: 0,
    currency: Currency.LSL,
  },

  // Media
  profilePicture: '',
  coverImage: '',
  introVideo: '',

  // Verification
  verified: false,
  verifiedBy: '',
  verifiedAt: null,

  // Ratings
  averageRating: 0,
  totalReviews: 0,
  totalSessions: 0,

  // Status
  status: MentorStatus.AVAILABLE,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Mentorship session
export const MentorshipSession = {
  id: '',
  mentorId: '',
  menteeId: '',

  // Session details
  type: MentorshipType.ONE_ON_ONE,
  title: '',
  description: '',

  // Schedule
  scheduledAt: null,
  duration: 60, // minutes
  timezone: '',

  // Location
  location: '', // physical location
  meetingLink: '', // virtual meeting link

  // Topics
  topics: [],
  objectives: [],
  materials: [],

  // Status
  status: SessionStatus.SCHEDULED,
  cancellationReason: '',

  // Feedback
  mentorFeedback: {
    rating: null,
    comment: '',
    submittedAt: null,
  },
  menteeFeedback: {
    rating: null,
    comment: '',
    submittedAt: null,
  },

  // Notes
  mentorNotes: '',
  menteeNotes: '',
  actionItems: [],

  // Recording
  recording: '',
  transcript: '',

  // Metadata
  createdAt: null,
  updatedAt: null,
  completedAt: null,
};

// Mentorship request
export const MentorshipRequest = {
  id: '',
  mentorId: '',
  menteeId: '',

  // Request details
  type: MentorshipType.ONE_ON_ONE,
  message: '',
  goals: [],
  expectations: '',

  // Schedule preferences
  preferredDates: [],
  preferredTimes: [],
  duration: 60,

  // Status
  status: 'pending', // pending, accepted, declined, cancelled
  respondedAt: null,
  responseMessage: '',

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Mentorship relationship
export const MentorshipRelationship = {
  id: '',
  mentorId: '',
  menteeId: '',

  // Relationship details
  startDate: null,
  endDate: null,
  isActive: true,

  // Goals
  goals: [],
  milestones: [],

  // Progress
  sessionsCompleted: 0,
  totalSessions: 0,
  nextSessionId: '',

  // Communication
  preferredContact: 'email', // email, phone, video, in_person
  communicationFrequency: 'weekly',

  // Notes
  notes: [],

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Mentor review
export const MentorReview = {
  id: '',
  mentorId: '',
  menteeId: '',
  sessionId: '',

  // Ratings (1-5)
  overallRating: 0,
  knowledgeRating: 0,
  communicationRating: 0,
  helpfulnessRating: 0,
  punctualityRating: 0,

  // Review
  title: '',
  comment: '',
  pros: '',
  cons: '',

  // Recommendation
  wouldRecommend: true,

  // Verification
  verified: true,

  // Metadata
  helpful: 0,
  notHelpful: 0,
  reports: 0,
  createdAt: null,
  updatedAt: null,
};

// Mentor availability
export const MentorAvailability = {
  id: '',
  mentorId: '',

  // Weekly schedule
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],

  // Date-specific availability
  specificDates: [],

  // Breaks
  breaks: [],

  // Timezone
  timezone: '',

  // Buffer time between sessions
  bufferTime: 15, // minutes

  // Advance booking
  minAdvanceNotice: 24, // hours
  maxAdvanceBooking: 30, // days

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Mentor skill
export const MentorSkill = {
  id: '',
  mentorId: '',
  name: '',
  level: ExpertiseLevel.INTERMEDIATE,
  yearsOfExperience: 0,
  verified: false,
};

// Mentor certification
export const MentorCertification = {
  id: '',
  mentorId: '',
  name: '',
  issuingOrganization: '',
  issueDate: null,
  expirationDate: null,
  credentialId: '',
  credentialUrl: '',
};

// Mentor education
export const MentorEducation = {
  id: '',
  mentorId: '',
  institution: '',
  degree: '',
  field: '',
  startDate: null,
  endDate: null,
  grade: '',
};

// Mentor work experience
export const MentorWorkExperience = {
  id: '',
  mentorId: '',
  title: '',
  company: '',
  location: '',
  startDate: null,
  endDate: null,
  current: false,
  description: '',
  achievements: [],
};

// Mentorship program
export const MentorshipProgram = {
  id: '',
  mentorId: '',
  name: '',
  description: '',

  // Program details
  type: MentorshipType.COURSE,
  duration: '', // e.g., "8 weeks"
  sessions: 8,
  sessionDuration: 60,

  // Curriculum
  curriculum: [],
  materials: [],

  // Pricing
  price: 0,
  currency: Currency.LSL,
  hasDiscounts: false,

  // Enrollment
  maxParticipants: 20,
  currentParticipants: 0,

  // Dates
  startDate: null,
  endDate: null,
  enrollmentDeadline: null,

  // Status
  status: Status.ACTIVE,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Program enrollment
export const ProgramEnrollment = {
  id: '',
  programId: '',
  menteeId: '',

  // Enrollment details
  enrolledAt: null,
  startDate: null,
  endDate: null,

  // Progress
  sessionsCompleted: 0,
  totalSessions: 0,
  currentSession: 0,

  // Status
  status: 'active', // active, completed, dropped, refunded

  // Payment
  paymentStatus: 'pending', // pending, paid, refunded
  amountPaid: 0,

  // Feedback
  feedback: '',
  rating: null,

  // Certificate
  certificateIssued: false,
  certificateUrl: '',

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Mentor analytics
export const MentorAnalytics = {
  mentorId: '',

  // Session metrics
  totalSessions: 0,
  completedSessions: 0,
  cancelledSessions: 0,
  noShowSessions: 0,
  averageSessionDuration: 0,

  // Mentee metrics
  totalMentees: 0,
  activeMentees: 0,
  completedMentees: 0,

  // Financial metrics
  totalEarnings: 0,
  pendingPayments: 0,
  averageRate: 0,

  // Rating metrics
  averageRating: 0,
  totalReviews: 0,
  fiveStarReviews: 0,

  // Engagement metrics
  responseRate: 0,
  averageResponseTime: 0,
  bookingRate: 0,

  // Time-based
  daily: [],
  weekly: [],
  monthly: [],
};

// Mentor search filters
export const MentorSearchFilters = {
  name: '',
  expertise: [],
  industries: [],
  skills: [],
  rating: {
    min: null,
    max: null,
  },
  hourlyRate: {
    min: null,
    max: null,
  },
  availability: null,
  languages: [],
  verified: null,
  yearsOfExperience: {
    min: null,
    max: null,
  },
};

// Mentor export options
export const MentorExportOptions = {
  format: 'json',
  fields: [],
  includeSessions: true,
  includeReviews: true,
  includeAnalytics: false,
  dateRange: {
    start: null,
    end: null,
  },
};

// Type guards
export const MentorTypeGuards = {
  /**
   * Check if mentor is available
   */
  isAvailable: (mentor) => {
    return mentor?.status === MentorStatus.AVAILABLE;
  },

  /**
   * Check if mentor is verified
   */
  isVerified: (mentor) => {
    return mentor?.verified === true;
  },

  /**
   * Check if mentor has availability
   */
  hasAvailability: (mentor, date, duration) => {
    // Implementation depends on availability structure
    return true;
  },

  /**
   * Check if mentor accepts mentees
   */
  isAcceptingMentees: (mentor) => {
    return mentor?.currentMentees < mentor?.maxMentees;
  },

  /**
   * Check if session can be rescheduled
   */
  canRescheduleSession: (session, hoursBefore = 24) => {
    const sessionTime = new Date(session.scheduledAt).getTime();
    const now = new Date().getTime();
    const hoursDifference = (sessionTime - now) / (1000 * 60 * 60);
    return hoursDifference >= hoursBefore;
  },

  /**
   * Check if mentor has expertise
   */
  hasExpertise: (mentor, skill) => {
    return mentor?.skills?.includes(skill) || mentor?.expertise?.includes(skill);
  },

  /**
   * Check if mentor is top-rated
   */
  isTopRated: (mentor, threshold = 4.5) => {
    return mentor?.averageRating >= threshold && mentor?.totalReviews >= 10;
  },
};
