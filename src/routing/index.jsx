import React from 'react';
import { getPublicRoutes } from './modules/PublicRoutes';
import { getAdminRoutes } from './modules/AdminRoutes';
import { getStudentRoutes } from './modules/StudentRoutes';
import { getCompanyRoutes } from './modules/CompanyRoutes';
import { getAIRoutes } from './modules/AIRoutes';
import { getCommonRoutes } from './modules/CommonRoutes';

// Import utility components directly
import { ScrollToTop, FirebaseLoader } from './utils/routingUtils';

// Lazy loaded components (fix: import the actual component, not from routingUtils)
const LoadingFallback = React.lazy(() => import('../components/layout/LoadingSpinner'));

export {
  getPublicRoutes,
  getAdminRoutes,
  getStudentRoutes,
  getCompanyRoutes,
  getAIRoutes,
  getCommonRoutes,
  LoadingFallback,
  ScrollToTop,
  FirebaseLoader
};