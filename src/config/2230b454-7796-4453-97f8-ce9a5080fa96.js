import {
  addDoc,
  auth,
  collection,
  db,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from './firebase';

export const alumniService = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const [profile, donations, connections, posts, events] = await Promise.all([
        getDoc(doc(db, 'alumni', userId)),
        getDocs(
          query(
            collection(db, 'alumni_donations'),
            where('alumniId', '==', userId),
            where('status', '==', 'completed')
          )
        ),
        getDocs(
          query(
            collection(db, 'alumni_connections'),
            where('status', '==', 'accepted'),
            where('fromUserId', '==', userId)
          )
        ),
        getDocs(query(collection(db, 'alumni_posts'), where('userId', '==', userId))),
        getDocs(query(collection(db, 'event_registrations'), where('userId', '==', userId))),
      ]);

      const profileData = profile.data() || {};
      const donationList = donations.docs.map((d) => d.data());
      const totalDonated = donationList.reduce((sum, d) => sum + (d.amount || 0), 0);

      return {
        success: true,
        data: {
          metrics: {
            total_connections: connections.size,
            active_mentorships: 0,
            total_donated: totalDonated,
            events_attended: events.size,
            posts_count: posts.size,
            achievements: 0,
          },
          recentActivity: [],
        },
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      return { success: false, error: error.message };
    }
  },

  // Get events
  getEvents: async () => {
    try {
      const eventsQuery = query(
        collection(db, 'alumni_events'),
        where('status', '==', 'published'),
        orderBy('startDate', 'asc'),
        limit(10)
      );

      const snapshot = await getDocs(eventsQuery);
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: events };
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  // Get network suggestions
  getNetworkSuggestions: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const alumniSnapshot = await getDocs(collection(db, 'alumni'));
      const suggestions = [];

      for (const doc of alumniSnapshot.docs) {
        if (doc.id !== userId) {
          suggestions.push({
            id: doc.id,
            name: doc.data().name || 'Alumni',
            photoURL: doc.data().photoURL || null,
            position: doc.data().position || 'Professional',
            company: doc.data().company || '',
            graduationYear: doc.data().graduationYear || '2020',
            matchScore: Math.random() * 0.5 + 0.3,
            mutualConnections: Math.floor(Math.random() * 10),
          });
        }
      }

      return { success: true, data: suggestions.slice(0, 10) };
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  // Get AI insights
  getAIInsights: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const metrics = await alumniService.getDashboardMetrics();
      const insights = [];

      if (metrics.data.metrics.total_donated === 0) {
        insights.push({
          id: 'donation_start',
          title: 'Start Your Giving Journey',
          description: 'Your donation can help fund scholarships and programs for students.',
          type: 'opportunity',
          priority: 'high',
          recommendation: 'Make your first donation today',
        });
      }

      insights.push({
        id: 'network_growth',
        title: 'Expand Your Network',
        description: 'Connect with more alumni to unlock opportunities.',
        type: 'suggestion',
        priority: 'medium',
        recommendation: 'Connect with 5 new alumni this month',
      });

      return { success: true, data: { insights } };
    } catch (error) {
      return { success: true, data: { insights: [] } };
    }
  },

  // Get achievements
  getAchievements: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const achievements = [
      {
        id: 'first_post',
        name: 'First Post',
        description: 'Shared your first post',
        requirement: 'Create your first post',
        unlocked: false,
      },
      {
        id: 'first_connection',
        name: 'Networker',
        description: 'Made your first connection',
        requirement: 'Connect with another alumni',
        unlocked: false,
      },
      {
        id: 'first_donation',
        name: 'Philanthropist',
        description: 'Made your first donation',
        requirement: 'Make a donation',
        unlocked: false,
      },
      {
        id: 'first_event',
        name: 'Event Goer',
        description: 'Attended your first event',
        requirement: 'Register for an event',
        unlocked: false,
      },
    ];

    return { success: true, data: achievements };
  },

  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const alumniSnapshot = await getDocs(collection(db, 'alumni'));
      const leaderboard = [];

      for (const doc of alumniSnapshot.docs) {
        leaderboard.push({
          id: doc.id,
          name: doc.data().name || 'Alumni',
          photoURL: doc.data().photoURL || null,
          title: doc.data().position || 'Alumni',
          impactScore: Math.floor(Math.random() * 100),
          totalDonated: Math.floor(Math.random() * 10000),
          connectionsCount: Math.floor(Math.random() * 100),
          postsCount: Math.floor(Math.random() * 50),
        });
      }

      leaderboard.sort((a, b) => b.impactScore - a.impactScore);
      return { success: true, data: leaderboard.slice(0, 20) };
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  // Register for event
  registerForEvent: async (eventId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await addDoc(collection(db, 'event_registrations'), {
        eventId,
        userId,
        registeredAt: Timestamp.now(),
        status: 'confirmed',
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send connection request
  sendConnectionRequest: async (targetUserId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await addDoc(collection(db, 'alumni_connections'), {
        fromUserId: userId,
        toUserId: targetUserId,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create donation
  createDonation: async (donationData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const donation = {
        alumniId: userId,
        amount: donationData.amount,
        campaign: donationData.campaign,
        message: donationData.message || '',
        isAnonymous: donationData.isAnonymous || false,
        status: 'completed',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'alumni_donations'), donation);

      await updateDoc(doc(db, 'alumni', userId), {
        totalDonations: increment(donation.amount),
        donationCount: increment(1),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
