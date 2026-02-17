import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // User type constants - SIMPLIFIED
  const USER_TYPES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    COMPANY: 'company',
    ENTREPRENEUR: 'entrepreneur',
    INSTITUTE: 'institute'
  };

  // Admin email from environment
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'baffkay20@gmail.com';

  // Clear errors
  const clearError = () => setError(null);

  // Check if user is admin based on email
  const isAdminEmail = (email) => {
    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };


// In your AuthContext, add this helper function

  
  // Create user profile in Firestore - SIMPLIFIED
  const createUserProfile = useCallback(async (user, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if this is an admin user
      const isAdminUser = isAdminEmail(user.email);
      
      if (isAdminUser) {
        console.log('👑 ADMIN USER DETECTED:', user.email);
        
        // Create admin profile
        const adminProfile = {
          uid: user.uid,
          email: user.email.toLowerCase(),
          displayName: 'System Administrator',
          userType: USER_TYPES.ADMIN,
          role: 'admin',
          isAdmin: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          profileCompletion: 100,
          emailVerified: user.emailVerified || true,
          photoURL: user.photoURL || '',
          status: 'active'
        };
        
        await setDoc(userRef, adminProfile, { merge: true });
        console.log('✅ Admin profile created');
        return { success: true, data: adminProfile };
      }

      // For regular users
      let userType = additionalData.userType || USER_TYPES.STUDENT;
      
      const userProfile = {
        uid: user.uid,
        email: user.email.toLowerCase(),
        displayName: additionalData.fullName || user.displayName || user.email.split('@')[0],
        userType: userType,
        role: userType,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        profileCompletion: 30,
        emailVerified: user.emailVerified || false,
        photoURL: user.photoURL || '',
        isGoogleAuth: additionalData.isGoogleAuth || false,
        status: 'active'
      };

      // Add type-specific fields
      if (userType === USER_TYPES.COMPANY) {
        userProfile.companyName = additionalData.companyName || '';
        userProfile.industry = additionalData.industry || '';
        userProfile.status = 'pending';
      } else if (userType === USER_TYPES.INSTITUTE) {
        userProfile.institutionName = additionalData.institutionName || '';
        userProfile.institutionType = additionalData.institutionType || 'university';
        userProfile.status = 'pending';
      }

      console.log('🎯 Creating user profile:', user.email, 'Type:', userType);
      await setDoc(userRef, userProfile, { merge: true });
      
      console.log('✅ Profile created successfully');
      return { success: true, data: userProfile };
      
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get user profile from Firestore
  const getUserProfile = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return { success: true, data };
      }
      return { success: false, error: 'Profile not found' };
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Email/Password Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      clearError();

      console.log('🔐 Attempting login for:', credentials.email);
      
      const { user } = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      console.log('✅ Firebase auth successful for:', user.email);

      // Check if profile exists
      const profileResult = await getUserProfile(user.uid);
      
      if (profileResult.success) {
        // Check if admin user has correct profile
        const isAdminUser = isAdminEmail(user.email);
        const profileData = profileResult.data;
        
        if (isAdminUser && !profileData.isAdmin) {
          console.log('⚠️ Admin email but non-admin profile. Fixing...');
          // Update to admin profile
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            userType: USER_TYPES.ADMIN,
            isAdmin: true,
            role: 'admin',
            displayName: 'System Administrator',
            updatedAt: new Date().toISOString()
          });
          
          // Re-fetch profile
          const updatedResult = await getUserProfile(user.uid);
          if (updatedResult.success) {
            profileResult.data = updatedResult.data;
          }
        }
        
        setUserProfile(profileResult.data);
        return { 
          success: true, 
          user, 
          profile: profileResult.data,
          userType: profileResult.data.userType,
          isAdmin: profileResult.data.isAdmin || false
        };
      } else {
        // Profile doesn't exist, create one
        console.log('🆕 No profile found, creating new profile');
        
        const isAdminUser = isAdminEmail(user.email);
        const userType = isAdminUser ? USER_TYPES.ADMIN : USER_TYPES.STUDENT;
        
        const createResult = await createUserProfile(user, {
          fullName: user.displayName || user.email.split('@')[0],
          userType: userType,
          emailVerified: user.emailVerified || false,
          isGoogleAuth: false
        });

        if (!createResult.success) {
          throw new Error('Failed to create user profile');
        }

        setUserProfile(createResult.data);
        return { 
          success: true, 
          user, 
          profile: createResult.data,
          userType: createResult.data.userType,
          isAdmin: createResult.data.isAdmin || false
        };
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Try again later.';
          break;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('✅ Google auth successful for:', user.email);

      // Check if profile exists
      const profileResult = await getUserProfile(user.uid);
      
      if (profileResult.success) {
        // Existing user
        setUserProfile(profileResult.data);
        return { 
          success: true, 
          user, 
          profile: profileResult.data,
          userType: profileResult.data.userType,
          isAdmin: profileResult.data.isAdmin || false
        };
      } else {
        // New Google user - create profile
        const createResult = await createUserProfile(user, {
          fullName: user.displayName || user.email.split('@')[0],
          userType: USER_TYPES.STUDENT,
          isGoogleAuth: true,
          emailVerified: user.emailVerified || true
        });

        if (!createResult.success) {
          throw new Error('Failed to create user profile');
        }

        setUserProfile(createResult.data);
        return { 
          success: true, 
          user, 
          profile: createResult.data,
          userType: createResult.data.userType,
          isAdmin: createResult.data.isAdmin || false
        };
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);
      const errorMessage = error.code === 'auth/popup-closed-by-user' 
        ? 'Google sign-in was cancelled.' 
        : error.message || 'Google sign-in failed.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Registration
  const register = async (userData) => {
    try {
      setLoading(true);
      clearError();

      console.log('👤 Registering user:', userData.email);
      
      // Prevent admin registration
      if (isAdminEmail(userData.email)) {
        throw new Error('Admin registration is not allowed.');
      }
      
      const { user } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      console.log('✅ Firebase user created');

      if (userData.fullName) {
        await updateProfile(user, { displayName: userData.fullName });
      }

      await sendEmailVerification(user);

      const createResult = await createUserProfile(user, {
        fullName: userData.fullName || user.email.split('@')[0],
        userType: userData.userType,
        emailVerified: false,
        isGoogleAuth: false,
        ...userData
      });

      if (!createResult.success) {
        throw new Error('Failed to create user profile');
      }

      setUserProfile(createResult.data);
      return { 
        success: true, 
        user, 
        profile: createResult.data,
        userType: createResult.data.userType,
        isAdmin: createResult.data.isAdmin || false
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      let errorMessage = 'Registration failed.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please login.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      clearError();
      return { success: true };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setError('Logout failed.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get dashboard path
  const getDashboardPath = () => {
    if (!userProfile) return '/login';
    
    console.log('📍 Dashboard for:', userProfile.userType, 'isAdmin:', userProfile.isAdmin);
    
    // Check admin first
    if (userProfile.isAdmin || userProfile.userType === USER_TYPES.ADMIN) {
      return '/admin/dashboard';
    }
    
    // Regular users
    switch (userProfile.userType) {
      case USER_TYPES.STUDENT: return '/student/dashboard';
      case USER_TYPES.COMPANY: return '/company/dashboard';
      case USER_TYPES.INSTITUTE: return '/institute/dashboard';
      case USER_TYPES.ENTREPRENEUR: return '/entrepreneur/dashboard';
      default: return '/student/dashboard';
    }
  };

  // Check if current user is admin
  const isAdmin = () => {
    return userProfile?.isAdmin === true || userProfile?.userType === USER_TYPES.ADMIN;
  };

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing AuthProvider...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Auth state changed:', user?.email);
      
      try {
        if (user) {
          setCurrentUser(user);
          
          const profileResult = await getUserProfile(user.uid);
          
          if (profileResult.success) {
            setUserProfile(profileResult.data);
          } else {
            // Create profile if it doesn't exist
            const isAdminUser = isAdminEmail(user.email);
            const userType = isAdminUser ? USER_TYPES.ADMIN : USER_TYPES.STUDENT;
            
            const createResult = await createUserProfile(user, {
              userType: userType
            });
            
            if (createResult.success) {
              setUserProfile(createResult.data);
            } else {
              setUserProfile(null);
            }
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('❌ Auth state error:', error);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
        setIsInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  // Show loading during initial app load
  if (isInitializing) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Initializing Career Connect...</p>
        </div>
      </div>
    );
  }

  const value = {
    currentUser,
    userProfile,
    loading: loading || isInitializing,
    isAuthenticated: !!currentUser,
    isAdmin: isAdmin(),
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    clearError,
    getDashboardPath,
    USER_TYPES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;