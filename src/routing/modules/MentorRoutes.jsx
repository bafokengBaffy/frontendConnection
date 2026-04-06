import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded mentor components
const MentorDashboard = lazy(() => import('../../pages/mentor/MentorDashboard'));
const MentorProfile = lazy(() => import('../../pages/mentor/MentorProfile'));
const MentorSessions = lazy(() => import('../../pages/mentor/MentorSessions'));
const MentorApplications = lazy(() => import('../../pages/mentor/MentorApplications'));
const MentorEarnings = lazy(() => import('../../pages/mentor/MentorEarnings'));

/**
 * Mentor Routes Module
 * Contains all mentor-specific routes (requires mentor authentication)
 */
export const getMentorRoutes = () => [
  // Mentor Dashboard
  <Route
    key="mentor-dashboard"
    path="/mentor/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorDashboard />
      </ProtectedRoute>
    }
  />,

  // Mentor Profile
  <Route
    key="mentor-profile"
    path="/mentor/profile"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorProfile />
      </ProtectedRoute>
    }
  />,

  // Sessions Management
  <Route
    key="mentor-sessions"
    path="/mentor/sessions"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorSessions />
      </ProtectedRoute>
    }
  />,

  // Applications
  <Route
    key="mentor-applications"
    path="/mentor/applications"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorApplications />
      </ProtectedRoute>
    }
  />,

  // Earnings
  <Route
    key="mentor-earnings"
    path="/mentor/earnings"
    element={
      <ProtectedRoute allowedUserTypes={['mentor']}>
        <MentorEarnings />
      </ProtectedRoute>
    }
  />,
];

// Default export for backward compatibility
export default getMentorRoutes;
