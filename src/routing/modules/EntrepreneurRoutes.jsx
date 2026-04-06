import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded entrepreneur components
const EntrepreneurDashboard = lazy(() => import('../../pages/entrepreneur/EntrepreneurDashboard'));
const EntrepreneurProfile = lazy(() => import('../../pages/entrepreneur/EntrepreneurProfile'));

// Entrepreneur Hub Components
const EntrepreneurHubDashboard = lazy(
  () => import('../../pages/EntrepreneurHub/EntrepreneurDashboard')
);
const EntrepreneurHubProfile = lazy(
  () => import('../../pages/EntrepreneurHub/EntrepreneurProfile')
);
const Analytics = lazy(() => import('../../pages/EntrepreneurHub/Analytics'));
const AnalyticsJSX = lazy(() => import('../../pages/EntrepreneurHub/Analytics.jsx'));
const ApplicationManagement = lazy(
  () => import('../../pages/EntrepreneurHub/ApplicationManagement')
);
const ApplicationManagementJSX = lazy(
  () => import('../../pages/EntrepreneurHub/ApplicationManagement.jsx')
);
const Communications = lazy(() => import('../../pages/EntrepreneurHub/Communications'));
const CommunicationsJSX = lazy(() => import('../../pages/EntrepreneurHub/Communications.jsx'));
const CompanyProfile = lazy(() => import('../../pages/EntrepreneurHub/CompanyProfile'));
const CompanyProfileJSX = lazy(() => import('../../pages/EntrepreneurHub/CompanyProfile.jsx'));
const FundingPrograms = lazy(() => import('../../pages/EntrepreneurHub/FundingPrograms'));
const ManagePortfolio = lazy(() => import('../../pages/EntrepreneurHub/ManagePortfolio'));
const MediaLibrary = lazy(() => import('../../pages/EntrepreneurHub/MediaLibrary'));
const MentorNetwork = lazy(() => import('../../pages/EntrepreneurHub/MentorNetwork'));
const ReviewApplications = lazy(() => import('../../pages/EntrepreneurHub/ReviewApplications'));

/**
 * Entrepreneur Routes Module
 * Contains all entrepreneur-specific routes
 */
export const getEntrepreneurRoutes = () => [
  // Entrepreneur Dashboard
  <Route
    key="entrepreneur-dashboard"
    path="/entrepreneur/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <EntrepreneurDashboard />
      </ProtectedRoute>
    }
  />,

  // Entrepreneur Profile
  <Route
    key="entrepreneur-profile"
    path="/entrepreneur/profile"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <EntrepreneurProfile />
      </ProtectedRoute>
    }
  />,

  // Entrepreneur Hub Routes
  <Route
    key="entrepreneur-hub-dashboard"
    path="/entrepreneur-hub/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <EntrepreneurHubDashboard />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-profile"
    path="/entrepreneur-hub/profile"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <EntrepreneurHubProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-analytics"
    path="/entrepreneur-hub/analytics"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <Analytics />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-analytics-jsx"
    path="/entrepreneur-hub/analytics/details"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <AnalyticsJSX />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-applications"
    path="/entrepreneur-hub/applications"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <ApplicationManagement />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-applications-jsx"
    path="/entrepreneur-hub/applications/manage"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <ApplicationManagementJSX />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-communications"
    path="/entrepreneur-hub/communications"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <Communications />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-communications-jsx"
    path="/entrepreneur-hub/communications/messages"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <CommunicationsJSX />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-company-profile"
    path="/entrepreneur-hub/company"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <CompanyProfile />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-company-profile-jsx"
    path="/entrepreneur-hub/company/details"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <CompanyProfileJSX />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-funding"
    path="/entrepreneur-hub/funding"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <FundingPrograms />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-portfolio"
    path="/entrepreneur-hub/portfolio"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <ManagePortfolio />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-media"
    path="/entrepreneur-hub/media"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <MediaLibrary />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-mentors"
    path="/entrepreneur-hub/mentors"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <MentorNetwork />
      </ProtectedRoute>
    }
  />,

  <Route
    key="entrepreneur-hub-review"
    path="/entrepreneur-hub/review"
    element={
      <ProtectedRoute allowedUserTypes={['entrepreneur']}>
        <ReviewApplications />
      </ProtectedRoute>
    }
  />,
];

// Default export for backward compatibility
export default getEntrepreneurRoutes;
