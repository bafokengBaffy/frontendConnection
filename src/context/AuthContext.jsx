/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  disableNetwork,
  doc,
  enableNetwork,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { auth, db, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';

// ==================== CONSTANTS ====================
export const USER_TYPES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
  INSTITUTE: 'institute',
  MENTOR: 'mentor',
  YOUTH: 'youth',
  ENTREPRENEUR: 'entrepreneur',
  PARENT: 'parent',
  ALUMNI: 'alumni',
};

// Update this to include all user types
const FIRESTORE_SUPPORTED_USER_TYPES = new Set([
  USER_TYPES.ADMIN,
  USER_TYPES.STUDENT,
  USER_TYPES.COMPANY,
  USER_TYPES.INSTITUTE,
  USER_TYPES.MENTOR,
  USER_TYPES.YOUTH,
  USER_TYPES.ENTREPRENEUR,
  USER_TYPES.PARENT,
  USER_TYPES.ALUMNI,
]);

const inFlightProfileCreations = new Map();

const isPermissionDeniedError = (error) => {
  return (
    error?.code === 'permission-denied' ||
    error?.code === 'firestore/permission-denied' ||
    /insufficient permissions|permission-denied/i.test(error?.message || '')
  );
};

const isProfileMissingError = (error) => {
  return /profile not found/i.test(error || '');
};

const normalizeUserTypeForFirestore = (userType) => {
  return FIRESTORE_SUPPORTED_USER_TYPES.has(userType) ? userType : USER_TYPES.STUDENT;
};

const writeRoleProfileDocument = async (collectionName, userId, profileData, label) => {
  const profileRef = doc(db, collectionName, userId);

  try {
    await setDoc(profileRef, profileData, { merge: true });
    console.log(`✅ ${label} profile created for:`, userId);
    return { success: true, data: profileData };
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      const existingProfileSnap = await getDoc(profileRef).catch(() => null);
      if (existingProfileSnap?.exists()) {
        console.warn(`${label} profile already exists or was created in parallel for:`, userId);
        return { success: true, data: existingProfileSnap.data() };
      }
    }

    console.error(`Error creating ${label.toLowerCase()} profile:`, error);
    return { success: false, error: error.message };
  }
};

const getProfileCollectionForUserType = (userType) => {
  switch (userType) {
    case USER_TYPES.ADMIN:
      return 'admins';
    case USER_TYPES.STUDENT:
      return 'students';
    case USER_TYPES.COMPANY:
      return 'companies';
    case USER_TYPES.INSTITUTE:
      return 'institutes';
    case USER_TYPES.MENTOR:
      return 'mentors';
    case USER_TYPES.YOUTH:
      return 'youth';
    case USER_TYPES.ENTREPRENEUR:
      return 'entrepreneurs';
    case USER_TYPES.PARENT:
      return 'parents';
    case USER_TYPES.ALUMNI:
      return 'alumni';
    default:
      return 'students';
  }
};

export const USER_TYPE_LABELS = {
  [USER_TYPES.ADMIN]: 'Administrator',
  [USER_TYPES.STUDENT]: 'Student / Graduate',
  [USER_TYPES.COMPANY]: 'Company / Employer',
  [USER_TYPES.INSTITUTE]: 'Educational Institute',
  [USER_TYPES.MENTOR]: 'Mentor / Advisor',
  [USER_TYPES.YOUTH]: 'Youth Entrepreneur',
  [USER_TYPES.ENTREPRENEUR]: 'Entrepreneur',
  [USER_TYPES.PARENT]: 'Parent / Guardian',
  [USER_TYPES.ALUMNI]: 'Alumni',
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  VERIFICATION_REQUIRED: 'verification_required',
  PENDING_APPROVAL: 'pending_approval',
};

export const SECURITY_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  verificationCodeExpiry: 10 * 60 * 1000, // 10 minutes
  refreshTokenThreshold: 5 * 60 * 1000, // 5 minutes before expiry
};

export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_IN_USE: 'Email already in use. Please login.',
  WEAK_PASSWORD: 'Password is too weak.',
  USER_NOT_FOUND: 'No account found with this email.',
  WRONG_PASSWORD: 'Incorrect password.',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Account temporarily locked.',
  USER_DISABLED: 'Account disabled. Contact support.',
  VERIFICATION_REQUIRED: 'Please verify your email first.',
  PROFILE_INCOMPLETE: 'Please complete your profile.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
};

export const STORAGE_KEYS = {
  SESSION_DATA: 'career_connect_session',
  USER_PREFERENCES: 'user_preferences',
  AUTH_REDIRECT: 'auth_redirect',
  LAST_ACTIVITY: 'last_activity',
};

