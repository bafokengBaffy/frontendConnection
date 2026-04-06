import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const GovernmentDashboard = lazy(() => import('../../pages/government/GovernmentDashboard'));
const PolicyManagement = lazy(() => import('../../pages/government/PolicyManagement'));
const YouthEmploymentAnalytics = lazy(
  () => import('../../pages/government/YouthEmploymentAnalytics')
);
const FundingAllocation = lazy(() => import('../../pages/government/FundingAllocation'));
const RegionalDevelopment = lazy(() => import('../../pages/government/RegionalDevelopment'));
const EconomicImpact = lazy(() => import('../../pages/government/EconomicImpact'));
const ProgramEffectiveness = lazy(() => import('../../pages/government/ProgramEffectiveness'));

export const getGovernmentRoutes = () => [
  <Route
    key="government-government-dashboard"
    path="/government/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <GovernmentDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-policy-management"
    path="/government/policy-management"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <PolicyManagement />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-youth-employment-analytics"
    path="/government/youth-employment-analytics"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <YouthEmploymentAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-funding-allocation"
    path="/government/funding-allocation"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <FundingAllocation />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-regional-development"
    path="/government/regional-development"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <RegionalDevelopment />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-economic-impact"
    path="/government/economic-impact"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <EconomicImpact />
      </ProtectedRoute>
    }
  />,
  <Route
    key="government-program-effectiveness"
    path="/government/program-effectiveness"
    element={
      <ProtectedRoute allowedUserTypes={['government', 'admin']}>
        <ProgramEffectiveness />
      </ProtectedRoute>
    }
  />,
];

export default getGovernmentRoutes;
