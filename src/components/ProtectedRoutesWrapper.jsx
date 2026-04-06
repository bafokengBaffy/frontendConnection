// frontend/src/components/ProtectedRoutesWrapper.jsx
import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './layout/LoadingSpinner';

// Lazy load the route modules
const AdminRoutes = React.lazy(() => import('../routing/modules/AdminRoutes'));
const StudentRoutes = React.lazy(() => import('../routing/modules/StudentRoutes'));
const CompanyRoutes = React.lazy(() => import('../routing/modules/CompanyRoutes'));
const InstituteRoutes = React.lazy(() => import('../routing/modules/InstituteRoutes'));
const MentorRoutes = React.lazy(() => import('../routing/modules/MentorRoutes'));
const YouthRoutes = React.lazy(() => import('../routing/modules/YouthRoutes'));
const EntrepreneurRoutes = React.lazy(() => import('../routing/modules/EntrepreneurRoutes'));
const ParentRoutes = React.lazy(() => import('../routing/modules/ParentRoutes'));
const AlumniRoutes = React.lazy(() => import('../routing/modules/AlumniRoutes'));
const AIRoutes = React.lazy(() => import('../routing/modules/AIRoutes'));

const LoadingFallback = () => <LoadingSpinner message="Loading dashboard..." />;

const ProtectedRoutesWrapper = ({ allowedUserTypes = [] }) => {
  const { currentUser, userProfile, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <LoadingFallback />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile
  if (!userProfile) {
    return <LoadingFallback />;
  }

  // Check if user type is allowed
  const userType = userProfile.userType;
  const isAdmin = userProfile.isAdmin || userType === 'admin';

  // Admins can access everything
  if (isAdmin && allowedUserTypes.length > 0) {
    // Determine which routes to render based on the path
    const path = location.pathname;

    if (path.startsWith('/admin')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AdminRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/student')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <StudentRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/company')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <CompanyRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/institute')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <InstituteRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/mentor')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <MentorRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/youth')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <YouthRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/entrepreneur')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <EntrepreneurRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/parent')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ParentRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/alumni')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AlumniRoutes />
        </Suspense>
      );
    }
    if (path.startsWith('/ai')) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AIRoutes />
        </Suspense>
      );
    }
  }

  // Check if user type is allowed (non-admin)
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    // Redirect to appropriate dashboard
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

    const redirectPath = dashboardMap[userType] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Render the appropriate routes based on the path
  const path = location.pathname;

  if (path.startsWith('/admin')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AdminRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/student')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <StudentRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/company')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <CompanyRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/institute')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <InstituteRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/mentor')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MentorRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/youth')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <YouthRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/entrepreneur')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <EntrepreneurRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/parent')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ParentRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/alumni')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AlumniRoutes />
      </Suspense>
    );
  }
  if (path.startsWith('/ai')) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AIRoutes />
      </Suspense>
    );
  }

  // Default fallback
  return <Navigate to="/" replace />;
};

export default ProtectedRoutesWrapper;
