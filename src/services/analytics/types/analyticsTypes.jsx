/**
 * Analytics Type Definitions
 */

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} eventName - Name of the event
 * @property {Object} eventData - Event data
 * @property {string} userId - User ID
 * @property {Timestamp} timestamp - Event timestamp
 * @property {string} userAgent - User agent string
 * @property {string} platform - Platform (mobile/desktop/tablet)
 * @property {string} pathname - Current pathname
 */

/**
 * @typedef {Object} UserAnalytics
 * @property {string} userId - User ID
 * @property {Object} userData - User data
 * @property {Array<AnalyticsEvent>} events - User events
 * @property {Object} metrics - Calculated metrics
 * @property {Object} summary - Analytics summary
 */

/**
 * @typedef {Object} CompanyAnalytics
 * @property {string} companyId - Company ID
 * @property {string} companyName - Company name
 * @property {Object} analytics - Analytics data
 * @property {Timestamp} lastUpdated - Last updated timestamp
 */

/**
 * @typedef {Object} StudentAnalytics
 * @property {string} studentId - Student ID
 * @property {Object} studentData - Student data
 * @property {Object} analytics - Analytics data
 * @property {Object} overallMetrics - Overall metrics
 * @property {Array<string>} recommendations - Recommendations
 */

/**
 * @typedef {Object} AdminAnalytics
 * @property {string} period - Analytics period
 * @property {Timestamp} generatedAt - Generation timestamp
 * @property {Object} analytics - Analytics data
 * @property {Object} trends - Trend data
 * @property {Array<string>} insights - Insights
 * @property {Array<Object>} alerts - System alerts
 */

/**
 * @typedef {Object} DashboardAnalytics
 * @property {string} userRole - User role
 * @property {string} userId - User ID
 * @property {Object} sections - Dashboard sections
 * @property {Object} metrics - Dashboard metrics
 * @property {Array<string>} recommendations - Recommendations
 */

/**
 * @typedef {Object} ReportData
 * @property {string} reportType - Report type
 * @property {Object} period - Report period
 * @property {Timestamp} generatedAt - Generation timestamp
 * @property {Object} sections - Report sections
 * @property {Object} executiveSummary - Executive summary
 * @property {Array<string>} recommendations - Recommendations
 */

/**
 * @typedef {Object} QuickStats
 * @property {string} userRole - User role
 * @property {string} userId - User ID
 * @property {Timestamp} generatedAt - Generation timestamp
 * @property {Object} stats - Quick statistics
 */

/**
 * @typedef {Object} ActivityItem
 * @property {string} id - Item ID
 * @property {string} type - Item type
 * @property {string} title - Item title
 * @property {Timestamp} timestamp - Item timestamp
 * @property {Object} data - Additional data
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {string} userRole - User role
 * @property {string} userId - User ID
 * @property {string} period - Metrics period
 * @property {Object} metrics - Performance metrics
 * @property {Object} trends - Performance trends
 */

// Export types for TypeScript/JavaScript documentation
export const AnalyticsTypes = {
  Event: 'AnalyticsEvent',
  User: 'UserAnalytics',
  Company: 'CompanyAnalytics',
  Student: 'StudentAnalytics',
  Admin: 'AdminAnalytics',
  Dashboard: 'DashboardAnalytics',
  Report: 'ReportData',
  QuickStats: 'QuickStats',
  Activity: 'ActivityItem',
  Performance: 'PerformanceMetrics'
};