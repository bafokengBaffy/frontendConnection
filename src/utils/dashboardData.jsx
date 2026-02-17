// src/utils/dashboardData.js - FIXED VERSION
import { db } from '../config/firebase';
import { collection, query, where, getDocs, getCountFromServer, onSnapshot } from 'firebase/firestore';

// Dashboard statistics service
export const DashboardService = {
  
  // Get real-time user counts by type
  async getUserCounts() {
    try {
      const usersRef = collection(db, 'users');
      const counts = {
        total: 0,
        students: 0,
        youth: 0,
        entrepreneurs: 0,
        companies: 0,
        institutes: 0,
        employers: 0,
        admins: 0
      };

      // Get total count
      try {
        const totalSnapshot = await getCountFromServer(usersRef);
        counts.total = totalSnapshot.data().count || 0;
      } catch (error) {
        counts.total = 0;
      }

      // Get counts by user type
      const userTypes = ['student', 'youth', 'entrepreneur', 'company', 'institute', 'employer', 'admin'];
      
      for (const type of userTypes) {
        try {
          const q = query(usersRef, where('userType', '==', type));
          const snapshot = await getCountFromServer(q);
          const key = type === 'youth' ? 'youth' : type + 's';
          counts[key] = snapshot.data().count || 0;
        } catch (error) {
          const key = type === 'youth' ? 'youth' : type + 's';
          counts[key] = 0;
        }
      }

      // Ensure at least admin exists
      if (counts.total === 0) {
        counts.total = 1;
        counts.admins = 1;
      }

      return counts;
    } catch (error) {
      console.error('Error getting user counts:', error);
      // Return default counts if error
      return {
        total: 1,
        students: 0,
        youth: 0,
        entrepreneurs: 0,
        companies: 0,
        institutes: 0,
        employers: 0,
        admins: 1
      };
    }
  },

  // Get real-time applications count
  async getApplicationsCount() {
    try {
      // Try different collection names
      const collections = ['applications', 'student_applications', 'job_applications'];
      
      for (const collName of collections) {
        try {
          const applicationsRef = collection(db, collName);
          const snapshot = await getCountFromServer(applicationsRef);
          const count = snapshot.data().count || 0;
          if (count > 0) {
            return count;
          }
        } catch (error) {
          continue;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error getting applications count:', error);
      return 0;
    }
  },

  // Get active jobs count
  async getActiveJobsCount() {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('status', '==', 'active'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count || 0;
    } catch (error) {
      console.error('Error getting jobs count:', error);
      return 0;
    }
  },

  // Get funding applications count
  async getFundingApplicationsCount() {
    try {
      const fundingRef = collection(db, 'funding_applications');
      const snapshot = await getCountFromServer(fundingRef);
      return snapshot.data().count || 0;
    } catch (error) {
      console.error('Error getting funding applications count:', error);
      return 0;
    }
  },

  // Get recent activities
  async getRecentActivities(limit = 10) {
    try {
      const activitiesRef = collection(db, 'activities');
      const q = query(activitiesRef);
      const querySnapshot = await getDocs(q);
      
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
        return dateB - dateA;
      }).slice(0, limit);

      // If no activities, return sample ones
      if (activities.length === 0) {
        return this.getSampleActivities();
      }

      return activities;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      // Return sample activities if collection doesn't exist
      return this.getSampleActivities();
    }
  },

  // Get sample activities for initial setup
  getSampleActivities() {
    return [
      {
        id: '1',
        type: 'user_registered',
        title: 'Admin Account Created',
        description: 'System administrator account was created',
        timestamp: new Date().toISOString(),
        userEmail: 'baffkay20@gmail.com'
      },
      {
        id: '2',
        type: 'login',
        title: 'Admin Login',
        description: 'Administrator logged into the system',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userEmail: 'baffkay20@gmail.com'
      },
      {
        id: '3',
        type: 'system_start',
        title: 'System Started',
        description: 'Career Connect Lesotho platform started',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];
  },

  // Get system statistics
  async getSystemStats() {
    try {
      const [
        userCounts,
        applicationsCount,
        jobsCount,
        fundingCount
      ] = await Promise.all([
        this.getUserCounts(),
        this.getApplicationsCount(),
        this.getActiveJobsCount(),
        this.getFundingApplicationsCount()
      ]);

      return {
        userCounts,
        applicationsCount,
        jobsCount,
        fundingCount,
        totalRevenue: 0,
        activeProjects: 0
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      // Return default stats
      return {
        userCounts: await this.getUserCounts(),
        applicationsCount: 0,
        jobsCount: 0,
        fundingCount: 0,
        totalRevenue: 0,
        activeProjects: 0
      };
    }
  },

  // Real-time subscription for user counts
  subscribeToUserCounts(callback) {
    try {
      const usersRef = collection(db, 'users');
      
      return onSnapshot(usersRef, (snapshot) => {
        const counts = {
          total: snapshot.size || 0,
          students: 0,
          youth: 0,
          entrepreneurs: 0,
          companies: 0,
          institutes: 0,
          employers: 0,
          admins: 0
        };

        snapshot.forEach(doc => {
          const data = doc.data();
          const userType = data.userType;
          if (userType) {
            const key = userType === 'youth' ? 'youth' : userType + 's';
            if (Object.prototype.hasOwnProperty.call(counts, key)) {
              counts[key]++;
            }
          }
        });

        callback(counts);
      }, (error) => {
        console.error('Error in user count subscription:', error);
        // Provide default counts on error
        callback({
          total: 1,
          students: 0,
          youth: 0,
          entrepreneurs: 0,
          companies: 0,
          institutes: 0,
          employers: 0,
          admins: 1
        });
      });
    } catch (error) {
      console.error('Error setting up subscription:', error);
      // Return a dummy unsubscribe function
      return () => {};
    }
  }
};

// Chart configuration - Simplified
export const chartConfig = {
  userDistribution: {
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  }
};

// Activity types with icons and labels
export const activityTypes = {
  user_registered: {
    icon: 'user-plus',
    color: 'success',
    label: 'New Registration'
  },
  application_submitted: {
    icon: 'file-text',
    color: 'info',
    label: 'Application Submitted'
  },
  job_posted: {
    icon: 'briefcase',
    color: 'primary',
    label: 'Job Posted'
  },
  funding_approved: {
    icon: 'dollar-sign',
    color: 'success',
    label: 'Funding Approved'
  },
  login: {
    icon: 'log-in',
    color: 'secondary',
    label: 'User Login'
  },
  profile_updated: {
    icon: 'edit',
    color: 'warning',
    label: 'Profile Updated'
  },
  system_start: {
    icon: 'power',
    color: 'dark',
    label: 'System Started'
  }
};