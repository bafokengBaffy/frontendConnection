import { db, auth, storage } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
      // Upload to Cloudinary
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

      // Update mentor profile
      await this.updateMentorProfile(userId, { profilePhoto: photoUrl });

      return { success: true, photoUrl };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  async uploadCertification(userId, file, certData) {
    try {
      // Upload to Cloudinary
      const fileUrl = await cloudinaryService.uploadFile(file, {
        folder: 'mentors/certifications',
        publicId: `cert_${userId}_${Date.now()}`,
      });

      // Add certification to profile
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

  // ==================== APPLICATION MANAGEMENT ====================

  async submitApplication(userId, applicationData) {
    try {
      const applicationRef = collection(db, this.applicationsCollection);
      const timestamp = Timestamp.now();

      const application = {
        userId,
        ...applicationData,
        status: 'submitted', // submitted, under_review, approved, rejected
        reviewedBy: null,
        reviewedAt: null,
        feedback: null,
        submittedAt: timestamp,
        updatedAt: timestamp,
      };

      const docRef = await addDoc(applicationRef, application);

      // Update mentor status
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

  // ==================== SESSION MANAGEMENT ====================

  async createSession(sessionData) {
    try {
      const sessionRef = collection(db, this.sessionsCollection);
      const timestamp = Timestamp.now();

      const session = {
        ...sessionData,
        status: 'scheduled', // scheduled, ongoing, completed, cancelled, no_show
        paymentStatus: 'pending', // pending, paid, refunded, failed
        meetingLink: null,
        recordingUrl: null,
        notes: null,
        feedback: null,
        rating: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        scheduledAt: timestamp.fromDate(new Date(sessionData.scheduledAt)),
      };

      const docRef = await addDoc(sessionRef, session);

      // Update mentor's total sessions count
      await updateDoc(doc(db, this.collection, sessionData.mentorId), {
        totalSessions: increment(1),
        lastActive: timestamp,
      });

      return { success: true, sessionId: docRef.id };
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

      if (filters.startDate) {
        q = query(q, where('scheduledAt', '>=', filters.startDate));
      }

      if (filters.endDate) {
        q = query(q, where('scheduledAt', '<=', filters.endDate));
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

  async generateMeetingLink(sessionId) {
    try {
      // Integration with Zoom/Google Meet API
      // For now, generating a mock meeting link
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
      // Upload to Cloudinary
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
      const timestamp = Timestamp.now();
      let startDate;

      // Calculate start date based on period
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

      // Calculate totals
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
      // Integration with Stripe/PayPal
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

      // Calculate average rating
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

      // Add review
      const reviewRef = collection(db, this.reviewsCollection);
      const review = {
        sessionId,
        mentorId,
        studentId: feedbackData.studentId,
        rating,
        comment,
        createdAt: timestamp,
      };

      await addDoc(reviewRef, review);

      // Update session with feedback
      await this.updateSession(sessionId, {
        feedback: { rating, comment },
        rating,
      });

      // Update mentor's average rating
      const reviews = await this.getMentorReviews(mentorId);
      const newAvgRating = reviews.data.averageRating;

      await this.updateMentorProfile(mentorId, {
        rating: newAvgRating,
      });

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

      // Get slots for specific day
      const daySlots = availability.filter((slot) => slot.dayOfWeek === dayOfWeek);

      // Get booked sessions for this date
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

      // Filter out booked slots
      const availableSlots = daySlots.filter((slot) => !bookedTimes.includes(slot.hour));

      return { success: true, data: availableSlots };
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

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

      // Get sessions in period
      const sessions = await this.getMentorSessions(mentorId, {
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
      });

      // Get earnings in period
      const earnings = await this.getEarnings(mentorId, period);

      // Get reviews in period
      const reviews = await this.getMentorReviews(mentorId, 100);

      // Calculate statistics
      const totalSessions = sessions.data.length;
      const completedSessions = sessions.data.filter((s) => s.status === 'completed').length;
      const cancelledSessions = sessions.data.filter((s) => s.status === 'cancelled').length;
      const completionRate = totalSessions ? (completedSessions / totalSessions) * 100 : 0;

      // Group by month for charts
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
}

export const mentorService = new MentorService();
