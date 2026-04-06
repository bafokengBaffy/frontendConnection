/* eslint-disable no-undef */
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { db } from '../config/firebase';

export const FirebaseHelpers = {
  // Log activity
  logActivity: async (type, description, userId = 'system', metadata = {}) => {
    try {
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        type,
        description,
        userId,
        metadata,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  },

  // Update dashboard stats
  updateDashboardStats: async (stats) => {
    try {
      const statsRef = collection(db, 'dashboard_stats');
      await addDoc(statsRef, {
        ...stats,
        timestamp: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      return false;
    }
  },

  // Send notification to user
  sendNotification: async (userId, title, message, type = 'info', link = null) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        title,
        message,
        type,
        link,
        read: false,
        createdAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Get collection with filters
  getCollection: async (
    collectionName,
    filters = [],
    orderByField = 'createdAt',
    orderDirection = 'desc'
  ) => {
    try {
      let q = collection(db, collectionName);

      // Apply filters
      filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      q = query(q, orderBy(orderByField, orderDirection));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      return [];
    }
  },

  // Initialize sample data for new deployments
  initializeSampleData: async () => {
    try {
      // Check if data already exists
      const usersRef = collection(db, 'users');
      const userSnapshot = await getDocs(usersRef);

      if (userSnapshot.empty) {
        // Create admin user if not exists
        const adminUser = {
          email: 'admin@careerconnect.ls',
          displayName: 'System Administrator',
          userType: 'admin',
          status: 'active',
          isAdmin: true,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await addDoc(usersRef, adminUser);
        await FirebaseHelpers.logActivity(
          'system_init',
          'System initialized with admin user',
          'system'
        );

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing sample data:', error);
      return false;
    }
  },

  // Backup data to JSON
  backupData: async (collections = ['users', 'applications', 'jobs', 'funding_requests']) => {
    try {
      const backup = {};

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        backup[collectionName] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      // Create backup record
      const backupsRef = collection(db, 'backups');
      await addDoc(backupsRef, {
        data: backup,
        timestamp: Timestamp.now(),
        size: JSON.stringify(backup).length,
      });

      return {
        success: true,
        message: 'Backup created successfully',
        size: JSON.stringify(backup).length,
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
