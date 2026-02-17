/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  doc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { 
  getStudentProfile,
  updateStudentProfile as updateProfile,
  getStudentApplications,
  getStudentDocuments,
  uploadDocument,
  deleteDocument,
  getJobs,
  getRecommendedJobs,
  getDashboardStats
} from '../services/studentServices';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const { currentUser, userData } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper to determine if user is a student
  const isUserStudent = useCallback(() => {
    if (!userData) return false;
    
    // Check multiple possible userType fields
    const userType = userData.userType || userData.role || userData.type;
    
    // If no userType is set, we need to check if this is a student based on email or other criteria
    if (!userType) {
      console.log('⚠️ No userType found in userData:', userData);
      
      // Check if this might be a student based on common patterns
      const email = userData.email || currentUser?.email || '';
      const displayName = userData.displayName || '';
      
      // If it has student-like email or no company/institution indicators, treat as student
      const isLikelyStudent = !email.includes('@company.') && 
                              !email.includes('@corp.') && 
                              !displayName.includes('Inc') &&
                              !displayName.includes('Ltd') &&
                              !displayName.includes('Company');
      
      return isLikelyStudent;
    }
    
    return userType === 'student' || userType === 'Student';
  }, [userData, currentUser]);

  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    console.log('🔄 fetchStudentData called:', {
      hasCurrentUser: !!currentUser,
      userData: userData ? {
        email: userData.email,
        userType: userData.userType,
        role: userData.role,
        type: userData.type
      } : null,
      studentId: currentUser?.uid
    });

    if (!currentUser) {
      console.log('❌ No currentUser, skipping fetch');
      setStudentData(null);
      setLoading(false);
      setInitialized(true);
      return { success: false, error: 'No authenticated user' };
    }

    // Check if user is a student (with relaxed checking)
    if (!isUserStudent()) {
      console.log('⚠️ User may not be a student:', {
        userType: userData?.userType,
        role: userData?.role,
        type: userData?.type,
        email: userData?.email
      });
      
      // Still try to fetch student data - maybe the userType hasn't been set yet
      console.log('🔄 Trying to fetch student data anyway...');
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching student profile for:', currentUser.uid);
      const result = await getStudentProfile(currentUser.uid);
      
      if (result.success) {
        console.log('✅ Student profile fetched successfully:', result.data);
        const studentDataWithId = {
          id: currentUser.uid,
          ...result.data
        };
        setStudentData(studentDataWithId);
        setInitialized(true);
        return { success: true, data: studentDataWithId };
      } else {
        console.error('❌ Failed to fetch student profile:', result.error);
        
        // Check if this is a "profile not found" error
        const isProfileNotFound = result.error?.includes('not found') || 
                                 result.error?.includes('does not exist') ||
                                 result.error?.includes('No student found');
        
        if (isProfileNotFound) {
          console.log('🆕 Student profile not found, creating basic profile...');
          
          // Create a basic student profile
          const basicProfile = {
            id: currentUser.uid,
            email: userData?.email || currentUser.email,
            displayName: userData?.displayName || currentUser.displayName || currentUser.email.split('@')[0],
            userType: 'student',
            role: 'student',
            profileCompletion: 30,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            status: 'active'
          };
          
          try {
            console.log('📝 Creating student document in Firestore...');
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              userType: 'student',
              role: 'student',
              updatedAt: new Date().toISOString(),
              // Also update the userData fields if they're missing
              ...(userData?.userType ? {} : { userType: 'student' }),
              ...(userData?.role ? {} : { role: 'student' })
            }, { merge: true });
            
            console.log('✅ Basic student profile created');
            setStudentData(basicProfile);
            setInitialized(true);
            return { success: true, data: basicProfile };
          } catch (createError) {
            console.error('❌ Failed to create student profile:', createError);
            // Still set basic profile locally
            setStudentData(basicProfile);
            setInitialized(true);
            return { success: true, data: basicProfile };
          }
        }
        
        // Other error
        setError(result.error || 'Failed to load student profile');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('❌ Error fetching student data:', err);
      
      // Create basic profile even on error
      const basicProfile = {
        id: currentUser.uid,
        email: userData?.email || currentUser?.email || '',
        displayName: userData?.displayName || currentUser?.displayName || 'Student',
        userType: 'student',
        role: 'student',
        profileCompletion: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      setStudentData(basicProfile);
      setInitialized(true);
      return { success: true, data: basicProfile };
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [currentUser, userData, isUserStudent]);

  // Update student data
  const updateStudent = async (updates) => {
    if (!studentData?.id) {
      throw new Error('No student data available');
    }

    try {
      console.log('🔄 Updating student data:', updates);
      const result = await updateProfile(studentData.id, updates);
      
      if (result.success) {
        // Update local state
        setStudentData(prev => ({
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString()
        }));
        console.log('✅ Student data updated successfully');
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error updating student:', err);
      throw err;
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file) => {
    if (!studentData?.id || !file) {
      throw new Error('Student ID or file missing');
    }

    try {
      console.log('📤 Uploading profile photo...');
      const result = await uploadDocument(studentData.id, file, 'profile_photo');
      
      if (result.success) {
        console.log('✅ Profile photo uploaded:', result.url);
        await updateStudent({ profilePhoto: result.url });
        return result.url;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error uploading profile photo:', err);
      throw err;
    }
  };

  // Fetch student applications
  const fetchApplications = async (filters = {}) => {
    if (!studentData?.id) {
      console.warn('⚠️ No student ID available for fetching applications');
      return [];
    }

    try {
      console.log('📡 Fetching student applications...');
      const result = await getStudentApplications(studentData.id);
      if (result.success) {
        // Apply filters if any
        let applications = result.data;
        if (filters.status) {
          applications = applications.filter(app => app.status === filters.status);
        }
        console.log(`✅ Fetched ${applications.length} applications`);
        return applications;
      }
      console.log('⚠️ No applications found');
      return [];
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
      return [];
    }
  };

  // Fetch student documents
  const fetchDocuments = async () => {
    if (!studentData?.id) {
      console.warn('⚠️ No student ID available for fetching documents');
      return [];
    }

    try {
      console.log('📡 Fetching student documents...');
      const result = await getStudentDocuments(studentData.id);
      if (result.success) {
        console.log(`✅ Fetched ${result.data.length} documents`);
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('❌ Error fetching documents:', err);
      return [];
    }
  };

  // Upload document
  const uploadStudentDocument = async (file, documentType = 'other') => {
    if (!studentData?.id || !file) {
      throw new Error('Student ID or file missing');
    }

    try {
      console.log(`📤 Uploading ${documentType} document...`);
      const result = await uploadDocument(studentData.id, file, documentType);
      if (result.success) {
        console.log('✅ Document uploaded successfully:', result.id);
        return {
          id: result.id,
          url: result.url,
          name: file.name,
          type: documentType
        };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Error uploading document:', err);
      throw err;
    }
  };

  // Delete document
  const deleteStudentDocument = async (documentId, storagePath) => {
    try {
      console.log(`🗑️ Deleting document: ${documentId}`);
      const result = await deleteDocument(documentId, storagePath);
      if (!result.success) {
        throw new Error(result.error);
      }
      console.log('✅ Document deleted successfully');
      return true;
    } catch (err) {
      console.error('❌ Error deleting document:', err);
      throw err;
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    if (!studentData?.id) {
      console.warn('⚠️ No student ID available for fetching jobs');
      return [];
    }

    try {
      console.log('📡 Fetching jobs...');
      const result = await getJobs(studentData.id);
      if (result.success) {
        console.log(`✅ Fetched ${result.data.length} jobs`);
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      return [];
    }
  };

  // Fetch recommended jobs
  const fetchRecommendedJobs = async () => {
    if (!studentData?.id) {
      console.warn('⚠️ No student ID available for fetching recommended jobs');
      return [];
    }

    try {
      console.log('📡 Fetching recommended jobs...');
      const result = await getRecommendedJobs(studentData.id);
      if (result.success) {
        console.log(`✅ Fetched ${result.data.length} recommended jobs`);
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('❌ Error fetching recommended jobs:', err);
      return [];
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    if (!studentData?.id) {
      console.warn('⚠️ No student ID available for fetching dashboard stats');
      return null;
    }

    try {
      console.log('📡 Fetching dashboard stats...');
      const result = await getDashboardStats(studentData.id);
      if (result.success) {
        console.log('✅ Dashboard stats fetched successfully');
        return result.data;
      }
      return null;
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      if (!mounted) return;
      
      console.log('🚀 Initializing StudentContext...');
      await fetchStudentData();
    };
    
    initialize();
    
    return () => {
      mounted = false;
    };
  }, [fetchStudentData]);

  // Listen for auth changes
  useEffect(() => {
    if (currentUser && initialized) {
      console.log('👤 Auth changed, refreshing student data...');
      fetchStudentData();
    } else if (!currentUser && initialized) {
      console.log('👤 User logged out, clearing student data');
      setStudentData(null);
      setError(null);
    }
  }, [currentUser, fetchStudentData, initialized]);

  // Value to provide
  const value = {
    studentData,
    loading: loading || !initialized,
    initialized,
    error,
    updateStudent,
    uploadProfilePhoto,
    fetchApplications,
    fetchDocuments,
    uploadDocument: uploadStudentDocument,
    deleteDocument: deleteStudentDocument,
    fetchJobs,
    fetchRecommendedJobs,
    fetchDashboardStats,
    refreshData: fetchStudentData,
    clearError: () => setError(null)
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};