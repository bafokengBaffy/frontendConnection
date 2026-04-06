/* eslint-disable no-unused-vars */
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  limit,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import { db, auth } from '../config/firebase';

/**
 * Company Firebase Service
 * Handles real-time Firebase operations for company dashboard
 */
export const companyFirebaseService = {
  // Subscribe to new applications in real-time
  subscribeToApplications: (companyId, callback, status = 'applied') => {
    if (!companyId) {
      console.error('Company ID is required');
      return () => {};
    }

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('companyId', '==', companyId),
        where('status', '==', status),
        orderBy('appliedAt', 'desc')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const applications = [];
          snapshot.forEach((doc) => {
            applications.push({
              id: doc.id,
              ...doc.data(),
              appliedAt: doc.data().appliedAt?.toDate?.() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            });
          });
          callback(applications);
        },
        (error) => {
          console.error('Error in applications subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up applications subscription:', error);
      return () => {};
    }
  },

  // Subscribe to interviews in real-time
  subscribeToInterviews: (companyId, callback) => {
    if (!companyId) {
      console.error('Company ID is required');
      return () => {};
    }

    try {
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('companyId', '==', companyId),
        where('status', 'in', ['scheduled', 'confirmed']),
        orderBy('scheduledTime', 'asc')
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const interviews = [];
          snapshot.forEach((doc) => {
            interviews.push({
              id: doc.id,
              ...doc.data(),
              scheduledTime: doc.data().scheduledTime?.toDate?.() || new Date(),
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            });
          });
          callback(interviews);
        },
        (error) => {
          console.error('Error in interviews subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up interviews subscription:', error);
      return () => {};
    }
  },

  // Subscribe to job applications (with filtering options)
  subscribeToJobApplications: (jobId, callback, options = {}) => {
    if (!jobId) {
      console.error('Job ID is required');
      return () => {};
    }

    const {
      status,
      limit: limitCount = 50,
      orderByField = 'appliedAt',
      orderDirection = 'desc',
    } = options;

    try {
      const applicationsRef = collection(db, 'applications');
      const constraints = [where('jobId', '==', jobId)];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      constraints.push(orderBy(orderByField, orderDirection));

      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(applicationsRef, ...constraints);

      return onSnapshot(
        q,
        (snapshot) => {
          const applications = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            applications.push({
              id: doc.id,
              ...data,
              appliedAt: data.appliedAt?.toDate?.() || new Date(),
              updatedAt: data.updatedAt?.toDate?.() || new Date(),
              reviewedAt: data.reviewedAt?.toDate?.() || null,
              interviewScheduledAt: data.interviewScheduledAt?.toDate?.() || null,
              hiredAt: data.hiredAt?.toDate?.() || null,
            });
          });
          callback(applications);
        },
        (error) => {
          console.error('Error in job applications subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up job applications subscription:', error);
      return () => {};
    }
  },

  // Subscribe to company stats
  subscribeToCompanyStats: (companyId, callback) => {
    if (!companyId) {
      console.error('Company ID is required');
      return () => {};
    }

    try {
      const statsRef = collection(db, 'company_stats');
      const q = query(
        statsRef,
        where('companyId', '==', companyId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            callback({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate?.() || new Date(),
            });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in company stats subscription:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up company stats subscription:', error);
      return () => {};
    }
  },

  // Subscribe to notifications
  subscribeToNotifications: (companyId, callback) => {
    if (!companyId) {
      console.error('Company ID is required');
      return () => {};
    }

    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('companyId', '==', companyId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const notifications = [];
          snapshot.forEach((doc) => {
            notifications.push({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            });
          });
          callback(notifications);
        },
        (error) => {
          console.error('Error in notifications subscription:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up notifications subscription:', error);
      return () => {};
    }
  },

  // Subscribe to company profile updates
  subscribeToCompanyProfile: (companyId, callback) => {
    if (!companyId) {
      console.error('Company ID is required');
      return () => {};
    }

    try {
      const companyRef = doc(db, 'companies', companyId);
      return onSnapshot(
        companyRef,
        (doc) => {
          if (doc.exists()) {
            callback({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            });
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error in company profile subscription:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up company profile subscription:', error);
      return () => {};
    }
  },

  // Get real-time dashboard data
  getRealtimeDashboardData: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      // Get company data
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      const companyData = companyDoc.exists()
        ? {
            id: companyDoc.id,
            ...companyDoc.data(),
          }
        : null;

      // Get stats counts using Promise.all for efficiency
      const [jobsSnapshot, applicationsSnapshot, interviewsSnapshot, followersSnapshot] =
        await Promise.all([
          getDocs(query(collection(db, 'jobs'), where('companyId', '==', companyId))),
          getDocs(query(collection(db, 'applications'), where('companyId', '==', companyId))),
          getDocs(query(collection(db, 'interviews'), where('companyId', '==', companyId))),
          getDocs(query(collection(db, 'followers'), where('companyId', '==', companyId))),
        ]);

      // Get recent applications
      const recentAppsQuery = query(
        collection(db, 'applications'),
        where('companyId', '==', companyId),
        orderBy('appliedAt', 'desc'),
        limit(10)
      );
      const recentAppsSnapshot = await getDocs(recentAppsQuery);

      // Process recent applications
      const recentApplications = [];
      recentAppsSnapshot.forEach((doc) => {
        const data = doc.data();
        recentApplications.push({
          id: doc.id,
          ...data,
          appliedAt: data.appliedAt?.toDate?.() || new Date(),
        });
      });

      // Get active jobs
      const activeJobsQuery = query(
        collection(db, 'jobs'),
        where('companyId', '==', companyId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const activeJobsSnapshot = await getDocs(activeJobsQuery);

      // Process active jobs
      const activeJobs = [];
      activeJobsSnapshot.forEach((doc) => {
        const data = doc.data();
        activeJobs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          deadline: data.deadline?.toDate?.() || null,
        });
      });

      // Calculate pipeline stats
      const pipelineStats = {
        new: 0,
        reviewed: 0,
        interview: 0,
        hired: 0,
        rejected: 0,
      };

      applicationsSnapshot.forEach((doc) => {
        const status = doc.data().status;
        if (Object.prototype.hasOwnProperty.call(pipelineStats, status)) {
          pipelineStats[status]++;
        }
      });

      return {
        company: companyData,
        stats: {
          totalJobs: jobsSnapshot.size,
          activeJobs: activeJobsSnapshot.size,
          totalApplicants: applicationsSnapshot.size,
          interviewsScheduled: interviewsSnapshot.size,
          totalFollowers: followersSnapshot.size,
        },
        recentApplications,
        activeJobs,
        pipelineStats,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting real-time dashboard data:', error);
      throw error;
    }
  },

  // Update application status
  updateApplicationStatus: async (applicationId, status, additionalData = {}) => {
    try {
      if (!applicationId || !status) {
        throw new Error('Application ID and status are required');
      }

      const applicationRef = doc(db, 'applications', applicationId);
      const updateData = {
        status,
        updatedAt: Timestamp.now(),
        ...additionalData,
      };

      // Add timestamp based on status
      if (status === 'reviewed') {
        updateData.reviewedAt = Timestamp.now();
      } else if (status === 'interview') {
        updateData.interviewScheduledAt = Timestamp.now();
      } else if (status === 'hired') {
        updateData.hiredAt = Timestamp.now();
      }

      await updateDoc(applicationRef, updateData);

      // Create notification for status change
      const applicationDoc = await getDoc(applicationRef);
      if (applicationDoc.exists()) {
        const applicationData = applicationDoc.data();
        await addDoc(collection(db, 'notifications'), {
          type: 'application_status_update',
          title: `Application ${status}`,
          message: `Your application has been ${status}`,
          userId: applicationData.studentId,
          companyId: applicationData.companyId,
          jobId: applicationData.jobId,
          applicationId,
          read: false,
          createdAt: Timestamp.now(),
          metadata: { status, previousStatus: applicationData.status },
        });
      }

      return { success: true, id: applicationId };
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Create a new interview
  scheduleInterview: async (interviewData) => {
    try {
      const {
        applicationId,
        companyId,
        candidateId,
        jobId,
        scheduledTime,
        duration,
        interviewType,
        interviewerId,
        notes,
      } = interviewData;

      if (!applicationId || !companyId || !candidateId || !jobId || !scheduledTime) {
        throw new Error('Missing required interview data');
      }

      const interviewRef = await addDoc(collection(db, 'interviews'), {
        applicationId,
        companyId,
        candidateId,
        jobId,
        scheduledTime: Timestamp.fromDate(new Date(scheduledTime)),
        duration: duration || 30,
        interviewType: interviewType || 'video',
        interviewerId,
        notes: notes || '',
        status: 'scheduled',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update application status to interview
      await companyFirebaseService.updateApplicationStatus(applicationId, 'interview', {
        interviewId: interviewRef.id,
      });

      // Create notification for candidate
      await addDoc(collection(db, 'notifications'), {
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `An interview has been scheduled for ${new Date(scheduledTime).toLocaleDateString()}`,
        userId: candidateId,
        companyId,
        jobId,
        interviewId: interviewRef.id,
        read: false,
        createdAt: Timestamp.now(),
        metadata: { scheduledTime, interviewType },
      });

      return { success: true, id: interviewRef.id };
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  },

  // Batch update multiple applications
  batchUpdateApplications: async (applicationIds, updates) => {
    try {
      if (!applicationIds.length || !updates) {
        throw new Error('Application IDs and updates are required');
      }

      const batch = writeBatch(db);

      applicationIds.forEach((applicationId) => {
        const applicationRef = doc(db, 'applications', applicationId);
        batch.update(applicationRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
      return { success: true, count: applicationIds.length };
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  },

  // Get candidate match scores (AI matching)
  getCandidateMatches: async (jobId, limitCount = 10) => {
    try {
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      // In a real implementation, this would call an AI service
      // For now, we'll simulate with Firebase data
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }

      const jobData = jobDoc.data();
      const requiredSkills = jobData.requiredSkills || [];
      const requiredQualifications = jobData.requiredQualifications || [];

      // Get all applications for this job
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        orderBy('appliedAt', 'desc'),
        limit(limitCount * 2) // Get extra for filtering
      );

      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = [];

      applicationsSnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          ...data,
          appliedAt: data.appliedAt?.toDate?.() || new Date(),
        });
      });

      // Simulate AI matching scores
      const matches = applications.map((app) => {
        let score = 50; // Base score

        // Add points for skills match
        const candidateSkills = app.candidate?.skills || [];
        const matchedSkills = candidateSkills.filter((skill) => requiredSkills.includes(skill));
        score += (matchedSkills.length / requiredSkills.length) * 30;

        // Add points for qualifications
        const candidateQuals = app.candidate?.qualifications || [];
        const matchedQuals = candidateQuals.filter((qual) =>
          requiredQualifications.some((req) => qual.toLowerCase().includes(req.toLowerCase()))
        );
        score += (matchedQuals.length / Math.max(requiredQualifications.length, 1)) * 20;

        // Bonus for recent application
        const daysOld = Math.floor((new Date() - app.appliedAt) / (1000 * 60 * 60 * 24));
        if (daysOld < 3) score += 10;
        if (daysOld < 1) score += 5;

        return {
          ...app,
          matchScore: Math.min(Math.round(score), 100),
        };
      });

      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches.slice(0, limitCount);
    } catch (error) {
      console.error('Error getting candidate matches:', error);
      throw error;
    }
  },
};

export default companyFirebaseService;
