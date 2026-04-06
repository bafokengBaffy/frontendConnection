/* eslint-disable no-undef */
/* eslint-disable no-dupe-keys */
/**
 * Student-related Type Definitions
 */

import { JobType } from './companyTypes';

import { Status } from './index';

// Student status
export const StudentStatus = {
  ENROLLED: 'enrolled',
  GRADUATED: 'graduated',
  ON_LEAVE: 'on_leave',
  WITHDRAWN: 'withdrawn',
  PROBATION: 'probation',
  SUSPENDED: 'suspended',
};

// Enrollment type
export const EnrollmentType = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  ONLINE: 'online',
  DISTANCE: 'distance',
  EXECUTIVE: 'executive',
};

// Degree type
export const DegreeType = {
  CERTIFICATE: 'certificate',
  DIPLOMA: 'diploma',
  ASSOCIATE: 'associate',
  BACHELOR: 'bachelor',
  MASTER: 'master',
  DOCTORATE: 'doctorate',
  POST_DOCTORATE: 'post_doctorate',
};

// Academic year
export const AcademicYear = {
  FRESHMAN: 'freshman',
  SOPHOMORE: 'sophomore',
  JUNIOR: 'junior',
  SENIOR: 'senior',
  GRADUATE: 'graduate',
};

// Semester
export const Semester = {
  FALL: 'fall',
  SPRING: 'spring',
  SUMMER: 'summer',
  WINTER: 'winter',
};

// Grade type
export const GradeType = {
  LETTER: 'letter',
  PERCENTAGE: 'percentage',
  GPA: 'gpa',
  PASS_FAIL: 'pass_fail',
  SATISFACTORY: 'satisfactory',
};

// Course status
export const CourseStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  WAITLISTED: 'waitlisted',
};

