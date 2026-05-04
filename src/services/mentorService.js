/* eslint-disable no-unused-vars */
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import { cloudinaryService } from './cloudinaryService';

class MentorService {
  constructor() {
    this.collection = 'mentors';
    this.applicationsCollection = 'mentorApplications';
    this.sessionsCollection = 'mentorSessions';
    this.earningsCollection = 'mentorEarnings';
    this.reviewsCollection = 'mentorReviews';
  }

  // ==================== PROFILE MANAGEMENT ====================

  async createMentorProfile(userId, profileData) {
    try {
      const mentorRef = doc(db, this.collection, userId);
      const timestamp = Timestamp.now();

      const mentorProfile = {
        userId,
        ...profileData,
        status: 'pending', // pending, approved, rejected, inactive
        isVerified: false,
        rating: 0,
        totalSessions: 0,
        totalStudents: 0,
        totalEarnings: 0,
        availability: profileData.availability || [],
        expertise: profileData.expertise || [],
        languages: profileData.languages || ['English'],
        certifications: profileData.certifications || [],
        education: profileData.education || [],
        workExperience: profileData.workExperience || [],
        socialLinks: profileData.socialLinks || {},
        achievements: profileData.achievements || [],
        createdAt: timestamp,
        updatedAt: timestamp,
        lastActive: timestamp,
      };

      await setDoc(mentorRef, mentorProfile);
      return { success: true, data: mentorProfile };
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      throw error;
    }
  }

  async getMentorProfile(userId) {
    try {
      const mentorRef = doc(db, this.collection, userId);
      const mentorDoc = await getDoc(mentorRef);

      if (mentorDoc.exists()) {
        return { success: true, data: { id: mentorDoc.id, ...mentorDoc.data() } };
      }
      return { success: false, error: 'Mentor profile not found' };
    } catch (error) {
      console.error('Error getting mentor profile:', error);
      throw error;
    }
  }

  async updateMentorProfile(userId, updates) {
    try {
      const mentorRef = doc(db, this.collection, userId);
      const timestamp = Timestamp.now();

      await updateDoc(mentorRef, {
        ...updates,
        updatedAt: timestamp,
      });

      const updated = await getDoc(mentorRef);
      return { success: true, data: { id: updated.id, ...updated.data() } };
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      throw error;
    }
  }

