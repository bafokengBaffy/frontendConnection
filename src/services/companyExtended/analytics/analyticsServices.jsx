/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

import {
  getCurrentCompanyId,
  safeConvertFirebaseData,
  handleServiceError,
  COLLECTIONS,
  getDateRangeStart,
  formatFileSize,
} from '../utils/baseService';
import { db } from '../../../config/firebase';

// ============================
// ANALYTICS SERVICE
// ============================
export const analyticsService = {
  async getDashboardAnalytics(timeRange = 'month') {
    try {
      const companyId = getCurrentCompanyId();

      // Get analytics data in parallel
      const [jobStats, applicationStats, interviewStats] = await Promise.all([
        this.getJobAnalytics(timeRange),
        this.getApplicationAnalytics(timeRange),
        this.getInterviewAnalytics(timeRange),
      ]);

      const overallMetrics = this.calculateOverallMetrics(
        jobStats.data,
        applicationStats.data,
        interviewStats.data
      );

      return {
        success: true,
        data: {
          overall: overallMetrics,
          jobs: jobStats.data,
          applications: applicationStats.data,
          interviews: interviewStats.data,
          timeRange,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'getDashboardAnalytics');
    }
  },

  async getJobAnalytics(timeRange) {
    try {
      const companyId = getCurrentCompanyId();
      const jobsRef = collection(db, COLLECTIONS.JOBS);
      const q = query(
        jobsRef,
        where('companyId', '==', companyId),
        where('createdAt', '>=', getDateRangeStart(timeRange))
      );

      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map((doc) => safeConvertFirebaseData(doc.data()));

      const analytics = {
        overview: this.calculateJobOverview(jobs),
        performance: this.calculateJobPerformance(jobs),
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return handleServiceError(error, 'getJobAnalytics');
    }
  },

  async getApplicationAnalytics(timeRange) {
    try {
      const companyId = getCurrentCompanyId();
      const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
      const q = query(
        applicationsRef,
        where('companyId', '==', companyId),
        where('appliedAt', '>=', getDateRangeStart(timeRange))
      );

      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map((doc) => safeConvertFirebaseData(doc.data()));

      const analytics = {
        overview: this.calculateApplicationOverview(applications),
        funnel: this.calculateApplicationFunnel(applications),
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return handleServiceError(error, 'getApplicationAnalytics');
    }
  },

  async getInterviewAnalytics(timeRange) {
    try {
      const companyId = getCurrentCompanyId();
      const interviewsRef = collection(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS);
      const q = query(
        interviewsRef,
        where('companyId', '==', companyId),
        where('scheduledTime', '>=', getDateRangeStart(timeRange))
      );

      const snapshot = await getDocs(q);
      const interviews = snapshot.docs.map((doc) => safeConvertFirebaseData(doc.data()));

      const analytics = {
        overview: this.calculateInterviewOverview(interviews),
        completion: this.calculateInterviewCompletion(interviews),
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return handleServiceError(error, 'getInterviewAnalytics');
    }
  },

  calculateOverallMetrics(jobStats, applicationStats, interviewStats) {
    const metrics = {
      totalJobs: jobStats.overview?.total || 0,
      activeJobs: jobStats.overview?.active || 0,
      totalApplications: applicationStats.overview?.total || 0,
      applicationRate:
        jobStats.overview?.total > 0
          ? Math.round((applicationStats.overview?.total || 0) / jobStats.overview.total)
          : 0,
      interviewRate:
        applicationStats.overview?.total > 0
          ? Math.round(
              ((applicationStats.funnel?.interview || 0) / applicationStats.overview.total) * 100
            )
          : 0,
      hireRate:
        applicationStats.overview?.total > 0
          ? Math.round(
              ((applicationStats.funnel?.hired || 0) / applicationStats.overview.total) * 100
            )
          : 0,
    };

    return metrics;
  },

  calculateJobOverview(jobs) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let total = 0;
    let active = 0;
    let closed = 0;
    let draft = 0;
    let createdThisMonth = 0;
    let totalViews = 0;
    let totalApplicants = 0;

    jobs.forEach((job) => {
      total++;

      if (job.status === 'active') active++;
      if (job.status === 'closed') closed++;
      if (job.status === 'draft') draft++;

      if (job.createdAt && job.createdAt > oneMonthAgo) {
        createdThisMonth++;
      }

      if (job.views) totalViews += job.views;
      if (job.applicantsCount) totalApplicants += job.applicantsCount;
    });

    return {
      total,
      active,
      closed,
      draft,
      createdThisMonth,
      totalViews,
      totalApplicants,
      avgViewsPerJob: total > 0 ? Math.round(totalViews / total) : 0,
      avgApplicantsPerJob: total > 0 ? Math.round(totalApplicants / total) : 0,
    };
  },

  calculateJobPerformance(jobs) {
    const performance = {
      topPerforming: [],
      byDepartment: {},
    };

    jobs.forEach((job) => {
      const applicants = job.applicantsCount || 0;
      const views = job.views || 0;
      const conversionRate = views > 0 ? (applicants / views) * 100 : 0;

      performance.topPerforming.push({
        id: job.id,
        title: job.title,
        applicants,
        views,
        conversionRate: Math.round(conversionRate),
        status: job.status,
      });

      const department = job.department || 'Other';
      if (!performance.byDepartment[department]) {
        performance.byDepartment[department] = {
          total: 0,
          active: 0,
          applicants: 0,
          views: 0,
        };
      }
      performance.byDepartment[department].total++;
      if (job.status === 'active') performance.byDepartment[department].active++;
      performance.byDepartment[department].applicants += applicants;
      performance.byDepartment[department].views += views;
    });

    performance.topPerforming.sort((a, b) => b.applicants - a.applicants);
    performance.topPerforming = performance.topPerforming.slice(0, 10);

    Object.keys(performance.byDepartment).forEach((dept) => {
      const stats = performance.byDepartment[dept];
      stats.conversionRate =
        stats.views > 0 ? Math.round((stats.applicants / stats.views) * 100) : 0;
    });

    return performance;
  },

  calculateApplicationOverview(applications) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let total = 0;
    let newApps = 0;
    let reviewed = 0;
    let interviewed = 0;
    let hired = 0;
    let rejected = 0;
    let thisMonth = 0;

    applications.forEach((app) => {
      total++;

      if (app.status === 'applied' || app.status === 'pending') newApps++;
      if (app.status === 'reviewed') reviewed++;
      if (app.status === 'interview') interviewed++;
      if (app.status === 'hired') hired++;
      if (app.status === 'rejected') rejected++;

      if (app.appliedAt && app.appliedAt > oneMonthAgo) {
        thisMonth++;
      }
    });

    return {
      total,
      new: newApps,
      reviewed,
      interview: interviewed,
      hired,
      rejected,
      thisMonth,
      conversionRate: total > 0 ? Math.round((hired / total) * 100) : 0,
    };
  },

  calculateApplicationFunnel(applications) {
    const funnel = {
      applied: 0,
      reviewed: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      const status = app.status || 'applied';
      funnel[status] = (funnel[status] || 0) + 1;
    });

    const conversionRates = {
      appliedToReviewed:
        funnel.applied > 0 ? Math.round((funnel.reviewed / funnel.applied) * 100) : 0,
      reviewedToInterview:
        funnel.reviewed > 0 ? Math.round((funnel.interview / funnel.reviewed) * 100) : 0,
      interviewToHire:
        funnel.interview > 0 ? Math.round((funnel.hired / funnel.interview) * 100) : 0,
      overall: funnel.applied > 0 ? Math.round((funnel.hired / funnel.applied) * 100) : 0,
    };

    return {
      stages: funnel,
      conversionRates,
    };
  },

  calculateInterviewOverview(interviews) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let total = 0;
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;
    let missed = 0;
    let upcoming = 0;
    let thisMonth = 0;

    interviews.forEach((interview) => {
      total++;

      if (interview.status === 'scheduled') {
        scheduled++;

        if (interview.scheduledTime && new Date(interview.scheduledTime) > now) {
          upcoming++;
        }
      }
      if (interview.status === 'completed') completed++;
      if (interview.status === 'cancelled') cancelled++;
      if (interview.status === 'missed') missed++;

      if (interview.scheduledTime && new Date(interview.scheduledTime) > oneMonthAgo) {
        thisMonth++;
      }
    });

    const totalScheduled = scheduled + completed + cancelled + missed;
    const completionRate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      missed,
      upcoming,
      thisMonth,
      completionRate,
    };
  },

  calculateInterviewCompletion(interviews) {
    const completion = {
      byStatus: {},
      successRate: 0,
    };

    let completedCount = 0;
    let successfulCount = 0;

    interviews.forEach((interview) => {
      const status = interview.status || 'scheduled';
      completion.byStatus[status] = (completion.byStatus[status] || 0) + 1;

      if (interview.status === 'completed') {
        completedCount++;
        if (interview.feedback?.recommendedForHire) {
          successfulCount++;
        }
      }
    });

    completion.successRate =
      completedCount > 0 ? Math.round((successfulCount / completedCount) * 100) : 0;

    completion.byStatusArray = Object.entries(completion.byStatus)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return completion;
  },
};

