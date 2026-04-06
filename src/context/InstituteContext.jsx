import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const InstituteContext = createContext();

export const useInstitute = () => {
  const context = useContext(InstituteContext);
  if (!context) {
    throw new Error('useInstitute must be used within an InstituteProvider');
  }
  return context;
};

export const InstituteProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [instituteData, setInstituteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to determine if user is an institute
  const isUserInstitute = useCallback(() => {
    if (!userData) return false;

    const userType = userData.userType || userData.role || userData.type;
    return userType === 'institute' || userType === 'Institute';
  }, [userData]);

  // Fetch institute data
  const fetchInstituteData = useCallback(async () => {
    if (!currentUser || !isUserInstitute()) {
      setInstituteData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Basic institute profile - you can expand this with actual API calls
      const instituteProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        instituteName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Institute',
        userType: 'institute',
        profileCompletion: 30,
        type: 'Educational Institution',
        category: 'Not specified',
        location: 'Not specified',
        website: '',
        description: '',
        accreditation: '',
        programs: [],
      };

      setInstituteData(instituteProfile);
    } catch (err) {
      console.error('Error fetching institute data:', err);
      setError(err.message);
      setInstituteData(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isUserInstitute]);

  // Update institute data
  const updateInstitute = async (updates) => {
    if (!instituteData?.id) {
      throw new Error('No institute data available');
    }

    try {
      // Update local state
      setInstituteData((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
      return true;
    } catch (err) {
      console.error('Error updating institute:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInstituteData();
  }, [fetchInstituteData]);

  // Value to provide
  const value = {
    instituteData,
    loading,
    error,
    updateInstitute,
    refreshData: fetchInstituteData,
    clearError: () => setError(null),
  };

  return <InstituteContext.Provider value={value}>{children}</InstituteContext.Provider>;
};