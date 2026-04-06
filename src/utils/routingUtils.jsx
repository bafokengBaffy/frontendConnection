/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

/**
 * Scroll to top on route change
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * Firebase Loader Component - Ensures auth state is loaded
 */
export const FirebaseLoader = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading application...</p>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * Route constants for consistent routing
 */
export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_JOBS: '/student/jobs',
  STUDENT_DOCUMENTS: '/student/documents',

  // Company Routes
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_PROFILE: '/company/profile',
  COMPANY_JOBS: '/company/jobs',

  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',

  // Common Routes
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',

  // AI Routes
  AI_DASHBOARD: '/ai/dashboard',
};

/**
 * Utility to check if user has access to route
 */
export const checkRouteAccess = (userType, path) => {
  if (path.startsWith('/admin')) {
    return userType === 'admin';
  }

  if (path.startsWith('/student')) {
    return userType === 'student' || userType === 'admin';
  }

  if (path.startsWith('/company')) {
    return userType === 'company' || userType === 'admin';
  }

  if (path.startsWith('/institute')) {
    return userType === 'institute' || userType === 'admin';
  }

  if (path.startsWith('/mentor')) {
    return userType === 'mentor' || userType === 'admin';
  }

  if (path.startsWith('/youth')) {
    return userType === 'youth' || userType === 'entrepreneur' || userType === 'admin';
  }

  if (path.startsWith('/entrepreneur')) {
    return userType === 'entrepreneur' || userType === 'admin';
  }

  if (path.startsWith('/parent')) {
    return userType === 'parent' || userType === 'admin';
  }

  if (path.startsWith('/alumni')) {
    return userType === 'alumni' || userType === 'admin';
  }

  // Common routes accessible to all authenticated users
  const commonPaths = ['/settings', '/notifications', '/ai'];
  if (commonPaths.some((commonPath) => path.startsWith(commonPath))) {
    return true;
  }

  return false;
};