// ============================
// NOTIFICATIONS SERVICE
// ============================
export const notificationsService = {
  async getNotifications(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const {
        type = 'all',
        readStatus = 'all',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = filters;

      const notifsRef = collection(db, COLLECTIONS.COMPANY_NOTIFICATIONS);
      let q = query(notifsRef, where('companyId', '==', companyId), orderBy(sortBy, sortOrder));

      if (type !== 'all') {
        q = query(q, where('type', '==', type));
      }

      if (readStatus !== 'all') {
        q = query(q, where('read', '==', readStatus === 'read'));
      }

      const snapshot = await getDocs(q);
      const total = snapshot.size;
      const offset = (page - 1) * limit;

      const notifications = [];
      snapshot.forEach((doc, index) => {
        if (index >= offset && index < offset + limit) {
          const data = safeConvertFirebaseData(doc.data());
          notifications.push({
            id: doc.id,
            ...data,
          });
        }
      });

      const hasMore = offset + notifications.length < total;
      const totalPages = Math.ceil(total / limit);

      // Get unread count
      const unreadQuery = query(
        notifsRef,
        where('companyId', '==', companyId),
        where('read', '==', false)
      );
      const unreadSnapshot = await getDocs(unreadQuery);
      const unreadCount = unreadSnapshot.size;

      return {
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore,
          },
        },
      };
    } catch (error) {
      return handleServiceError(error, 'getNotifications');
    }
  },

  async markAsRead(notificationIds) {
    try {
      const companyId = getCurrentCompanyId();
      const batch = writeBatch(db);

      notificationIds.forEach((notificationId) => {
        const notifRef = doc(db, COLLECTIONS.COMPANY_NOTIFICATIONS, notificationId);
        batch.update(notifRef, {
          read: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();

      return {
        success: true,
        count: notificationIds.length,
      };
    } catch (error) {
      return handleServiceError(error, 'markAsRead');
    }
  },

  async deleteNotification(notificationId) {
    try {
      const companyId = getCurrentCompanyId();
      const notifRef = doc(db, COLLECTIONS.COMPANY_NOTIFICATIONS, notificationId);
      const notifSnap = await getDoc(notifRef);

      if (!notifSnap.exists()) {
        return { success: false, error: 'Notification not found' };
      }

      const notifData = notifSnap.data();

      if (notifData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }

      await deleteDoc(notifRef);

      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'deleteNotification');
    }
  },
};
