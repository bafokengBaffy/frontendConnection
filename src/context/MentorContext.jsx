/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { logger } from '../utils/logger';
import { mentorService } from '../services/mentorService';

import { useAuth } from './AuthContext';

// Create context
const MentorContext = createContext();

// Session status types
export const SESSION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// Session types
export const SESSION_TYPES = {
  ONE_ON_ONE: 'one_on_one',
  GROUP: 'group',
  WORKSHOP: 'workshop',
  WEBINAR: 'webinar',
  REVIEW: 'review',
};

// Mentorship status
export const MENTORSHIP_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Initial state
const initialState = {
  mentors: [],
  currentMentor: null,
  sessions: [],
  upcomingSessions: [],
  pastSessions: [],
  mentorshipRequests: [],
  reviews: [],
  analytics: {
    totalSessions: 0,
    totalHours: 0,
    averageRating: 0,
    completionRate: 0,
    earnings: 0,
  },
  loading: false,
  error: null,
  filters: {
    expertise: [],
    availability: [],
    rating: null,
    priceRange: { min: 0, max: 1000 },
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Context provider component
export const MentorProvider = ({ children }) => {
  const { user, currentUser } = useAuth();
  const [state, setState] = useState(initialState);
  const userRole = user?.role || user?.userType || null;
  const mentorUserId = currentUser?.uid || user?.uid || user?.id || null;

  // Fetch mentors based on filters
  const fetchMentors = useCallback(
    async (filters = {}) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await mentorService.getMentors({
          ...state.filters,
          ...filters,
          page: state.pagination.page,
          limit: state.pagination.limit,
        });

        setState((prev) => ({
          ...prev,
          mentors: response.data || [],
          pagination: response.pagination || prev.pagination,
          loading: false,
        }));
      } catch (error) {
        logger.error('Failed to fetch mentors:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch mentors',
        }));
      }
    },
    [user, state.filters, state.pagination.page, state.pagination.limit]
  );

  // Fetch mentor by ID
  const fetchMentorById = useCallback(
    async (mentorId) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const mentor = await mentorService.getMentorById(mentorId);
        setState((prev) => ({
          ...prev,
          currentMentor: mentor,
          loading: false,
        }));
        return mentor;
      } catch (error) {
        logger.error('Failed to fetch mentor:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch mentor',
        }));
      }
    },
    [user]
  );

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;

    if (!mentorUserId || (userRole !== 'mentor' && userRole !== 'admin')) {
      setState((prev) => ({
        ...prev,
        sessions: [],
        upcomingSessions: [],
        pastSessions: [],
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [sessions, upcoming, past] = await Promise.all([
        mentorService.getSessions(mentorUserId),
        mentorService.getUpcomingSessions(mentorUserId),
        mentorService.getPastSessions(mentorUserId),
      ]);

      setState((prev) => ({
        ...prev,
        sessions: sessions?.data || [],
        upcomingSessions: upcoming?.data || [],
        pastSessions: past?.data || [],
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch sessions:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch sessions',
      }));
    }
  }, [user, mentorUserId, userRole]);

  // Fetch mentorship requests
  const fetchMentorshipRequests = useCallback(async () => {
    if (!user) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const requests = await mentorService.getMentorshipRequests();
      setState((prev) => ({
        ...prev,
        mentorshipRequests: requests,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch mentorship requests:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch requests',
      }));
    }
  }, [user]);

  // Fetch reviews
  const fetchReviews = useCallback(
    async (mentorId) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const reviews = await mentorService.getReviews(mentorId);
        setState((prev) => ({
          ...prev,
          reviews,
          loading: false,
        }));
      } catch (error) {
        logger.error('Failed to fetch reviews:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch reviews',
        }));
      }
    },
    [user]
  );

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!user || !mentorUserId || (userRole !== 'mentor' && userRole !== 'admin')) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const analytics = await mentorService.getAnalytics(mentorUserId);
      setState((prev) => ({
        ...prev,
        analytics,
        loading: false,
      }));
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch analytics',
      }));
    }
  }, [user, mentorUserId, userRole]);

  // Request mentorship
  const requestMentorship = useCallback(
    async (mentorId, requestData) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const request = await mentorService.requestMentorship(mentorId, requestData);

        // Refresh requests
        await fetchMentorshipRequests();

        setState((prev) => ({ ...prev, loading: false }));
        return request;
      } catch (error) {
        logger.error('Failed to request mentorship:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to request mentorship',
        }));
        throw error;
      }
    },
    [user, fetchMentorshipRequests]
  );

  // Schedule session
  const scheduleSession = useCallback(
    async (sessionData) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const session = await mentorService.scheduleSession(sessionData);

        // Refresh sessions
        await fetchSessions();

        setState((prev) => ({ ...prev, loading: false }));
        return session;
      } catch (error) {
        logger.error('Failed to schedule session:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to schedule session',
        }));
        throw error;
      }
    },
    [user, fetchSessions]
  );

  // Update session
  const updateSession = useCallback(
    async (sessionId, updates) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const session = await mentorService.updateSession(sessionId, updates);

        // Refresh sessions
        await fetchSessions();

        setState((prev) => ({ ...prev, loading: false }));
        return session;
      } catch (error) {
        logger.error('Failed to update session:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to update session',
        }));
        throw error;
      }
    },
    [user, fetchSessions]
  );

  // Cancel session
  const cancelSession = useCallback(
    async (sessionId, reason) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await mentorService.cancelSession(sessionId, reason);

        // Refresh sessions
        await fetchSessions();

        setState((prev) => ({ ...prev, loading: false }));
      } catch (error) {
        logger.error('Failed to cancel session:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to cancel session',
        }));
        throw error;
      }
    },
    [user, fetchSessions]
  );

  // Submit review
  const submitReview = useCallback(
    async (mentorId, reviewData) => {
      if (!user) throw new Error('User not authenticated');

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const review = await mentorService.submitReview(mentorId, reviewData);

        // Refresh reviews if viewing this mentor
        if (state.currentMentor?.id === mentorId) {
          await fetchReviews(mentorId);
        }

        setState((prev) => ({ ...prev, loading: false }));
        return review;
      } catch (error) {
        logger.error('Failed to submit review:', error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to submit review',
        }));
        throw error;
      }
    },
    [user, state.currentMentor, fetchReviews]
  );

  // Update filters
  const updateFilters = useCallback((filters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      pagination: { ...prev.pagination, page: 1 }, // Reset to first page on filter change
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: initialState.filters,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchMentors();
      fetchSessions();

      if (userRole === 'mentor' || userRole === 'admin') {
        fetchMentorshipRequests();
        fetchAnalytics();
      }
    }
  }, [user, userRole, fetchMentors, fetchSessions, fetchMentorshipRequests, fetchAnalytics]);

  // Refetch when filters or pagination change
  useEffect(() => {
    if (user) {
      fetchMentors();
    }
  }, [user, state.filters, state.pagination.page, fetchMentors]);

  const value = {
    // State
    mentors: state.mentors,
    currentMentor: state.currentMentor,
    sessions: state.sessions,
    upcomingSessions: state.upcomingSessions,
    pastSessions: state.pastSessions,
    mentorshipRequests: state.mentorshipRequests,
    reviews: state.reviews,
    analytics: state.analytics,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,

    // Actions
    fetchMentors,
    fetchMentorById,
    fetchSessions,
    fetchMentorshipRequests,
    fetchReviews,
    fetchAnalytics,
    requestMentorship,
    scheduleSession,
    updateSession,
    cancelSession,
    submitReview,
    updateFilters,
    clearFilters,
    changePage,
    clearError,

    // Helpers
    sessionStatus: SESSION_STATUS,
    sessionTypes: SESSION_TYPES,
    mentorshipStatus: MENTORSHIP_STATUS,
  };

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>;
};

// Custom hook to use mentor context
export const useMentor = () => {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error('useMentor must be used within a MentorProvider');
  }
  return context;
};

// Higher-order component
export const withMentor = (Component) => {
  return function WrappedComponent(props) {
    return (
      <MentorContext.Consumer>
        {(mentorProps) => <Component {...props} mentor={mentorProps} />}
      </MentorContext.Consumer>
    );
  };
};
