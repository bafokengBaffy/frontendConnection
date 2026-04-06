import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Lazy load common pages
const Notifications = React.lazy(() => import('../../pages/Notifications'));
const Settings = React.lazy(() => import('../../pages/Settings'));
const Search = React.lazy(() => import('../../pages/Search'));
const Resources = React.lazy(() => import('../../pages/Resources/Resources'));

// Dashboard redirect component
const DashboardRedirect = () => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

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
    government: '/government/dashboard',
    system: '/system/dashboard',
  };

  const redirectPath = dashboardMap[userProfile.userType] || '/student/dashboard';

  return <Navigate to={redirectPath} replace />;
};

export const getCommonRoutes = () => (
  <React.Fragment>
    <Route
      path="/dashboard"
      element={
        <CommonRouteGuard>
          <DashboardRedirect />
        </CommonRouteGuard>
      }
    />
    <Route
      path="/notifications"
      element={
        <CommonRouteGuard>
          <Notifications />
        </CommonRouteGuard>
      }
    />
    <Route
      path="/settings"
      element={
        <CommonRouteGuard>
          <Settings />
        </CommonRouteGuard>
      }
    />
    <Route
      path="/search"
      element={
        <CommonRouteGuard>
          <Search />
        </CommonRouteGuard>
      }
    />
    <Route
      path="/resources"
      element={
        <CommonRouteGuard>
          <Resources />
        </CommonRouteGuard>
      }
    />
  </React.Fragment>
);

export default getCommonRoutes;
