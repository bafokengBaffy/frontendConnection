import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading...</span>
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for userProfile to load
  if (!userProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="info" />
        <span className="ms-3">Loading your profile...</span>
      </div>
    );
  }

  // If allowedUserTypes is specified, check if user's type is allowed
  if (allowedUserTypes.length > 0) {
    // Normalize userType
    const rawUserType = userProfile?.userType || 'student';
    const userType = rawUserType === 'institute' ? 'institution' : rawUserType;

    // Also normalize allowed types
    const normalizedAllowedTypes = allowedUserTypes.map((type) =>
      type === 'institute' ? 'institution' : type
    );

    if (!normalizedAllowedTypes.includes(userType)) {
      console.log(
        `🚫 Access denied: User type ${userType} not in allowed types:`,
        normalizedAllowedTypes
      );

      // Redirect to appropriate dashboard based on user type
      let redirectPath = '/dashboard';
      switch (userType) {
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'student':
          redirectPath = '/student/dashboard';
          break;
        case 'company':
          redirectPath = '/company/dashboard';
          break;
        case 'entrepreneur':
          redirectPath = '/entrepreneur/dashboard';
          break;
        case 'institution':
          redirectPath = '/institute/dashboard';
          break;
        case 'employer':
          redirectPath = '/employer/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }

      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
