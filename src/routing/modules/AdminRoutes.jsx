import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded admin components
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../../pages/admin/UserManagement'));
const CompanyManagement = lazy(() => import('../../pages/admin/CompanyManagement'));
const JobManagement = lazy(() => import('../../pages/admin/JobManagement'));
const PendingApprovals = lazy(() => import('../../pages/admin/PendingApprovals'));
const SystemReports = lazy(() => import('../../pages/admin/SystemReports'));
const SystemSettings = lazy(() => import('../../pages/admin/SystemSettings'));
const AdminProfile = lazy(() => import('../../pages/admin/AdminProfile'));
const AdminSettings = lazy(() => import('../../pages/admin/AdminSettings'));
const AdminAudit = lazy(() => import('../../pages/admin/AdminAudit'));
const AdmissionsManagement = lazy(() => import('../../pages/admin/AdmissionsManagement'));
const SearchUsers = lazy(() => import('../../pages/admin/SearchUsers'));
const SearchCompanies = lazy(() => import('../../pages/admin/SearchCompanies'));
const SearchApplications = lazy(() => import('../../pages/admin/SearchApplications'));

/**
 * Admin Routes Module
 * Contains all admin-specific routes (requires admin authentication)
 */
export const getAdminRoutes = () => [
  // Admin Dashboard
  <Route
    key="admin-dashboard"
    path="/admin/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />,

  // Admin Management Routes
  <Route
    key="admin-users"
    path="/admin/users"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <UserManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-companies"
    path="/admin/companies"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <CompanyManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-jobs"
    path="/admin/jobs"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <JobManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-pending-approvals"
    path="/admin/pending-approvals"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <PendingApprovals />
      </ProtectedRoute>
    }
  />,

  // Admin Analytics & Reports
  <Route
    key="admin-analytics"
    path="/admin/analytics"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SystemReports />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-system-settings"
    path="/admin/system-settings"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SystemSettings />
      </ProtectedRoute>
    }
  />,

  // Admin Profile & Settings
  <Route
    key="admin-profile"
    path="/admin/profile"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-settings"
    path="/admin/settings"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminSettings />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-audit"
    path="/admin/audit"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminAudit />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-admissions"
    path="/admin/admissions"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdmissionsManagement />
      </ProtectedRoute>
    }
  />,

  // Admin Search Routes
  <Route
    key="admin-search-users"
    path="/admin/search/users"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchUsers />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-search-companies"
    path="/admin/search/companies"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchCompanies />
      </ProtectedRoute>
    }
  />,

  <Route
    key="admin-search-applications"
    path="/admin/search/applications"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchApplications />
      </ProtectedRoute>
    }
  />,

  // Legacy Admin Routes (backward compatibility)
  <Route
    key="adminprofile"
    path="/adminprofile"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="usermanagement"
    path="/usermanagement"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <UserManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="companymanagement"
    path="/companymanagement"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <CompanyManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="adminsettings"
    path="/adminsettings"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <AdminSettings />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchusers"
    path="/searchusers"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchUsers />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchcompanies"
    path="/searchcompanies"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchCompanies />
      </ProtectedRoute>
    }
  />,

  <Route
    key="searchapplications"
    path="/searchapplications"
    element={
      <ProtectedRoute allowedUserTypes={['admin']}>
        <SearchApplications />
      </ProtectedRoute>
    }
  />,
];
