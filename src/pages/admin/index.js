/**
 * Admin Pages Index
 * Export all admin-related pages
 */

export { default as AdminAudit } from './AdminAudit';
export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminProfile } from './AdminProfile';
export { default as AdminSettings } from './AdminSettings';
export { default as AdmissionsManagement } from './AdmissionsManagement';
export { default as CompanyManagement } from './CompanyManagement';
export { default as JobManagement } from './JobManagement';
export { default as PendingApprovals } from './PendingApprovals';
export { default as SearchApplications } from './SearchApplications';
export { default as SearchCompanies } from './SearchCompanies';
export { default as SearchUsers } from './SearchUsers';
export { default as SystemReports } from './SystemReports';
export { default as SystemSettings } from './SystemSettings';
export { default as UserManagement } from './UserManagement';

// Re-export types and utilities
export * from './types';
export * from './constants';
