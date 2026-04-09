/**
 * Routing Modules Index
 * Central export point for all route modules
 */

// Import all route modules
import getAdminRoutes from './modules/AdminRoutes';
import getAIRoutes from './modules/AIRoutes';
import getAlumniRoutes from './modules/AlumniRoutes';
import getCollaborationRoutes from './modules/CollaborationRoutes';
import getCommonRoutes from './modules/CommonRoutes';
import getCompanyRoutes from './modules/CompanyRoutes';
import getEntrepreneurRoutes from './modules/EntrepreneurRoutes';
import getGovernmentRoutes from './modules/GovernmentRoutes';
import getInstituteRoutes from './modules/InstituteRoutes';
import getMentorRoutes from './modules/MentorRoutes';
import getParentRoutes from './modules/ParentRoutes';
import getPublicRoutes from './modules/PublicRoutes';
import getResourcesRoutes from './modules/ResourcesRoutes';
import getStudentRoutes from './modules/StudentRoutes';
import getSystemRoutes from './modules/SystemRoutes';
import getYouthRoutes from './modules/YouthRoutes';

// Execute the route functions to get the actual route arrays
export const adminRoutes = getAdminRoutes();
export const aiRoutes = getAIRoutes();
export const alumniRoutes = getAlumniRoutes();
export const collaborationRoutes = getCollaborationRoutes();
export const commonRoutes = getCommonRoutes();
export const companyRoutes = getCompanyRoutes();
export const entrepreneurRoutes = getEntrepreneurRoutes();
export const governmentRoutes = getGovernmentRoutes();
export const instituteRoutes = getInstituteRoutes();
export const mentorRoutes = getMentorRoutes();
export const parentRoutes = getParentRoutes();
export const publicRoutes = getPublicRoutes();
export const resourcesRoutes = getResourcesRoutes();
export const studentRoutes = getStudentRoutes();
export const systemRoutes = getSystemRoutes();
export const youthRoutes = getYouthRoutes();

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
