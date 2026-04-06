import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const EntrepreneurContext = createContext();

export const useEntrepreneur = () => {
  const context = useContext(EntrepreneurContext);
  if (!context) {
    throw new Error('useEntrepreneur must be used within an EntrepreneurProvider');
  }
  return context;
};

export const EntrepreneurProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [entrepreneurData, setEntrepreneurData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to determine if user is an entrepreneur
  const isUserEntrepreneur = useCallback(() => {
    if (!userData) return false;

    const userType = userData.userType || userData.role || userData.type;
    return userType === 'entrepreneur' || userType === 'Entrepreneur';
  }, [userData]);

  // Fetch entrepreneur data
  const fetchEntrepreneurData = useCallback(async () => {
    if (!currentUser || !isUserEntrepreneur()) {
      setEntrepreneurData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Basic entrepreneur profile - you can expand this with actual API calls
      const entrepreneurProfile = {
        id: currentUser.uid,
        email: currentUser.email || '',
        entrepreneurName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Entrepreneur',
        userType: 'entrepreneur',
        profileCompletion: 30,
        businessName: '',
        industry: 'Not specified',
        stage: 'Not specified',
        location: 'Not specified',
        website: '',
        description: '',
        funding: 'Not specified',
        teamSize: 'Not specified',
      };

      setEntrepreneurData(entrepreneurProfile);
    } catch (err) {
      console.error('Error fetching entrepreneur data:', err);
      setError(err.message);
      setEntrepreneurData(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isUserEntrepreneur]);

  // Update entrepreneur data
  const updateEntrepreneur = async (updates) => {
    if (!entrepreneurData?.id) {
      throw new Error('No entrepreneur data available');
    }

    try {
      // Update local state
      setEntrepreneurData((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
      return true;
    } catch (err) {
      console.error('Error updating entrepreneur:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEntrepreneurData();
  }, [fetchEntrepreneurData]);

  // Value to provide
  const value = {
    entrepreneurData,
    loading,
    error,
    updateEntrepreneur,
    refreshData: fetchEntrepreneurData,
    clearError: () => setError(null),
  };

  return <EntrepreneurContext.Provider value={value}>{children}</EntrepreneurContext.Provider>;
};