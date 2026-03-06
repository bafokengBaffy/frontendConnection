import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import SettingsPage from '../../pages/Settings';
import Notifications from '../../pages/Notifications';
import Search from '../../pages/Search';

/**
 * Common Routes Module
 * Contains routes accessible to all authenticated users
 */
export const getCommonRoutes = () => {
  return [
    // Settings - Accessible to all authenticated users
    <Route
      key="settings"
      path="/settings"
      element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      }
    />,

    // Notifications - Accessible to all authenticated users
    <Route
      key="notifications"
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />,

    // Search - Accessible to all authenticated users
    <Route
      key="search"
      path="/search"
      element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      }
    />,
  ];
};
