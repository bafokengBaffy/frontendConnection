import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';

import { ROLE_BASED_REDIRECTS } from './routeConstants';

// Import Layout for LoadingFallback

export const LoadingFallback = () => (
  <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
    <Spinner animation="border" variant="primary" size="lg" />
    <span className="mt-3 text-muted">Loading Career Connect...</span>
  </div>
);

export const LoadingSpinner = () => (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" />
    <span className="ms-2">Loading...</span>
  </div>
);

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const FirebaseLoader = () => {
  const { currentUser, userProfile, loading, refreshUserProfile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && !userProfile && !loading && refreshUserProfile) {
      refreshUserProfile();
    }
  }, [location.pathname, currentUser, userProfile, loading, refreshUserProfile]);

  if (loading) {
    return <LoadingFallback />;
  }

  return <Outlet />;
};

export const EnhancedDashboardRedirect = () => {
  const { userProfile, currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile) {
    return <LoadingFallback />;
  }

  const userType = userProfile?.userType || 'student';
  const route = ROLE_BASED_REDIRECTS[userType] || '/student';

  return <Navigate to={route} replace />;
};
