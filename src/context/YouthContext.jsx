/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/context/YouthContext.jsx (updated with consistent exports)
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import * as youthServices from '../services/youthServices';

import { useAuth } from './AuthContext';

// Create context
const YouthContext = createContext(null);

// Custom hook - must be a named export
export const useYouth = () => {
  const context = useContext(YouthContext);
  if (!context) {
    throw new Error('useYouth must be used within a YouthProvider');
  }
  return context;
};

// Provider component - must be a named export
export const YouthProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [youthProfile, setYouthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const fetchInFlightRef = useRef(false);

  // Cache for various data to prevent unnecessary re-fetches
  const cache = useRef({
    businessIdeas: null,
    fundingApplications: null,
    mentorshipConnections: null,
    completedTrainings: null,
    achievements: null,
    networkConnections: null,
    recentActivities: null,
    dashboardStats: null,
    lastFetched: null,
  });

  // Check if user is a youth
  const isUserYouth = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.userType === 'youth' || userProfile.userType === 'entrepreneur';
  }, [userProfile]);

  // Clear cache for specific data type
  const clearCache = useCallback((dataType) => {
    if (dataType) {
      cache.current[dataType] = null;
    } else {
      cache.current = {
        businessIdeas: null,
        fundingApplications: null,
        mentorshipConnections: null,
        completedTrainings: null,
        achievements: null,
        networkConnections: null,
        recentActivities: null,
        dashboardStats: null,
        lastFetched: null,
      };
    }
  }, []);

  // Fetch youth profile data
  const fetchYouthProfile = useCallback(
    async (forceRefresh = false) => {
      console.log('🔄 fetchYouthProfile called:', {
        hasCurrentUser: !!currentUser,
        userId: currentUser?.uid,
        forceRefresh,
      });

      if (!currentUser) {
        console.log('❌ No currentUser, skipping fetch');
        setYouthProfile(null);
        setLoading(false);
        setInitialized(true);
        return { success: false, error: 'No authenticated user' };
      }

      if (fetchInFlightRef.current && !forceRefresh) {
        return { success: false, error: 'Fetch already in progress' };
      }

      try {
        fetchInFlightRef.current = true;
        setLoading(true);
        setError(null);

        console.log('📡 Fetching youth profile for:', currentUser.uid);
        const result = await youthServices.getYouthProfile(currentUser.uid);

        if (result.success && result.data) {
          console.log('✅ Youth profile fetched successfully');
          setYouthProfile(result.data);
          setInitialized(true);

          // Reset cache when profile is refreshed
          if (forceRefresh) {
            clearCache();
          }

          return { success: true, data: result.data };
        } else {
          console.log('🆕 Youth profile not found, initializing...');

          // Create profile from user data
          const createResult = await youthServices.createYouthProfile(currentUser.uid, {
            email: currentUser.email,
            fullName: currentUser.displayName || currentUser.email?.split('@')[0] || '',
            firstName: currentUser.displayName?.split(' ')[0] || '',
            lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            photoURL: currentUser.photoURL,
            userType: 'youth',
            ...userProfile,
          });

          if (createResult.success) {
            setYouthProfile(createResult.data);
            setInitialized(true);
            return { success: true, data: createResult.data };
          } else {
            throw new Error(createResult.error || 'Failed to create youth profile');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching youth profile:', err);
        setError(err.message);
        setInitialized(true);
        return { success: false, error: err.message };
      } finally {
        fetchInFlightRef.current = false;
        setLoading(false);
      }
    },
    [currentUser, userProfile, clearCache]
  );

  // Update youth profile
  const updateYouthProfile = useCallback(
    async (updates) => {
      if (!currentUser?.uid) {
        throw new Error('No user authenticated');
      }

      try {
        const result = await youthServices.updateYouthProfile(currentUser.uid, updates);

        if (result.success) {
          // Update local state
          setYouthProfile((prev) => ({
            ...prev,
            ...updates,
            updatedAt: new Date().toISOString(),
          }));

          // Clear cache as profile changes may affect other data
          clearCache();

          return { success: true };
        } else {
          throw new Error(result.error || 'Failed to update profile');
        }
      } catch (err) {
        console.error('❌ Error updating youth profile:', err);
        throw err;
      }
    },
    [currentUser?.uid, clearCache]
  );

  // Upload profile photo
  const uploadProfilePhoto = useCallback(
    async (file) => {
      if (!currentUser?.uid) {
        throw new Error('No user authenticated');
      }

      try {
        const result = await youthServices.uploadProfilePhoto(currentUser.uid, file);

        if (result.success) {
          // Update local state
          setYouthProfile((prev) => ({
            ...prev,
            profilePhoto: result.url,
            profilePhotoPublicId: result.publicId,
            updatedAt: new Date().toISOString(),
          }));

          return result;
        } else {
          throw new Error(result.error || 'Failed to upload photo');
        }
      } catch (err) {
        console.error('❌ Error uploading profile photo:', err);
        throw err;
      }
    },
    [currentUser?.uid]
  );

  // Generic fetch function with caching
  const fetchWithCache = useCallback(
    async (dataType, fetchFunction, forceRefresh = false) => {
      if (!currentUser?.uid) {
        return [];
      }

      // Return cached data if available and not forcing refresh
      if (!forceRefresh && cache.current[dataType]) {
        return cache.current[dataType];
      }

      try {
        const result = await fetchFunction();
        const data = result.success ? result.data : [];

        // Cache the result
        cache.current[dataType] = data;
        cache.current.lastFetched = {
          ...cache.current.lastFetched,
          [dataType]: new Date().toISOString(),
        };

        return data;
      } catch (err) {
        console.error(`Error fetching ${dataType}:`, err);
        return [];
      }
    },
    [currentUser?.uid]
  );

  // Business Ideas
  const getBusinessIdeas = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'businessIdeas',
        () => youthServices.getBusinessIdeas(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  const createBusinessIdea = useCallback(
    async (ideaData) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.createBusinessIdea(currentUser.uid, ideaData);

        if (result.success) {
          // Clear cache for business ideas
          cache.current.businessIdeas = null;

          // Refresh profile to update stats
          await fetchYouthProfile();
        }

        return result;
      } catch (err) {
        console.error('Error creating business idea:', err);
        throw err;
      }
    },
    [currentUser?.uid, fetchYouthProfile]
  );

  const updateBusinessIdea = useCallback(
    async (ideaId, updates) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.updateBusinessIdea(currentUser.uid, ideaId, updates);

        if (result.success) {
          // Clear cache for business ideas
          cache.current.businessIdeas = null;
        }

        return result;
      } catch (err) {
        console.error('Error updating business idea:', err);
        throw err;
      }
    },
    [currentUser?.uid]
  );

  const deleteBusinessIdea = useCallback(
    async (ideaId) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.deleteBusinessIdea(currentUser.uid, ideaId);

        if (result.success) {
          // Clear cache for business ideas
          cache.current.businessIdeas = null;

          // Refresh profile to update stats
          await fetchYouthProfile();
        }

        return result;
      } catch (err) {
        console.error('Error deleting business idea:', err);
        throw err;
      }
    },
    [currentUser?.uid, fetchYouthProfile]
  );

  // Funding Applications
  const getFundingApplications = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'fundingApplications',
        () => youthServices.getFundingApplications(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  const createFundingApplication = useCallback(
    async (applicationData) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.createFundingApplication(
          currentUser.uid,
          applicationData
        );

        if (result.success) {
          // Clear cache for funding applications
          cache.current.fundingApplications = null;

          // Refresh profile to update stats
          await fetchYouthProfile();
        }

        return result;
      } catch (err) {
        console.error('Error creating funding application:', err);
        throw err;
      }
    },
    [currentUser?.uid, fetchYouthProfile]
  );

  // Mentorship
  const getMentorshipConnections = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'mentorshipConnections',
        () => youthServices.getMentorshipConnections(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  const requestMentorship = useCallback(
    async (mentorId, requestData) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.requestMentorship(currentUser.uid, mentorId, {
          ...requestData,
          youthName: youthProfile?.fullName || currentUser.displayName,
        });

        if (result.success) {
          // Clear cache for mentorship connections
          cache.current.mentorshipConnections = null;

          // Refresh profile to update stats
          await fetchYouthProfile();
        }

        return result;
      } catch (err) {
        console.error('Error requesting mentorship:', err);
        throw err;
      }
    },
    [currentUser?.uid, youthProfile, fetchYouthProfile]
  );

  // Training
  const getCompletedTrainings = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'completedTrainings',
        () => youthServices.getCompletedTrainings(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  const enrollInTraining = useCallback(
    async (trainingId, trainingData) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.enrollInTraining(
          currentUser.uid,
          trainingId,
          trainingData
        );

        if (result.success) {
          // Clear cache for completed trainings
          cache.current.completedTrainings = null;
        }

        return result;
      } catch (err) {
        console.error('Error enrolling in training:', err);
        throw err;
      }
    },
    [currentUser?.uid]
  );

  // Achievements
  const getAchievements = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'achievements',
        () => youthServices.getAchievements(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  // Network
  const getNetworkConnections = useCallback(
    async (forceRefresh = false) => {
      return fetchWithCache(
        'networkConnections',
        () => youthServices.getNetworkConnections(currentUser.uid),
        forceRefresh
      );
    },
    [currentUser?.uid, fetchWithCache]
  );

  const connectWithUser = useCallback(
    async (targetUserId, targetUserType) => {
      if (!currentUser?.uid) throw new Error('No user authenticated');

      try {
        const result = await youthServices.connectWithUser(
          currentUser.uid,
          targetUserId,
          targetUserType
        );

        if (result.success) {
          // Clear cache for network connections
          cache.current.networkConnections = null;

          // Refresh profile to update stats
          await fetchYouthProfile();
        }

        return result;
      } catch (err) {
        console.error('Error connecting with user:', err);
        throw err;
      }
    },
    [currentUser?.uid, fetchYouthProfile]
  );

  // Activities
  const getRecentActivities = useCallback(
    async (limitCount = 20, forceRefresh = false) => {
      if (!currentUser?.uid) return [];

      // Don't cache activities with different limits
      if (
        !forceRefresh &&
        cache.current.recentActivities &&
        cache.current.recentActivities.length <= limitCount
      ) {
        return cache.current.recentActivities;
      }

      try {
        const result = await youthServices.getRecentActivities(currentUser.uid, limitCount);
        const data = result.success ? result.data : [];

        cache.current.recentActivities = data;

        return data;
      } catch (err) {
        console.error('Error getting recent activities:', err);
        return [];
      }
    },
    [currentUser?.uid]
  );

  // Dashboard Stats
  const getDashboardStats = useCallback(
    async (forceRefresh = false) => {
      if (!currentUser?.uid) return null;

      if (!forceRefresh && cache.current.dashboardStats) {
        return cache.current.dashboardStats;
      }

      try {
        const result = await youthServices.getDashboardStats(currentUser.uid);
        const data = result.success ? result.data : null;

        cache.current.dashboardStats = data;

        return data;
      } catch (err) {
        console.error('Error getting dashboard stats:', err);
        return null;
      }
    },
    [currentUser?.uid]
  );

  // Search functions
  const searchFundingOpportunities = useCallback(async (filters) => {
    try {
      return await youthServices.searchFundingOpportunities(filters);
    } catch (err) {
      console.error('Error searching funding opportunities:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const searchMentors = useCallback(async (filters) => {
    try {
      return await youthServices.searchMentors(filters);
    } catch (err) {
      console.error('Error searching mentors:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const initialize = async () => {
      if (!mounted) return;

      // Only fetch if user is actually a youth
      if (isUserYouth()) {
        console.log('🚀 Initializing YouthContext for youth user...');
        await fetchYouthProfile();
      } else {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Add a small delay to prevent race conditions
    timeoutId = setTimeout(initialize, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchYouthProfile, isUserYouth]);

  // Listen for auth changes
  useEffect(() => {
    if (currentUser && initialized && isUserYouth()) {
      console.log('👤 Auth changed, refreshing youth data...');
      fetchYouthProfile(true); // Force refresh on auth change
    } else if (!currentUser && initialized) {
      console.log('👤 User logged out, clearing youth data');
      setYouthProfile(null);
      setError(null);
      clearCache();
    }
  }, [currentUser, fetchYouthProfile, initialized, isUserYouth, clearCache]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // Profile
      youthProfile,
      loading: loading || !initialized,
      initialized,
      error,
      refreshYouthProfile: () => fetchYouthProfile(true),
      clearError: () => setError(null),
      isYouth: isUserYouth(),
      clearCache,

      // Profile management
      updateYouthProfile,
      uploadProfilePhoto,

      // Business Ideas
      getBusinessIdeas,
      createBusinessIdea,
      updateBusinessIdea,
      deleteBusinessIdea,

      // Funding
      getFundingApplications,
      createFundingApplication,

      // Mentorship
      getMentorshipConnections,
      requestMentorship,

      // Training
      getCompletedTrainings,
      enrollInTraining,

      // Achievements
      getAchievements,

      // Network
      getNetworkConnections,
      connectWithUser,

      // Activities
      getRecentActivities,

      // Stats
      getDashboardStats,

      // Search
      searchFundingOpportunities,
      searchMentors,
    }),
    [
      youthProfile,
      loading,
      initialized,
      error,
      isUserYouth,
      fetchYouthProfile,
      updateYouthProfile,
      uploadProfilePhoto,
      getBusinessIdeas,
      createBusinessIdea,
      updateBusinessIdea,
      deleteBusinessIdea,
      getFundingApplications,
      createFundingApplication,
      getMentorshipConnections,
      requestMentorship,
      getCompletedTrainings,
      enrollInTraining,
      getAchievements,
      getNetworkConnections,
      connectWithUser,
      getRecentActivities,
      getDashboardStats,
      searchFundingOpportunities,
      searchMentors,
      clearCache,
    ]
  );

  return <YouthContext.Provider value={value}>{children}</YouthContext.Provider>;
};

// Default export for backward compatibility
export default YouthContext;
