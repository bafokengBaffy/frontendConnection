/* eslint-disable no-unused-vars */
/**
 * Main Analytics Service for Career Connect Lesotho
 * Consolidated analytics service that imports from modular sub-services
 */

// Import Firebase configuration
import { db, auth } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  startAt,
  endAt,
  Timestamp,
  arrayUnion,
  arrayRemove,
  updateDoc,
  increment,
  setDoc,
  writeBatch
} from 'firebase/firestore';

// Import modular analytics services
import userAnalytics from './analytics/modules/userAnalytics';
import companyAnalytics from './analytics/modules/companyAnalytics';
import studentAnalytics from './analytics/modules/studentAnalytics';
import adminAnalytics from './analytics/modules/adminAnalytics';
import dashboardAnalytics from './analytics/modules/dashboardAnalytics';

// Constants
const ANALYTICS_COLLECTION = 'analytics';
const USER_ANALYTICS_SUBCOLLECTION = 'userAnalytics';
const COMPANY_ANALYTICS_SUBCOLLECTION = 'companyAnalytics';
const SYSTEM_ANALYTICS_COLLECTION = 'systemAnalytics';

/**
 * Main Analytics Service Class
 */
class AnalyticsService {
  constructor() {
    this.userAnalytics = userAnalytics;
    this.companyAnalytics = companyAnalytics;
    this.studentAnalytics = studentAnalytics;
    this.adminAnalytics = adminAnalytics;
    this.dashboardAnalytics = dashboardAnalytics;
    
    // Initialize services with database reference
    this.initializeServices();
  }

  initializeServices() {
    // Pass db reference to all services
    const services = [
      this.userAnalytics,
      this.companyAnalytics,
      this.studentAnalytics,
      this.adminAnalytics,
      this.dashboardAnalytics
    ];
    
    services.forEach(service => {
      if (service.initialize) {
        service.initialize(db, auth);
      }
    });
  }

  /**
   * Track user event
   * @param {string} eventName - Name of the event
   * @param {Object} eventData - Event data
   * @param {string} userId - Optional user ID
   */
  async trackEvent(eventName, eventData = {}, userId = null) {
    try {
      const user = auth.currentUser;
      const currentUserId = userId || (user ? user.uid : 'anonymous');
      
      const eventDoc = {
        eventName,
        eventData,
        userId: currentUserId,
        timestamp: Timestamp.now(),
        userAgent: navigator.userAgent,
        platform: this._detectPlatform(),
        pathname: window.location.pathname,
        ...eventData
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', eventName, eventDoc);
      }

      // Store in Firestore
      const analyticsRef = collection(db, ANALYTICS_COLLECTION);
      const userAnalyticsRef = collection(
        db, 
        ANALYTICS_COLLECTION, 
        currentUserId, 
        USER_ANALYTICS_SUBCOLLECTION
      );
      
      // Use batch write for efficiency
      const batch = writeBatch(db);
      
      // Add to main analytics collection
      const mainDocRef = doc(analyticsRef);
      batch.set(mainDocRef, eventDoc);
      
      // Add to user-specific analytics
      const userDocRef = doc(userAnalyticsRef);
      batch.set(userDocRef, eventDoc);
      
      await batch.commit();
      
      // Increment event count in user profile if it's a registered user
      if (user) {
        await this._incrementUserEventCount(user.uid, eventName);
      }
      
      return { success: true, eventId: mainDocRef.id };
    } catch (error) {
      console.error('Error tracking event:', error);
      // Fail silently in production, but log in development
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   */
  async getUserAnalytics(userId, options = {}) {
    return this.userAnalytics.getUserAnalytics(userId, options);
  }

  /**
   * Get company analytics
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options
   */
  async getCompanyAnalytics(companyId, options = {}) {
    return this.companyAnalytics.getCompanyAnalytics(companyId, options);
  }

  /**
   * Get student analytics
   * @param {string} studentId - Student ID
   * @param {Object} options - Query options
   */
  async getStudentAnalytics(studentId, options = {}) {
    return this.studentAnalytics.getStudentAnalytics(studentId, options);
  }

  /**
   * Get admin/system analytics
   * @param {Object} options - Query options
   */
  async getAdminAnalytics(options = {}) {
    return this.adminAnalytics.getAdminAnalytics(options);
  }

  /**
   * Get dashboard analytics based on user role
   * @param {string} userRole - User role
   * @param {string} userId - User ID
   */
  async getDashboardAnalytics(userRole, userId) {
    return this.dashboardAnalytics.getDashboardAnalytics(userRole, userId);
  }

  /**
   * Generate report
   * @param {string} reportType - Type of report
   * @param {Object} filters - Report filters
   */
  async generateReport(reportType, filters = {}) {
    try {
      switch (reportType) {
        case 'user-activity':
          return await this._generateUserActivityReport(filters);
        case 'company-performance':
          return await this._generateCompanyPerformanceReport(filters);
        case 'student-engagement':
          return await this._generateStudentEngagementReport(filters);
        case 'system-usage':
          return await this._generateSystemUsageReport(filters);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics data
   * @param {string} metric - Metric to track
   * @param {Object} options - Options for real-time tracking
   */
  async getRealTimeAnalytics(metric, options = {}) {
    // Implementation for real-time analytics
    // This would typically set up listeners
    return {
      metric,
      data: [],
      unsubscribe: () => {} // Placeholder for unsubscribe function
    };
  }

  /**
   * Export analytics data
   * @param {string} format - Export format (csv, json, pdf)
   * @param {Object} data - Data to export
   */
  async exportAnalytics(format, data) {
    switch (format) {
      case 'csv':
        return this._exportToCSV(data);
      case 'json':
        return this._exportToJSON(data);
      case 'pdf':
        return this._exportToPDF(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Private methods
  async _incrementUserEventCount(userId, eventName) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`analytics.eventCounts.${eventName}`]: increment(1),
        'analytics.lastEvent': Timestamp.now(),
        'analytics.totalEvents': increment(1)
      });
    } catch (error) {
      console.warn('Could not update user event count:', error);
    }
  }

  async _generateUserActivityReport(filters) {
    const { startDate, endDate, userType } = filters;
    
    const q = query(
      collection(db, ANALYTICS_COLLECTION),
      where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))),
      where('timestamp', '<=', Timestamp.fromDate(new Date(endDate))),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      reportType: 'user-activity',
      period: { startDate, endDate },
      totalEvents: data.length,
      eventsByType: this._groupBy(data, 'eventName'),
      eventsByUser: this._groupBy(data, 'userId'),
      eventsByHour: this._groupByHour(data),
      rawData: data
    };
  }

