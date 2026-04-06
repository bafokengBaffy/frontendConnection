import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const EcosystemDashboard = lazy(() => import('../../pages/collaboration/EcosystemDashboard'));
const StakeholderEngagement = lazy(() => import('../../pages/collaboration/StakeholderEngagement'));
const PartnershipHub = lazy(() => import('../../pages/collaboration/PartnershipHub'));
const ValueChainAnalyzer = lazy(() => import('../../pages/collaboration/ValueChainAnalyzer'));

export const getCollaborationRoutes = () => [
  <Route
    key="collaboration-ecosystem-dashboard"
    path="/collaboration/ecosystem-dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'collaboration']}>
        <EcosystemDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="collaboration-stakeholder-engagement"
    path="/collaboration/stakeholder-engagement"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'collaboration']}>
        <StakeholderEngagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="collaboration-partnership-hub"
    path="/collaboration/partnership-hub"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'collaboration']}>
        <PartnershipHub />
      </ProtectedRoute>
    }
  />,
  <Route
    key="collaboration-value-chain-analyzer"
    path="/collaboration/value-chain-analyzer"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'collaboration']}>
        <ValueChainAnalyzer />
      </ProtectedRoute>
    }
  />,
];

export default getCollaborationRoutes;
