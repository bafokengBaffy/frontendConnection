/**
 * Routing Modules Index
 * Central export point for all route modules
 */

// Import all route modules (these are functions that return arrays of Route elements)
import AdminRoutes from './AdminRoutes';
import AIRoutes from './AIRoutes';
import AlumniRoutes from './AlumniRoutes';
import CollaborationRoutes from './CollaborationRoutes';
import CommonRoutes from './CommonRoutes';
import CompanyRoutes from './CompanyRoutes';
import EntrepreneurRoutes from './EntrepreneurRoutes';
import GovernmentRoutes from './GovernmentRoutes';
import InstituteRoutes from './InstituteRoutes';
import MentorRoutes from './MentorRoutes';
import ParentRoutes from './ParentRoutes';
import PublicRoutes from './PublicRoutes';
import ResourcesRoutes from './ResourcesRoutes';
import StudentRoutes from './StudentRoutes';
import SystemRoutes from './SystemRoutes';
import YouthRoutes from './YouthRoutes';

// Execute the route functions to get the actual route arrays
const adminRoutes = AdminRoutes();
const aiRoutes = AIRoutes();
const alumniRoutes = AlumniRoutes();
const collaborationRoutes = CollaborationRoutes();
const commonRoutes = CommonRoutes();
const companyRoutes = CompanyRoutes();
const entrepreneurRoutes = EntrepreneurRoutes();
const governmentRoutes = GovernmentRoutes();
const instituteRoutes = InstituteRoutes();
const mentorRoutes = MentorRoutes();
const parentRoutes = ParentRoutes();
const publicRoutes = PublicRoutes();
const resourcesRoutes = ResourcesRoutes();
const studentRoutes = StudentRoutes();
const systemRoutes = SystemRoutes();
const youthRoutes = YouthRoutes();

// Combine all protected routes (require authentication)
export const protectedRoutes = [
  ...adminRoutes,
  ...aiRoutes,
  ...alumniRoutes,
  ...collaborationRoutes,
  ...companyRoutes,
  ...entrepreneurRoutes,
  ...governmentRoutes,
  ...instituteRoutes,
  ...mentorRoutes,
  ...parentRoutes,
  ...studentRoutes,
  ...systemRoutes,
  ...youthRoutes,
];

// Combine all public routes (no authentication required)
export const allPublicRoutes = [...commonRoutes, ...publicRoutes, ...resourcesRoutes];

// Combined routes for easy import
export const allRoutes = [...protectedRoutes, ...allPublicRoutes];

// Export the route functions for use in other parts of the app
export {
  adminRoutes,
  aiRoutes,
  alumniRoutes,
  collaborationRoutes,
  commonRoutes,
  companyRoutes,
  entrepreneurRoutes,
  governmentRoutes,
  instituteRoutes,
  mentorRoutes,
  parentRoutes,
  publicRoutes,
  resourcesRoutes,
  studentRoutes,
  systemRoutes,
  youthRoutes,
};

// Default export for convenience
export default {
  protectedRoutes,
  allPublicRoutes,
  allRoutes,
  adminRoutes,
  aiRoutes,
  alumniRoutes,
  collaborationRoutes,
  commonRoutes,
  companyRoutes,
  entrepreneurRoutes,
  governmentRoutes,
  instituteRoutes,
  mentorRoutes,
  parentRoutes,
  publicRoutes,
  resourcesRoutes,
  studentRoutes,
  systemRoutes,
  youthRoutes,
};
