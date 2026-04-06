import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

const ParentDashboard = lazy(() => import('../../pages/parent/ParentDashboard'));
const StudentProgress = lazy(() => import('../../pages/parent/StudentProgress'));
const WellbeingMonitor = lazy(() => import('../../pages/parent/WellbeingMonitor'));
const CareerGuidance = lazy(() => import('../../pages/parent/CareerGuidance'));
const FinancialPlanning = lazy(() => import('../../pages/parent/FinancialPlanning'));
const CommunicationHub = lazy(() => import('../../pages/parent/CommunicationHub'));

export const getParentRoutes = () => [
  <Route
    key="parent-parent-dashboard"
    path="/parent/dashboard"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <ParentDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="parent-student-progress"
    path="/parent/student-progress"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <StudentProgress />
      </ProtectedRoute>
    }
  />,
  <Route
    key="parent-wellbeing-monitor"
    path="/parent/wellbeing-monitor"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <WellbeingMonitor />
      </ProtectedRoute>
    }
  />,
  <Route
    key="parent-career-guidance"
    path="/parent/career-guidance"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <CareerGuidance />
      </ProtectedRoute>
    }
  />,
  <Route
    key="parent-financial-planning"
    path="/parent/financial-planning"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <FinancialPlanning />
      </ProtectedRoute>
    }
  />,
  <Route
    key="parent-communication-hub"
    path="/parent/communication-hub"
    element={
      <ProtectedRoute allowedUserTypes={['parent', 'admin']}>
        <CommunicationHub />
      </ProtectedRoute>
    }
  />,
];

export default getParentRoutes;
