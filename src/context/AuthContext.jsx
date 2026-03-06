import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const USER_TYPES = {
    ADMIN: 'admin',
    STUDENT: 'student',
    COMPANY: 'company',
  };

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'baffkay20@gmail.com';

  const clearError = () => setError(null);

  const isAdminEmail = (email) => {
    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('one special character (!@#$%^&*)');

    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.max(0, 10 - errors.length * 2),
    };
  };

  const checkEmailExists = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Create company-specific collection document
  const createCompanyProfile = async (userId, companyData) => {
    try {
      const companyRef = doc(db, 'companies', userId);
      const companySnap = await getDoc(companyRef);

      if (!companySnap.exists()) {
        const companyProfile = {
          uid: userId,
          companyName: companyData.companyName || '',
          industry: companyData.industry || '',
          companySize: companyData.companySize || '',
          website: companyData.website || '',
          phone: companyData.phone || '',
          email: companyData.email || '',
          description: '',
          logo: '',
          verified: false,
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          jobsPosted: 0,
          totalHires: 0,
          followers: 0,
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: '',
          },
        };

        await setDoc(companyRef, companyProfile);
        console.log('✅ Company profile created for:', userId);
        return { success: true, data: companyProfile };
      }

      return { success: true, data: companySnap.data() };
    } catch (error) {
      console.error('❌ Error creating company profile:', error);
      return { success: false, error: error.message };
    }
  };

  // Create student-specific collection document
  const createStudentProfile = async (userId, studentData) => {
    try {
      const studentRef = doc(db, 'students', userId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        const studentProfile = {
          uid: userId,
          fullName: studentData.fullName || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          dateOfBirth: null,
          address: '',
          qualifications: {
            educationLevel: 'Not specified',
            overallGrade: 'Not specified',
            subjects: [],
            certificates: [],
          },
          jobPreferences: {
            industries: [],
            jobTypes: [],
            locations: [],
            minSalary: null,
          },
          skills: [],
          experience: 0,
          resumeUrl: '',
          profilePhoto: '',
          status: 'active',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(studentRef, studentProfile);
        console.log('✅ Student profile created for:', userId);
        return { success: true, data: studentProfile };
      }

      return { success: true, data: studentSnap.data() };
    } catch (error) {
      console.error('❌ Error creating student profile:', error);
      return { success: false, error: error.message };
    }
  };

  const createUserProfile = useCallback(async (user, additionalData = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { success: true, data: userSnap.data() };
      }

      const isAdminUser = isAdminEmail(user.email);

      if (isAdminUser) {
        console.log('👑 ADMIN USER DETECTED:', user.email);

        const adminProfile = {
          uid: user.uid,
          email: user.email.toLowerCase(),
          displayName: 'System Administrator',
          userType: USER_TYPES.ADMIN,
          role: 'admin',
          isAdmin: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isActive: true,
          profileCompletion: 100,
          emailVerified: user.emailVerified || true,
          photoURL: user.photoURL || '',
          status: 'active',
        };

        await setDoc(userRef, adminProfile);
        return { success: true, data: adminProfile };
      }

      const userType = additionalData.userType || USER_TYPES.STUDENT;

      // Base user profile data
      const userProfileData = {
        uid: user.uid,
        email: user.email.toLowerCase(),
        displayName: additionalData.fullName || user.displayName || user.email.split('@')[0],
        firstName: additionalData.firstName || additionalData.fullName?.split(' ')[0] || '',
        lastName:
          additionalData.lastName || additionalData.fullName?.split(' ').slice(1).join(' ') || '',
        userType: userType,
        role: userType,
        isAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        profileCompletion: userType === USER_TYPES.COMPANY ? 20 : 30,
        emailVerified: user.emailVerified || false,
        photoURL: user.photoURL || '',
        isGoogleAuth: additionalData.isGoogleAuth || false,
        status: 'active',
      };

      // Add company-specific fields to user profile
      if (userType === USER_TYPES.COMPANY) {
        userProfileData.companyName = additionalData.companyName || '';
        userProfileData.industry = additionalData.industry || '';
        userProfileData.companySize = additionalData.companySize || '';
        userProfileData.website = additionalData.website || '';
        userProfileData.phone = additionalData.phone || '';
        userProfileData.verified = false;
        userProfileData.status = 'pending_verification';
      }

      // Save to users collection
      await setDoc(userRef, userProfileData);

      // Create type-specific profile
      if (userType === USER_TYPES.COMPANY) {
        await createCompanyProfile(user.uid, {
          ...additionalData,
          email: user.email,
        });
      } else if (userType === USER_TYPES.STUDENT) {
        await createStudentProfile(user.uid, {
          ...additionalData,
          email: user.email,
        });
      }

      return { success: true, data: userProfileData };
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const getUserProfile = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // If company, also fetch company profile
        if (userData.userType === USER_TYPES.COMPANY) {
          try {
            const companyRef = doc(db, 'companies', userId);
            const companySnap = await getDoc(companyRef);
            if (companySnap.exists()) {
              userData.companyProfile = companySnap.data();
            }
          } catch (err) {
            console.warn('Could not fetch company profile:', err);
          }
        }

        // If student, also fetch student profile
        if (userData.userType === USER_TYPES.STUDENT) {
          try {
            const studentRef = doc(db, 'students', userId);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              userData.studentProfile = studentSnap.data();
            }
          } catch (err) {
            console.warn('Could not fetch student profile:', err);
          }
        }

        return { success: true, data: userData };
      }
      return { success: false, error: 'Profile not found' };
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      setEmailVerificationSent(true);
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  };

  const isEmailVerified = () => {
    return currentUser?.emailVerified || false;
  };

  // FIXED: Google Sign-In with proper user type handling
  const loginWithGoogle = async (userTypeData) => {
    try {
      setLoading(true);
      clearError();

      // Handle both direct string and object input
      const selectedUserType =
        typeof userTypeData === 'string'
          ? userTypeData
          : userTypeData?.userType || USER_TYPES.STUDENT;

      const additionalData = typeof userTypeData === 'object' ? userTypeData : {};

      console.log('🔐 Starting Google sign-in with type:', selectedUserType);

      if (!googleProvider) {
        throw new Error('Google Auth provider not configured');
      }

      // Validate that we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Google sign-in is only available in browser environment');
      }

      // Check if popups are blocked
      const popup = window.open('about:blank', '_blank');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('popup-blocked');
      }
      popup.close();

      // Sign in with popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error('No user returned from Google sign-in');
      }

      console.log('✅ Google sign-in successful for:', user.email);

      // Get additional info from result
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log('🔑 Got access token:', !!token);

      // Check if profile exists
      const profileResult = await getUserProfile(user.uid);

      if (profileResult.success) {
        // Update last login
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
        });

        setUserProfile(profileResult.data);

        return {
          success: true,
          user,
          profile: profileResult.data,
          userType: profileResult.data.userType,
          isAdmin: profileResult.data.isAdmin || false,
        };
      } else {
        // New Google user - create profile with selected type
        const isAdminUser = isAdminEmail(user.email);
        const userType = isAdminUser ? USER_TYPES.ADMIN : selectedUserType;

        console.log('📝 Creating new profile for user type:', userType);

        // Prepare additional data for profile creation
        const profileData = {
          fullName: user.displayName || user.email.split('@')[0],
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          userType: userType,
          isGoogleAuth: true,
          emailVerified: user.emailVerified,
          ...additionalData, // Include any additional data passed (like company info)
        };

        const createResult = await createUserProfile(user, profileData);

        if (!createResult.success) {
          throw new Error('Failed to create user profile');
        }

        setUserProfile(createResult.data);

        return {
          success: true,
          user,
          profile: createResult.data,
          userType: createResult.data.userType,
          isAdmin: createResult.data.isAdmin || false,
        };
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);

      let errorMessage = 'Google sign-in failed.';

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Google sign-in was cancelled.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups for this site.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Another sign-in request is in progress.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage =
            'This domain is not authorized for Google sign-in. Please add it to your Firebase console.';
          console.error('❌ Unauthorized domain. Current domain:', window.location.hostname);
          console.error(
            '✅ Add this domain to Firebase Console > Authentication > Sign-in methods > Authorized domains'
          );
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled. Please enable it in the Firebase Console.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage =
            'An account already exists with the same email address but different sign-in credentials. Please sign in with email/password instead.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credential. Please try again.';
          break;
        case 'auth/argument-error':
          errorMessage = 'Google sign-in configuration error. Please check your Firebase setup.';
          console.error('❌ Argument error details:', {
            hasProvider: !!googleProvider,
            hasAuth: !!auth,
            currentDomain: window.location.hostname,
          });
          break;
        case 'auth/internal-error':
          errorMessage = 'Internal error during Google sign-in. Please try again.';
          break;
        default:
          if (error.message === 'popup-blocked') {
            errorMessage = 'Popup blocked. Please allow popups for this site.';
          } else {
            errorMessage = error.message || 'Google sign-in failed. Please try again.';
          }
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      clearError();

      if (!validateEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      console.log('🔐 Attempting login for:', credentials.email);

      const { user } = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      if (!user.emailVerified && !isAdminEmail(user.email)) {
        await sendVerificationEmail(user);
        await signOut(auth);
        throw new Error(
          'Please verify your email before logging in. A new verification email has been sent.'
        );
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
      });

      const profileResult = await getUserProfile(user.uid);

      if (profileResult.success) {
        setUserProfile(profileResult.data);
        return {
          success: true,
          user,
          profile: profileResult.data,
          userType: profileResult.data.userType,
          isAdmin: profileResult.data.isAdmin || false,
        };
      } else {
        const isAdminUser = isAdminEmail(user.email);
        const userType = isAdminUser ? USER_TYPES.ADMIN : USER_TYPES.STUDENT;

        const createResult = await createUserProfile(user, {
          fullName: user.displayName || user.email.split('@')[0],
          userType: userType,
          emailVerified: user.emailVerified,
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
          isAdmin: createResult.data.isAdmin || false,
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
          errorMessage = 'Too many failed attempts. Account temporarily locked. Try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Contact support.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Email/Password Registration with proper user type handling
  const register = async (userData) => {
    try {
      setLoading(true);
      clearError();
      setEmailVerificationSent(false);

      // Validate email
      if (!validateEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if email already exists
      const emailExists = await checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error('An account with this email already exists. Please login instead.');
      }

      // Validate password
      const passwordValidation = validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password must contain: ${passwordValidation.errors.join(', ')}`);
      }

      // Prevent admin registration through regular signup
      if (isAdminEmail(userData.email)) {
        throw new Error('Admin accounts cannot be created through registration.');
      }

      console.log('👤 Registering user:', userData.email, 'as', userData.userType);

      // Create Firebase auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update profile with display name
      if (userData.fullName) {
        await updateProfile(user, { displayName: userData.fullName });
      }

      // Send verification email
      await sendVerificationEmail(user);

      // Prepare additional data for profile creation
      const profileData = {
        fullName: userData.fullName,
        firstName: userData.fullName?.split(' ')[0] || '',
        lastName: userData.fullName?.split(' ').slice(1).join(' ') || '',
        userType: userData.userType,
        emailVerified: false,
        isGoogleAuth: false,
      };

      // Add company-specific data if applicable
      if (userData.userType === USER_TYPES.COMPANY) {
        profileData.companyName = userData.companyName;
        profileData.industry = userData.industry;
        profileData.companySize = userData.companySize;
        profileData.website = userData.website;
        profileData.phone = userData.phone;
      }

      // Create user profile and type-specific collection
      const createResult = await createUserProfile(user, profileData);

      if (!createResult.success) {
        throw new Error('Failed to create user profile');
      }

      // Sign out user after registration (they need to verify email first)
      await signOut(auth);

      return {
        success: true,
        message: `Registration successful! Please check your email to verify your ${userData.userType} account.`,
        emailVerificationSent: true,
        userType: userData.userType,
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);

      let errorMessage = 'Registration failed.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please login.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign-up is not enabled. Please contact support.';
      } else {
        errorMessage = error.message || 'Registration failed. Please try again.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      return await sendVerificationEmail(currentUser);
    }
    return { success: false, error: 'No user or email already verified' };
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });

      return { success: true, message: 'Password reset email sent. Check your inbox.' };
    } catch (error) {
      console.error('Password reset error:', error);

      let errorMessage = 'Failed to send password reset email.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setEmailVerificationSent(false);
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

  // Get dashboard path based on user type
  const getDashboardPath = () => {
    if (!userProfile) return '/login';

    if (userProfile.isAdmin || userProfile.userType === USER_TYPES.ADMIN) {
      return '/admin/dashboard';
    }

    switch (userProfile.userType) {
      case USER_TYPES.STUDENT:
        return '/student/dashboard';
      case USER_TYPES.COMPANY:
        return '/company/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  // Get user type display name
  const getUserTypeDisplay = () => {
    if (!userProfile) return '';

    if (userProfile.userType === USER_TYPES.COMPANY) {
      return userProfile.companyName || 'Company';
    }

    return userProfile.displayName || 'User';
  };

  // Check if email needs verification
  const needsEmailVerification = () => {
    return currentUser && !currentUser.emailVerified && !isAdminEmail(currentUser?.email);
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
            const isAdminUser = isAdminEmail(user.email);
            const userType = isAdminUser ? USER_TYPES.ADMIN : USER_TYPES.STUDENT;

            const createResult = await createUserProfile(user, {
              userType: userType,
              emailVerified: user.emailVerified,
            });

            if (createResult.success) {
              setUserProfile(createResult.data);
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
    isAdmin: userProfile?.isAdmin || userProfile?.userType === USER_TYPES.ADMIN,
    isStudent: userProfile?.userType === USER_TYPES.STUDENT,
    isCompany: userProfile?.userType === USER_TYPES.COMPANY,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    clearError,
    getDashboardPath,
    getUserTypeDisplay,
    USER_TYPES,
    isEmailVerified,
    needsEmailVerification,
    resendVerificationEmail,
    resetPassword,
    emailVerificationSent,
    validatePassword,
    validateEmail,
    checkEmailExists,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
