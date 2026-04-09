// frontend/src/App.jsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/layout/LoadingSpinner';
import {
  AuthProvider,
  useAuth,
  StudentProvider,
  NotificationProvider,
  YouthProvider,
  AlumniProvider,
  GovernmentProvider,
  ParentProvider,
  SystemProvider,
  CollaborationProvider,
  CompanyProvider,
  InstituteProvider,
  EntrepreneurProvider,
} from './context';
import { MentorProvider } from './context/MentorContext';
import { AIProvider } from './context/AIContext';
import getAdminRoutes from './routing/modules/AdminRoutes';
import getAIRoutes from './routing/modules/AIRoutes';
import getAlumniRoutes from './routing/modules/AlumniRoutes';
import getCommonRoutes from './routing/modules/CommonRoutes';
import getCompanyRoutes from './routing/modules/CompanyRoutes';
import getEntrepreneurRoutes from './routing/modules/EntrepreneurRoutes';
import getInstituteRoutes from './routing/modules/InstituteRoutes';
import getMentorRoutes from './routing/modules/MentorRoutes';
import getParentRoutes from './routing/modules/ParentRoutes';
import getPublicRoutes from './routing/modules/PublicRoutes';
import getStudentRoutes from './routing/modules/StudentRoutes';
import getYouthRoutes from './routing/modules/YouthRoutes';
import './App.css';

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container">
    <LoadingSpinner message="Loading Career Connect..." />
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="error-container">
    <div className="error-content">
      <h1>Something went wrong</h1>
      <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
      {error && <pre className="error-details">{error.message}</pre>}
      <button onClick={resetErrorBoundary} className="btn btn-primary">
        Try Again
      </button>
    </div>
  </div>
);

// Main app content with routes
const AppContent = () => {
  const { loading, error } = useAuth();

  // Show loading state
  if (loading) {
    return <LoadingFallback />;
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>Authentication Error</h1>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes - No authentication required */}
        {getPublicRoutes()}

        {/* Common Routes - Authentication required */}
        {getCommonRoutes()}

        {/* Protected Routes by User Type */}
        {getAdminRoutes()}
        {getStudentRoutes()}
        {getCompanyRoutes()}
        {getInstituteRoutes()}
        {getMentorRoutes()}
        {getYouthRoutes()}
        {getEntrepreneurRoutes()}
        {getParentRoutes()}
        {getAlumniRoutes()}
        {getAIRoutes()}

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// Main App component
function App() {
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      // Optional: Trigger a refresh or reconnection
      if (window.location.pathname !== '/') {
        window.location.reload();
      }
    };

    const handleOffline = () => {
      console.warn('App is offline - some features may be limited');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <NotificationProvider>
            <StudentProvider>
              <CompanyProvider>
                <InstituteProvider>
                  <EntrepreneurProvider>
                    <MentorProvider>
                      <YouthProvider>
                        <AlumniProvider>
                          <GovernmentProvider>
                            <ParentProvider>
                              <SystemProvider>
                                <CollaborationProvider>
                                  <AIProvider>
                                    <AppContent />
                                  </AIProvider>
                                </CollaborationProvider>
                              </SystemProvider>
                            </ParentProvider>
                          </GovernmentProvider>
                        </AlumniProvider>
                      </YouthProvider>
                    </MentorProvider>
                  </EntrepreneurProvider>
                </InstituteProvider>
              </CompanyProvider>
            </StudentProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
