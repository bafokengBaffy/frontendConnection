/**
 * Analytics Services Index
 * Central export for all analytics services
 */

// Import main analytics service
import analyticsService from '../analyticsService';

// Import individual service modules
export { default as userAnalytics } from './modules/userAnalytics';
export { default as companyAnalytics } from './modules/companyAnalytics';
export { default as studentAnalytics } from './modules/studentAnalytics';
export { default as adminAnalytics } from './modules/adminAnalytics';
export { default as dashboardAnalytics } from './modules/dashboardAnalytics';

// Export the main analytics service as default
export default analyticsService;

// Export utility functions
export * from './utils/analyticsUtils';
export * from './types/analyticsTypes';
