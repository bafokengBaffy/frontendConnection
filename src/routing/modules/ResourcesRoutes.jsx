import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded resources components
const ResourcesPage = lazy(() => import('../../pages/Resources/Resources'));

/**
 * Resources Routes Module
 * Contains all resources-related routes
 */
export const getResourcesRoutes = () => [
  <Route
    key="resources"
    path="/resources"
    element={
      <ProtectedRoute>
        <ResourcesPage />
      </ProtectedRoute>
    }
  />,
];

export default getResourcesRoutes;
