import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Container, Alert } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedUserTypes = [] }) => {
  const { currentUser, userProfile, loading, isAuthenticated, isOffline, needsEmailVerification } =
    useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </Container>
    );
  }

  // Check offline status
  if (isOffline) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>You're offline</Alert.Heading>
          <p>Please check your internet connection and try again.</p>
        </Alert>
      </Container>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification
  if (needsEmailVerification()) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="warning" className="text-center">
          <Alert.Heading>Email Verification Required</Alert.Heading>
          <p>Please verify your email address to access this page.</p>
          <p className="mb-0">
            <small>Check your inbox for the verification link.</small>
          </p>
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
          <p className="mt-3 text-muted">Loading profile...</p>
        </div>
      </Container>
    );
  }

  // Check allowed user types
  if (allowedUserTypes.length > 0) {
    const userType = userProfile.userType;
    const isAllowed = allowedUserTypes.includes(userType) || userProfile.isAdmin;

    if (!isAllowed) {
      // Redirect to appropriate dashboard based on user type
      const dashboardMap = {
        admin: '/admin/dashboard',
        student: '/student/dashboard',
        company: '/company/dashboard',
        institute: '/institute/dashboard',
        mentor: '/mentor/dashboard',
        youth: '/youth/dashboard',
        entrepreneur: '/entrepreneur/dashboard',
        parent: '/parent/dashboard',
        alumni: '/alumni/dashboard',
      };

      const redirectPath = dashboardMap[userType] || '/student/dashboard';

      return <Navigate to={redirectPath} replace />;
    }
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;
