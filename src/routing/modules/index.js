/* eslint-disable no-undef */
/**
 * Routing Modules Index
 * Export all route modules and resolved route collections.
 */

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

export {
  AdminRoutes,
  AIRoutes,
  AlumniRoutes,
  CollaborationRoutes,
  CommonRoutes,
  CompanyRoutes,
  EntrepreneurRoutes,
  GovernmentRoutes,
  InstituteRoutes,
  MentorRoutes,
  ParentRoutes,
  PublicRoutes,
  ResourcesRoutes,
  StudentRoutes,
  SystemRoutes,
  YouthRoutes,
};

export * from './types';
export * from './constants';

export const protectedRoutes = [
  ...AdminRoutes(),
  ...AIRoutes(),
  ...AlumniRoutes(),
  ...CollaborationRoutes(),
  ...CompanyRoutes(),
  ...EntrepreneurRoutes(),
  ...GovernmentRoutes(),
  ...InstituteRoutes(),
  ...MentorRoutes(),
  ...ParentRoutes(),
  ...StudentRoutes(),
  ...SystemRoutes(),
  ...YouthRoutes(),
];

export const publicRoutes = [...CommonRoutes(), ...PublicRoutes(), ...ResourcesRoutes()];

export const allRoutes = [...protectedRoutes, ...publicRoutes];

export default {
  protectedRoutes,
  publicRoutes,
  allRoutes,
};
