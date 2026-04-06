import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const InstitutionDashboard = lazy(() => import('../../pages/institute/InstitutionDashboard.jsx'));
const InstituteProfile = lazy(() => import('../../pages/institute/InstituteProfile.jsx'));
const ManageCourses = lazy(() => import('../../pages/institute/ManageCourses.jsx'));
const ManageFaculties = lazy(() => import('../../pages/institute/ManageFaculties.jsx'));
const ReviewApplications = lazy(() => import('../../pages/institute/ReviewApplications.jsx'));
const StudentManagement = lazy(() => import('../../pages/institute/StudentManagement.jsx'));
const InstituteSettings = lazy(() => import('../../pages/institute/Settings.jsx'));

/**
 * Institute Routes Module
 * Contains all institute-specific routes (requires institute authentication)
 */
export const getInstituteRoutes = () => {
  return [
    <Route
      key="institute-root"
      path="/institute"
      element={
        <ProtectedRoute requiredRole="institute">
          <InstitutionDashboard />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-dashboard"
      path="/institute/dashboard"
      element={
        <ProtectedRoute requiredRole="institute">
          <InstitutionDashboard />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-profile"
      path="/institute/profile"
      element={
        <ProtectedRoute requiredRole="institute">
          <InstituteProfile />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-courses"
      path="/institute/courses"
      element={
        <ProtectedRoute requiredRole="institute">
          <ManageCourses />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-faculties"
      path="/institute/faculties"
      element={
        <ProtectedRoute requiredRole="institute">
          <ManageFaculties />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-applications"
      path="/institute/applications"
      element={
        <ProtectedRoute requiredRole="institute">
          <ReviewApplications />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-students"
      path="/institute/students"
      element={
        <ProtectedRoute requiredRole="institute">
          <StudentManagement />
        </ProtectedRoute>
      }
    />,
    <Route
      key="institute-settings"
      path="/institute/settings"
      element={
        <ProtectedRoute requiredRole="institute">
          <InstituteSettings />
        </ProtectedRoute>
      }
    />,
  ];
};

export default getInstituteRoutes;