  async _generateCompanyPerformanceReport(filters) {
    return this.companyAnalytics.generatePerformanceReport(filters);
  }

  async _generateStudentEngagementReport(filters) {
    return this.studentAnalytics.generateEngagementReport(filters);
  }

  async _generateSystemUsageReport(filters) {
    return this.adminAnalytics.generateSystemUsageReport(filters);
  }

  _exportToCSV(data) {
    // Convert data to CSV format
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    return {
      blob,
      filename: `analytics-export-${new Date().toISOString().split('T')[0]}.csv`,
      type: 'csv'
    };
  }

  _exportToJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    return {
      blob,
      filename: `analytics-export-${new Date().toISOString().split('T')[0]}.json`,
      type: 'json'
    };
  }

  _exportToPDF(data) {
    // This would typically use a PDF generation library
    // For now, return a placeholder
    return {
      blob: new Blob(['PDF generation would be implemented here'], { type: 'application/pdf' }),
      filename: `analytics-export-${new Date().toISOString().split('T')[0]}.pdf`,
      type: 'pdf'
    };
  }

  _detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  _groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key] || 'unknown';
      result[groupKey] = (result[groupKey] || 0) + 1;
      return result;
    }, {});
  }

  _groupByHour(data) {
    const hours = {};
    data.forEach(item => {
      const date = item.timestamp?.toDate() || new Date();
      const hour = date.getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return hours;
  }

  // Utility methods for specific analytics
  async trackPageView(pageName, additionalData = {}) {
    return this.trackEvent('page_view', {
      pageName,
      ...additionalData
    });
  }

  async trackButtonClick(buttonName, location, additionalData = {}) {
    return this.trackEvent('button_click', {
      buttonName,
      location,
      ...additionalData
    });
  }

  async trackFormSubmission(formName, success = true, additionalData = {}) {
    return this.trackEvent('form_submission', {
      formName,
      success,
      ...additionalData
    });
  }

  async trackSearch(searchTerm, filters = {}, resultsCount = 0) {
    return this.trackEvent('search', {
      searchTerm,
      filters,
      resultsCount
    });
  }

  async trackJobApplication(jobId, companyId, status = 'applied') {
    return this.trackEvent('job_application', {
      jobId,
      companyId,
      status
    });
  }

  async trackProfileUpdate(fieldsUpdated) {
    return this.trackEvent('profile_update', {
      fieldsUpdated
    });
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;

// Also export individual services for direct access if needed
export { 
  userAnalytics, 
  companyAnalytics, 
  studentAnalytics, 
  adminAnalytics, 
  dashboardAnalytics 
};