// src/services/companyServices/companyFirebaseService.js

import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

const companyFirebaseService = {
  /**
   * Subscribe to real-time applications for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToApplications: (companyId, callback) => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('companyId', '==', companyId),
        orderBy('appliedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const applications = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            applications.push({
              id: doc.id,
              ...data,
              // Convert Firestore timestamps to Date objects
              appliedAt: data.appliedAt?.toDate()?.toISOString() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString(),
            });
          });

          if (typeof callback === 'function') {
            callback(applications);
          }
        },
        (error) => {
          console.error('Error subscribing to applications:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToApplications:', error);
      return () => {}; // Return empty unsubscribe function
    }
  },

  /**
   * Subscribe to real-time interviews for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToInterviews: (companyId, callback) => {
    try {
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('companyId', '==', companyId),
        where('scheduledTime', '>=', Timestamp.now()),
        orderBy('scheduledTime', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const interviews = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            interviews.push({
              id: doc.id,
              ...data,
              scheduledTime: data.scheduledTime?.toDate()?.toISOString(),
              createdAt: data.createdAt?.toDate()?.toISOString(),
            });
          });

          if (typeof callback === 'function') {
            callback(interviews);
          }
        },
        (error) => {
          console.error('Error subscribing to interviews:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToInterviews:', error);
      return () => {};
    }
  },

  /**
   * Subscribe to company profile updates
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToCompanyProfile: (companyId, callback) => {
    try {
      const companyRef = doc(db, 'companies', companyId);

      const unsubscribe = onSnapshot(
        companyRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({
              id: docSnapshot.id,
              ...data,
              // Handle timestamp conversions
              createdAt: data.createdAt?.toDate()?.toISOString(),
              updatedAt: data.updatedAt?.toDate()?.toISOString(),
            });
          }
        },
        (error) => {
          console.error('Error subscribing to company profile:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToCompanyProfile:', error);
      return () => {};
    }
  },

  /**
   * Subscribe to job listings for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToJobs: (companyId, callback) => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const jobs = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            jobs.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate()?.toISOString(),
              updatedAt: data.updatedAt?.toDate()?.toISOString(),
              deadline: data.deadline?.toDate()?.toISOString(),
            });
          });

          if (typeof callback === 'function') {
            callback(jobs);
          }
        },
        (error) => {
          console.error('Error subscribing to jobs:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToJobs:', error);
      return () => {};
    }
  },

  /**
   * Get real-time notifications for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToNotifications: (companyId, callback) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', companyId),
        where('recipientType', '==', 'company'),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notifications = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            notifications.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate()?.toISOString(),
            });
          });

          if (typeof callback === 'function') {
            callback(notifications);
          }
        },
        (error) => {
          console.error('Error subscribing to notifications:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToNotifications:', error);
      return () => {};
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Get real-time analytics for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToAnalytics: (companyId, callback) => {
    try {
      const analyticsRef = doc(db, 'analytics', companyId);

      const unsubscribe = onSnapshot(
        analyticsRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            callback({
              id: docSnapshot.id,
              ...data,
              lastUpdated: data.lastUpdated?.toDate()?.toISOString(),
            });
          }
        },
        (error) => {
          console.error('Error subscribing to analytics:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToAnalytics:', error);
      return () => {};
    }
  },

  /**
   * Subscribe to followers for a company
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToFollowers: (companyId, callback) => {
    try {
      const followersRef = collection(db, 'followers');
      const q = query(
        followersRef,
        where('companyId', '==', companyId),
        orderBy('followedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const followers = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            followers.push({
              id: doc.id,
              ...data,
              followedAt: data.followedAt?.toDate()?.toISOString(),
            });
          });

          if (typeof callback === 'function') {
            callback(followers);
          }
        },
        (error) => {
          console.error('Error subscribing to followers:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToFollowers:', error);
      return () => {};
    }
  },

  /**
   * Get company statistics in real-time
   * @param {string} companyId - Company ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToStats: (companyId, callback) => {
    try {
      const statsRef = doc(db, 'companyStats', companyId);

      const unsubscribe = onSnapshot(
        statsRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const stats = {
              id: docSnapshot.id,
              ...data,
              updatedAt: data.updatedAt?.toDate()?.toISOString(),
            };

            // Get additional real-time data
            const applicationsCount = await getApplicationsCount(companyId);
            const jobsCount = await getJobsCount(companyId);
            const followersCount = await getFollowersCount(companyId);

            callback({
              ...stats,
              applicationsCount,
              jobsCount,
              followersCount,
            });
          }
        },
        (error) => {
          console.error('Error subscribing to stats:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error in subscribeToStats:', error);
      return () => {};
    }
  },

  /**
   * Cleanup all subscriptions
   * @param {Array} listeners - Array of unsubscribe functions
   */
  cleanupSubscriptions: (listeners) => {
    if (Array.isArray(listeners)) {
      listeners.forEach((unsubscribe) => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          try {
            unsubscribe();
          } catch (error) {
            console.error('Error cleaning up subscription:', error);
          }
        }
      });
    }
  },
};

// Helper functions
const getApplicationsCount = async (companyId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('companyId', '==', companyId));
    const snapshot = await getDoc(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting applications count:', error);
    return 0;
  }
};

const getJobsCount = async (companyId) => {
  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, where('companyId', '==', companyId));
    const snapshot = await getDoc(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting jobs count:', error);
    return 0;
  }
};

const getFollowersCount = async (companyId) => {
  try {
    const followersRef = collection(db, 'followers');
    const q = query(followersRef, where('companyId', '==', companyId));
    const snapshot = await getDoc(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting followers count:', error);
    return 0;
  }
};

export default companyFirebaseService;
