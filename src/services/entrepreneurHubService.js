import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

class EntrepreneurHubService {
  constructor() {
    this.db = db;
  }

  // ==================== REAL-TIME LISTENERS ====================
  setupDashboardListeners(organizationId, callbacks) {
    const unsubscribes = [];

    try {
      // Startups listener
      const startupsQuery = query(
        collection(this.db, 'startups'),
        where('organizationId', '==', organizationId),
        where('status', 'in', ['active', 'incubated'])
      );
      unsubscribes.push(
        onSnapshot(
          startupsQuery,
          (snapshot) => {
            const startups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callbacks.onStartupsUpdate?.(startups);
          },
          (error) => {
            console.error('Startups listener error:', error);
          }
        )
      );

      // Applications listener
      const applicationsQuery = query(
        collection(this.db, 'fundingApplications'),
        where('organizationId', '==', organizationId),
        where('status', 'in', ['submitted', 'pending', 'under_review'])
      );
      unsubscribes.push(
        onSnapshot(
          applicationsQuery,
          (snapshot) => {
            const applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callbacks.onApplicationsUpdate?.(applications);
          },
          (error) => {
            console.error('Applications listener error:', error);
          }
        )
      );

      // Approved grants listener
      const grantsQuery = query(
        collection(this.db, 'fundingApplications'),
        where('organizationId', '==', organizationId),
        where('status', '==', 'approved')
      );
      unsubscribes.push(
        onSnapshot(
          grantsQuery,
          (snapshot) => {
            const grants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callbacks.onGrantsUpdate?.(grants);
          },
          (error) => {
            console.error('Grants listener error:', error);
          }
        )
      );

      // Activities listener
      const activitiesQuery = query(
        collection(this.db, 'activities'),
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      unsubscribes.push(
        onSnapshot(
          activitiesQuery,
          (snapshot) => {
            const activities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            callbacks.onActivitiesUpdate?.(activities);
          },
          (error) => {
            console.error('Activities listener error:', error);
          }
        )
      );
    } catch (error) {
      console.error('Error setting up listeners:', error);
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing listener:', error);
        }
      });
    };
  }

  // ==================== FUNDING APPLICATIONS ====================
  async getFundingApplications(organizationId, status = null) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      let q;
      const constraints = [
        where('organizationId', '==', organizationId),
        orderBy('submittedAt', 'desc'),
      ];

      if (status && status !== 'all') {
        constraints.push(where('status', '==', status));
      }

      q = query(collection(this.db, 'fundingApplications'), ...constraints);

      const snapshot = await getDocs(q);
      const applications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startupName: doc.data().startupName,
        entrepreneurName: doc.data().entrepreneurName || doc.data().founderName,
        entrepreneurEmail: doc.data().entrepreneurEmail || doc.data().email,
        programName: doc.data().programName || 'General Funding',
        fundingAmount: doc.data().fundingAmount || 0,
        businessDescription: doc.data().businessDescription,
        industry: doc.data().industry || doc.data().businessType || 'General',
        status: doc.data().status || 'pending',
        submittedAt: doc.data().submittedAt || doc.data().createdAt,
        reviewNotes: doc.data().reviewNotes || doc.data().feedback,
      }));

      return applications;
    } catch (error) {
      console.error('Error getting funding applications:', error);
      throw new Error('Failed to load funding applications. Please try again.');
    }
  }

  async getApplicationDetails(applicationId) {
    try {
      if (!applicationId) {
        throw new Error('Application ID is required');
      }

      const appDoc = await getDoc(doc(this.db, 'fundingApplications', applicationId));
      if (appDoc.exists()) {
        return { id: appDoc.id, ...appDoc.data() };
      }
      throw new Error('Application not found');
    } catch (error) {
      console.error('Error getting application details:', error);
      throw error;
    }
  }

  async updateApplicationStatus(applicationId, status, reviewNotes = '', reviewerId) {
    try {
      if (!applicationId || !status) {
        throw new Error('Application ID and status are required');
      }

      const updateData = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
        updateData.feedback = reviewNotes;
      }

      if (reviewerId) {
        updateData.reviewerId = reviewerId;
        updateData.reviewedBy = reviewerId;
      }

      if (status === 'approved' || status === 'rejected') {
        updateData.reviewedAt = serverTimestamp();
      }

      await updateDoc(doc(this.db, 'fundingApplications', applicationId), updateData);

      // Log activity
      const appDoc = await getDoc(doc(this.db, 'fundingApplications', applicationId));
      if (appDoc.exists()) {
        const appData = appDoc.data();
        await this.logActivity(
          appData.organizationId,
          'application_review',
          'Application Status Updated',
          `Application from ${appData.startupName} status changed to ${status}`,
          status
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw new Error('Failed to update application status. Please try again.');
    }
  }

  async approveFunding(applicationId, approvedAmount, terms, reviewerId) {
    try {
      if (!applicationId || !approvedAmount) {
        throw new Error('Application ID and approved amount are required');
      }

      await updateDoc(doc(this.db, 'fundingApplications', applicationId), {
        status: 'approved',
        approvedAmount,
        fundingTerms: terms,
        reviewerId,
        reviewedBy: reviewerId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create startup record if approved
      const appDoc = await getDoc(doc(this.db, 'fundingApplications', applicationId));
      if (appDoc.exists()) {
        const appData = appDoc.data();
        await this.createStartupFromApplication(appData, approvedAmount);
      }

      await this.logActivity(
        appDoc.data().organizationId,
        'funding_approval',
        'Funding Approved',
        `Funding of M${approvedAmount} approved for ${appDoc.data().startupName}`,
        'approved'
      );

      return true;
    } catch (error) {
      console.error('Error approving funding:', error);
      throw new Error('Failed to approve funding. Please try again.');
    }
  }

  // ==================== STARTUPS PORTFOLIO ====================
  async getPortfolioStartups(organizationId) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const q = query(
        collection(this.db, 'startups'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const startups = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().startupName || doc.data().name,
        industry: doc.data().industry || 'General',
        stage: doc.data().stage || 'seed',
        investmentAmount: doc.data().investmentAmount || doc.data().fundingReceived || 0,
        performance: doc.data().performance || 50,
        status: doc.data().status || 'active',
        lastUpdate: doc.data().updatedAt || doc.data().createdAt,
      }));
      return startups;
    } catch (error) {
      console.error('Error getting portfolio startups:', error);
      throw new Error('Failed to load portfolio startups. Please try again.');
    }
  }

  async updateStartupStatus(startupId, status, notes = '') {
    try {
      if (!startupId || !status) {
        throw new Error('Startup ID and status are required');
      }

      await updateDoc(doc(this.db, 'startups', startupId), {
        status,
        statusNotes: notes,
        updatedAt: serverTimestamp(),
      });

      // Log activity
      const startupDoc = await getDoc(doc(this.db, 'startups', startupId));
      if (startupDoc.exists()) {
        const startupData = startupDoc.data();
        await this.logActivity(
          startupData.organizationId,
          'startup_status_update',
          'Startup Status Updated',
          `Startup ${startupData.startupName || startupData.name} status changed to ${status}`,
          status
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating startup status:', error);
      throw new Error('Failed to update startup status. Please try again.');
    }
  }

  // ==================== DASHBOARD STATISTICS ====================
  async getDashboardStats(organizationId) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const [startupsSnapshot, applicationsSnapshot, grantsSnapshot, mentorshipSnapshot] =
        await Promise.all([
          getDocs(
            query(
              collection(this.db, 'startups'),
              where('organizationId', '==', organizationId),
              where('status', 'in', ['active', 'incubated'])
            )
          ),
          getDocs(
            query(
              collection(this.db, 'fundingApplications'),
              where('organizationId', '==', organizationId),
              where('status', 'in', ['submitted', 'pending'])
            )
          ),
          getDocs(
            query(
              collection(this.db, 'fundingApplications'),
              where('organizationId', '==', organizationId),
              where('status', '==', 'approved')
            )
          ),
          getDocs(
            query(
              collection(this.db, 'mentorshipPrograms'),
              where('organizationId', '==', organizationId),
              where('status', '==', 'active')
            )
          ),
        ]);

      const profileCompletion = await this.calculateProfileCompletion(organizationId);

      return {
        activeStartups: startupsSnapshot.size,
        fundingApplications: applicationsSnapshot.size,
        approvedGrants: grantsSnapshot.size,
        mentorshipPrograms: mentorshipSnapshot.size,
        profileCompletion,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to load dashboard statistics. Please try again.');
    }
  }

  // ==================== FUNDING PIPELINE ANALYTICS ====================
  async getFundingPipeline(organizationId) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const pipelineStages = [
        { status: 'submitted', label: 'New Applications', color: 'primary' },
        { status: 'under_review', label: 'Under Review', color: 'info' },
        { status: 'approved', label: 'Approved', color: 'success' },
      ];

      const pipelineData = [];

      for (const stage of pipelineStages) {
        const q = query(
          collection(this.db, 'fundingApplications'),
          where('organizationId', '==', organizationId),
          where('status', '==', stage.status)
        );
        const snapshot = await getDocs(q);
        pipelineData.push({
          ...stage,
          count: snapshot.size,
          percentage: Math.min(snapshot.size * 20, 100),
        });
      }

      return pipelineData;
    } catch (error) {
      console.error('Error getting funding pipeline:', error);
      throw new Error('Failed to load funding pipeline data. Please try again.');
    }
  }

  // ==================== ACTIVITY LOGGING ====================
  async logActivity(organizationId, type, title, description, status = 'completed') {
    try {
      if (!organizationId) return;

      const activityData = {
        organizationId,
        type,
        title,
        description,
        status,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(this.db, 'activities'), activityData);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getRecentActivities(organizationId, limit = 5) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const q = query(
        collection(this.db, 'activities'),
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw new Error('Failed to load recent activities. Please try again.');
    }
  }

  // ==================== ORGANIZATION PROFILE ====================
  async getOrganizationProfile(organizationId) {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const orgDoc = await getDoc(doc(this.db, 'organizations', organizationId));
      if (orgDoc.exists()) {
        return { id: orgDoc.id, ...orgDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting organization profile:', error);
      throw error;
    }
  }

  async calculateProfileCompletion(organizationId) {
    try {
      const orgDoc = await getDoc(doc(this.db, 'organizations', organizationId));
      if (!orgDoc.exists()) return 0;

      const orgData = orgDoc.data();
      const requiredFields = [
        'organizationName',
        'contactEmail',
        'phoneNumber',
        'address',
        'description',
        'fundingFocus',
        'website',
      ];

      let completion = 0;
      requiredFields.forEach((field) => {
        if (orgData[field] && orgData[field].toString().trim() !== '') {
          completion += 100 / requiredFields.length;
        }
      });

      return Math.min(Math.round(completion), 100);
    } catch (error) {
      console.error('Error calculating profile completion:', error);
      return 0;
    }
  }

  // ==================== STARTUP CREATION ====================
  async createStartupFromApplication(appData, fundingAmount) {
    try {
      const startupData = {
        organizationId: appData.organizationId,
        startupName: appData.startupName,
        founderName: appData.entrepreneurName || appData.founderName,
        description: appData.businessDescription,
        industry: appData.industry || appData.businessType || 'General',
        stage: 'seed',
        fundingReceived: fundingAmount,
        investmentAmount: fundingAmount,
        status: 'active',
        applicationSource: appData.id,
        performance: 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const startupRef = await addDoc(collection(this.db, 'startups'), startupData);

      await this.logActivity(
        appData.organizationId,
        'startup_created',
        'New Startup Created',
        `Startup ${appData.startupName} created from approved application`,
        'completed'
      );

      return startupRef.id;
    } catch (error) {
      console.error('Error creating startup from application:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const entrepreneurHubService = new EntrepreneurHubService();
export default entrepreneurHubService;
