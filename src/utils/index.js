/**
 * Utilities Index
 * Central export point for all utility functions
 */

export * from './activityLogger';
export * from './aiHelpers';
export * from './alertUtils';
export * from './arrayUtils';
export * from './businessCalculations';
export * from './businessTemplates';
export * from './companyHelpers';
export * from './constants';
export * from './dashboardConstants';
export * from './dashboardData';
export * from './dataFormatters';
export * from './dateUtils';
export * from './entrepreneurHubUtils';
export * from './errorHandlers';
export * from './formatters';
export * from './fundingCalculators';
export * from './fundingData';
export * from './helpers';
export * from './initializeCompanyData';
export * from './logger';
export * from './mlConstants';
export * from './nitializeFirestore';
export * from './objectUtils';
export * from './permissions';
export * from './routingUtils';
export * from './stringUtils';
export * from './validation';
export * from './validationSchemas';
export * from './validationUtils';
export * from './validators';
export * from './youthConstants';
export * from './youthHelpers';

// Default export for all utilities
export default {
  ...require('./activityLogger'),
  ...require('./aiHelpers'),
  ...require('./alertUtils'),
  ...require('./arrayUtils'),
  ...require('./businessCalculations'),
  ...require('./businessTemplates'),
  ...require('./companyHelpers'),
  ...require('./constants'),
  ...require('./dashboardConstants'),
  ...require('./dashboardData'),
  ...require('./dataFormatters'),
  ...require('./dateUtils'),
  ...require('./entrepreneurHubUtils'),
  ...require('./errorHandlers'),
  ...require('./formatters'),
  ...require('./fundingCalculators'),
  ...require('./fundingData'),
  ...require('./helpers'),
  ...require('./initializeCompanyData'),
  ...require('./logger'),
  ...require('./mlConstants'),
  ...require('./nitializeFirestore'),
  ...require('./objectUtils'),
  ...require('./permissions'),
  ...require('./routingUtils'),
  ...require('./stringUtils'),
  ...require('./validation'),
  ...require('./validationSchemas'),
  ...require('./validationUtils'),
  ...require('./validators'),
  ...require('./youthConstants'),
  ...require('./youthHelpers'),
};
