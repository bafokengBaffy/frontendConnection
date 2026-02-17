import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded AI components
const AIDashboard = lazy(() => import('../../pages/AI/AIDashboard'));
const BusinessInsights = lazy(() => import('../../pages/AI/BusinessInsights'));
const BusinessInsightsJSX = lazy(() => import('../../pages/AI/BusinessInsights.jsx'));
const PredictiveAnalytics = lazy(() => import('../../pages/AI/PredictiveAnalytics'));
const RecommendationEngine = lazy(() => import('../../pages/AI/RecommendationEngine'));
const RecommendationEngineJSX = lazy(() => import('../../pages/AI/RecommendationEngine.jsx'));

/**
 * AI Routes Module
 * Contains all AI-related routes (accessible to all authenticated users)
 */
export const getAIRoutes = () => [
  <Route key="ai-dashboard" path="/ai/dashboard" element={
    <ProtectedRoute>
      <AIDashboard />
    </ProtectedRoute>
  } />,
  
  <Route key="ai-business-insights" path="/ai/business-insights" element={
    <ProtectedRoute>
      <BusinessInsights />
    </ProtectedRoute>
  } />,
  
  <Route key="ai-business-insights-advanced" path="/ai/business-insights-advanced" element={
    <ProtectedRoute>
      <BusinessInsightsJSX />
    </ProtectedRoute>
  } />,
  
  <Route key="ai-analytics" path="/ai/analytics" element={
    <ProtectedRoute>
      <PredictiveAnalytics />
    </ProtectedRoute>
  } />,
  
  <Route key="ai-recommendations" path="/ai/recommendations" element={
    <ProtectedRoute>
      <RecommendationEngine />
    </ProtectedRoute>
  } />,
  
  <Route key="ai-recommendations-advanced" path="/ai/recommendations-advanced" element={
    <ProtectedRoute>
      <RecommendationEngineJSX />
    </ProtectedRoute>
  } />
];
