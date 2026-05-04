// frontend/src/hooks/useAlumni.js
import { useCallback, useEffect, useRef, useState } from 'react';
import alumniService from '../services/alumniService';
import { useAuth } from './useAuth';

export const useAlumni = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState(null);
  const [models, setModels] = useState([]);
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [networkSuggestions, setNetworkSuggestions] = useState([]);
  const [donationImpact, setDonationImpact] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // Use ref to prevent multiple initial loads
  const hasLoadedRef = useRef(false);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    // Don't fetch if not authenticated or still loading auth
    if (!isAuthenticated || authLoading) {
      return;
    }

    if (!user?.uid) {
      console.warn('No user UID available for fetching alumni data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        overviewRes,
        modelsRes,
        insightsRes,
        historyRes,
        predictionsRes,
        recommendationsRes,
        metricsRes,
        suggestionsRes,
        impactRes,
        eventsRes,
        storiesRes,
      ] = await Promise.allSettled([
        alumniService.getOverview(),
        alumniService.getModels(),
        alumniService.getInsights(),
        alumniService.getHistory(),
        alumniService.getAIPredictions(),
        alumniService.getAIRecommendations(),
        alumniService.getEngagementMetrics('month'),
        alumniService.getNetworkSuggestions(),
        alumniService.getDonationImpact(),
        alumniService.getUpcomingEvents(),
        alumniService.getSuccessStories(),
      ]);

      // Handle each response safely
      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
        setOverview(overviewRes.value.data);
      }
      if (modelsRes.status === 'fulfilled' && modelsRes.value?.success) {
        setModels(modelsRes.value.data);
      }
      if (insightsRes.status === 'fulfilled' && insightsRes.value?.success) {
        setInsights(insightsRes.value.data?.insights || []);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value?.success) {
        setHistory(historyRes.value.data);
      }
      if (predictionsRes.status === 'fulfilled' && predictionsRes.value?.success) {
        setPredictions(predictionsRes.value.data?.predictions || []);
      }
      if (recommendationsRes.status === 'fulfilled' && recommendationsRes.value?.success) {
        setRecommendations(recommendationsRes.value.data?.recommendations || []);
      }
      if (metricsRes.status === 'fulfilled' && metricsRes.value?.success) {
        setEngagementMetrics(metricsRes.value.data);
      }
      if (suggestionsRes.status === 'fulfilled' && suggestionsRes.value?.success) {
        setNetworkSuggestions(suggestionsRes.value.data);
      }
      if (impactRes.status === 'fulfilled' && impactRes.value?.success) {
        setDonationImpact(impactRes.value.data);
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value?.success) {
        setUpcomingEvents(eventsRes.value.data);
      }
      if (storiesRes.status === 'fulfilled' && storiesRes.value?.success) {
        setSuccessStories(storiesRes.value.data);
      }

      setInitialized(true);
    } catch (err) {
      console.error('Error fetching alumni data:', err);
      setError(err.message || 'Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  // Refresh all data
  const refresh = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }
    await fetchAllData();
  }, [fetchAllData, isAuthenticated, authLoading]);

  // Fetch engagement metrics
  const fetchEngagementMetrics = useCallback(
    async (period = 'month') => {
      if (!isAuthenticated || authLoading) {
        return null;
      }
      try {
        const response = await alumniService.getEngagementMetrics(period);
        if (response.success) {
          return response.data;
        }
        return null;
      } catch (err) {
        console.error('Error fetching engagement metrics:', err);
        return null;
      }
    },
    [isAuthenticated, authLoading]
  );

  // Fetch network suggestions
  const fetchNetworkSuggestions = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return [];
    }
    try {
      const response = await alumniService.getNetworkSuggestions();
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching network suggestions:', err);
      return [];
    }
  }, [isAuthenticated, authLoading]);

  // Fetch AI predictions
  const fetchAIPredictions = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return { predictions: [] };
    }
    try {
      const response = await alumniService.getAIPredictions();
      if (response.success) {
        return response.data;
      }
      return { predictions: [] };
    } catch (err) {
      console.error('Error fetching AI predictions:', err);
      return { predictions: [] };
    }
  }, [isAuthenticated, authLoading]);

  // Fetch AI recommendations
  const fetchAIRecommendations = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return { recommendations: [] };
    }
    try {
      const response = await alumniService.getAIRecommendations();
      if (response.success) {
        return response.data;
      }
      return { recommendations: [] };
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
      return { recommendations: [] };
    }
  }, [isAuthenticated, authLoading]);

  // Send connection request
  const sendConnectionRequest = useCallback(
    async (connectedUserId) => {
      if (!isAuthenticated || authLoading) {
        return false;
      }
      try {
        const response = await alumniService.sendConnectionRequest(connectedUserId);
        if (response.success) {
          // Refresh suggestions after sending request
          await fetchNetworkSuggestions();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error sending connection request:', err);
        return false;
      }
    },
    [fetchNetworkSuggestions, isAuthenticated, authLoading]
  );

  // Create donation
  const createDonation = useCallback(
    async (donationData) => {
      if (!isAuthenticated || authLoading) {
        return false;
      }
      try {
        const response = await alumniService.createDonation(donationData);
        if (response.success) {
          // Refresh overview and impact data
          await fetchAllData();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error creating donation:', err);
        return false;
      }
    },
    [fetchAllData, isAuthenticated, authLoading]
  );

  // Register for event
  const registerForEvent = useCallback(
    async (eventId) => {
      if (!isAuthenticated || authLoading) {
        return false;
      }
      try {
        const response = await alumniService.registerForEvent(eventId);
        if (response.success) {
          // Refresh events
          const eventsRes = await alumniService.getUpcomingEvents();
          if (eventsRes.success) setUpcomingEvents(eventsRes.data);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error registering for event:', err);
        return false;
      }
    },
    [isAuthenticated, authLoading]
  );

  // Create success story
  const createSuccessStory = useCallback(
    async (storyData) => {
      if (!isAuthenticated || authLoading) {
        return false;
      }
      try {
        const response = await alumniService.createSuccessStory(storyData);
        if (response.success) {
          // Refresh stories
          const storiesRes = await alumniService.getSuccessStories();
          if (storiesRes.success) setSuccessStories(storiesRes.data);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error creating success story:', err);
        return false;
      }
    },
    [isAuthenticated, authLoading]
  );

  // Make prediction
  const makePrediction = useCallback(
    async (modelId, payload) => {
      if (!isAuthenticated || authLoading) {
        return { success: false, message: 'Not authenticated' };
      }
      try {
        const response = await alumniService.predict(modelId, payload);
        return response;
      } catch (err) {
        console.error('Error making prediction:', err);
        return { success: false, message: err.message };
      }
    },
    [isAuthenticated, authLoading]
  );

  // Load data when auth is ready
  useEffect(() => {
    // Only load once when auth is ready and user is authenticated
    if (!authLoading && isAuthenticated && user?.uid && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchAllData();
    }

    // Reset loaded flag when user changes or logs out
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
      setInitialized(false);
      // Reset all states when user logs out
      setOverview(null);
      setModels([]);
      setInsights([]);
      setHistory([]);
      setPredictions([]);
      setRecommendations([]);
      setEngagementMetrics(null);
      setNetworkSuggestions([]);
      setDonationImpact(null);
      setUpcomingEvents([]);
      setSuccessStories([]);
    }
  }, [user?.uid, isAuthenticated, authLoading, fetchAllData]);

  return {
    // State
    overview,
    models,
    insights,
    history,
    loading: loading || authLoading,
    error,
    predictions,
    recommendations,
    engagementMetrics,
    networkSuggestions,
    donationImpact,
    upcomingEvents,
    successStories,
    initialized,

    // Actions
    refresh,
    fetchEngagementMetrics,
    fetchNetworkSuggestions,
    fetchAIPredictions,
    fetchAIRecommendations,
    sendConnectionRequest,
    createDonation,
    registerForEvent,
    createSuccessStory,
    makePrediction,
  };
};

export default useAlumni;
