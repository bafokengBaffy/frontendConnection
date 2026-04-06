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

const LoadingFallback = () => (
  <div className="loading-container">
    <LoadingSpinner message="Loading Career Connect..." />
  </div>
);

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

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {getPublicRoutes()}
        {getCommonRoutes()}
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
    };

    const handleOffline = () => {
      console.warn('App is offline');
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
