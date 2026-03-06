/* eslint-disable no-unused-vars */
/**
 * User Analytics Module
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

class UserAnalyticsService {
  constructor() {
    this.db = null;
    this.auth = null;
  }

  initialize(db, auth) {
    this.db = db;
    this.auth = auth;
  }

  async getUserAnalytics(userId, options = {}) {
    const {
      startDate = null,
      endDate = new Date(),
      limit: resultLimit = 100,
      eventTypes = [],
    } = options;

    try {
      // Get user profile for context
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      // Build query for user analytics
      let q = query(
        collection(this.db, 'analytics', userId, 'userAnalytics'),
        orderBy('timestamp', 'desc'),
        limit(resultLimit)
      );

      if (startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(new Date(startDate))));
      }

      if (eventTypes.length > 0) {
        q = query(q, where('eventName', 'in', eventTypes));
      }

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calculate metrics
      const metrics = this._calculateUserMetrics(events, userData);

      return {
        userId,
        userData: {
          email: userData?.email,
          userType: userData?.userType,
          createdAt: userData?.createdAt,
        },
        events,
        metrics,
        summary: {
          totalEvents: events.length,
          eventsByType: this._groupEventsByType(events),
          dailyActivity: this._calculateDailyActivity(events),
          popularActions: this._getPopularActions(events),
        },
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  async getUserEngagementScore(userId) {
    try {
      // Get recent activity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const q = query(
        collection(this.db, 'analytics', userId, 'userAnalytics'),
        where('timestamp', '>=', Timestamp.fromDate(weekAgo)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => doc.data());

      // Calculate engagement score (0-100)
      const score = this._calculateEngagementScore(events);

      return {
        userId,
        score,
        level: this._getEngagementLevel(score),
        activityCount: events.length,
        period: '7d',
      };
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return {
        userId,
        score: 0,
        level: 'inactive',
        activityCount: 0,
        period: '7d',
      };
    }
  }

  async getUserActivityTimeline(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(this.db, 'analytics', userId, 'userAnalytics'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group by day
      const timeline = events.reduce((acc, event) => {
        const date = event.timestamp?.toDate().toDateString() || 'Unknown';
        if (!acc[date]) {
          acc[date] = {
            date,
            events: [],
            eventCount: 0,
            eventTypes: new Set(),
          };
        }
        acc[date].events.push(event);
        acc[date].eventCount++;
        acc[date].eventTypes.add(event.eventName);
        return acc;
      }, {});

      return Object.values(timeline).map((day) => ({
        ...day,
        eventTypes: Array.from(day.eventTypes),
      }));
    } catch (error) {
      console.error('Error getting activity timeline:', error);
      return [];
    }
  }

  async updateUserAnalyticsPreferences(userId, preferences) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        'analytics.preferences': preferences,
        'analytics.preferencesUpdatedAt': Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating analytics preferences:', error);
      throw error;
    }
  }

  // Private methods
  _calculateUserMetrics(events, userData) {
    const now = new Date();
    const accountAge = userData?.createdAt
      ? (now - userData.createdAt.toDate()) / (1000 * 60 * 60 * 24)
      : 0;

    const metrics = {
      activityLevel: 'low',
      sessionFrequency: 0,
      averageSessionDuration: 0,
      favoriteFeatures: [],
      conversionRate: 0,
    };

    if (events.length > 0) {
      // Calculate session frequency (sessions per week)
      const sessions = this._extractSessions(events);
      metrics.sessionFrequency = sessions.length / (accountAge / 7);

      // Calculate average session duration
      const totalDuration = sessions.reduce((sum, session) => {
        if (session.start && session.end) {
          return sum + (session.end - session.start);
        }
        return sum;
      }, 0);
      metrics.averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

      // Determine activity level
      const eventsPerDay = events.length / Math.max(accountAge, 1);
      if (eventsPerDay > 5) metrics.activityLevel = 'high';
      else if (eventsPerDay > 1) metrics.activityLevel = 'medium';
      else metrics.activityLevel = 'low';

      // Find favorite features
      const featureCounts = events.reduce((acc, event) => {
        const feature = this._extractFeatureFromEvent(event);
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {});

      metrics.favoriteFeatures = Object.entries(featureCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([feature]) => feature);
    }

    return metrics;
  }

  _calculateEngagementScore(events) {
    if (events.length === 0) return 0;

    const weights = {
      page_view: 1,
      button_click: 2,
      form_submission: 3,
      job_application: 5,
      profile_update: 2,
      search: 1,
    };

    const now = new Date();
    const score = events.reduce((total, event) => {
      const weight = weights[event.eventName] || 1;

      // Apply time decay (more recent events weighted higher)
      const hoursAgo = (now - event.timestamp?.toDate()) / (1000 * 60 * 60);
      const timeDecay = Math.max(0, 1 - hoursAgo / (7 * 24)); // Decay over 7 days

      return total + weight * timeDecay;
    }, 0);

    // Normalize to 0-100 scale
    const maxPossibleScore = 100; // Adjust based on your scoring system
    return Math.min(100, (score / maxPossibleScore) * 100);
  }

  _getEngagementLevel(score) {
    if (score >= 80) return 'very-high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'inactive';
  }

  _extractSessions(events) {
    const sessions = [];
    let currentSession = null;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    events.sort((a, b) => a.timestamp - b.timestamp);

    events.forEach((event) => {
      const eventTime = event.timestamp?.toDate().getTime();

      if (!currentSession) {
        currentSession = {
          start: eventTime,
          end: eventTime,
          events: [event],
        };
      } else {
        const timeSinceLastEvent = eventTime - currentSession.end;

        if (timeSinceLastEvent <= SESSION_TIMEOUT) {
          currentSession.end = eventTime;
          currentSession.events.push(event);
        } else {
          sessions.push(currentSession);
          currentSession = {
            start: eventTime,
            end: eventTime,
            events: [event],
          };
        }
      }
    });

    if (currentSession) {
      sessions.push(currentSession);
    }

    return sessions;
  }

  _extractFeatureFromEvent(event) {
    const featureMap = {
      page_view: event.pageName || 'Unknown Page',
      button_click: event.buttonName || 'Unknown Button',
      form_submission: event.formName || 'Unknown Form',
      job_application: 'Job Applications',
      profile_update: 'Profile Management',
      search: 'Search',
    };

    return featureMap[event.eventName] || event.eventName;
  }

  _groupEventsByType(events) {
    return events.reduce((acc, event) => {
      acc[event.eventName] = (acc[event.eventName] || 0) + 1;
      return acc;
    }, {});
  }

  _calculateDailyActivity(events) {
    const dailyActivity = {};

    events.forEach((event) => {
      const date = event.timestamp?.toDate().toDateString() || 'Unknown';
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return dailyActivity;
  }

  _getPopularActions(events, limit = 5) {
    const actionCounts = events.reduce((acc, event) => {
      const key = `${event.eventName}:${event.buttonName || event.pageName || event.formName}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([action]) => action);
  }
}

// Export singleton instance
const userAnalytics = new UserAnalyticsService();
export default userAnalytics;
