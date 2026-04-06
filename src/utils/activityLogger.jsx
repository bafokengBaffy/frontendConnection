// src/utils/activityLogger.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../config/firebase';

export const ActivityLogger = {
  async logActivity(type, description, userId = null, email = null, metadata = {}) {
    try {
      // Check if activities collection exists, if not we'll handle gracefully
      const activitiesRef = collection(db, 'activities');

      const activity = {
        type,
        title: this.getActivityTitle(type),
        description,
        userId: userId || 'system',
        userEmail: email || 'system@careerconnect.ls',
        timestamp: serverTimestamp(),
        metadata,
        createdAt: new Date().toISOString(),
      };

      await addDoc(activitiesRef, activity);
      console.log('Activity logged:', activity);
      return true;
    } catch (error) {
      console.warn('Could not log activity (collection might not exist yet):', error.message);
      return false;
    }
  },

  getActivityTitle(type) {
    const titles = {
      user_registered: 'New User Registration',
      login: 'User Login',
      logout: 'User Logout',
      profile_updated: 'Profile Updated',
      application_submitted: 'Application Submitted',
      job_posted: 'Job Posted',
      funding_application: 'Funding Application',
      admin_action: 'Admin Action',
      system_start: 'System Started',
      error: 'System Error',
    };

    return titles[type] || 'System Activity';
  },

  // Common activity logging functions
  async logUserLogin(user) {
    return this.logActivity('login', `${user.email} logged into the system`, user.uid, user.email, {
      action: 'login',
      platform: 'web',
    });
  },

  async logUserRegistration(user) {
    return this.logActivity(
      'user_registered',
      `New user registered: ${user.email} as ${user.userType || 'user'}`,
      user.uid,
      user.email,
      { userType: user.userType, action: 'registration' }
    );
  },

  async logAdminAction(adminEmail, action, details) {
    return this.logActivity(
      'admin_action',
      `Admin ${adminEmail} performed: ${action}`,
      null,
      adminEmail,
      { action, details, userType: 'admin' }
    );
  },
};

export default ActivityLogger;
