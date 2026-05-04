import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

/**
 * Protected Route Component
 * Handles authentication, authorization, and route protection
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string[]} [props.allowedUserTypes=[]] - Allowed user types for this route
 * @param {string} [props.redirectPath='/login'] - Custom redirect path
 * @param {boolean} [props.requireEmailVerification=true] - Require email verification
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({
  children,
  allowedUserTypes = [],
  redirectPath = '/login',
  requireEmailVerification = true,
}) => {
  const { currentUser, userProfile, loading, isAuthenticated, isOffline, needsEmailVerification } =
    useAuth();
  const location = useLocation();

  /** @type {Object.<string, string>} */
  const DASHBOARD_MAP = {
    admin: '/admin/dashboard',
    student: '/student/dashboard',
    company: '/company/dashboard',
    institute: '/institute/dashboard',
    mentor: '/mentor/dashboard',
    youth: '/youth/dashboard',
    entrepreneur: '/entrepreneur/dashboard',
    parent: '/parent/dashboard',
    alumni: '/alumni/dashboard',
    government: '/government/dashboard',
    system: '/system/dashboard',
  };

  // Loading state with better UX
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  // Offline state with retry option
  if (isOffline) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="warning" className="text-center" style={{ maxWidth: '500px' }}>
          <Alert.Heading>
            <i className="bi bi-wifi-off me-2"></i>
            You're Offline
          </Alert.Heading>
          <p>Please check your internet connection and try again.</p>
          <Button
            variant="outline-warning"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry Connection
          </Button>
        </Alert>
      </Container>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return (
      <Navigate
        to={redirectPath}
        state={{
          from: location,
          message: 'Please log in to access this page',
        }}
        replace
      />
    );
  }

  // Email verification check
  if (requireEmailVerification && needsEmailVerification && needsEmailVerification()) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="warning" className="text-center" style={{ maxWidth: '500px' }}>
          <Alert.Heading>
            <i className="bi bi-envelope-exclamation me-2"></i>
            Email Verification Required
          </Alert.Heading>
          <p>Please verify your email address to access this page.</p>
          <p className="mb-3">
            <small className="text-muted">
              Check your inbox for the verification link. Didn't receive it? Check your spam folder.
            </small>
          </p>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              // Resend verification email logic
              if (currentUser && currentUser.sendEmailVerification) {
                currentUser
                  .sendEmailVerification()
                  .then(() => alert('Verification email sent! Please check your inbox.'))
                  .catch((error) => console.error('Error sending verification:', error));
              }
            }}
          >
            Resend Verification Email
          </Button>
        </Alert>
      </Container>
    );
  }

  // Wait for profile to load
  if (!userProfile) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  // Check allowed user types with admin override
  if (allowedUserTypes.length > 0) {
    const userType = userProfile.userType;
    const isAdmin = userProfile.isAdmin || userType === 'admin';
    const isAllowed = allowedUserTypes.includes(userType) || isAdmin;

    if (!isAllowed) {
      // Get appropriate dashboard for user type
      const targetPath = DASHBOARD_MAP[userType] || '/student/dashboard';

      return (
        <Navigate
          to={targetPath}
          state={{
            from: location,
            message: `Access denied. ${userType} users cannot access this page.`,
          }}
          replace
        />
      );
    }
  }

  // All checks passed - render children inside the shared app shell
  return <Layout>{children}</Layout>;
};

// Export both as default and as CommonRouteGuard for backward compatibility
export default ProtectedRoute;
export { ProtectedRoute as CommonRouteGuard };
