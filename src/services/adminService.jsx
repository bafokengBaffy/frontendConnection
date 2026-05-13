/* eslint-disable no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  addDoc,
  writeBatch,
  limit as queryLimit,
} from 'firebase/firestore';

import { db } from '../config/firebase';

// Helper functions
const getAdminId = (currentUser) => currentUser?.uid || 'system';
const getAdminName = (currentUser, userProfile) =>
  userProfile?.displayName || currentUser?.email || 'System Administrator';

// Log admin action
const logAction = async (action, details, currentUser, userProfile) => {
  try {
    await addDoc(collection(db, 'admin_actions'), {
      action,
      adminId: getAdminId(currentUser),
      adminName: getAdminName(currentUser, userProfile),
      timestamp: serverTimestamp(),
      ...details,
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Safe document fetch with error handling
const safeGetDocs = async (q) => {
  try {
    const snapshot = await getDocs(q);
    return snapshot;
  } catch (error) {
    console.warn('Error fetching documents:', error);
    return { size: 0, docs: [] };
  }
};

// Safely convert timestamp to date
const safeDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return null;
};

export const adminService = {
  // ==================== DASHBOARD STATISTICS ====================

  getDashboardStats: async (currentUser, userProfile) => {
    try {
      console.log('Fetching dashboard stats...');

      // Use try-catch for each query to prevent cascading failures
      const collectionCounts = {};
      let userStats = { total: 0, active: 0, pending: 0, suspended: 0, byType: {} };
      let recentActivities = [];
      let pendingApprovals = [];

      try {
        // Get users count
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef);
        const usersSnapshot = await safeGetDocs(usersQuery);
        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        collectionCounts.users = users.length;

        // Calculate user stats
        userStats = {
          total: users.length,
          active: users.filter((u) => u.status === 'active').length,
          pending: users.filter((u) => u.status === 'pending').length,
          suspended: users.filter((u) => u.status === 'suspended').length,
          byType: users.reduce((acc, user) => {
            const type = user.userType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
        };

        // Get pending approvals
        pendingApprovals = users
          .filter((user) => user.status === 'pending')
          .slice(0, 5)
          .map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            userType: user.userType,
            createdAt: user.createdAt,
          }));
      } catch (error) {
        console.warn('Error processing users:', error);
      }

      try {
        // Get companies count
        const companiesRef = collection(db, 'companies');
        const companiesQuery = query(companiesRef);
        const companiesSnapshot = await safeGetDocs(companiesQuery);
        collectionCounts.companies = companiesSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting companies:', error);
        collectionCounts.companies = 0;
      }

      try {
        // Get jobs count
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, where('status', '==', 'active'));
        const jobsSnapshot = await safeGetDocs(jobsQuery);
        collectionCounts.jobs = jobsSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting jobs:', error);
        collectionCounts.jobs = 0;
      }

      try {
        // Get applications count
        const appsRef = collection(db, 'applications');
        const appsQuery = query(appsRef);
        const appsSnapshot = await safeGetDocs(appsQuery);
        collectionCounts.applications = appsSnapshot.docs.length;
      } catch (error) {
        console.warn('Error counting applications:', error);
        collectionCounts.applications = 0;
      }

      try {
        // Get recent activities
        const activitiesRef = collection(db, 'activities');
        const activitiesQuery = query(activitiesRef, orderBy('timestamp', 'desc'), queryLimit(10));
        const activitiesSnapshot = await safeGetDocs(activitiesQuery);
        recentActivities = activitiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: safeDate(doc.data().timestamp),
        }));
      } catch (error) {
        console.warn('Error fetching activities:', error);
      }

      // Calculate recent registrations (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentRegistrations = userStats.byType
        ? Object.values(userStats.byType).reduce((sum, count) => sum + count, 0)
        : 0;

      const stats = {
        timestamp: new Date().toISOString(),
        collectionCounts,
        userStats,
        recentActivities,
        pendingApprovals,
        recentRegistrations,
        summary: {
          totalUsers: userStats.total || 0,
          pendingApprovals: userStats.pending || 0,
          activeCompanies: collectionCounts.companies || 0,
          activeJobs: collectionCounts.jobs || 0,
        },
      };

      try {
        await logAction(
          'dashboard_stats_viewed',
          { stats: stats.summary },
          currentUser,
          userProfile
        );
      } catch (logError) {
        console.warn('Error logging action:', logError);
      }

      console.log('Dashboard stats fetched successfully');
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);

      // Return fallback data
      const fallbackStats = {
        timestamp: new Date().toISOString(),
        collectionCounts: { users: 0, companies: 0, jobs: 0, applications: 0 },
        userStats: { total: 0, active: 0, pending: 0, suspended: 0, byType: {} },
        recentActivities: [],
        pendingApprovals: [],
        recentRegistrations: 0,
        summary: {
          totalUsers: 0,
          pendingApprovals: 0,
          activeCompanies: 0,
          activeJobs: 0,
        },
      };

      return { success: false, error: error.message, data: fallbackStats };
    }
  },

  // ==================== PENDING APPROVALS ====================

  getPendingApprovals: async (currentUser, userProfile) => {
    try {
      console.log('Fetching pending approvals...');

      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('status', 'in', ['pending', 'awaiting_approval']),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await safeGetDocs(q);

      const pendingUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: safeDate(doc.data().createdAt),
        updatedAt: safeDate(doc.data().updatedAt),
      }));

      console.log(`Found ${pendingUsers.length} pending users`);

      // Log the action
      await logAction(
        'pending_approvals_viewed',
        {
          count: pendingUsers.length,
        },
        currentUser,
        userProfile
      );

      return {
        success: true,
        data: {
          users: pendingUsers,
          total: pendingUsers.length,
        },
      };
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return {
        success: false,
        error: error.message,
        data: { users: [], total: 0 },
      };
    }
  },

  rejectUser: async (userId, reason, currentUser, userProfile) => {
    try {
      console.log('Rejecting user:', userId, 'Reason:', reason);

      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        status: 'rejected',
        isActive: false,
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
        rejectedBy: getAdminId(currentUser),
        rejectedByName: getAdminName(currentUser, userProfile),
        updatedAt: serverTimestamp(),
      });

      await logAction(
        'user_rejected',
        {
          userId,
          reason,
          userEmail: (await getDoc(userRef)).data()?.email,
        },
        currentUser,
        userProfile
      );

      console.log('User rejected successfully');
      return { success: true, message: 'User rejected successfully' };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: error.message };
    }
  },

  bulkApproveUsers: async (userIds, comments, currentUser, userProfile) => {
    try {
      console.log('Bulk approving users:', userIds.length, 'users');

      const batch = writeBatch(db);

      for (const userId of userIds) {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, {
          status: 'active',
          isActive: true,
          approvedAt: serverTimestamp(),
          approvedBy: getAdminId(currentUser),
          approvedByName: getAdminName(currentUser, userProfile),
          approvalComments: comments || 'Bulk approval',
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      await logAction(
        'bulk_users_approved',
        {
          count: userIds.length,
          userIds,
          comments,
        },
        currentUser,
        userProfile
      );

      console.log('Bulk approval completed successfully');
      return { success: true, message: `${userIds.length} users approved successfully` };
    } catch (error) {
      console.error('Error bulk approving users:', error);
      return { success: false, error: error.message };
    }
  },

  bulkRejectUsers: async (userIds, reason, currentUser, userProfile) => {
    try {
      console.log('Bulk rejecting users:', userIds.length, 'users');

      const batch = writeBatch(db);

      for (const userId of userIds) {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, {
          status: 'rejected',
          isActive: false,
          rejectionReason: reason,
          rejectedAt: serverTimestamp(),
          rejectedBy: getAdminId(currentUser),
          rejectedByName: getAdminName(currentUser, userProfile),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      await logAction(
        'bulk_users_rejected',
        {
          count: userIds.length,
          userIds,
          reason,
        },
        currentUser,
        userProfile
      );

      console.log('Bulk rejection completed successfully');
      return { success: true, message: `${userIds.length} users rejected successfully` };
    } catch (error) {
      console.error('Error bulk rejecting users:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== USER MANAGEMENT ====================

  users: {
    getAllUsers: async (arg1 = {}, arg2 = 1, arg3 = 20) => {
      try {
        // Backward-compatible signature handling:
        // getAllUsers(filters, page, limit) OR getAllUsers(page, limit, filters)
        let filters = {};
        let page = 1;
        let limit = 20;

        if (typeof arg1 === 'number') {
          page = arg1;
          limit = typeof arg2 === 'number' ? arg2 : 20;
          filters = typeof arg3 === 'object' && arg3 !== null ? arg3 : {};
        } else {
          filters = typeof arg1 === 'object' && arg1 !== null ? arg1 : {};
          page = typeof arg2 === 'number' ? arg2 : 1;
          limit = typeof arg3 === 'number' ? arg3 : 20;
        }

        console.log('Fetching users with filters:', filters);

        let users = [];

        // Simple fetch without complex queries to avoid Firestore errors
        const usersRef = collection(db, 'users');
        const snapshot = await safeGetDocs(usersRef);

        users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredUsers = users;

        if (filters.status && filters.status !== 'all') {
          filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
        }

        if (filters.userType && filters.userType !== 'all') {
          filteredUsers = filteredUsers.filter((user) => user.userType === filters.userType);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.email?.toLowerCase().includes(searchTerm) ||
              false ||
              user.displayName?.toLowerCase().includes(searchTerm) ||
              false ||
              user.userType?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredUsers.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        const payload = {
          users: paginatedUsers,
          total: filteredUsers.length,
          page,
          totalPages: Math.ceil(filteredUsers.length / limit),
          limit,
        };

        return {
          success: true,
          data: payload,
          ...payload,
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        const payload = {
          users: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: typeof arg3 === 'number' ? arg3 : 20,
        };

        return {
          success: false,
          error: error.message,
          data: payload,
          ...payload,
        };
      }
    },

    getUserDetails: async (userId) => {
      try {
        console.log('Fetching user details for:', userId);

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          return { success: false, error: 'User not found' };
        }

        const userData = {
          id: userSnap.id,
          ...userSnap.data(),
          createdAt: safeDate(userSnap.data().createdAt),
        };

        // Get additional data based on user type
        let additionalData = {};

        try {
          if (userData.userType === 'company') {
            const companyRef = doc(db, 'companies', userId);
            const companySnap = await getDoc(companyRef);
            if (companySnap.exists()) {
              additionalData.companyDetails = companySnap.data();
            }
          } else if (userData.userType === 'student') {
            const studentRef = doc(db, 'profiles', userId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              additionalData.profileDetails = studentSnap.data();
            }
          }
        } catch (profileError) {
          console.warn('Error fetching additional data:', profileError);
        }

        console.log('User details fetched successfully');
        return {
          success: true,
          data: { ...userData, ...additionalData },
        };
      } catch (error) {
        console.error('Error fetching user details:', error);
        return { success: false, error: error.message };
      }
    },

    updateUser: async (userId, updates, currentUser, userProfile) => {
      try {
        console.log('Updating user:', userId, 'with:', updates);

        const userRef = doc(db, 'users', userId);
        const updateData = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(userRef, updateData);

        await logAction(
          'user_updated',
          {
            userId,
            updates,
            userEmail: updates.email,
          },
          currentUser,
          userProfile
        );

        console.log('User updated successfully');
        return { success: true, message: 'User updated successfully' };
      } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }
    },

    deleteUser: async (userId, currentUser, userProfile) => {
      try {
        console.log('Deleting user:', userId);

        const userRef = doc(db, 'users', userId);

        // Instead of deleting, mark as deleted
        await updateDoc(userRef, {
          status: 'deleted',
          deletedAt: serverTimestamp(),
          deletedBy: getAdminId(currentUser),
          isActive: false,
        });

        await logAction('user_deleted', { userId }, currentUser, userProfile);

        console.log('User marked as deleted');
        return { success: true, message: 'User marked as deleted' };
      } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }
    },

    approveUser: async (userId, currentUser, userProfile) => {
      try {
        console.log('Approving user:', userId);

        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
          status: 'active',
          isActive: true,
          approvedAt: serverTimestamp(),
          approvedBy: getAdminId(currentUser),
          approvedByName: getAdminName(currentUser, userProfile),
        });

        await logAction('user_approved', { userId }, currentUser, userProfile);

        console.log('User approved successfully');
        return { success: true, message: 'User approved successfully' };
      } catch (error) {
        console.error('Error approving user:', error);
        return { success: false, error: error.message };
      }
    },

    suspendUser: async (userId, reason, currentUser, userProfile) => {
      try {
        console.log('Suspending user:', userId, 'Reason:', reason);

        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
          status: 'suspended',
          isActive: false,
          suspensionReason: reason,
          suspendedAt: serverTimestamp(),
          suspendedBy: getAdminId(currentUser),
        });

        await logAction('user_suspended', { userId, reason }, currentUser, userProfile);

        console.log('User suspended successfully');
        return { success: true, message: 'User suspended successfully' };
      } catch (error) {
        console.error('Error suspending user:', error);
        return { success: false, error: error.message };
      }
    },

    activateUser: async (userId, currentUser, userProfile) => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          status: 'active',
          isActive: true,
          updatedAt: serverTimestamp(),
          reactivatedBy: getAdminId(currentUser),
        });
        await logAction('user_activated', { userId }, currentUser, userProfile);
        return { success: true, message: 'User activated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    createUser: async (newUser, currentUser, userProfile) => {
      try {
        const email = String(newUser?.email || '')
          .trim()
          .toLowerCase();
        if (!email) return { success: false, error: 'Email is required' };

        const ref = await addDoc(collection(db, 'users'), {
          email,
          displayName: newUser.displayName || email.split('@')[0],
          userType: newUser.userType || 'student',
          status: newUser.status || 'active',
          phoneNumber: newUser.phoneNumber || '',
          isAdmin: newUser.userType === 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: getAdminId(currentUser),
        });

        await logAction('user_created', { userId: ref.id, email }, currentUser, userProfile);
        return { success: true, data: { id: ref.id } };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== COMPANY MANAGEMENT ====================

  companies: {
    getAllCompanies: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching companies with filters:', filters);

        const companiesRef = collection(db, 'companies');
        const snapshot = await safeGetDocs(companiesRef);

        let allCompanies = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredCompanies = allCompanies;

        if (filters.status && filters.status !== 'all') {
          filteredCompanies = filteredCompanies.filter(
            (company) => company.status === filters.status
          );
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredCompanies = filteredCompanies.filter(
            (company) =>
              company.companyName?.toLowerCase().includes(searchTerm) ||
              false ||
              company.email?.toLowerCase().includes(searchTerm) ||
              false ||
              company.industry?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredCompanies.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            companies: paginatedCompanies,
            total: filteredCompanies.length,
            page,
            totalPages: Math.ceil(filteredCompanies.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching companies:', error);
        return {
          success: false,
          error: error.message,
          data: {
            companies: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },

    approveCompany: async (companyId, currentUser, userProfile) => {
      try {
        console.log('Approving company:', companyId);

        const companyRef = doc(db, 'companies', companyId);

        // Update company status
        await updateDoc(companyRef, {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: getAdminId(currentUser),
        });

        // Try to update user status if exists
        try {
          const userRef = doc(db, 'users', companyId);
          await updateDoc(userRef, {
            status: 'active',
            isActive: true,
            approvedAt: serverTimestamp(),
          });
        } catch (userError) {
          console.warn('User update failed (might not exist):', userError);
        }

        await logAction('company_approved', { companyId }, currentUser, userProfile);

        console.log('Company approved successfully');
        return { success: true, message: 'Company approved successfully' };
      } catch (error) {
        console.error('Error approving company:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== JOB MANAGEMENT ====================

  jobs: {
    getAllJobs: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching jobs with filters:', filters);

        const jobsRef = collection(db, 'jobs');
        const snapshot = await safeGetDocs(jobsRef);

        let allJobs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        // Apply filters client-side
        let filteredJobs = allJobs;

        if (filters.status && filters.status !== 'all') {
          filteredJobs = filteredJobs.filter((job) => job.status === filters.status);
        }

        if (filters.jobType && filters.jobType !== 'all') {
          filteredJobs = filteredJobs.filter((job) => job.jobType === filters.jobType);
        }

        if (filters.approved !== undefined) {
          filteredJobs = filteredJobs.filter((job) => job.approved === filters.approved);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredJobs = filteredJobs.filter(
            (job) =>
              job.title?.toLowerCase().includes(searchTerm) ||
              false ||
              job.companyName?.toLowerCase().includes(searchTerm) ||
              false ||
              job.description?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by createdAt descending
        filteredJobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            jobs: paginatedJobs,
            total: filteredJobs.length,
            page,
            totalPages: Math.ceil(filteredJobs.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return {
          success: false,
          error: error.message,
          data: {
            jobs: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },

    updateJob: async (jobId, updates, currentUser, userProfile) => {
      try {
        console.log('Updating job:', jobId, 'with:', updates);

        const jobRef = doc(db, 'jobs', jobId);

        await updateDoc(jobRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        await logAction('job_updated', { jobId, updates }, currentUser, userProfile);

        console.log('Job updated successfully');
        return { success: true, message: 'Job updated successfully' };
      } catch (error) {
        console.error('Error updating job:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== APPLICATION MANAGEMENT ====================

  applications: {
    getAllApplications: async (filters = {}, page = 1, limit = 20) => {
      try {
        console.log('Fetching applications with filters:', filters);

        const appsRef = collection(db, 'applications');
        const snapshot = await safeGetDocs(appsRef);

        let allApplications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: safeDate(doc.data().submittedAt),
        }));

        // Apply filters client-side
        let filteredApps = allApplications;

        if (filters.status && filters.status !== 'all') {
          filteredApps = filteredApps.filter((app) => app.status === filters.status);
        }

        if (filters.type && filters.type !== 'all') {
          filteredApps = filteredApps.filter((app) => app.type === filters.type);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredApps = filteredApps.filter(
            (app) =>
              app.applicantName?.toLowerCase().includes(searchTerm) ||
              false ||
              app.applicantEmail?.toLowerCase().includes(searchTerm) ||
              false ||
              app.jobTitle?.toLowerCase().includes(searchTerm) ||
              false
          );
        }

        // Sort by submittedAt descending
        filteredApps.sort((a, b) => {
          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          return dateB - dateA;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedApplications = filteredApps.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            applications: paginatedApplications,
            total: filteredApps.length,
            page,
            totalPages: Math.ceil(filteredApps.length / limit),
            limit,
          },
        };
      } catch (error) {
        console.error('Error fetching applications:', error);
        return {
          success: false,
          error: error.message,
          data: {
            applications: [],
            total: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
        };
      }
    },
  },

  // ==================== SYSTEM ANALYTICS ====================

  analytics: {
    getRegistrationTrends: async (days = 30) => {
      try {
        console.log('Fetching registration trends for', days, 'days');

        const usersRef = collection(db, 'users');
        const snapshot = await safeGetDocs(usersRef);

        const users = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: safeDate(doc.data().createdAt),
        }));

        const trends = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Initialize trends for each day
        for (let i = 0; i <= days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateString = date.toISOString().split('T')[0];

          trends.push({
            date: dateString,
            count: 0,
            byType: {},
          });
        }

        // Count registrations by date
        users.forEach((user) => {
          if (user.createdAt && user.createdAt >= startDate) {
            const dayIndex = Math.floor((user.createdAt - startDate) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex <= days) {
              trends[dayIndex].count++;

              const userType = user.userType || 'unknown';
              trends[dayIndex].byType[userType] = (trends[dayIndex].byType[userType] || 0) + 1;
            }
          }
        });

        console.log('Registration trends fetched successfully');
        return { success: true, data: trends };
      } catch (error) {
        console.error('Error fetching registration trends:', error);
        return { success: false, error: error.message };
      }
    },

    getPlatformMetrics: async () => {
      try {
        console.log('Fetching platform metrics');

        // Get counts from collections
        const collections = ['users', 'companies', 'jobs', 'applications'];
        const metrics = {};

        for (const collectionName of collections) {
          const snapshot = await safeGetDocs(collection(db, collectionName));
          metrics[collectionName] = snapshot.docs.length;
        }

        // Get recent activities
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activitiesRef = collection(db, 'activities');
        const activitiesSnapshot = await safeGetDocs(activitiesRef);

        const recentActivities = activitiesSnapshot.docs
          .map((doc) => doc.data())
          .filter((activity) => {
            const activityDate = safeDate(activity.timestamp);
            return activityDate && activityDate >= weekAgo;
          });

        const activeUsers = [
          ...new Set(recentActivities.map((activity) => activity.userId)),
        ].filter(Boolean).length;

        console.log('Platform metrics fetched successfully');
        return {
          success: true,
          data: {
            ...metrics,
            activeUsersLast7Days: activeUsers,
            conversionRate:
              metrics.applications && metrics.users
                ? ((metrics.applications / metrics.users) * 100).toFixed(2)
                : '0.00',
          },
        };
      } catch (error) {
        console.error('Error fetching platform metrics:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== SYSTEM SETTINGS ====================

  settings: {
    getSystemSettings: async () => {
      try {
        console.log('Fetching system settings');

        const settingsRef = doc(db, 'system_settings', 'general');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          return { success: true, data: settingsSnap.data() };
        } else {
          // Return default settings
          const defaultSettings = {
            requireJobApproval: true,
            autoApproveInternships: true,
            emailNotifications: true,
            maintenanceMode: false,
            registrationOpen: true,
            maxFileSize: 10, // MB
            allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // Don't create settings automatically, just return defaults
          return { success: true, data: defaultSettings };
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
        return { success: false, error: error.message };
      }
    },

    updateSystemSettings: async (updates, currentUser, userProfile) => {
      try {
        console.log('Updating system settings:', updates);

        const settingsRef = doc(db, 'system_settings', 'general');
        const settingsSnap = await getDoc(settingsRef);

        const updateData = {
          ...updates,
          updatedAt: serverTimestamp(),
          updatedBy: getAdminId(currentUser),
        };

        if (settingsSnap.exists()) {
          await updateDoc(settingsRef, updateData);
        } else {
          await getDoc(settingsRef, {
            ...updateData,
            createdAt: serverTimestamp(),
          });
        }

        await logAction('system_settings_updated', { updates }, currentUser, userProfile);

        console.log('System settings updated successfully');
        return { success: true, message: 'Settings updated successfully' };
      } catch (error) {
        console.error('Error updating system settings:', error);
        return { success: false, error: error.message };
      }
    },
  },

  // ==================== ADMIN MANAGEMENT ====================
  admins: {
    getAllAdmins: async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await safeGetDocs(usersRef);

        const admins = snapshot.docs
          .map((adminDoc) => ({
            id: adminDoc.id,
            ...adminDoc.data(),
            createdAt: safeDate(adminDoc.data().createdAt),
            updatedAt: safeDate(adminDoc.data().updatedAt),
          }))
          .filter(
            (user) =>
              user.userType === 'admin' ||
              user.role === 'admin' ||
              user.role === 'super_admin' ||
              user.isAdmin === true
          );

        admins.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        return { success: true, data: admins };
      } catch (error) {
        return { success: false, error: error.message, data: [] };
      }
    },

    createAdmin: async (payload, currentUser, userProfile) => {
      try {
        const normalizedEmail = String(payload?.email || '')
          .trim()
          .toLowerCase();
        if (!normalizedEmail) {
          return { success: false, error: 'Email is required' };
        }

        const newRef = await addDoc(collection(db, 'users'), {
          email: normalizedEmail,
          displayName: payload?.displayName || normalizedEmail.split('@')[0],
          userType: 'admin',
          role: payload?.adminLevel === 'super_admin' ? 'super_admin' : 'admin',
          adminLevel: payload?.adminLevel === 'super_admin' ? 'super_admin' : 'admin',
          status: payload?.status || 'active',
          permissions: payload?.permissions || [],
          isAdmin: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: getAdminId(currentUser),
        });

        await logAction(
          'admin_created',
          { adminId: newRef.id, email: normalizedEmail },
          currentUser,
          userProfile
        );

        return { success: true, data: { id: newRef.id }, message: 'Admin created successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    updateAdmin: async (adminId, updates, currentUser, userProfile) => {
      try {
        const adminRef = doc(db, 'users', adminId);
        const merged = { ...updates, updatedAt: serverTimestamp() };

        if (updates.adminLevel) {
          merged.role = updates.adminLevel === 'super_admin' ? 'super_admin' : 'admin';
          merged.adminLevel = updates.adminLevel === 'super_admin' ? 'super_admin' : 'admin';
        }

        await updateDoc(adminRef, merged);
        await logAction('admin_updated', { adminId, updates: merged }, currentUser, userProfile);
        return { success: true, message: 'Admin updated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    deactivateAdmin: async (adminId, currentUser, userProfile) => {
      try {
        const adminRef = doc(db, 'users', adminId);
        await updateDoc(adminRef, {
          status: 'suspended',
          isActive: false,
          updatedAt: serverTimestamp(),
          suspendedBy: getAdminId(currentUser),
        });
        await logAction('admin_deactivated', { adminId }, currentUser, userProfile);
        return { success: true, message: 'Admin deactivated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },
};

export default adminService;
