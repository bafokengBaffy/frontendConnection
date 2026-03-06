/* eslint-disable no-undef */
// Main export file for company extended services
export * from './utils/baseService';

// Export social services
export * from './social/socialServices';

// Export recruitment services
export * from './recruitment/recruitmentServices';

// Export management services
export * from './management/managementServices';

// Export analytics services
export * from './analytics/analyticsServices';

// Export all services as named exports
export { followersService, chatService, companyBrandingService } from './social/socialServices';
export {
  videoInterviewService,
  aiMatchingService,
  talentPoolService,
} from './recruitment/recruitmentServices';
export { teamService, documentsService, settingsService } from './management/managementServices';
export { analyticsService, notificationsService } from './analytics/analyticsServices';

// Default export with all services grouped
export default {
  // Social Services
  followersService,
  chatService,
  companyBrandingService,

  // Recruitment Services
  videoInterviewService,
  aiMatchingService,
  talentPoolService,

  // Management Services
  teamService,
  documentsService,
  settingsService,

  // Analytics Services
  analyticsService,
  notificationsService,

  // Utility functions
  ...require('./utils/baseService'),
};