  async uploadProfilePhoto(userId, file) {
    try {
      const photoUrl = await cloudinaryService.uploadImage(file, {
        folder: 'mentors/profile',
        publicId: `mentor_${userId}`,
        transformation: {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
        },
      });

      await this.updateMentorProfile(userId, { profilePhoto: photoUrl });
      return { success: true, photoUrl };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  async uploadCertification(userId, file, certData) {
    try {
      const fileUrl = await cloudinaryService.uploadFile(file, {
        folder: 'mentors/certifications',
        publicId: `cert_${userId}_${Date.now()}`,
      });

      const certification = {
        ...certData,
        fileUrl,
        uploadedAt: Timestamp.now(),
        verified: false,
      };

      await this.updateMentorProfile(userId, {
        certifications: arrayUnion(certification),
      });

      return { success: true, certification };
    } catch (error) {
      console.error('Error uploading certification:', error);
      throw error;
    }
  }

  // ==================== PUBLIC API METHODS (for Context calls) ====================

  /**
   * Get all mentors with filtering options
   * @param {Object} filters - Filter options
   * @param {Array} filters.expertise - Filter by expertise areas
   * @param {string} filters.language - Filter by language
   * @param {number} filters.minRating - Minimum rating filter
   * @param {string} filters.searchTerm - Search by name/title/bio
   * @param {string} filters.status - Filter by status (default: 'approved')
   * @returns {Promise<Object>} - List of mentors
   */
  async getMentors(filters = {}) {
    try {
      const status = filters.status || 'approved';
      let q = query(collection(db, this.collection), where('status', '==', status));

      // Apply expertise filter
      if (filters.expertise && filters.expertise.length > 0) {
        q = query(q, where('expertise', 'array-contains-any', filters.expertise));
      }

      // Apply language filter
      if (filters.language) {
        q = query(q, where('languages', 'array-contains', filters.language));
      }

      // Apply minimum rating filter
      if (filters.minRating) {
        q = query(q, where('rating', '>=', filters.minRating));
      }

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let mentors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply search filter (client-side for text search)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        mentors = mentors.filter(
          (mentor) =>
            mentor.name?.toLowerCase().includes(searchLower) ||
            mentor.title?.toLowerCase().includes(searchLower) ||
            mentor.bio?.toLowerCase().includes(searchLower) ||
            mentor.expertise?.some((exp) => exp.toLowerCase().includes(searchLower))
        );
      }

      return { success: true, data: mentors };
    } catch (error) {
      console.error('Error getting mentors:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  /**
   * Get mentor by ID (alias for getMentorProfile for compatibility)
   * @param {string} mentorId - Mentor ID
   * @returns {Promise<Object>} - Mentor profile
   */
  async getMentorById(mentorId) {
    return this.getMentorProfile(mentorId);
  }

  // ==================== SESSION MANAGEMENT ====================

  async createSession(sessionData) {
    try {
      const sessionRef = collection(db, this.sessionsCollection);
      const timestamp = Timestamp.now();

      const session = {
        ...sessionData,
        status: 'scheduled',
        paymentStatus: 'pending',
        meetingLink: null,
        recordingUrl: null,
        notes: null,
        feedback: null,
        rating: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        scheduledAt: Timestamp.fromDate(new Date(sessionData.scheduledAt)),
      };

      const docRef = await addDoc(sessionRef, session);

      await updateDoc(doc(db, this.collection, sessionData.mentorId), {
        totalSessions: increment(1),
        lastActive: timestamp,
      });

      return { success: true, sessionId: docRef.id, data: { id: docRef.id, ...session } };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getMentorSessions(mentorId, filters = {}) {
    try {
      let q = query(
        collection(db, this.sessionsCollection),
        where('mentorId', '==', mentorId),
        orderBy('scheduledAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.studentId) {
        q = query(q, where('studentId', '==', filters.studentId));
      }

      if (filters.startDate) {
        q = query(q, where('scheduledAt', '>=', filters.startDate));
      }

      if (filters.endDate) {
        q = query(q, where('scheduledAt', '<=', filters.endDate));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting mentor sessions:', error);
      throw error;
    }
  }

  /**
   * Get all sessions (for admin or general use)
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - List of sessions
   */
  async getSessions(mentorId = null, filters = {}) {
    try {
      let q = query(collection(db, this.sessionsCollection), orderBy('scheduledAt', 'desc'));

      if (mentorId) {
        q = query(q, where('mentorId', '==', mentorId));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.studentId) {
        q = query(q, where('studentId', '==', filters.studentId));
      }

      if (filters.startDate) {
        q = query(q, where('scheduledAt', '>=', filters.startDate));
      }

      if (filters.endDate) {
        q = query(q, where('scheduledAt', '<=', filters.endDate));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting sessions:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  async getSessionById(sessionId) {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        return { success: true, data: { id: sessionDoc.id, ...sessionDoc.data() } };
      }
      return { success: false, error: 'Session not found' };
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const timestamp = Timestamp.now();

      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: timestamp,
      });

      const updated = await getDoc(sessionRef);
      return { success: true, data: { id: updated.id, ...updated.data() } };
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async getUpcomingSessions(mentorId, limitCount = 10) {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.sessionsCollection),
        where('mentorId', '==', mentorId),
        where('scheduledAt', '>=', now),
        where('status', '==', 'scheduled'),
        orderBy('scheduledAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  async getPastSessions(mentorId, limitCount = 10) {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.sessionsCollection),
        where('mentorId', '==', mentorId),
        where('scheduledAt', '<=', now),
        where('status', 'in', ['completed', 'cancelled', 'no_show']),
        orderBy('scheduledAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: sessions };
    } catch (error) {
      console.error('Error getting past sessions:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  async cancelSession(sessionId, reason = '') {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session not found' };
      }

      await updateDoc(sessionRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling session:', error);
      return { success: false, error: error.message };
    }
  }

  async completeSession(sessionId, notes = '') {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        return { success: false, error: 'Session not found' };
      }

      const sessionData = sessionDoc.data();

      await updateDoc(sessionRef, {
        status: 'completed',
        notes: notes,
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await updateDoc(doc(db, this.collection, sessionData.mentorId), {
        totalSessions: increment(1),
        totalStudents: increment(1),
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing session:', error);
      return { success: false, error: error.message };
    }
  }

  async generateMeetingLink(sessionId) {
    try {
      const meetingLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
      await this.updateSession(sessionId, { meetingLink });
      return { success: true, meetingLink };
    } catch (error) {
      console.error('Error generating meeting link:', error);
      throw error;
    }
  }

  async uploadSessionRecording(sessionId, file) {
    try {
      const recordingUrl = await cloudinaryService.uploadVideo(file, {
        folder: 'mentors/sessions',
        publicId: `session_${sessionId}`,
      });

      await this.updateSession(sessionId, { recordingUrl });
      return { success: true, recordingUrl };
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  // ==================== EARNINGS MANAGEMENT ====================

  async getEarnings(mentorId, period = 'monthly') {
    try {
      const earningsRef = collection(db, this.earningsCollection);
      let startDate;

      const now = new Date();
      switch (period) {
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'yearly':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const q = query(
        earningsRef,
        where('mentorId', '==', mentorId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const earnings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const totals = earnings.reduce(
        (acc, curr) => {
          acc.total += curr.amount;
          if (curr.status === 'completed') {
            acc.completed += curr.amount;
          } else if (curr.status === 'pending') {
            acc.pending += curr.amount;
          }
          return acc;
        },
        { total: 0, completed: 0, pending: 0 }
      );

      return {
        success: true,
        data: {
          transactions: earnings,
          summary: totals,
        },
      };
    } catch (error) {
      console.error('Error getting earnings:', error);
      throw error;
    }
  }

  async createPayout(mentorId, amount, paymentMethod) {
    try {
      const payoutRef = collection(db, 'mentorPayouts');
      const timestamp = Timestamp.now();

      const payout = {
        mentorId,
        amount,
        paymentMethod,
        status: 'processing',
        processedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(payoutRef, payout);
      return { success: true, payoutId: docRef.id };
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  }

  // ==================== REVIEWS & RATINGS ====================

  async getMentorReviews(mentorId, limitCount = 10) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('mentorId', '==', mentorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length || 0;

      return {
        success: true,
        data: {
          reviews,
          averageRating: avgRating,
          totalReviews: reviews.length,
        },
      };
    } catch (error) {
      console.error('Error getting mentor reviews:', error);
      throw error;
    }
  }

  async submitSessionFeedback(sessionId, feedbackData) {
    try {
      const { mentorId, rating, comment } = feedbackData;
      const timestamp = Timestamp.now();

      const review = {
        sessionId,
        mentorId,
        studentId: feedbackData.studentId,
        rating,
        comment,
        createdAt: timestamp,
      };

      await addDoc(collection(db, this.reviewsCollection), review);
      await this.updateSession(sessionId, { feedback: { rating, comment }, rating });

      const reviews = await this.getMentorReviews(mentorId);
      const newAvgRating = reviews.data.averageRating;

      await this.updateMentorProfile(mentorId, { rating: newAvgRating });

      return { success: true };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  // ==================== AVAILABILITY MANAGEMENT ====================

  async setAvailability(mentorId, availability) {
    try {
      await this.updateMentorProfile(mentorId, { availability });
      return { success: true };
    } catch (error) {
      console.error('Error setting availability:', error);
      throw error;
    }
  }

  async getAvailableSlots(mentorId, date) {
    try {
      const mentor = await this.getMentorProfile(mentorId);
      if (!mentor.success) {
        throw new Error('Mentor not found');
      }

      const availability = mentor.data.availability || [];
      const dayOfWeek = new Date(date).getDay();

      const daySlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookedSessions = await this.getMentorSessions(mentorId, {
        startDate: Timestamp.fromDate(startOfDay),
        endDate: Timestamp.fromDate(endOfDay),
        status: 'scheduled',
      });

      const bookedTimes = bookedSessions.data.map((session) =>
        session.scheduledAt.toDate().getHours()
      );

      const availableSlots = daySlots.filter((slot) => !bookedTimes.includes(slot.hour));

      return { success: true, data: availableSlots };
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  // ==================== STATS & ANALYTICS ====================

  /**
   * Get mentor statistics summary
   * @param {string} mentorId - Mentor ID
   * @returns {Promise<Object>} - Mentor statistics
   */
  async getMentorStats(mentorId) {
    try {
      const mentorProfile = await this.getMentorProfile(mentorId);
      if (!mentorProfile.success) {
        throw new Error('Mentor not found');
      }

      const sessions = await this.getMentorSessions(mentorId);
      const reviews = await this.getMentorReviews(mentorId);
      const earnings = await this.getEarnings(mentorId);

      const totalSessions = sessions.data.length;
      const completedSessions = sessions.data.filter((s) => s.status === 'completed').length;
      const upcomingSessions = sessions.data.filter((s) => s.status === 'scheduled').length;
      const cancelledSessions = sessions.data.filter((s) => s.status === 'cancelled').length;

      return {
        success: true,
        data: {
          totalSessions,
          completedSessions,
          upcomingSessions,
          cancelledSessions,
          completionRate: totalSessions ? (completedSessions / totalSessions) * 100 : 0,
          averageRating: reviews.data.averageRating,
          totalReviews: reviews.data.totalReviews,
          totalEarnings: earnings.data.summary.total,
          pendingEarnings: earnings.data.summary.pending,
        },
      };
    } catch (error) {
      console.error('Error getting mentor stats:', error);
      return { success: false, error: error.message };
    }
  }

  async getAnalytics(mentorId, period = '30d') {
    try {
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const sessions = await this.getMentorSessions(mentorId, {
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
      });

      const earnings = await this.getEarnings(mentorId, period);
      const reviews = await this.getMentorReviews(mentorId, 100);

      const totalSessions = sessions.data.length;
      const completedSessions = sessions.data.filter((s) => s.status === 'completed').length;
      const cancelledSessions = sessions.data.filter((s) => s.status === 'cancelled').length;
      const completionRate = totalSessions ? (completedSessions / totalSessions) * 100 : 0;

      const sessionsByMonth = sessions.data.reduce((acc, session) => {
        const month = session.scheduledAt.toDate().toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const earningsByMonth = earnings.data.transactions.reduce((acc, transaction) => {
        const month = transaction.createdAt.toDate().toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + transaction.amount;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          summary: {
            totalSessions,
            completedSessions,
            cancelledSessions,
            completionRate: completionRate.toFixed(2),
            totalEarnings: earnings.data.summary.total,
            averageRating: reviews.data.averageRating.toFixed(1),
            totalReviews: reviews.data.totalReviews,
            uniqueStudents: new Set(sessions.data.map((s) => s.studentId)).size,
          },
          charts: {
            sessionsByMonth,
            earningsByMonth,
          },
          sessions: sessions.data,
          earnings: earnings.data.transactions,
          reviews: reviews.data.reviews,
        },
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // ==================== APPLICATION MANAGEMENT ====================

  async submitApplication(userId, applicationData) {
    try {
      const applicationRef = collection(db, this.applicationsCollection);
      const timestamp = Timestamp.now();

      const application = {
        userId,
        ...applicationData,
        status: 'submitted',
        reviewedBy: null,
        reviewedAt: null,
        feedback: null,
        submittedAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(applicationRef, application);

      await this.updateMentorProfile(userId, {
        applicationId: docRef.id,
        status: 'under_review',
      });

      return { success: true, applicationId: docRef.id };
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  async getApplicationStatus(userId) {
    try {
      const q = query(
        collection(db, this.applicationsCollection),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'No application found' };
    } catch (error) {
      console.error('Error getting application status:', error);
      throw error;
    }
  }
}

// Create and export the service instance
export const mentorService = new MentorService();

// Export individual functions for backward compatibility with Context imports
export const getMentors = (filters) => mentorService.getMentors(filters);
export const getSessions = (mentorId, filters) => mentorService.getSessions(mentorId, filters);
export const getMentorProfile = (userId) => mentorService.getMentorProfile(userId);
export const getMentorById = (mentorId) => mentorService.getMentorById(mentorId);
export const updateMentorProfile = (userId, updates) =>
  mentorService.updateMentorProfile(userId, updates);
export const createSession = (sessionData) => mentorService.createSession(sessionData);
export const getMentorSessions = (mentorId, filters) =>
  mentorService.getMentorSessions(mentorId, filters);
export const getSessionById = (sessionId) => mentorService.getSessionById(sessionId);
export const updateSession = (sessionId, updates) =>
  mentorService.updateSession(sessionId, updates);
export const cancelSession = (sessionId, reason) => mentorService.cancelSession(sessionId, reason);
export const completeSession = (sessionId, notes) =>
  mentorService.completeSession(sessionId, notes);
export const getUpcomingSessions = (mentorId, limit) =>
  mentorService.getUpcomingSessions(mentorId, limit);
export const getPastSessions = (mentorId, limit) => mentorService.getPastSessions(mentorId, limit);
export const getMentorStats = (mentorId) => mentorService.getMentorStats(mentorId);
export const getMentorReviews = (mentorId, limit) =>
  mentorService.getMentorReviews(mentorId, limit);
export const getEarnings = (mentorId, period) => mentorService.getEarnings(mentorId, period);
export const setAvailability = (mentorId, availability) =>
  mentorService.setAvailability(mentorId, availability);
export const getAvailableSlots = (mentorId, date) =>
  mentorService.getAvailableSlots(mentorId, date);

export default mentorService;
