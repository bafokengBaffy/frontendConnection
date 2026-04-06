/* eslint-disable no-undef */
import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import { LoadingSpinner } from './components/layout/LoadingSpinner';

// Lazy load route components for code splitting
const PublicRoutes = lazy(() => import('./modules/PublicRoutes'));
const AdminRoutes = lazy(() => import('./modules/AdminRoutes'));
const StudentRoutes = lazy(() => import('./modules/StudentRoutes'));
const CompanyRoutes = lazy(() => import('./modules/CompanyRoutes'));
const CommonRoutes = lazy(() => import('./modules/CommonRoutes'));
const AIRoutes = lazy(() => import('./modules/AIRoutes'));

// Loading fallback
export const LoadingFallback = () => <LoadingSpinner message="Loading page..." />;

// Scroll to top on route change
export const ScrollToTop = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

// Firebase loader wrapper
export const FirebaseLoader = ({ children }) => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading Firebase..." />}>{children}</Suspense>
  );
};

// Route getters
export const getPublicRoutes = () => (
  <Route
    path="/*"
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <PublicRoutes />
      </Suspense>
    }
  />
);

export const getAdminRoutes = () => (
  <Route
    path="/admin/*"
    element={
      <Suspense fallback={<LoadingSpinner message="Loading admin panel..." />}>
        <AdminRoutes />
      </Suspense>
    }
  />
);

export const getStudentRoutes = () => (
  <Route
    path="/student/*"
    element={
      <Suspense fallback={<LoadingSpinner message="Loading student dashboard..." />}>
        <StudentRoutes />
      </Suspense>
    }
  />
);

export const getCompanyRoutes = () => (
  <Route
    path="/company/*"
    element={
      <Suspense fallback={<LoadingSpinner message="Loading company dashboard..." />}>
        <CompanyRoutes />
      </Suspense>
    }
  />
);

export const getCommonRoutes = () => (
  <Route
    path="/common/*"
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <CommonRoutes />
      </Suspense>
    }
  />
);

export const getAIRoutes = () => (
  <Route
    path="/ai/*"
    element={
      <Suspense fallback={<LoadingSpinner message="Loading AI features..." />}>
        <AIRoutes />
      </Suspense>
    }
  />
);