// Student interface
export const Student = {
  id: '',
  userId: '',
  institutionId: '',

  // Academic info
  studentId: '',
  enrollmentType: EnrollmentType.FULL_TIME,
  status: StudentStatus.ENROLLED,

  // Program info
  program: '',
  degree: DegreeType.BACHELOR,
  major: '',
  minor: '',
  concentration: '',

  // Year info
  currentYear: AcademicYear.FRESHMAN,
  currentSemester: Semester.FALL,
  expectedGraduation: null,

  // Academic dates
  enrollmentDate: null,
  graduationDate: null,

  // Academic standing
  gpa: 0,
  creditsEarned: 0,
  creditsAttempted: 0,
  academicStanding: 'good', // good, probation, suspended

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Student profile
export const StudentProfile = {
  studentId: '',

  // Personal info
  personalStatement: '',
  achievements: [],
  extracurriculars: [],
  volunteerWork: [],

  // Academic interests
  researchInterests: [],
  careerInterests: [],
  preferredIndustries: [],

  // Skills
  technicalSkills: [],
  softSkills: [],
  languages: [],

  // Work experience
  workExperience: [],
  internships: [],

  // Projects
  projects: [],
  publications: [],
  presentations: [],

  // Portfolio
  portfolio: '',
  github: '',
  linkedin: '',

  // Preferences
  jobPreferences: {
    types: [],
    locations: [],
    remote: false,
    industries: [],
    salary: {
      min: null,
      max: null,
    },
  },

  // Availability
  availableForWork: false,
  availableFrom: null,
  workAuthorization: '',
};

// Course
export const Course = {
  id: '',
  institutionId: '',
  departmentId: '',

  // Basic info
  code: '',
  name: '',
  description: '',
  credits: 0,

  // Level
  level: 'undergraduate', // undergraduate, graduate
  year: 1,
  semester: Semester.FALL,

  // Prerequisites
  prerequisites: [],
  corequisites: [],

  // Schedule
  schedule: {
    days: [],
    time: '',
    location: '',
  },

  // Instructor
  instructorId: '',
  instructorName: '',

  // Capacity
  capacity: 0,
  enrolled: 0,
  waitlist: 0,

  // Materials
  syllabus: '',
  textbooks: [],
  materials: [],

  // Status
  status: Status.ACTIVE,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Course enrollment
export const CourseEnrollment = {
  id: '',
  studentId: '',
  courseId: '',
  semester: Semester.FALL,
  academicYear: '',

  // Enrollment details
  enrollmentDate: null,
  status: CourseStatus.IN_PROGRESS,
  grade: null,
  gradeType: GradeType.LETTER,

  // Attendance
  attendance: {
    total: 0,
    attended: 0,
    excused: 0,
    unexcused: 0,
  },

  // Performance
  assignments: [],
  exams: [],
  finalGrade: null,

  // Metadata
  droppedDate: null,
  completedDate: null,
  createdAt: null,
  updatedAt: null,
};

// Assignment
export const Assignment = {
  id: '',
  courseId: '',
  title: '',
  description: '',
  type: 'homework', // homework, quiz, project, presentation, etc.

  // Dates
  assignedDate: null,
  dueDate: null,
  submittedDate: null,

  // Points
  totalPoints: 0,
  pointsEarned: null,
  weight: 0,

  // Submission
  submissionType: 'online', // online, in_person, file_upload
  submitted: false,
  late: false,

  // Files
  attachments: [],
  submissions: [],

  // Feedback
  feedback: '',
  gradedBy: '',
  gradedAt: null,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Exam
export const Exam = {
  id: '',
  courseId: '',
  title: '',
  type: 'midterm', // midterm, final, quiz, test

  // Schedule
  scheduledDate: null,
  duration: 0, // minutes
  location: '',

  // Format
  format: 'in_person', // in_person, online, take_home
  totalPoints: 0,

  // Results
  score: null,
  grade: null,
  percentile: null,

  // Feedback
  feedback: '',
  reviewedAt: null,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Transcript
export const Transcript = {
  id: '',
  studentId: '',

  // Student info
  studentName: '',
  studentId: '',
  program: '',

  // Institution info
  institutionName: '',
  institutionId: '',

  // Academic summary
  totalCredits: 0,
  totalGPA: 0,
  majorGPA: 0,
  classRank: null,

  // Courses
  courses: [],

  // Honors
  honors: [],
  awards: [],

  // Verification
  verified: false,
  verifiedBy: '',
  verifiedAt: null,

  // Metadata
  issuedDate: null,
  createdAt: null,
  updatedAt: null,
};

// Academic record
export const AcademicRecord = {
  id: '',
  studentId: '',
  semester: Semester.FALL,
  academicYear: '',

  // Summary
  creditsAttempted: 0,
  creditsEarned: 0,
  semesterGPA: 0,
  cumulativeGPA: 0,

  // Courses
  courses: [],

  // Standing
  academicStanding: 'good',
  deanList: false,
  probation: false,

  // Notes
  notes: '',

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Scholarship
export const Scholarship = {
  id: '',
  name: '',
  provider: '',
  description: '',
  amount: 0,
  currency: 'USD',

  // Eligibility
  eligibilityCriteria: [],
  minimumGPA: 0,

  // Dates
  applicationDeadline: null,
  awardDate: null,

  // Status
  status: Status.ACTIVE,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Scholarship application
export const ScholarshipApplication = {
  id: '',
  studentId: '',
  scholarshipId: '',

  // Application details
  personalStatement: '',
  achievements: [],
  references: [],

  // Documents
  documents: [],

  // Status
  status: ApplicationStatus.SUBMITTED,
  statusHistory: [],

  // Review
  reviewedBy: '',
  reviewedAt: null,
  feedback: '',
  score: null,

  // Metadata
  submittedAt: null,
  createdAt: null,
  updatedAt: null,
};

// Internship
export const Internship = {
  id: '',
  companyId: '',
  title: '',
  description: '',

  // Details
  type: JobType.INTERNSHIP,
  duration: '',
  location: '',
  remote: false,

  // Compensation
  paid: false,
  salary: null,
  currency: 'USD',

  // Requirements
  requirements: [],
  preferredSkills: [],

  // Dates
  startDate: null,
  endDate: null,
  applicationDeadline: null,

  // Status
  status: Status.ACTIVE,

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Career counseling session
export const CareerCounseling = {
  id: '',
  studentId: '',
  counselorId: '',

  // Session details
  type: 'career_guidance', // career_guidance, resume_review, interview_prep
  scheduledAt: null,
  duration: 60,

  // Topics
  topics: [],
  notes: '',
  actionItems: [],

  // Feedback
  studentFeedback: '',
  counselorFeedback: '',
  rating: null,

  // Status
  status: 'scheduled', // scheduled, completed, cancelled

  // Metadata
  createdAt: null,
  updatedAt: null,
};

// Student analytics
export const StudentAnalytics = {
  studentId: '',

  // Academic metrics
  currentGPA: 0,
  creditsCompleted: 0,
  coursesInProgress: 0,
  coursesCompleted: 0,
  coursesFailed: 0,

  // Performance metrics
  averageGrade: 0,
  attendanceRate: 0,
  assignmentCompletionRate: 0,

  // Engagement metrics
  loginFrequency: 0,
  resourceAccessCount: 0,
  eventAttendance: 0,

  // Career metrics
  applicationsSubmitted: 0,
  interviewsAttended: 0,
  offersReceived: 0,

  // Time-based
  weeklyProgress: [],
  monthlyProgress: [],
  semesterProgress: [],
};

// Student search filters
export const StudentSearchFilters = {
  name: '',
  studentId: '',
  program: '',
  major: '',
  year: null,
  gpa: {
    min: null,
    max: null,
  },
  status: null,
  graduationYear: null,
  skills: [],
  languages: [],
};

// Type guards
export const StudentTypeGuards = {
  /**
   * Check if student is graduating soon
   */
  isGraduatingSoon: (student, months = 6) => {
    if (!student?.expectedGraduation) return false;
    const gradDate = new Date(student.expectedGraduation);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() + months);
    return gradDate <= cutoffDate;
  },

  /**
   * Check if student is on track
   */
  isOnTrack: (student) => {
    const requiredCreditsPerYear = 30; // Example
    const yearsEnrolled =
      student.currentYear === 'freshman'
        ? 1
        : student.currentYear === 'sophomore'
          ? 2
          : student.currentYear === 'junior'
            ? 3
            : 4;
    const expectedCredits = requiredCreditsPerYear * yearsEnrolled;
    return student.creditsEarned >= expectedCredits * 0.8; // 80% of expected
  },

  /**
   * Check if student is eligible for honors
   */
  isEligibleForHonors: (student) => {
    return student.gpa >= 3.5 && student.creditsEarned >= 60;
  },

  /**
   * Check if student is on probation
   */
  isOnProbation: (student) => {
    return student.academicStanding === 'probation';
  },

  /**
   * Check if student has completed prerequisite
   */
  hasCompletedPrerequisite: (student, courseCode) => {
    return student.completedCourses?.includes(courseCode);
  },
};
