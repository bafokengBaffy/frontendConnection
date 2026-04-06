/* eslint-disable no-unused-vars */
const { Timestamp, FieldValue } = require('firebase-admin/firestore');

const { db, admin } = require('../config/firebase');

/**
 * Backend Firebase Company Service
 * Provides server-side Firebase operations for company dashboard
 */
class FirebaseCompanyService {
  constructor() {
    this.db = db;
  }

  // Get company dashboard data
  async getCompanyDashboard(companyId) {
    try {
      const companyRef = this.db.collection('companies').doc(companyId);
      const companyDoc = await companyRef.get();

      if (!companyDoc.exists) {
        throw new Error('Company not found');
      }

      const companyData = {
        id: companyDoc.id,
        ...companyDoc.data(),
      };

      // Get counts in parallel
      const [jobsCount, applicationsCount, interviewsCount, followersCount] = await Promise.all([
        this.getCollectionCount('jobs', 'companyId', companyId),
        this.getCollectionCount('applications', 'companyId', companyId),
        this.getCollectionCount('interviews', 'companyId', companyId),
        this.getCollectionCount('followers', 'companyId', companyId),
      ]);

      // Get recent applications
      const recentApps = await this.db
        .collection('applications')
        .where('companyId', '==', companyId)
        .orderBy('appliedAt', 'desc')
        .limit(10)
        .get();

      const recentApplications = recentApps.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        appliedAt: doc.data().appliedAt?.toDate?.() || new Date(),
      }));

      // Get active jobs
      const activeJobs = await this.db
        .collection('jobs')
        .where('companyId', '==', companyId)
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      const jobs = activeJobs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        deadline: doc.data().deadline?.toDate?.() || null,
      }));

      // Calculate pipeline stats
      const pipelineStats = await this.calculatePipelineStats(companyId);

      return {
        company: companyData,
        stats: {
          totalJobs: jobsCount,
          activeJobs: jobs.length,
          totalApplicants: applicationsCount,
          interviewsScheduled: interviewsCount,
          totalFollowers: followersCount,
          profileViews: companyData.profileViews || 0,
          conversionRate: this.calculateConversionRate(pipelineStats),
        },
        recentApplications,
        jobListings: jobs,
        pipelineStats,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting company dashboard:', error);
      throw error;
    }
  }

  // Get collection count
  async getCollectionCount(collectionName, field, value) {
    try {
      const snapshot = await this.db
        .collection(collectionName)
        .where(field, '==', value)
        .count()
        .get();
      return snapshot.data().count || 0;
    } catch (error) {
      console.error(`Error counting ${collectionName}:`, error);
      return 0;
    }
  }

  // Calculate pipeline statistics
  async calculatePipelineStats(companyId) {
    try {
      const applications = await this.db
        .collection('applications')
        .where('companyId', '==', companyId)
        .get();

      const stats = {
        new: 0,
        reviewed: 0,
        interview: 0,
        hired: 0,
        rejected: 0,
        withdrawn: 0,
      };

      applications.forEach((doc) => {
        const status = doc.data().status;
        if (Object.prototype.hasOwnProperty.call(stats, status)) {
          stats[status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating pipeline stats:', error);
      return {};
    }
  }

  // Calculate conversion rate
  calculateConversionRate(pipelineStats) {
    const total = Object.values(pipelineStats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    return Math.round((pipelineStats.hired / total) * 100);
  }

  // Update application status (server-side)
  async updateApplicationStatus(applicationId, status, userId) {
    try {
      const applicationRef = this.db.collection('applications').doc(applicationId);
      const applicationDoc = await applicationRef.get();

      if (!applicationDoc.exists) {
        throw new Error('Application not found');
      }

      const updateData = {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: userId,
      };

      // Add timestamp based on status
      switch (status) {
        case 'reviewed':
          updateData.reviewedAt = FieldValue.serverTimestamp();
          break;
        case 'interview':
          updateData.interviewScheduledAt = FieldValue.serverTimestamp();
          break;
        case 'hired':
          updateData.hiredAt = FieldValue.serverTimestamp();
          break;
        case 'rejected':
          updateData.rejectedAt = FieldValue.serverTimestamp();
          break;
      }

      await applicationRef.update(updateData);

      // Log the status change
      await this.logStatusChange(applicationId, applicationDoc.data().status, status, userId);

      // Create notification
      await this.createNotification({
        type: 'application_status_update',
        title: `Application ${status}`,
        message: `Application status changed to ${status}`,
        userId: applicationDoc.data().studentId,
        companyId: applicationDoc.data().companyId,
        applicationId,
        metadata: {
          previousStatus: applicationDoc.data().status,
          newStatus: status,
        },
      });

      return { success: true, id: applicationId };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Log status changes
  async logStatusChange(applicationId, oldStatus, newStatus, userId) {
    try {
      await this.db.collection('application_logs').add({
        applicationId,
        oldStatus,
        newStatus,
        changedBy: userId,
        changedAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      await this.db.collection('notifications').add({
        ...notificationData,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Get real-time updates for company
  setupRealtimeListeners(companyId, callbacks) {
    const unsubscribers = {};

    // Applications listener
    if (callbacks.onApplicationsUpdate) {
      const applicationsQuery = this.db
        .collection('applications')
        .where('companyId', '==', companyId)
        .where('status', 'in', ['applied', 'reviewed'])
        .orderBy('appliedAt', 'desc')
        .limit(20);

      unsubscribers.applications = applicationsQuery.onSnapshot(
        (snapshot) => {
          const applications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callbacks.onApplicationsUpdate(applications);
        },
        (error) => {
          console.error('Applications listener error:', error);
        }
      );
    }

    // Interviews listener
    if (callbacks.onInterviewsUpdate) {
      const interviewsQuery = this.db
        .collection('interviews')
        .where('companyId', '==', companyId)
        .where('status', 'in', ['scheduled', 'confirmed'])
        .orderBy('scheduledTime', 'asc');

      unsubscribers.interviews = interviewsQuery.onSnapshot(
        (snapshot) => {
          const interviews = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          callbacks.onInterviewsUpdate(interviews);
        },
        (error) => {
          console.error('Interviews listener error:', error);
        }
      );
    }

    // Company stats listener
    if (callbacks.onStatsUpdate) {
      const statsQuery = this.db
        .collection('company_stats')
        .where('companyId', '==', companyId)
        .orderBy('timestamp', 'desc')
        .limit(1);

      unsubscribers.stats = statsQuery.onSnapshot(
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            callbacks.onStatsUpdate({
              id: doc.id,
              ...doc.data(),
            });
          }
        },
        (error) => {
          console.error('Stats listener error:', error);
        }
      );
    }

    // Return cleanup function
    return () => {
      Object.values(unsubscribers).forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }

  // Generate analytics report
  async generateAnalyticsReport(companyId, startDate, endDate) {
    try {
      const applications = await this.db
        .collection('applications')
        .where('companyId', '==', companyId)
        .where('appliedAt', '>=', new Date(startDate))
        .where('appliedAt', '<=', new Date(endDate))
        .get();

      const jobs = await this.db
        .collection('jobs')
        .where('companyId', '==', companyId)
        .where('createdAt', '>=', new Date(startDate))
        .where('createdAt', '<=', new Date(endDate))
        .get();

      const interviews = await this.db
        .collection('interviews')
        .where('companyId', '==', companyId)
        .where('scheduledTime', '>=', new Date(startDate))
        .where('scheduledTime', '<=', new Date(endDate))
        .get();

      // Calculate metrics
      const totalApplications = applications.size;
      const totalJobs = jobs.size;
      const totalInterviews = interviews.size;

      // Calculate status distribution
      const statusCounts = {};
      applications.forEach((doc) => {
        const status = doc.data().status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Calculate time metrics
      const timeMetrics = await this.calculateTimeMetrics(applications);

      return {
        period: { startDate, endDate },
        totals: {
          applications: totalApplications,
          jobs: totalJobs,
          interviews: totalInterviews,
        },
        statusDistribution: statusCounts,
        timeMetrics,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  // Calculate time-based metrics
  async calculateTimeMetrics(applicationsSnapshot) {
    const hiredApplications = applicationsSnapshot.docs.filter(
      (doc) => doc.data().status === 'hired'
    );

    if (hiredApplications.length === 0) {
      return {
        avgTimeToHire: 0,
        avgResponseTime: 0,
        hireRate: 0,
      };
    }

    let totalTimeToHire = 0;
    let totalResponseTime = 0;

    hiredApplications.forEach((doc) => {
      const data = doc.data();
      const appliedAt = data.appliedAt?.toDate?.() || new Date();
      const hiredAt = data.hiredAt?.toDate?.() || new Date();
      const reviewedAt = data.reviewedAt?.toDate?.() || hiredAt;

      const timeToHire = Math.ceil((hiredAt - appliedAt) / (1000 * 60 * 60 * 24));
      const responseTime = Math.ceil((reviewedAt - appliedAt) / (1000 * 60 * 60 * 24));

      totalTimeToHire += timeToHire;
      totalResponseTime += responseTime;
    });

    const avgTimeToHire = Math.round(totalTimeToHire / hiredApplications.length);
    const avgResponseTime = Math.round(totalResponseTime / hiredApplications.length);
    const hireRate = Math.round((hiredApplications.length / applicationsSnapshot.size) * 100);

    return {
      avgTimeToHire,
      avgResponseTime,
      hireRate,
    };
  }

  // Get top candidates (AI matching simulation)
  async getTopCandidates(companyId, limit = 5) {
    try {
      // Get recent applications
      const applications = await this.db
        .collection('applications')
        .where('companyId', '==', companyId)
        .where('status', 'in', ['applied', 'reviewed'])
        .orderBy('appliedAt', 'desc')
        .limit(20)
        .get();

      if (applications.empty) {
        return [];
      }

      // Simulate AI matching scores
      const candidates = await Promise.all(
        applications.docs.map(async (doc) => {
          const application = doc.data();

          // Get candidate details
          const candidateDoc = await this.db.collection('users').doc(application.studentId).get();

          const candidate = candidateDoc.exists ? candidateDoc.data() : {};

          // Calculate match score (simplified)
          let score = 60; // Base score

          // Add points for skills (if job data available)
          if (application.jobId) {
            const jobDoc = await this.db.collection('jobs').doc(application.jobId).get();
            if (jobDoc.exists) {
              const job = jobDoc.data();
              const requiredSkills = job.requiredSkills || [];
              const candidateSkills = candidate.skills || [];

              const matchedSkills = candidateSkills.filter((skill) =>
                requiredSkills.includes(skill)
              );

              score += (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 20;
            }
          }

          // Add points for recent application
          const daysOld = Math.floor(
            (new Date() - application.appliedAt?.toDate?.()) / (1000 * 60 * 60 * 24)
          );
          if (daysOld < 2) score += 20;

          return {
            id: doc.id,
            ...application,
            candidate: {
              id: candidateDoc.id,
              ...candidate,
            },
            matchScore: Math.min(Math.round(score), 100),
          };
        })
      );

      // Sort by match score and limit
      return candidates.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
    } catch (error) {
      console.error('Error getting top candidates:', error);
      return [];
    }
  }
}

module.exports = new FirebaseCompanyService();
