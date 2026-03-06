import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { StudentProvider } from './context/StudentContext';

// Layout Components
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Routing Modules
import {
  getPublicRoutes,
  getAdminRoutes,
  getStudentRoutes,
  getCompanyRoutes,
  getAIRoutes,
  getCommonRoutes,
  LoadingFallback,
  ScrollToTop,
  FirebaseLoader,
} from './routing';

// Import 404 Component
const NotFound = React.lazy(() => import('./routing/components/NotFound'));

/**
 * Layout Wrapper Component - Prevents double sidebar
 */
function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

/**
 * Main App Content Component
 * Uses modular routing configuration
 */
function AppContent() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          {getPublicRoutes()}

          {/* ==================== PROTECTED ROUTES ==================== */}
          <Route element={<FirebaseLoader />}>
            {/* Wrap ALL protected routes with Layout */}
            <Route element={<LayoutWrapper />}>
              {/* Common Routes (accessible to all authenticated users) */}
              {getCommonRoutes()}

              {/* AI Routes (accessible to all authenticated users) */}
              {getAIRoutes()}

              {/* Admin Routes (admin only) */}
              {getAdminRoutes()}

              {/* Student Routes (student only) */}
              {getStudentRoutes()}

              {/* Company Routes (company only) */}
              {getCompanyRoutes()}

              {/* ============ 404 ROUTE ============ */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

/**
 * Main App Wrapper Component
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <StudentProvider>
            <AppContent />
          </StudentProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
