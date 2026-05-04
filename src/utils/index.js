/**
 * Utilities Index
 * Central export point for all utility functions
 */

// Export all utilities from individual files
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

// Also import for default export
import * as activityLogger from './activityLogger';
import * as aiHelpers from './aiHelpers';
import * as alertUtils from './alertUtils';
import * as arrayUtils from './arrayUtils';
import * as businessCalculations from './businessCalculations';
import * as businessTemplates from './businessTemplates';
import * as companyHelpers from './companyHelpers';
import * as constants from './constants';
import * as dashboardConstants from './dashboardConstants';
import * as dashboardData from './dashboardData';
import * as dataFormatters from './dataFormatters';
import * as dateUtils from './dateUtils';
import * as entrepreneurHubUtils from './entrepreneurHubUtils';
import * as errorHandlers from './errorHandlers';
import * as formatters from './formatters';
import * as fundingCalculators from './fundingCalculators';
import * as fundingData from './fundingData';
import * as helpers from './helpers';
import * as initializeCompanyData from './initializeCompanyData';
import * as logger from './logger';
import * as mlConstants from './mlConstants';
import * as nitializeFirestore from './nitializeFirestore';
import * as objectUtils from './objectUtils';
import * as permissions from './permissions';
import * as routingUtils from './routingUtils';
import * as stringUtils from './stringUtils';
import * as validation from './validation';
import * as validationSchemas from './validationSchemas';
import * as validationUtils from './validationUtils';
import * as validators from './validators';
import * as youthConstants from './youthConstants';
import * as youthHelpers from './youthHelpers';

// Create combined default export
const allUtils = {
  ...activityLogger,
  ...aiHelpers,
  ...alertUtils,
  ...arrayUtils,
  ...businessCalculations,
  ...businessTemplates,
  ...companyHelpers,
  ...constants,
  ...dashboardConstants,
  ...dashboardData,
  ...dataFormatters,
  ...dateUtils,
  ...entrepreneurHubUtils,
  ...errorHandlers,
  ...formatters,
  ...fundingCalculators,
  ...fundingData,
  ...helpers,
  ...initializeCompanyData,
  ...logger,
  ...mlConstants,
  ...nitializeFirestore,
  ...objectUtils,
  ...permissions,
  ...routingUtils,
  ...stringUtils,
  ...validation,
  ...validationSchemas,
  ...validationUtils,
  ...validators,
  ...youthConstants,
  ...youthHelpers,
};

// Default export
export default allUtils;