// ==================== AUTH CONTEXT ====================
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loginAttempts, setLoginAttempts] = useState({});
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false);

  const sessionTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const activityEvents = useRef(['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']);
  const managedAuthFlowRef = useRef({
    suppressAutoProfileCreation: false,
    requestedUserType: null,
  });

  // Admin emails from env
  const ADMIN_EMAILS = useMemo(
    () =>
      [
        import.meta.env.VITE_ADMIN_EMAIL || 'admin@careerconnect.com',
        import.meta.env.VITE_SUPER_ADMIN_EMAIL,
      ].filter(Boolean),
    []
  );

  // ==================== UTILITY FUNCTIONS ====================
  const clearError = useCallback(() => setError(null), []);

  const isAdminEmail = useCallback(
    (email) => {
      if (!email) return false;
      const normalizedEmail = email.toLowerCase();
      return ADMIN_EMAILS.some(
        (adminEmail) => adminEmail && normalizedEmail === adminEmail.toLowerCase()
      );
    },
    [ADMIN_EMAILS]
  );

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    const errors = [];
    let strength = 0;

    if (password.length >= 8) {
      strength += 2;
    } else {
      errors.push('at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one number');
    }

    if (/[!@#$%^&*()_+.=..{};':".|,.<>.?]/.test(password)) {
      strength += 2;
    } else {
      errors.push('one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: Math.min(10, strength),
      strengthLabel: strength >= 8 ? 'Strong' : strength >= 5 ? 'Medium' : 'Weak',
    };
  }, []);

  const checkEmailExists = useCallback(async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }, []);

  // ==================== RATE LIMITING ====================
  const checkLoginAttempts = useCallback(
    (email) => {
      const normalizedEmail = email.toLowerCase();
      const attempts = loginAttempts[normalizedEmail] || { count: 0, timestamp: Date.now() };

      if (Date.now() - attempts.timestamp > SECURITY_CONFIG.lockoutDuration) {
        setLoginAttempts((prev) => ({
          ...prev,
          [normalizedEmail]: { count: 1, timestamp: Date.now() },
        }));
        return { allowed: true, remaining: SECURITY_CONFIG.maxLoginAttempts - 1 };
      }

      if (attempts.count >= SECURITY_CONFIG.maxLoginAttempts) {
        const waitTime = Math.ceil(
          (SECURITY_CONFIG.lockoutDuration - (Date.now() - attempts.timestamp)) / 60000
        );
        return {
          allowed: false,
          message: `Too many failed attempts. Please try again in ${waitTime} minutes.`,
          waitTime,
        };
      }

      return { allowed: true, remaining: SECURITY_CONFIG.maxLoginAttempts - attempts.count };
    },
    [loginAttempts]
  );

  const recordFailedAttempt = useCallback((email) => {
    const normalizedEmail = email.toLowerCase();
    setLoginAttempts((prev) => {
      const current = prev[normalizedEmail] || { count: 0, timestamp: Date.now() };
      return {
        ...prev,
        [normalizedEmail]: {
          count: current.count + 1,
          timestamp: current.timestamp,
        },
      };
    });
  }, []);

  const resetLoginAttempts = useCallback((email) => {
    const normalizedEmail = email.toLowerCase();
    setLoginAttempts((prev) => {
      const newState = { ...prev };
      delete newState[normalizedEmail];
      return newState;
    });
  }, []);

  // ==================== SESSION MANAGEMENT ====================
  const startSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set warning timer (5 minutes before expiry)
    warningTimerRef.current = setTimeout(
      () => {
        setSessionExpiryWarning(true);
      },
      SECURITY_CONFIG.sessionTimeout - 5 * 60 * 1000
    );

    // Set expiry timer
    sessionTimerRef.current = setTimeout(async () => {
      if (currentUser) {
        console.log('Session timeout - logging out');
        setSessionExpiryWarning(false);
        await logout(true); // silent logout for session expiry
        setError('Your session has expired. Please log in again.');
      }
    }, SECURITY_CONFIG.sessionTimeout);
  }, [currentUser]);

  const resetSessionTimer = useCallback(() => {
    if (currentUser) {
      setSessionExpiryWarning(false);
      startSessionTimer();
      // Update last activity in storage
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }
  }, [currentUser, startSessionTimer]);

  // ==================== ONLINE/OFFLINE DETECTION ====================
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      try {
        await enableNetwork(db);
      } catch (error) {
        console.error('Error enabling network:', error);
      }
    };

    const handleOffline = async () => {
      setIsOffline(true);
      try {
        await disableNetwork(db);
      } catch (error) {
        console.error('Error disabling network:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==================== ACTIVITY LISTENER ====================
  useEffect(() => {
    if (!currentUser) return;

    const handleActivity = () => resetSessionTimer();

    activityEvents.current.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    startSessionTimer();

    return () => {
      activityEvents.current.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [currentUser, resetSessionTimer, startSessionTimer]);

  // ==================== PROFILE CREATION FUNCTIONS ====================
  const createAdminProfile = useCallback(async (userId, userData) => {
    try {
      const adminRef = doc(db, 'admins', userId);
      const adminProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        displayName: userData.displayName || 'Administrator',
        role: userData.role || 'admin',
        permissions: userData.permissions || ['all'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        emailVerified: userData.emailVerified || true,
        photoURL: userData.photoURL || '',
        status: ACCOUNT_STATUS.ACTIVE,
      };

      await setDoc(adminRef, adminProfile);
      return { success: true, data: adminProfile };
    } catch (error) {
      console.error('Error creating admin profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createStudentProfile = useCallback(async (userId, userData) => {
    try {
      const studentRef = doc(db, 'students', userId);
      const studentProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        dateOfBirth: null,
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
        },
        education: {
          level: userData.educationLevel || 'Not specified',
          institution: userData.institution || '',
          fieldOfStudy: userData.fieldOfStudy || '',
          graduationYear: userData.graduationYear || null,
          gpa: null,
        },
        qualifications: {
          educationLevel: userData.educationLevel || 'Not specified',
          overallGrade: userData.overallGrade || '',
          subjects: userData.subjects || [],
          certificates: [],
        },
        jobPreferences: {
          industries: userData.industries || [],
          jobTypes: userData.jobTypes || [],
          locations: userData.locations || [],
          remote: false,
          salaryMin: null,
          salaryMax: null,
          currency: 'USD',
          willingToRelocate: false,
        },
        skills: userData.skills || [],
        experience: userData.experience || 0,
        experienceDetails: [],
        resumeUrl: '',
        resumeFileName: '',
        profilePhoto: userData.photoURL || '',
        status: ACCOUNT_STATUS.ACTIVE,
        isActive: true,
        profileCompletion: 20,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        savedJobs: [],
        appliedJobs: [],
        savedCompanies: [],
        notifications: {
          email: true,
          push: true,
          jobAlerts: true,
          marketing: false,
        },
        privacy: {
          showProfile: true,
          showResume: false,
          showContactInfo: false,
        },
      };

      return await writeRoleProfileDocument('students', userId, studentProfile, 'Student');
    } catch (error) {
      console.error('Error creating student profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createCompanyProfile = useCallback(async (userId, userData) => {
    try {
      const companyProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        companyName: userData.companyName || '',
        legalName: userData.legalName || userData.companyName || '',
        registrationNumber: userData.registrationNumber || '',
        industry: userData.industry || '',
        industries: userData.industries || [userData.industry].filter(Boolean),
        companySize: userData.companySize || '',
        founded: userData.founded || null,
        website: userData.website || '',
        phone: userData.phone || '',
        description: userData.description || '',
        mission: '',
        vision: '',
        values: [],
        logo: '',
        coverImage: '',
        verified: false,
        verificationStatus: ACCOUNT_STATUS.PENDING_APPROVAL,
        status: ACCOUNT_STATUS.PENDING_APPROVAL,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        jobsPosted: 0,
        activeJobs: 0,
        totalHires: 0,
        followers: 0,
        socialLinks: {
          linkedin: userData.linkedin || '',
          twitter: userData.twitter || '',
          facebook: userData.facebook || '',
          instagram: '',
        },
        address: {
          street: userData.street || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          zipCode: userData.zipCode || '',
        },
        benefits: [],
        culture: '',
        gallery: [],
        team: [],
        profileCompletion: 30,
      };

      return await writeRoleProfileDocument('companies', userId, companyProfile, 'Company');
    } catch (error) {
      console.error('Error creating company profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createInstituteProfile = useCallback(async (userId, userData) => {
    try {
      const instituteProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        instituteName: userData.instituteName || '',
        legalName: userData.legalName || userData.instituteName || '',
        registrationNumber: userData.registrationNumber || '',
        type: userData.type || 'university',
        accreditation: userData.accreditation || '',
        established: userData.established || null,
        website: userData.website || '',
        phone: userData.phone || '',
        description: userData.description || '',
        logo: '',
        coverImage: '',
        verified: false,
        verificationStatus: ACCOUNT_STATUS.PENDING_APPROVAL,
        status: ACCOUNT_STATUS.PENDING_APPROVAL,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        coursesOffered: 0,
        studentsEnrolled: 0,
        faculties: 0,
        address: {
          street: userData.street || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          zipCode: userData.zipCode || '',
        },
        socialLinks: {
          linkedin: '',
          twitter: '',
          facebook: '',
        },
        profileCompletion: 25,
      };

      return await writeRoleProfileDocument('institutes', userId, instituteProfile, 'Institute');
    } catch (error) {
      console.error('Error creating institute profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createMentorProfile = useCallback(async (userId, userData) => {
    try {
      const mentorProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        title: userData.title || '',
        expertise: userData.expertise || [],
        industries: userData.industries || [],
        yearsOfExperience: userData.yearsOfExperience || 0,
        bio: userData.bio || '',
        phone: userData.phone || '',
        website: userData.website || '',
        linkedin: userData.linkedin || '',
        hourlyRate: userData.hourlyRate || null,
        currency: userData.currency || 'USD',
        availability: {
          monday: userData.availability?.monday || [],
          tuesday: userData.availability?.tuesday || [],
          wednesday: userData.availability?.wednesday || [],
          thursday: userData.availability?.thursday || [],
          friday: userData.availability?.friday || [],
          saturday: userData.availability?.saturday || [],
          sunday: userData.availability?.sunday || [],
        },
        languages: userData.languages || ['English'],
        education: userData.education || [],
        certifications: userData.certifications || [],
        achievements: [],
        profilePhoto: userData.photoURL || '',
        verified: false,
        verificationStatus: ACCOUNT_STATUS.PENDING_APPROVAL,
        status: ACCOUNT_STATUS.PENDING_APPROVAL,
        isActive: true,
        isAvailable: true,
        rating: 0,
        totalSessions: 0,
        totalReviews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileCompletion: 30,
      };

      return await writeRoleProfileDocument('mentors', userId, mentorProfile, 'Mentor');
    } catch (error) {
      console.error('Error creating mentor profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createYouthProfile = useCallback(async (userId, userData) => {
    try {
      const youthProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        dateOfBirth: userData.dateOfBirth || null,
        phone: userData.phone || '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
        },
        education: {
          level: userData.educationLevel || 'Not specified',
          institution: userData.institution || '',
          fieldOfStudy: userData.fieldOfStudy || '',
          graduationYear: userData.graduationYear || null,
        },
        skills: userData.skills || [],
        interests: userData.interests || [],
        businessIdeas: [],
        currentStage: userData.currentStage || 'idea',
        businessName: userData.businessName || '',
        businessDescription: userData.businessDescription || '',
        businessIndustry: userData.businessIndustry || '',
        businessStage: userData.businessStage || 'idea',
        fundingNeeds: userData.fundingNeeds || null,
        lookingForMentor: userData.lookingForMentor || false,
        lookingForFunding: userData.lookingForFunding || false,
        lookingForPartners: userData.lookingForPartners || false,
        profilePhoto: userData.photoURL || '',
        status: ACCOUNT_STATUS.ACTIVE,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        profileCompletion: 25,
      };

      return await writeRoleProfileDocument('youth', userId, youthProfile, 'Youth');
    } catch (error) {
      console.error('Error creating youth profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createEntrepreneurProfile = useCallback(async (userId, userData) => {
    try {
      const entrepreneurProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        companyName: userData.companyName || '',
        businessType: userData.businessType || '',
        industry: userData.industry || '',
        industries: userData.industries || [userData.industry].filter(Boolean),
        registrationNumber: userData.registrationNumber || '',
        yearFounded: userData.yearFounded || null,
        website: userData.website || '',
        phone: userData.phone || '',
        description: userData.description || '',
        mission: '',
        vision: '',
        stage: userData.stage || 'startup',
        teamSize: userData.teamSize || '1',
        fundingStage: userData.fundingStage || 'bootstrapped',
        fundingNeeded: userData.fundingNeeded || null,
        lookingForInvestment: userData.lookingForInvestment || false,
        lookingForMentors: userData.lookingForMentors || false,
        lookingForPartners: userData.lookingForPartners || false,
        logo: '',
        coverImage: '',
        verified: false,
        verificationStatus: ACCOUNT_STATUS.PENDING_APPROVAL,
        status: ACCOUNT_STATUS.ACTIVE,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        address: {
          street: userData.street || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          zipCode: userData.zipCode || '',
        },
        socialLinks: {
          linkedin: userData.linkedin || '',
          twitter: userData.twitter || '',
          facebook: userData.facebook || '',
          instagram: '',
        },
        profileCompletion: 30,
      };

      return await writeRoleProfileDocument(
        'entrepreneurs',
        userId,
        entrepreneurProfile,
        'Entrepreneur'
      );
    } catch (error) {
      console.error('Error creating entrepreneur profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createParentProfile = useCallback(async (userId, userData) => {
    try {
      const parentProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || '',
        children: [],
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        profilePhoto: userData.photoURL || '',
        status: ACCOUNT_STATUS.ACTIVE,
      };

      return await writeRoleProfileDocument('parents', userId, parentProfile, 'Parent');
    } catch (error) {
      console.error('Error creating parent profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const createAlumniProfile = useCallback(async (userId, userData) => {
    try {
      const alumniProfile = {
        uid: userId,
        email: userData.email.toLowerCase(),
        fullName: userData.fullName || '',
        firstName: userData.firstName || userData.fullName?.split(' ')[0] || '',
        lastName: userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '',
        graduationYear: userData.graduationYear || null,
        degree: userData.degree || '',
        institution: userData.institution || '',
        currentEmployer: userData.currentEmployer || '',
        currentPosition: userData.currentPosition || '',
        industry: userData.industry || '',
        phone: userData.phone || '',
        linkedin: userData.linkedin || '',
        willingToMentor: userData.willingToMentor || false,
        willingToNetwork: userData.willingToNetwork || true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        profilePhoto: userData.photoURL || '',
        status: ACCOUNT_STATUS.ACTIVE,
      };

      return await writeRoleProfileDocument('alumni', userId, alumniProfile, 'Alumni');
    } catch (error) {
      console.error('Error creating alumni profile:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ==================== MAIN USER PROFILE CREATION ====================
  const createUserProfile = useCallback(
    async (user, additionalData = {}) => {
      const existingCreation = inFlightProfileCreations.get(user.uid);
      if (existingCreation) {
        return existingCreation;
      }

      const creationPromise = (async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return { success: true, data: userSnap.data() };
            }
          } catch (lookupError) {
            if (!isPermissionDeniedError(lookupError)) {
              throw lookupError;
            }

            console.warn(
              'Could not verify whether the base user profile already exists. Proceeding with profile creation.',
              lookupError
            );
          }

          // Check if admin
          const isAdminUser = isAdminEmail(user.email);
          const normalizedUserType = normalizeUserTypeForFirestore(
            additionalData.userType || USER_TYPES.STUDENT
          );

          if (isAdminUser) {
            console.log('👑 ADMIN USER DETECTED:', user.email);

            const adminProfile = {
              uid: user.uid,
              email: user.email.toLowerCase(),
              displayName: additionalData.displayName || 'Administrator',
              firstName: additionalData.firstName || 'System',
              lastName: additionalData.lastName || 'Administrator',
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
              status: ACCOUNT_STATUS.ACTIVE,
            };

            await setDoc(userRef, adminProfile, { merge: true });
            const adminProfileResult = await createAdminProfile(user.uid, {
              ...additionalData,
              ...adminProfile,
            });
            if (!adminProfileResult.success) {
              console.warn(
                'Admin profile collection write failed, but base admin user profile was created.',
                adminProfileResult.error
              );
            }
            return { success: true, data: adminProfile };
          }

          // Get user type from additional data
          const requestedUserType = normalizedUserType;
          const userType = normalizedUserType;

          // Base user profile data - using serverTimestamp() for all timestamps
          const userProfileData = {
            uid: user.uid,
            email: user.email.toLowerCase(),
            displayName: additionalData.fullName || user.displayName || user.email.split('@')[0],
            firstName: additionalData.firstName || additionalData.fullName?.split(' ')[0] || '',
            lastName:
              additionalData.lastName ||
              additionalData.fullName?.split(' ').slice(1).join(' ') ||
              '',
            userType: userType,
            requestedUserType: requestedUserType,
            role: userType,
            isAdmin: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            lastActivity: serverTimestamp(),
            isActive: true,
            profileCompletion: userType === USER_TYPES.COMPANY ? 30 : 25,
            emailVerified: user.emailVerified || false,
            photoURL: user.photoURL || '',
            isGoogleAuth: additionalData.isGoogleAuth || false,
            status:
              userType === USER_TYPES.COMPANY ||
                userType === USER_TYPES.INSTITUTE ||
                userType === USER_TYPES.MENTOR
                ? ACCOUNT_STATUS.PENDING_APPROVAL
                : ACCOUNT_STATUS.ACTIVE,
            preferences: {
              language: 'en',
              theme: 'light',
              notifications: {
                email: true,
                push: true,
                inApp: true,
              },
            },
          };

          // Add type-specific fields to user profile
          switch (userType) {
            case USER_TYPES.COMPANY:
              userProfileData.companyName = additionalData.companyName || '';
              userProfileData.industry = additionalData.industry || '';
              userProfileData.companySize = additionalData.companySize || '';
              userProfileData.website = additionalData.website || '';
              userProfileData.phone = additionalData.phone || '';
              userProfileData.verified = false;
              userProfileData.status = ACCOUNT_STATUS.PENDING_APPROVAL;
              break;
            case USER_TYPES.INSTITUTE:
              userProfileData.instituteName = additionalData.instituteName || '';
              userProfileData.instituteType = additionalData.instituteType || '';
              userProfileData.website = additionalData.website || '';
              userProfileData.phone = additionalData.phone || '';
              break;
            case USER_TYPES.MENTOR:
              userProfileData.title = additionalData.title || '';
              userProfileData.expertise = additionalData.expertise || [];
              userProfileData.yearsOfExperience = additionalData.yearsOfExperience || 0;
              break;
            case USER_TYPES.ENTREPRENEUR:
              userProfileData.companyName = additionalData.companyName || '';
              userProfileData.industry = additionalData.industry || '';
              userProfileData.stage = additionalData.stage || 'startup';
              userProfileData.website = additionalData.website || '';
              break;
            case USER_TYPES.YOUTH:
              userProfileData.businessName = additionalData.businessName || '';
              userProfileData.businessStage = additionalData.businessStage || 'idea';
              userProfileData.businessIndustry = additionalData.businessIndustry || '';
              userProfileData.lookingForMentor = additionalData.lookingForMentor || false;
              userProfileData.lookingForFunding = additionalData.lookingForFunding || false;
              break;
            case USER_TYPES.PARENT:
              userProfileData.children = [];
              break;
            case USER_TYPES.ALUMNI:
              userProfileData.graduationYear = additionalData.graduationYear || null;
              userProfileData.degree = additionalData.degree || '';
              userProfileData.institution = additionalData.institution || '';
              break;
            default: // STUDENT
              userProfileData.educationLevel = additionalData.educationLevel || '';
              userProfileData.institution = additionalData.institution || '';
              userProfileData.fieldOfStudy = additionalData.fieldOfStudy || '';
              userProfileData.graduationYear = additionalData.graduationYear || null;
              break;
          }

          // Save to users collection
          try {
            await setDoc(userRef, userProfileData, { merge: true });
          } catch (writeError) {
            if (!isPermissionDeniedError(writeError)) {
              throw writeError;
            }

            const existingUserSnap = await getDoc(userRef).catch(() => null);
            if (existingUserSnap?.exists()) {
              return { success: true, data: existingUserSnap.data() };
            }

            throw writeError;
          }

          // Create type-specific profile based on actual user type
          let typeProfileResult;
          switch (userType) {
            case USER_TYPES.ADMIN:
              typeProfileResult = await createAdminProfile(user.uid, {
                ...additionalData,
                email: user.email,
              });
              break;
            case USER_TYPES.STUDENT:
              typeProfileResult = await createStudentProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            case USER_TYPES.COMPANY:
              typeProfileResult = await createCompanyProfile(user.uid, {
                ...additionalData,
                email: user.email,
              });
              break;
            case USER_TYPES.INSTITUTE:
              typeProfileResult = await createInstituteProfile(user.uid, {
                ...additionalData,
                email: user.email,
              });
              break;
            case USER_TYPES.MENTOR:
              typeProfileResult = await createMentorProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            case USER_TYPES.YOUTH:
              typeProfileResult = await createYouthProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            case USER_TYPES.ENTREPRENEUR:
              typeProfileResult = await createEntrepreneurProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            case USER_TYPES.PARENT:
              typeProfileResult = await createParentProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            case USER_TYPES.ALUMNI:
              typeProfileResult = await createAlumniProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
              break;
            default:
              typeProfileResult = await createStudentProfile(user.uid, {
                ...additionalData,
                email: user.email,
                photoURL: user.photoURL,
              });
          }

          if (!typeProfileResult.success) {
            console.warn('Type-specific profile creation failed:', typeProfileResult.error);
          }

          return { success: true, data: userProfileData };
        } catch (error) {
          console.error('❌ Profile creation error:', error);
          return { success: false, error: error.message };
        } finally {
          inFlightProfileCreations.delete(user.uid);
        }
      })();

      inFlightProfileCreations.set(user.uid, creationPromise);
      return creationPromise;
    },
    [
      isAdminEmail,
      createAdminProfile,
      createStudentProfile,
      createCompanyProfile,
      createInstituteProfile,
      createMentorProfile,
      createYouthProfile,
      createEntrepreneurProfile,
      createParentProfile,
      createAlumniProfile,
    ]
  );

  // ==================== GET USER PROFILE ====================
  const getUserProfile = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Fetch type-specific profile based on actual userType
        let typeProfile = null;
        try {
          switch (userData.userType) {
            case USER_TYPES.STUDENT: {
              const studentRef = doc(db, 'students', userId);
              const studentSnap = await getDoc(studentRef);
              if (studentSnap.exists()) {
                typeProfile = studentSnap.data();
              }
              break;
            }
            case USER_TYPES.COMPANY: {
              const companyRef = doc(db, 'companies', userId);
              const companySnap = await getDoc(companyRef);
              if (companySnap.exists()) {
                typeProfile = companySnap.data();
              }
              break;
            }
            case USER_TYPES.INSTITUTE: {
              const instituteRef = doc(db, 'institutes', userId);
              const instituteSnap = await getDoc(instituteRef);
              if (instituteSnap.exists()) {
                typeProfile = instituteSnap.data();
              }
              break;
            }
            case USER_TYPES.MENTOR: {
              const mentorRef = doc(db, 'mentors', userId);
              const mentorSnap = await getDoc(mentorRef);
              if (mentorSnap.exists()) {
                typeProfile = mentorSnap.data();
              }
              break;
            }
            case USER_TYPES.YOUTH: {
              const youthRef = doc(db, 'youth', userId);
              const youthSnap = await getDoc(youthRef);
              if (youthSnap.exists()) {
                typeProfile = youthSnap.data();
              }
              break;
            }
            case USER_TYPES.ENTREPRENEUR: {
              const entrepreneurRef = doc(db, 'entrepreneurs', userId);
              const entrepreneurSnap = await getDoc(entrepreneurRef);
              if (entrepreneurSnap.exists()) {
                typeProfile = entrepreneurSnap.data();
              }
              break;
            }
            case USER_TYPES.PARENT: {
              const parentRef = doc(db, 'parents', userId);
              const parentSnap = await getDoc(parentRef);
              if (parentSnap.exists()) {
                typeProfile = parentSnap.data();
              }
              break;
            }
            case USER_TYPES.ALUMNI: {
              const alumniRef = doc(db, 'alumni', userId);
              const alumniSnap = await getDoc(alumniRef);
              if (alumniSnap.exists()) {
                typeProfile = alumniSnap.data();
              }
              break;
            }
            default:
              break;
          }
        } catch (err) {
          if (err?.code !== 'permission-denied') {
            console.warn(`Could not fetch ${userData.userType} profile:`, err);
          }
        }

        // Merge type profile with user data
        if (typeProfile) {
          userData.typeProfile = typeProfile;
          // Add specific profile fields
          if (userData.userType === USER_TYPES.COMPANY) {
            userData.companyProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.STUDENT) {
            userData.studentProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.INSTITUTE) {
            userData.instituteProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.MENTOR) {
            userData.mentorProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.YOUTH) {
            userData.youthProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.ENTREPRENEUR) {
            userData.entrepreneurProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.PARENT) {
            userData.parentProfile = typeProfile;
          } else if (userData.userType === USER_TYPES.ALUMNI) {
            userData.alumniProfile = typeProfile;
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

  // ==================== EMAIL VERIFICATION ====================
  const sendVerificationEmail = useCallback(async (user) => {
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: true,
      });
      setEmailVerificationSent(true);
      return { success: true };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const isEmailVerified = useCallback(() => {
    return currentUser?.emailVerified || false;
  }, [currentUser]);

  const needsEmailVerification = useCallback(() => {
    return currentUser && !currentUser.emailVerified && !isAdminEmail(currentUser?.email);
  }, [currentUser, isAdminEmail]);

  const resendVerificationEmail = useCallback(async () => {
    if (currentUser && !currentUser.emailVerified) {
      return await sendVerificationEmail(currentUser);
    }
    return { success: false, error: 'No user or email already verified' };
  }, [currentUser, sendVerificationEmail]);

  const verifyEmail = useCallback(
    async (email, password) => {
      try {
        clearError();

        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        if (!password) {
          throw new Error('Password is required to verify your account');
        }

        const { user } = await signInWithEmailAndPassword(auth, email, password);
        await user.reload();

        if (!user.emailVerified && !isAdminEmail(user.email)) {
          await sendVerificationEmail(user);
          await signOut(auth);
          return {
            success: false,
            error: 'Please verify your email from the link we sent, then try again.',
          };
        }

        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
          return {
            success: true,
            user,
            userType: profileResult.data.userType,
          };
        }

        return { success: true, user, userType: USER_TYPES.STUDENT };
      } catch (error) {
        let errorMessage = ERROR_MESSAGES.GENERIC;

        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
            break;
          case 'auth/network-request-failed':
            errorMessage = ERROR_MESSAGES.NETWORK;
            break;
          default:
            errorMessage = error.message || ERROR_MESSAGES.GENERIC;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [clearError, validateEmail, isAdminEmail, sendVerificationEmail, getUserProfile]
  );

  const resendVerification = useCallback(
    async (email, password) => {
      try {
        clearError();

        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        if (!password) {
          throw new Error('Password is required to resend verification');
        }

        const { user } = await signInWithEmailAndPassword(auth, email, password);
        await user.reload();

        if (user.emailVerified) {
          await signOut(auth);
          return { success: false, error: 'Email is already verified. Please sign in.' };
        }

        const verificationResult = await sendVerificationEmail(user);
        await signOut(auth);

        if (!verificationResult.success) {
          return {
            success: false,
            error: verificationResult.error || 'Failed to resend verification email',
          };
        }

        return { success: true, message: 'Verification email resent successfully.' };
      } catch (error) {
        let errorMessage = ERROR_MESSAGES.GENERIC;

        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
            break;
          case 'auth/network-request-failed':
            errorMessage = ERROR_MESSAGES.NETWORK;
            break;
          default:
            errorMessage = error.message || ERROR_MESSAGES.GENERIC;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [clearError, validateEmail, sendVerificationEmail]
  );

  const verifyRegistrationEmailOtp = useCallback(async (email, otp) => {
    try {
      const result = await authAPI.verifyEmailOtp({
        email: email?.trim().toLowerCase(),
        otp: String(otp || '').trim(),
      });

      if (!result.success) {
        return { success: false, error: result.message || 'Failed to verify email OTP' };
      }

      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to verify email OTP' };
    }
  }, []);

  const resendRegistrationEmailOtp = useCallback(async (email) => {
    try {
      const result = await authAPI.resendEmailOtp({
        email: email?.trim().toLowerCase(),
      });

      if (!result.success) {
        return { success: false, error: result.message || 'Failed to resend email OTP' };
      }

      return { success: true, message: result.message, otp: result.otp };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to resend email OTP' };
    }
  }, []);

  const requestRegistrationPhoneOtp = useCallback(async (email) => {
    try {
      const result = await authAPI.requestPhoneOtp({
        email: email?.trim().toLowerCase(),
      });

      if (!result.success) {
        return { success: false, error: result.message || 'Failed to send phone OTP' };
      }

      return { success: true, message: result.message, otp: result.otp };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to send phone OTP' };
    }
  }, []);

  const verifyRegistrationPhoneOtp = useCallback(async (email, otp) => {
    try {
      const result = await authAPI.verifyPhoneOtp({
        email: email?.trim().toLowerCase(),
        otp: String(otp || '').trim(),
      });

      if (!result.success) {
        return { success: false, error: result.message || 'Failed to verify phone OTP' };
      }

      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to verify phone OTP' };
    }
  }, []);

  // ==================== AUTHENTICATION FUNCTIONS ====================
  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);
        clearError();

        if (!validateEmail(credentials.email)) {
          throw new Error('Please enter a valid email address');
        }

        // Check rate limiting
        const attemptCheck = checkLoginAttempts(credentials.email);
        if (!attemptCheck.allowed) {
          throw new Error(attemptCheck.message);
        }

        console.log('🔐 Attempting login for:', credentials.email);

        const { user } = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

        // Reset login attempts on success
        resetLoginAttempts(credentials.email);

        // Check email verification (skip for admin)
        if (!user.emailVerified && !isAdminEmail(user.email)) {
          await sendVerificationEmail(user);
          await signOut(auth);
          throw new Error(
            'Please verify your email before logging in. A new verification email has been sent.'
          );
        }

        const verificationStatus = await authAPI.getVerificationStatus({
          email: credentials.email,
        });

        if (
          verificationStatus?.success &&
          verificationStatus.exists &&
          (!verificationStatus.emailVerified || !verificationStatus.phoneVerified)
        ) {
          await signOut(auth);
          throw new Error(
            verificationStatus.phoneVerified
              ? 'Please complete your email OTP verification before logging in.'
              : 'Please complete your email and phone OTP verification before logging in.'
          );
        }

        const userRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
            lastActivity: serverTimestamp(),
          });
        } catch (profileUpdateError) {
          if (!isPermissionDeniedError(profileUpdateError)) {
            throw profileUpdateError;
          }
          console.warn(
            'Skipping lastLogin update due to Firestore permissions:',
            profileUpdateError
          );
        }

        const profileResult = await getUserProfile(user.uid);

        if (profileResult.success) {
          setUserProfile(profileResult.data);

          // Store session data
          sessionStorage.setItem(
            STORAGE_KEYS.SESSION_DATA,
            JSON.stringify({
              userId: user.uid,
              email: user.email,
              userType: profileResult.data.userType,
              timestamp: Date.now(),
            })
          );

          return {
            success: true,
            user,
            profile: profileResult.data,
            userType: profileResult.data.userType,
            isAdmin: profileResult.data.isAdmin || false,
          };
        } else if (isProfileMissingError(profileResult.error)) {
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

          sessionStorage.setItem(
            STORAGE_KEYS.SESSION_DATA,
            JSON.stringify({
              userId: user.uid,
              email: user.email,
              userType: createResult.data.userType,
              timestamp: Date.now(),
            })
          );

          return {
            success: true,
            user,
            profile: createResult.data,
            userType: createResult.data.userType,
            isAdmin: createResult.data.isAdmin || false,
          };
        }

        return {
          success: true,
          user,
          profile: null,
          userType: USER_TYPES.STUDENT,
          isAdmin: false,
        };
      } catch (error) {
        console.error('❌ Login failed:', error);

        // Record failed attempt
        if (credentials?.email) {
          recordFailedAttempt(credentials.email);
        }

        let errorMessage = ERROR_MESSAGES.GENERIC;

        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
            break;
          case 'auth/too-many-requests':
            errorMessage = ERROR_MESSAGES.TOO_MANY_ATTEMPTS;
            break;
          case 'auth/user-disabled':
            errorMessage = ERROR_MESSAGES.USER_DISABLED;
            break;
          case 'auth/network-request-failed':
            errorMessage = ERROR_MESSAGES.NETWORK;
            break;
          default:
            errorMessage = error.message || ERROR_MESSAGES.GENERIC;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [
      validateEmail,
      checkLoginAttempts,
      resetLoginAttempts,
      isAdminEmail,
      sendVerificationEmail,
      getUserProfile,
      createUserProfile,
      recordFailedAttempt,
      clearError,
    ]
  );

  const loginWithGoogle = useCallback(
    async (userTypeData) => {
      try {
        setLoading(true);
        clearError();

        if (!googleProvider) {
          throw new Error('Google Auth provider not configured');
        }

        if (typeof window === 'undefined') {
          throw new Error('Google sign-in is only available in browser environment');
        }

        // Get selected user type - can be string or object
        const selectedUserType =
          typeof userTypeData === 'string'
            ? userTypeData
            : userTypeData?.userType || USER_TYPES.STUDENT;

        const additionalData = typeof userTypeData === 'object' ? userTypeData : {};
        managedAuthFlowRef.current = {
          suppressAutoProfileCreation: true,
          requestedUserType: selectedUserType,
        };

        console.log('🔐 Starting Google sign-in with type:', selectedUserType);

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        if (!user) {
          throw new Error('No user returned from Google sign-in');
        }

        console.log('✅ Google sign-in successful for:', user.email);

        // Check if profile exists
        const profileResult = await getUserProfile(user.uid);

        if (profileResult.success) {
          // Update last login
          const userRef = doc(db, 'users', user.uid);
          try {
            await updateDoc(userRef, {
              lastLogin: serverTimestamp(),
              lastActivity: serverTimestamp(),
            });
          } catch (profileUpdateError) {
            if (!isPermissionDeniedError(profileUpdateError)) {
              throw profileUpdateError;
            }
            console.warn(
              'Skipping Google login profile timestamp update due to Firestore permissions:',
              profileUpdateError
            );
          }

          // Update type-specific profile last login if needed
          try {
            const typeRef = doc(
              db,
              getProfileCollectionForUserType(profileResult.data.userType),
              user.uid
            );
            await updateDoc(typeRef, {
              lastLogin: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Could not update type profile last login:', err);
          }

          setUserProfile(profileResult.data);

          sessionStorage.setItem(
            STORAGE_KEYS.SESSION_DATA,
            JSON.stringify({
              userId: user.uid,
              email: user.email,
              userType: profileResult.data.userType,
              timestamp: Date.now(),
            })
          );

          return {
            success: true,
            user,
            profile: profileResult.data,
            userType: profileResult.data.userType,
            isAdmin: profileResult.data.isAdmin || false,
          };
        } else if (isProfileMissingError(profileResult.error)) {
          // New Google user - create profile with selected type
          const isAdminUser = isAdminEmail(user.email);
          const userType = isAdminUser ? USER_TYPES.ADMIN : selectedUserType;

          console.log('📝 Creating new profile for user type:', userType);

          const profileData = {
            fullName: user.displayName || user.email.split('@')[0],
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            userType: userType,
            isGoogleAuth: true,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            ...additionalData,
          };

          const createResult = await createUserProfile(user, profileData);

          if (!createResult.success) {
            throw new Error('Failed to create user profile');
          }

          setUserProfile(createResult.data);

          sessionStorage.setItem(
            STORAGE_KEYS.SESSION_DATA,
            JSON.stringify({
              userId: user.uid,
              email: user.email,
              userType: createResult.data.userType,
              timestamp: Date.now(),
            })
          );

          return {
            success: true,
            user,
            profile: createResult.data,
            userType: createResult.data.userType,
            isAdmin: createResult.data.isAdmin || false,
          };
        }

        return {
          success: true,
          user,
          profile: null,
          userType: selectedUserType,
          isAdmin: false,
        };
      } catch (error) {
        console.error('❌ Google login failed:', error);

        let errorMessage = ERROR_MESSAGES.GENERIC;

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
            errorMessage = 'This domain is not authorized for Google sign-in.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Google sign-in is not enabled.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage =
              'An account already exists with the same email address but different sign-in credentials.';
            break;
          case 'auth/network-request-failed':
            errorMessage = ERROR_MESSAGES.NETWORK;
            break;
          default:
            errorMessage = error.message || ERROR_MESSAGES.GENERIC;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        managedAuthFlowRef.current = {
          suppressAutoProfileCreation: false,
          requestedUserType: null,
        };
        setLoading(false);
      }
    },
    [getUserProfile, isAdminEmail, createUserProfile, clearError]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        clearError();
        setEmailVerificationSent(false);
        managedAuthFlowRef.current = {
          suppressAutoProfileCreation: true,
          requestedUserType: userData.userType || USER_TYPES.STUDENT,
        };

        if (!validateEmail(userData.email)) {
          throw new Error('Please enter a valid email address');
        }

        const emailExists = await checkEmailExists(userData.email);
        if (emailExists) {
          throw new Error(ERROR_MESSAGES.EMAIL_IN_USE);
        }

        const passwordValidation = validatePassword(userData.password);
        if (!passwordValidation.isValid) {
          throw new Error(`Password must contain: ${passwordValidation.errors.join(', ')}`);
        }

        if (isAdminEmail(userData.email)) {
          throw new Error('Admin accounts cannot be created through registration.');
        }

        console.log('👤 Registering user:', userData.email, 'as', userData.userType);

        const { user } = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        if (userData.fullName) {
          await updateProfile(user, { displayName: userData.fullName });
        }

        await sendVerificationEmail(user);

        const profileData = {
          fullName: userData.fullName,
          firstName: userData.fullName?.split(' ')[0] || '',
          lastName: userData.fullName?.split(' ').slice(1).join(' ') || '',
          userType: userData.userType,
          emailVerified: false,
          isGoogleAuth: false,
          photoURL: user.photoURL,
        };

        // Add type-specific data
        switch (userData.userType) {
          case USER_TYPES.COMPANY:
            profileData.companyName = userData.companyName;
            profileData.industry = userData.industry;
            profileData.companySize = userData.companySize;
            profileData.website = userData.website;
            profileData.phone = userData.phone;
            break;
          case USER_TYPES.INSTITUTE:
            profileData.instituteName = userData.instituteName;
            profileData.instituteType = userData.instituteType;
            profileData.website = userData.website;
            profileData.phone = userData.phone;
            break;
          case USER_TYPES.MENTOR:
            profileData.title = userData.title;
            profileData.expertise = userData.expertise ? [userData.expertise] : [];
            profileData.yearsOfExperience = userData.yearsOfExperience;
            profileData.hourlyRate = userData.hourlyRate;
            break;
          case USER_TYPES.ENTREPRENEUR:
            profileData.companyName = userData.companyName;
            profileData.industry = userData.industry;
            profileData.stage = userData.stage || 'startup';
            profileData.website = userData.website;
            break;
          case USER_TYPES.YOUTH:
            profileData.businessName = userData.businessName;
            profileData.businessStage = userData.businessStage || 'idea';
            profileData.businessIndustry = userData.businessIndustry;
            profileData.lookingForMentor = userData.lookingForMentor || false;
            profileData.lookingForFunding = userData.lookingForFunding || false;
            break;
          case USER_TYPES.PARENT:
            profileData.children = [];
            break;
          case USER_TYPES.ALUMNI:
            profileData.graduationYear = userData.graduationYear;
            profileData.degree = userData.degree;
            profileData.institution = userData.institution;
            profileData.currentEmployer = userData.currentEmployer;
            profileData.currentPosition = userData.currentPosition;
            break;
          default: // STUDENT
            profileData.educationLevel = userData.educationLevel;
            profileData.institution = userData.institution;
            profileData.fieldOfStudy = userData.fieldOfStudy;
            profileData.graduationYear = userData.graduationYear;
            break;
        }

        const createResult = await createUserProfile(user, profileData);

        if (!createResult.success) {
          throw new Error('Failed to create user profile');
        }

        const backendRegisterResult = await authAPI.register({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phone: userData.phone,
          role: userData.userType,
          userType: userData.userType,
          companyName: userData.companyName || userData.entrepreneurCompanyName,
        });

        if (!backendRegisterResult.success) {
          throw new Error(backendRegisterResult.message || 'Failed to initialize verification flow');
        }

        await signOut(auth);

        return {
          success: true,
          message: `Registration successful! Please check your email to verify your ${USER_TYPE_LABELS[userData.userType]} account.`,
          emailVerificationSent: true,
          userType: userData.userType,
          backendVerification: backendRegisterResult.verificationRequired,
          emailOtp: backendRegisterResult.emailOtp,
          phoneOtp: backendRegisterResult.phoneOtp,
        };
      } catch (error) {
        console.error('❌ Registration failed:', error);

        let errorMessage = ERROR_MESSAGES.GENERIC;

        if (error.code === 'auth/email-already-in-use') {
          errorMessage = ERROR_MESSAGES.EMAIL_IN_USE;
        } else if (error.code === 'auth/weak-password') {
          errorMessage = ERROR_MESSAGES.WEAK_PASSWORD;
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address.';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Email/password sign-up is not enabled.';
        } else {
          errorMessage = error.message || ERROR_MESSAGES.GENERIC;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        managedAuthFlowRef.current = {
          suppressAutoProfileCreation: false,
          requestedUserType: null,
        };
        setLoading(false);
      }
    },
    [
      validateEmail,
      checkEmailExists,
      validatePassword,
      isAdminEmail,
      sendVerificationEmail,
      createUserProfile,
      clearError,
    ]
  );

  const resetPassword = useCallback(
    async (email) => {
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

        let errorMessage = ERROR_MESSAGES.GENERIC;
        if (error.code === 'auth/user-not-found') {
          errorMessage = ERROR_MESSAGES.USER_NOT_FOUND;
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = ERROR_MESSAGES.NETWORK;
        }

        return { success: false, error: errorMessage };
      }
    },
    [validateEmail]
  );

  const logout = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        // Clear session data
        sessionStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);

        // Clear timers
        if (sessionTimerRef.current) {
          clearTimeout(sessionTimerRef.current);
        }
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }

        setSessionExpiryWarning(false);

        await signOut(auth);
        setCurrentUser(null);
        setUserProfile(null);
        setEmailVerificationSent(false);
        clearError();

        return { success: true };
      } catch (error) {
        console.error('❌ Logout failed:', error);
        if (!silent) {
          setError('Logout failed.');
        }
        return { success: false, error: error.message };
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [clearError]
  );

  // ==================== HELPER FUNCTIONS ====================
  const getDashboardPath = useCallback(() => {
    if (!userProfile) return '/login';

    if (userProfile.isAdmin || userProfile.userType === USER_TYPES.ADMIN) {
      return '/admin/dashboard';
    }

    switch (userProfile.userType) {
      case USER_TYPES.STUDENT:
        return '/student/dashboard';
      case USER_TYPES.COMPANY:
        return '/company/dashboard';
      case USER_TYPES.INSTITUTE:
        return '/institute/dashboard';
      case USER_TYPES.MENTOR:
        return '/mentor/dashboard';
      case USER_TYPES.YOUTH:
        return '/youth/dashboard';
      case USER_TYPES.ENTREPRENEUR:
        return '/entrepreneur/dashboard';
      case USER_TYPES.PARENT:
        return '/parent/dashboard';
      case USER_TYPES.ALUMNI:
        return '/alumni/dashboard';
      default:
        return '/student/dashboard';
    }
  }, [userProfile]);

  const getUserTypeDisplay = useCallback(() => {
    if (!userProfile) return '';

    if (userProfile.userType === USER_TYPES.COMPANY) {
      return userProfile.companyName || 'Company';
    } else if (userProfile.userType === USER_TYPES.INSTITUTE) {
      return userProfile.instituteName || 'Institute';
    } else if (userProfile.userType === USER_TYPES.ENTREPRENEUR) {
      return userProfile.companyName || 'Entrepreneur';
    } else if (userProfile.userType === USER_TYPES.YOUTH) {
      return userProfile.businessName || userProfile.displayName || 'Youth';
    } else if (userProfile.userType === USER_TYPES.MENTOR) {
      return userProfile.displayName || 'Mentor';
    } else if (userProfile.userType === USER_TYPES.PARENT) {
      return userProfile.displayName || 'Parent';
    } else if (userProfile.userType === USER_TYPES.ALUMNI) {
      return userProfile.displayName || 'Alumni';
    }

    return userProfile.displayName || 'User';
  }, [userProfile]);

  const getUserTypeLabel = useCallback((userType) => {
    return USER_TYPE_LABELS[userType] || userType;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser) {
      const result = await getUserProfile(currentUser.uid);
      if (result.success) {
        setUserProfile(result.data);
      }
    }
  }, [currentUser, getUserProfile]);

  // ==================== INITIALIZATION ====================
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
            if (
              managedAuthFlowRef.current.suppressAutoProfileCreation ||
              !isProfileMissingError(profileResult.error)
            ) {
              return;
            }

            const isAdminUser = isAdminEmail(user.email);
            const userType = isAdminUser ? USER_TYPES.ADMIN : USER_TYPES.STUDENT;

            const createResult = await createUserProfile(user, {
              fullName: user.displayName || user.email.split('@')[0],
              userType: userType,
              emailVerified: user.emailVerified,
              isGoogleAuth: user.providerData.some((p) => p.providerId === 'google.com'),
            });

            if (createResult.success) {
              setUserProfile(createResult.data);
            }
          }

          // Check session storage for existing session
          const savedSession = sessionStorage.getItem(STORAGE_KEYS.SESSION_DATA);
          if (!savedSession) {
            sessionStorage.setItem(
              STORAGE_KEYS.SESSION_DATA,
              JSON.stringify({
                userId: user.uid,
                email: user.email,
                userType: userProfile?.userType || 'unknown',
                timestamp: Date.now(),
              })
            );
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          sessionStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
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
  }, [getUserProfile, isAdminEmail, createUserProfile]);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // User state
    user: userProfile,
    currentUser,
    userProfile,
    userData: userProfile,
    loading: loading || isInitializing,
    isAuthenticated: !!currentUser,
    isAdmin: userProfile?.isAdmin || userProfile?.userType === USER_TYPES.ADMIN,
    isStudent: userProfile?.userType === USER_TYPES.STUDENT,
    isCompany: userProfile?.userType === USER_TYPES.COMPANY,
    isInstitute: userProfile?.userType === USER_TYPES.INSTITUTE,
    isMentor: userProfile?.userType === USER_TYPES.MENTOR,
    isYouth: userProfile?.userType === USER_TYPES.YOUTH,
    isEntrepreneur: userProfile?.userType === USER_TYPES.ENTREPRENEUR,
    isParent: userProfile?.userType === USER_TYPES.PARENT,
    isAlumni: userProfile?.userType === USER_TYPES.ALUMNI,
    isOffline,
    sessionExpiryWarning,

    // Error handling
    error,
    clearError,

    // Authentication functions
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,

    // Email verification
    isEmailVerified,
    needsEmailVerification,
    resendVerificationEmail,
    verifyEmail,
    resendVerification,
    verifyRegistrationEmailOtp,
    resendRegistrationEmailOtp,
    requestRegistrationPhoneOtp,
    verifyRegistrationPhoneOtp,
    emailVerificationSent,
    sendVerificationEmail,

    // Profile management
    refreshUserProfile,
    getUserProfile,

    // Helper functions
    getDashboardPath,
    getUserTypeDisplay,
    getUserTypeLabel,
    validatePassword,
    validateEmail,
    checkEmailExists,

    // Constants
    USER_TYPES,
    USER_TYPE_LABELS,
    ACCOUNT_STATUS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
