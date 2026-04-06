import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const SystemHealth = lazy(() => import('../../pages/system/SystemHealth'));
const PerformanceMetrics = lazy(() => import('../../pages/system/PerformanceMetrics'));
const AnomalyDetection = lazy(() => import('../../pages/system/AnomalyDetection'));
const UserBehaviorAnalytics = lazy(() => import('../../pages/system/UserBehaviorAnalytics'));
const FraudMonitoring = lazy(() => import('../../pages/system/FraudMonitoring'));
const PlatformOptimization = lazy(() => import('../../pages/system/PlatformOptimization'));

export const getSystemRoutes = () => [
  <Route
    key="system-system-health"
    path="/system/health"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <SystemHealth />
      </ProtectedRoute>
    }
  />,
  <Route
    key="system-performance-metrics"
    path="/system/performance-metrics"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <PerformanceMetrics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="system-anomaly-detection"
    path="/system/anomaly-detection"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <AnomalyDetection />
      </ProtectedRoute>
    }
  />,
  <Route
    key="system-user-behavior-analytics"
    path="/system/user-behavior-analytics"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <UserBehaviorAnalytics />
      </ProtectedRoute>
    }
  />,
  <Route
    key="system-fraud-monitoring"
    path="/system/fraud-monitoring"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <FraudMonitoring />
      </ProtectedRoute>
    }
  />,
  <Route
    key="system-platform-optimization"
    path="/system/platform-optimization"
    element={
      <ProtectedRoute allowedUserTypes={['admin', 'system']}>
        <PlatformOptimization />
      </ProtectedRoute>
    }
  />,
];

export default getSystemRoutes;
