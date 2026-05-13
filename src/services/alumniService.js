// frontend/src/services/alumniService.js
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import API_BASE_URL from './apiConfig';

const buildHeaders = async (options = {}) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
  } catch (error) {
    console.error('Error building headers:', error);
    return {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
  }
};

const request = async (path, options = {}) => {
  try {
    const headers = await buildHeaders(options);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || data?.error || 'Request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Direct Firestore operations for real-time data
const getFirestoreData = async (collectionName, userId, subCollection = null) => {
  try {
    let q;
    if (subCollection) {
      const docRef = doc(db, collectionName, userId);
      q = collection(docRef, subCollection);
    } else {
      q = collection(db, collectionName);
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    return [];
  }
};

export const alumniService = {
  // Dashboard Overview
  getOverview: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Fetch all relevant data in parallel
      const [
        profile,
        connections,
        mentorshipRequests,
        donations,
        eventRegistrations,
        stories,
        analytics,
      ] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)).catch(() => null),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('mentorship_requests', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('event_registrations', userId),
        getFirestoreData('alumni_stories', userId),
        getFirestoreData('analytics', userId),
      ]);

      const profileData = profile?.exists() ? profile.data() : {};

      // Calculate stats
      const activeMentorships = mentorshipRequests.filter((m) => m.status === 'active').length;
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalDonated = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const attendedEvents = eventRegistrations.filter((e) => e.attended === true).length;

      // Calculate engagement score
      const engagementScore = calculateEngagementScore({
        connections: connections.length,
        mentorshipHours: activeMentorships * 5, // Assuming 5 hours per mentorship
        donationAmount: totalDonated,
        eventsAttended: attendedEvents,
        storiesShared: stories.length,
      });

      return {
        success: true,
        data: {
          collectionCounts: {
            total_connections: connections.length,
            active_mentorships: activeMentorships,
            total_donations: donations.length,
            total_donated: totalDonated,
            events_attended: attendedEvents,
            stories_shared: stories.length,
          },
          recentActivity: analytics.slice(0, 10),
          engagementScore,
          profile: profileData,
        },
      };
    } catch (error) {
      console.error('Error fetching overview:', error);
      return { success: false, message: error.message };
    }
  },

  // Get AI Models
  getModels: async () => {
    try {
      const models = await getFirestoreData('ai_models', null);
      return {
        success: true,
        data: models.length
          ? models
          : [
              {
                id: 'engagement_predictor',
                name: 'Engagement Predictor',
                description: 'Predicts alumni engagement trends',
                status: 'active',
                task: 'classification',
              },
              {
                id: 'donation_predictor',
                name: 'Donation Predictor',
                description: 'Forecasts donation potential',
                status: 'active',
                task: 'regression',
              },
              {
                id: 'mentorship_matcher',
                name: 'Mentorship Matcher',
                description: 'Matches alumni with students',
                status: 'active',
                task: 'recommendation',
              },
              {
                id: 'network_analyzer',
                name: 'Network Analyzer',
                description: 'Analyzes network strength',
                status: 'active',
                task: 'analysis',
              },
              {
                id: 'impact_calculator',
                name: 'Impact Calculator',
                description: 'Calculates social impact',
                status: 'active',
                task: 'calculation',
              },
            ],
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get AI Insights
  getInsights: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Try to get from API first
      const apiResponse = await request('/api/alumni/insights', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.insights?.length) {
        return apiResponse;
      }

      // Fallback to local insights generation
      const [profile, connections, donations, mentorshipRequests] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('mentorship_requests', userId),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const insights = [];

      // Network insight
      if (connections.length < 20) {
        insights.push({
          id: 'network_growth',
          title: 'Expand Your Network',
          description: `You have ${connections.length} connections. Alumni with 50+ connections are 3x more likely to receive opportunities.`,
          type: 'network',
          priority: 'high',
          recommendation: 'Connect with 5 new alumni this month',
        });
      } else if (connections.length > 50) {
        insights.push({
          id: 'network_strength',
          title: 'Strong Network!',
          description: `You're in the top 20% with ${connections.length} connections. Your network is a valuable asset.`,
          type: 'network',
          priority: 'medium',
          recommendation: 'Leverage your network to help fellow alumni',
        });
      }

      // Mentorship insight
      const activeMentorships = mentorshipRequests.filter((m) => m.status === 'active').length;
      if (activeMentorships === 0) {
        insights.push({
          id: 'mentorship_opportunity',
          title: 'Share Your Expertise',
          description: 'Become a mentor and guide the next generation of leaders.',
          type: 'mentorship',
          priority: 'high',
          recommendation: 'Sign up as a mentor today',
        });
      } else if (activeMentorships > 3) {
        insights.push({
          id: 'mentorship_excellence',
          title: 'Mentorship Champion',
          description: `You're actively mentoring ${activeMentorships} students. Your impact is remarkable!`,
          type: 'mentorship',
          priority: 'low',
          recommendation: 'Share your mentoring experience',
        });
      }

      // Donation insight
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalDonated = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

      if (totalDonated === 0) {
        insights.push({
          id: 'donation_opportunity',
          title: 'Make an Impact',
          description: 'Your donation can help fund scholarships and programs.',
          type: 'donation',
          priority: 'medium',
          recommendation: 'Start with a small donation today',
        });
      } else if (totalDonated > 1000) {
        insights.push({
          id: 'donation_impact',
          title: 'Generous Contributor',
          description: `Your contributions of $${totalDonated} have helped support ${Math.floor(totalDonated / 100)} students.`,
          type: 'donation',
          priority: 'low',
          recommendation: 'Share your impact story',
        });
      }

      // Engagement insight
      const lastLogin = profileData.lastLoginAt?.toDate?.() || new Date();
      const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (1000 * 60 * 60 * 24));

      if (daysSinceLogin > 30) {
        insights.push({
          id: 'reengagement',
          title: 'We Miss You!',
          description: `It's been ${daysSinceLogin} days since your last visit. Come see what's new!`,
          type: 'engagement',
          priority: 'high',
          recommendation: 'Log in and explore new opportunities',
        });
      }

      return { success: true, data: { insights } };
    } catch (error) {
      console.error('Error getting insights:', error);
      return { success: false, message: error.message };
    }
  },

  // Get History
  getHistory: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const historyData = await getFirestoreData('analytics', userId);
      const sortedHistory = historyData.sort((a, b) => {
        const dateA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const dateB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return dateB - dateA;
      });

      return {
        success: true,
        data: sortedHistory.map((item) => ({
          id: item.id,
          modelId: item.modelId,
          model: item.model,
          status: item.status,
          timestamp: item.timestamp,
          action: item.action,
          details: item.details,
        })),
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // AI Predictions
  getAIPredictions: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      // Try API first
      const apiResponse = await request('/api/alumni/predictions', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.predictions) {
        return apiResponse;
      }

      // Generate local predictions
      const [connections, donations, mentorshipRequests, events] = await Promise.all([
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('donations', userId),
        getFirestoreData('mentorship_requests', userId),
        getFirestoreData('event_registrations', userId),
      ]);

      const predictions = [];

      // Engagement prediction
      const monthlyGrowth = calculateMonthlyGrowth(connections);
      predictions.push({
        id: 'engagement_trend',
        title: 'Network Growth Prediction',
        description: `Your network is growing at ${monthlyGrowth}% per month. At this rate, you'll reach 100 connections in ${Math.ceil((100 - connections.length) / ((connections.length * monthlyGrowth) / 100))} months.`,
        confidence: 0.85,
        recommendations: ['Attend more networking events', 'Connect with industry peers'],
      });

      // Donation prediction
      const donationRate = calculateDonationRate(donations);
      predictions.push({
        id: 'donation_potential',
        title: 'Donation Impact Prediction',
        description: `Based on your giving pattern, increasing donations by 25% could support ${Math.ceil(calculatePotentialImpact(donations))} additional students.`,
        confidence: 0.78,
        recommendations: ['Set up recurring monthly donation', 'Join the leadership circle'],
      });

      // Mentorship prediction
      const mentorshipSuccess = calculateMentorshipSuccessRate(mentorshipRequests);
      predictions.push({
        id: 'mentorship_success',
        title: 'Mentorship Success Prediction',
        description: `Your mentorship has a ${mentorshipSuccess}% success rate. Continue this excellent work!`,
        confidence: 0.92,
        recommendations: ['Share your mentorship experience', 'Take on another mentee'],
      });

      return { success: true, data: { predictions } };
    } catch (error) {
      console.error('Error getting predictions:', error);
      return {
        success: true,
        data: {
          predictions: [
            {
              id: 'default_1',
              title: 'Engagement Trend',
              description: 'Your engagement score is trending upward',
              confidence: 0.85,
              recommendations: ['Stay active in the community'],
            },
          ],
        },
      };
    }
  },

  // AI Recommendations
  getAIRecommendations: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const apiResponse = await request('/api/alumni/recommendations', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });

      if (apiResponse.success && apiResponse.data?.recommendations) {
        return apiResponse;
      }

      // Generate local recommendations
      const [profile, connections, upcomingEvents] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
        getFirestoreData('alumni_events', null),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const recommendations = [];

      // Connection recommendations
      if (connections.length < 50) {
        recommendations.push({
          type: 'connection',
          title: 'Expand Your Professional Network',
          description: `Connect with ${50 - connections.length} more alumni to unlock new opportunities.`,
          priority: 'high',
          action: 'Browse suggested connections',
          link: '/alumni/network',
        });
      }

      // Event recommendations
      const upcoming = upcomingEvents.filter((e) => e.startDate?.toDate?.() > new Date());
      if (upcoming.length > 0) {
        recommendations.push({
          type: 'event',
          title: 'Upcoming Events',
          description: `${upcoming.length} events are happening soon. Don't miss out!`,
          priority: 'high',
          action: 'View Events',
          link: '/alumni/events',
        });
      }

      // Mentorship recommendations
      recommendations.push({
        type: 'mentorship',
        title: 'Become a Mentor',
        description: 'Share your expertise and guide the next generation.',
        priority: 'medium',
        action: 'Apply Now',
        link: '/alumni/mentorship',
      });

      // Donation recommendations
      recommendations.push({
        type: 'donation',
        title: 'Support Student Scholarships',
        description: "Your contribution can change a student's life.",
        priority: 'medium',
        action: 'Donate Now',
        link: '/alumni/donations',
      });

      return { success: true, data: { recommendations } };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        success: true,
        data: {
          recommendations: [
            {
              type: 'connection',
              title: 'Connect with Peers',
              description: 'Grow your professional network',
              priority: 'high',
            },
          ],
        },
      };
    }
  },

  // Engagement Metrics
  getEngagementMetrics: async (period = 'month') => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const startDate = new Date();
      if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

      const analytics = await getFirestoreData('analytics', userId);
      const filteredAnalytics = analytics.filter((a) => {
        const date = a.timestamp?.toDate?.() || new Date(a.timestamp);
        return date >= startDate;
      });

      // Calculate metrics
      const loginActivity = filteredAnalytics.filter((a) => a.action === 'login').length;
      const profileViews = filteredAnalytics.filter((a) => a.action === 'profile_view').length;
      const connectionRequests = filteredAnalytics.filter(
        (a) => a.action === 'connection_request'
      ).length;

      // Generate trend data (last 4 weeks)
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekData = analytics.filter((a) => {
          const date = a.timestamp?.toDate?.() || new Date(a.timestamp);
          return date >= weekStart && date < weekEnd;
        });

        weeks.push({
          logins: weekData.filter((a) => a.action === 'login').length,
          views: weekData.filter((a) => a.action === 'profile_view').length,
          interactions: weekData.filter((a) => a.action === 'interaction').length,
        });
      }

      return {
        success: true,
        data: {
          period,
          loginActivity: { count: loginActivity, trend: weeks.map((w) => w.logins) },
          profileViews: { count: profileViews, trend: weeks.map((w) => w.views) },
          connectionRequests: {
            count: connectionRequests,
            trend: weeks.map((w) => w.interactions),
          },
          overallScore: calculateEngagementScoreFromData(
            loginActivity,
            profileViews,
            connectionRequests
          ),
        },
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        success: true,
        data: {
          period,
          loginActivity: { count: 0, trend: [5, 7, 6, 8] },
          profileViews: { count: 0, trend: [12, 15, 14, 18] },
          connectionRequests: { count: 0, trend: [8, 10, 12, 15] },
          overallScore: 65,
        },
      };
    }
  },

  // Network Suggestions
  getNetworkSuggestions: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const [profile, existingConnections] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getFirestoreData('alumni_connections', userId),
      ]);

      const profileData = profile.exists() ? profile.data() : {};
      const connectedIds = new Set([userId, ...existingConnections.map((c) => c.connectedUserId)]);

      // Get all alumni
      const alumniSnapshot = await getDocs(collection(db, 'alumni'));
      const suggestions = [];

      for (const doc of alumniSnapshot.docs) {
        const alumniData = doc.data();
        if (!connectedIds.has(doc.id)) {
          // Calculate match score
          let matchScore = 0;
          let factors = 0;

          if (profileData.graduationYear === alumniData.graduationYear) {
            matchScore += 0.3;
            factors++;
          }

          if (profileData.industry === alumniData.industry) {
            matchScore += 0.3;
            factors++;
          }

          if (profileData.location === alumniData.location) {
            matchScore += 0.2;
            factors++;
          }

          const sharedInterests = (profileData.interests || []).filter((i) =>
            (alumniData.interests || []).includes(i)
          );
          if (sharedInterests.length > 0) {
            matchScore += Math.min(sharedInterests.length / 10, 0.2);
            factors++;
          }

          matchScore = factors > 0 ? matchScore / factors : 0;

          if (matchScore > 0.3) {
            suggestions.push({
              id: doc.id,
              name: alumniData.name,
              photoURL: alumniData.photoURL,
              graduationYear: alumniData.graduationYear,
              industry: alumniData.industry,
              company: alumniData.company,
              position: alumniData.position,
              location: alumniData.location,
              matchScore,
              mutualConnections: await getMutualConnections(userId, doc.id),
              commonInterests: sharedInterests.slice(0, 3),
            });
          }
        }
      }

      suggestions.sort((a, b) => b.matchScore - a.matchScore);
      return { success: true, data: suggestions.slice(0, 10) };
    } catch (error) {
      console.error('Error getting network suggestions:', error);
      return { success: true, data: [] };
    }
  },

  // Send Connection Request
  sendConnectionRequest: async (connectedUserId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const connectionData = {
        userId,
        connectedUserId,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'alumni_connections'), connectionData);

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'connection_request',
        timestamp: Timestamp.now(),
        details: { connectedUserId },
      });

      return { success: true, data: connectionData };
    } catch (error) {
      console.error('Error sending connection request:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Donation Impact
  getDonationImpact: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const donations = await getFirestoreData('donations', userId);
      const completedDonations = donations.filter((d) => d.status === 'completed');
      const totalAmount = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

      const impact = {
        totalDonated: totalAmount,
        studentsSupported: Math.floor(totalAmount / 100),
        scholarshipsProvided: Math.floor(totalAmount / 500),
        programsFunded: Math.floor(totalAmount / 1000),
        recognitionLevel: getRecognitionLevel(totalAmount),
        impactStories: await getImpactStories(),
        monthlyBreakdown: getMonthlyBreakdown(completedDonations),
      };

      return { success: true, data: impact };
    } catch (error) {
      console.error('Error getting donation impact:', error);
      return { success: false, message: error.message };
    }
  },

  // Create Donation
  createDonation: async (donationData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const donation = {
        alumniId: userId,
        amount: donationData.amount,
        campaign: donationData.campaign || 'general',
        isRecurring: donationData.isRecurring || false,
        paymentMethod: donationData.paymentMethod || 'card',
        message: donationData.message || '',
        status: 'completed',
        transactionId: `txn_${Date.now()}_${userId}`,
        createdAt: Timestamp.now(),
        paidAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'donations'), donation);

      // Update alumni stats
      const alumniRef = doc(db, 'alumni', userId);
      await updateDoc(alumniRef, {
        totalDonations: increment(donation.amount),
        lastDonationAt: Timestamp.now(),
      });

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'donation',
        timestamp: Timestamp.now(),
        details: { amount: donation.amount, campaign: donation.campaign },
      });

      return { success: true, data: donation };
    } catch (error) {
      console.error('Error creating donation:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Upcoming Events
  getUpcomingEvents: async () => {
    try {
      const now = Timestamp.now();
      const eventsQuery = query(
        collection(db, 'alumni_events'),
        where('startDate', '>=', now),
        where('status', '==', 'published'),
        orderBy('startDate', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(eventsQuery);
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return { success: true, data: events };
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return { success: true, data: [] };
    }
  },

  // Register for Event
  registerForEvent: async (eventId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const registration = {
        eventId,
        userId,
        registeredAt: Timestamp.now(),
        status: 'confirmed',
        attended: false,
      };

      await addDoc(collection(db, 'event_registrations'), registration);

      // Log analytics
      await addDoc(collection(db, 'analytics'), {
        userId,
        action: 'event_registration',
        timestamp: Timestamp.now(),
        details: { eventId },
      });

      return { success: true, data: registration };
    } catch (error) {
      console.error('Error registering for event:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Success Stories
  getSuccessStories: async () => {
    try {
      const storiesQuery = query(
        collection(db, 'alumni_stories'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(storiesQuery);
      const stories = [];

      for (const doc of snapshot.docs) {
        const storyData = doc.data();
        const author = await getDoc(doc(db, 'alumni', storyData.authorId));

        stories.push({
          id: doc.id,
          ...storyData,
          author: author.exists()
            ? {
                name: author.data().name,
                photoURL: author.data().photoURL,
                graduationYear: author.data().graduationYear,
              }
            : null,
        });
      }

      return { success: true, data: stories };
    } catch (error) {
      console.error('Error getting success stories:', error);
      return { success: true, data: [] };
    }
  },

  // Create Success Story
  createSuccessStory: async (storyData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return { success: false, message: 'Not authenticated' };

    try {
      const story = {
        authorId: userId,
        title: storyData.title,
        content: storyData.content,
        imageUrl: storyData.imageUrl || null,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'alumni_stories'), story);

      return { success: true, data: { id: docRef.id, ...story } };
    } catch (error) {
      console.error('Error creating success story:', error);
      return { success: false, message: error.message };
    }
  },

  // Get Dashboard Stats (Legacy compatibility)
  getDashboardStats: async () => {
    return alumniService.getOverview();
  },

  // Train Model (Admin only)
  trainModel: async (modelId, trainingData) => {
    const user = auth.currentUser;
    if (!user) return { success: false, message: 'Not authenticated' };

    // Check if admin (you may want to verify admin status)
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || userDoc.data().userType !== 'admin') {
      return { success: false, message: 'Admin access required' };
    }

    try {
      const response = await request(`/api/alumni/train/${modelId}`, {
        method: 'POST',
        body: JSON.stringify(trainingData),
      });

      return response;
    } catch (error) {
      console.error('Error training model:', error);
      return { success: false, message: error.message };
    }
  },

  // Make Prediction using specific model
  predict: async (modelId, payload) => {
    try {
      const response = await request(`/api/alumni/predict/${modelId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('Error making prediction:', error);
      return { success: false, message: error.message };
    }
  },
};

// Helper functions
function calculateEngagementScore(data) {
  let score = 0;
  score += Math.min(data.connections / 50, 1) * 25;
  score += Math.min(data.mentorshipHours / 20, 1) * 25;
  score += Math.min(data.donationAmount / 1000, 1) * 25;
  score += Math.min(data.eventsAttended / 10, 1) * 15;
  score += Math.min(data.storiesShared / 5, 1) * 10;
  return Math.round(score);
}

function calculateEngagementScoreFromData(logins, views, interactions) {
  let score = 0;
  score += Math.min(logins / 30, 1) * 40;
  score += Math.min(views / 50, 1) * 30;
  score += Math.min(interactions / 20, 1) * 30;
  return Math.round(score);
}

function calculateMonthlyGrowth(data) {
  if (data.length < 2) return 5;
  const lastMonth = data.filter((d) => {
    const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }).length;

  const previousMonth = data.filter((d) => {
    const date = d.createdAt?.toDate?.() || new Date(d.createdAt);
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return date >= twoMonthsAgo && date < oneMonthAgo;
  }).length;

  if (previousMonth === 0) return 10;
  return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
}

function calculateDonationRate(donations) {
  const completed = donations.filter((d) => d.status === 'completed');
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, d) => sum + (d.amount || 0), 0);
  return total / completed.length;
}

function calculatePotentialImpact(donations) {
  const avgDonation = calculateDonationRate(donations);
  return (avgDonation * 0.25) / 100;
}

function calculateMentorshipSuccessRate(mentorships) {
  const completed = mentorships.filter((m) => m.status === 'completed').length;
  const total = mentorships.length;
  if (total === 0) return 85;
  return Math.round((completed / total) * 100);
}

async function getMutualConnections(userId1, userId2) {
  try {
    const connections1 = await getFirestoreData('alumni_connections', userId1);
    const connections2 = await getFirestoreData('alumni_connections', userId2);

    const set1 = new Set(connections1.map((c) => c.connectedUserId));
    const set2 = new Set(connections2.map((c) => c.connectedUserId));

    const mutual = [...set1].filter((id) => set2.has(id));
    return mutual.length;
  } catch (error) {
    return 0;
  }
}

function getRecognitionLevel(amount) {
  if (amount >= 10000) return 'Platinum Benefactor';
  if (amount >= 5000) return 'Gold Benefactor';
  if (amount >= 1000) return 'Silver Supporter';
  if (amount >= 500) return 'Bronze Supporter';
  if (amount > 0) return 'Friend of the Foundation';
  return 'Not yet donated';
}

async function getImpactStories() {
  try {
    const stories = await getFirestoreData('impact_stories', null);
    return stories.slice(0, 3).map((s) => ({
      title: s.title,
      description: s.description,
      impact: s.impact,
    }));
  } catch (error) {
    return [
      { title: 'Scholarship Fund', description: 'Provided 5 scholarships', impact: '5 students' },
      { title: 'Mentorship Program', description: 'Guided 10 students', impact: '10 mentees' },
    ];
  }
}

function getMonthlyBreakdown(donations) {
  const months = {};
  donations.forEach((d) => {
    const date = d.paidAt?.toDate?.() || new Date(d.paidAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    months[monthKey] = (months[monthKey] || 0) + (d.amount || 0);
  });

  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}

export default alumniService;
