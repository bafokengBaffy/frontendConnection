/**
 * System Pages Index
 * Export all system-related pages
 */

export { default as AnomalyDetection } from './AnomalyDetection';
export { default as FraudMonitoring } from './FraudMonitoring';
export { default as PerformanceMetrics } from './PerformanceMetrics';
export { default as PlatformOptimization } from './PlatformOptimization';
export { default as SystemHealth } from './SystemHealth';
export { default as UserBehaviorAnalytics } from './UserBehaviorAnalytics';

// Re-export types and utilities
export * from './types';
export * from './constants';
