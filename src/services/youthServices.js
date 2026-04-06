/* eslint-disable no-unused-vars */
// src/services/youthServices.js
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadString } from 'firebase/storage';

import { db, storage } from '../config/firebase';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// ==================== PROFILE MANAGEMENT ====================

/**
 * Get youth profile by user ID
 */
export const getYouthProfile = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const youthRef = doc(db, 'youth', userId);
    const youthSnap = await getDoc(youthRef);

    if (youthSnap.exists()) {
      const data = youthSnap.data();
      // Convert timestamps to dates for easier handling
      return {
        success: true,
        data: {
          id: youthSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
          lastLogin: data.lastLogin?.toDate?.() || null,
        },
      };
    }
    return { success: false, error: 'Youth profile not found', notFound: true };
  } catch (error) {
    console.error('Error fetching youth profile:', error);

    // Handle specific Firebase errors
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You do not have permission to view this profile',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Create or update youth profile
 */
export const createYouthProfile = async (userId, profileData) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const youthRef = doc(db, 'youth', userId);
    const youthSnap = await getDoc(youthRef);

    // Check if profile exists first to avoid permission issues
    const baseProfile = {
      uid: userId,
      email: profileData.email || '',
      fullName: profileData.fullName || profileData.displayName || '',
      firstName:
        profileData.firstName ||
        profileData.fullName?.split(' ')[0] ||
        profileData.displayName?.split(' ')[0] ||
        '',
      lastName:
        profileData.lastName ||
        profileData.fullName?.split(' ').slice(1).join(' ') ||
        profileData.displayName?.split(' ').slice(1).join(' ') ||
        '',
      phone: profileData.phone || '',
      dateOfBirth: profileData.dateOfBirth || null,
      address: {
        street: profileData.street || '',
        city: profileData.city || '',
        state: profileData.state || '',
        country: profileData.country || 'Lesotho',
        zipCode: profileData.zipCode || '',
      },
      education: {
        level: profileData.educationLevel || 'Not specified',
        institution: profileData.institution || '',
        fieldOfStudy: profileData.fieldOfStudy || '',
        graduationYear: profileData.graduationYear || null,
      },
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      interests: Array.isArray(profileData.interests) ? profileData.interests : [],
      businessName: profileData.businessName || '',
      businessDescription: profileData.businessDescription || '',
      businessIndustry: profileData.businessIndustry || '',
      businessStage: profileData.businessStage || 'idea',
      businessPlanProgress: profileData.businessPlanProgress || 0,
      marketResearchProgress: profileData.marketResearchProgress || 0,
      fundingNeeds: profileData.fundingNeeds || null,
      lookingForMentor: profileData.lookingForMentor || false,
      lookingForFunding: profileData.lookingForFunding || false,
      lookingForPartners: profileData.lookingForPartners || false,
      profilePhoto: profileData.profilePhoto || '',
      profilePhotoPublicId: profileData.profilePhotoPublicId || '',
      status: 'active',
      isActive: true,
      profileCompletion: calculateProfileCompletion(profileData),
      stats: {
        profileViews: 0,
        businessIdeasCount: 0,
        fundingApplicationsCount: 0,
        mentorshipSessionsCount: 0,
        networkCount: 0,
        achievementsCount: 0,
        trainingsCompleted: 0,
      },
      connectedMentors: [],
      networkConnections: [],
      completedTrainings: [],
      achievements: [],
      createdAt: youthSnap.exists() ? youthSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    if (youthSnap.exists()) {
      // Update existing profile - merge with existing data
      const existingData = youthSnap.data();
      const mergedProfile = { ...existingData, ...baseProfile, updatedAt: serverTimestamp() };
      await updateDoc(youthRef, mergedProfile);
    } else {
      // Create new profile
      await setDoc(youthRef, baseProfile);
    }

    // Log activity (try-catch to prevent main operation failure if logging fails)
    try {
      await logYouthActivity(userId, {
        type: 'profile',
        description: youthSnap.exists() ? 'Profile updated' : 'Profile created',
        timestamp: serverTimestamp(),
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
      // Don't fail the main operation
    }

    return { success: true, data: baseProfile };
  } catch (error) {
    console.error('Error creating/updating youth profile:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. Please check your authentication status.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Update youth profile
 */
export const updateYouthProfile = async (userId, updates) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const youthRef = doc(db, 'youth', userId);

    // Get current profile for completion calculation
    const currentProfile = await getDoc(youthRef);
    if (!currentProfile.exists()) {
      return { success: false, error: 'Profile not found' };
    }

    // Calculate new profile completion if relevant fields are updated
    const fieldsToCheck = [
      'businessName',
      'businessIndustry',
      'skills',
      'profilePhoto',
      'businessStage',
      'lookingForMentor',
      'lookingForFunding',
      'phone',
    ];
    const shouldRecalculate = fieldsToCheck.some((field) => field in updates);

    let profileCompletion;
    if (shouldRecalculate) {
      const mergedData = { ...currentProfile.data(), ...updates };
      profileCompletion = calculateProfileCompletion(mergedData);
      updates.profileCompletion = profileCompletion;
    }

    updates.updatedAt = serverTimestamp();

    await updateDoc(youthRef, updates);

    // Log activity (don't await - fire and forget)
    logYouthActivity(userId, {
      type: 'profile_update',
      description: 'Profile information updated',
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return { success: true };
  } catch (error) {
    console.error('Error updating youth profile:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. You may only update your own profile.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

// ==================== CLOUDINARY IMAGE UPLOAD ====================

/**
 * Upload image to Cloudinary
 */
export const uploadToCloudinary = async (file, folder = 'youth-profiles') => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload profile photo to Cloudinary and update profile
 */
export const uploadProfilePhoto = async (userId, file) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file, 'youth-profiles');

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Update profile with new photo URL
    const youthRef = doc(db, 'youth', userId);
    await updateDoc(youthRef, {
      profilePhoto: uploadResult.url,
      profilePhotoPublicId: uploadResult.publicId,
      updatedAt: serverTimestamp(),
    });

    // Log activity
    logYouthActivity(userId, {
      type: 'profile_photo',
      description: 'Profile photo updated',
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return {
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    };
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return { success: false, error: error.message };
  }
};

// ==================== BUSINESS IDEAS MANAGEMENT ====================

/**
 * Get all business ideas for a youth
 */
export const getBusinessIdeas = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const ideasRef = collection(db, 'youth', userId, 'businessIdeas');
    const q = query(ideasRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const ideas = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: ideas };
  } catch (error) {
    console.error('Error fetching business ideas:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You do not have permission to view these ideas',
        permissionDenied: true,
        data: [],
      };
    }

    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Create a new business idea
 */
export const createBusinessIdea = async (userId, ideaData) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!ideaData.title) {
      return { success: false, error: 'Title is required' };
    }

    const ideasRef = collection(db, 'youth', userId, 'businessIdeas');

    const newIdea = {
      title: ideaData.title,
      description: ideaData.description || '',
      industry: ideaData.industry || '',
      problemSolved: ideaData.problemSolved || '',
      targetMarket: ideaData.targetMarket || '',
      revenueModel: ideaData.revenueModel || '',
      fundingNeeded: ideaData.fundingNeeded || null,
      stage: ideaData.stage || 'idea',
      status: ideaData.status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      comments: [],
    };

    const docRef = await addDoc(ideasRef, newIdea);

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.businessIdeasCount': increment(1),
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
      // Don't fail the main operation
    }

    // Log activity
    logYouthActivity(userId, {
      type: 'business_idea',
      description: `New business idea created: ${ideaData.title}`,
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return {
      success: true,
      id: docRef.id,
      data: { ...newIdea, id: docRef.id, createdAt: new Date() },
    };
  } catch (error) {
    console.error('Error creating business idea:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. You may only create ideas in your own profile.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Update business idea
 */
export const updateBusinessIdea = async (userId, ideaId, updates) => {
  try {
    if (!userId || !ideaId) {
      return { success: false, error: 'User ID and Idea ID are required' };
    }

    const ideaRef = doc(db, 'youth', userId, 'businessIdeas', ideaId);

    updates.updatedAt = serverTimestamp();

    await updateDoc(ideaRef, updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating business idea:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. You may only update your own ideas.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Delete business idea
 */
export const deleteBusinessIdea = async (userId, ideaId) => {
  try {
    if (!userId || !ideaId) {
      return { success: false, error: 'User ID and Idea ID are required' };
    }

    const ideaRef = doc(db, 'youth', userId, 'businessIdeas', ideaId);

    await deleteDoc(ideaRef);

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.businessIdeasCount': increment(-1),
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting business idea:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. You may only delete your own ideas.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

// ==================== FUNDING APPLICATIONS MANAGEMENT ====================

/**
 * Get all funding applications for a youth
 */
export const getFundingApplications = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const applicationsRef = collection(db, 'youth', userId, 'fundingApplications');
    const q = query(applicationsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const applications = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
        submittedAt: data.submittedAt?.toDate?.() || null,
        reviewedAt: data.reviewedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: applications };
  } catch (error) {
    console.error('Error fetching funding applications:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true, data: [] };
    }

    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Create a new funding application
 */
export const createFundingApplication = async (userId, applicationData) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    if (!applicationData.programName) {
      return { success: false, error: 'Program name is required' };
    }

    const applicationsRef = collection(db, 'youth', userId, 'fundingApplications');

    const newApplication = {
      ...applicationData,
      status: 'pending',
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reviewedBy: null,
      reviewedAt: null,
      comments: [],
    };

    const docRef = await addDoc(applicationsRef, newApplication);

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.fundingApplicationsCount': increment(1),
        lookingForFunding: false,
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
    }

    // Log activity
    logYouthActivity(userId, {
      type: 'funding_application',
      description: `Funding application submitted: ${applicationData.programName}`,
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating funding application:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permission denied. You may only create applications in your own profile.',
        permissionDenied: true,
      };
    }

    return { success: false, error: error.message };
  }
};

// ==================== MENTORSHIP MANAGEMENT ====================

/**
 * Get mentorship connections
 */
export const getMentorshipConnections = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const mentorshipsRef = collection(db, 'youth', userId, 'mentorships');
    const q = query(mentorshipsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const mentorships = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null,
        requestedAt: data.requestedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: mentorships };
  } catch (error) {
    console.error('Error fetching mentorship connections:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true, data: [] };
    }

    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Request mentorship
 */
export const requestMentorship = async (userId, mentorId, requestData) => {
  try {
    if (!userId || !mentorId) {
      return { success: false, error: 'User ID and Mentor ID are required' };
    }

    const mentorshipRef = collection(db, 'youth', userId, 'mentorships');

    const request = {
      mentorId,
      status: 'pending',
      message: requestData.message || '',
      goals: requestData.goals || [],
      requestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(mentorshipRef, request);

    // Also add to mentor's requests
    try {
      const mentorRequestsRef = collection(db, 'mentors', mentorId, 'mentorshipRequests');
      await addDoc(mentorRequestsRef, {
        youthId: userId,
        youthName: requestData.youthName || 'A youth entrepreneur',
        status: 'pending',
        requestedAt: serverTimestamp(),
      });
    } catch (mentorError) {
      console.warn('Failed to create mentor request:', mentorError);
      // Don't fail the main operation
    }

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.mentorshipSessionsCount': increment(1),
        lookingForMentor: false,
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
    }

    // Log activity
    logYouthActivity(userId, {
      type: 'mentorship_request',
      description: 'Mentorship requested',
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error requesting mentorship:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true };
    }

    return { success: false, error: error.message };
  }
};

// ==================== TRAINING MANAGEMENT ====================

/**
 * Get completed trainings
 */
export const getCompletedTrainings = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const trainingsRef = collection(db, 'youth', userId, 'completedTrainings');
    const q = query(trainingsRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const trainings = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        completedAt: data.completedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: trainings };
  } catch (error) {
    console.error('Error fetching completed trainings:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true, data: [] };
    }

    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Enroll in training
 */
export const enrollInTraining = async (userId, trainingId, trainingData) => {
  try {
    if (!userId || !trainingId) {
      return { success: false, error: 'User ID and Training ID are required' };
    }

    const enrollmentsRef = collection(db, 'youth', userId, 'enrollments');

    const enrollment = {
      trainingId,
      trainingTitle: trainingData.title || 'Training',
      enrolledAt: serverTimestamp(),
      status: 'enrolled',
      progress: 0,
    };

    await addDoc(enrollmentsRef, enrollment);

    // Log activity
    logYouthActivity(userId, {
      type: 'training_enrollment',
      description: `Enrolled in: ${trainingData.title || 'Training'}`,
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return { success: true };
  } catch (error) {
    console.error('Error enrolling in training:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true };
    }

    return { success: false, error: error.message };
  }
};

// ==================== ACHIEVEMENTS MANAGEMENT ====================

/**
 * Get achievements
 */
export const getAchievements = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const achievementsRef = collection(db, 'youth', userId, 'achievements');
    const q = query(achievementsRef, orderBy('earnedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const achievements = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        earnedAt: data.earnedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: achievements };
  } catch (error) {
    console.error('Error fetching achievements:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true, data: [] };
    }

    return { success: false, error: error.message, data: [] };
  }
};

// ==================== ACTIVITY LOGGING ====================

/**
 * Log youth activity - internal use only
 */
const logYouthActivity = async (userId, activity) => {
  try {
    if (!userId) return { success: false, error: 'User ID is required' };

    const activitiesRef = collection(db, 'youth', userId, 'activities');

    await addDoc(activitiesRef, activity);

    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - this is a non-critical operation
    return { success: false, error: error.message };
  }
};

/**
 * Get recent activities - public method
 */
export const getRecentActivities = async (userId, limitCount = 20) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const activitiesRef = collection(db, 'youth', userId, 'activities');
    const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const activities = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.() || null,
      };
    });

    return { success: true, data: activities };
  } catch (error) {
    console.error('Error fetching activities:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true, data: [] };
    }

    return { success: false, error: error.message, data: [] };
  }
};

// ==================== DASHBOARD STATS ====================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const youthRef = doc(db, 'youth', userId);
    const youthSnap = await getDoc(youthRef);

    if (!youthSnap.exists()) {
      return { success: false, error: 'Profile not found' };
    }

    const youthData = youthSnap.data();

    // Get counts from subcollections with error handling for each
    let ideasCount = 0;
    let applicationsCount = 0;
    let mentorshipsCount = 0;
    let trainingsCount = 0;
    let activitiesCount = 0;

    try {
      const ideasSnap = await getDocs(collection(db, 'youth', userId, 'businessIdeas'));
      ideasCount = ideasSnap.size;
    } catch (e) {
      console.warn('Could not fetch ideas count:', e);
    }

    try {
      const applicationsSnap = await getDocs(
        collection(db, 'youth', userId, 'fundingApplications')
      );
      applicationsCount = applicationsSnap.size;
    } catch (e) {
      console.warn('Could not fetch applications count:', e);
    }

    try {
      const mentorshipsSnap = await getDocs(collection(db, 'youth', userId, 'mentorships'));
      mentorshipsCount = mentorshipsSnap.size;
    } catch (e) {
      console.warn('Could not fetch mentorships count:', e);
    }

    try {
      const trainingsSnap = await getDocs(collection(db, 'youth', userId, 'completedTrainings'));
      trainingsCount = trainingsSnap.size;
    } catch (e) {
      console.warn('Could not fetch trainings count:', e);
    }

    try {
      const activitiesSnap = await getDocs(collection(db, 'youth', userId, 'activities'));
      activitiesCount = activitiesSnap.size;
    } catch (e) {
      console.warn('Could not fetch activities count:', e);
    }

    const stats = {
      profileViews: youthData.stats?.profileViews || 0,
      businessIdeasCount: ideasCount,
      fundingApplicationsCount: applicationsCount,
      mentorshipSessionsCount: mentorshipsCount,
      trainingsCompleted: trainingsCount,
      activitiesCount: activitiesCount,
      profileCompletion: youthData.profileCompletion || 0,
      lookingForMentor: youthData.lookingForMentor || false,
      lookingForFunding: youthData.lookingForFunding || false,
      lookingForPartners: youthData.lookingForPartners || false,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Increment profile view count
 */
export const incrementProfileView = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const youthRef = doc(db, 'youth', userId);
    await updateDoc(youthRef, {
      'stats.profileViews': increment(1),
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing profile views:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'Permission denied', permissionDenied: true };
    }

    return { success: false, error: error.message };
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Calculate profile completion percentage
 */
const calculateProfileCompletion = (profileData) => {
  const fields = [
    profileData.businessName,
    profileData.businessIndustry,
    profileData.businessDescription,
    profileData.skills?.length > 0,
    profileData.profilePhoto,
    profileData.businessStage,
    profileData.lookingForMentor !== undefined,
    profileData.lookingForFunding !== undefined,
    profileData.lookingForPartners !== undefined,
    profileData.interests?.length > 0,
    profileData.phone,
    profileData.address?.city,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

/**
 * Subscribe to youth profile updates
 */
export const subscribeToYouthProfile = (userId, onUpdate, onError) => {
  if (!userId) {
    if (onError) onError(new Error('User ID is required'));
    return () => {};
  }

  const youthRef = doc(db, 'youth', userId);

  return onSnapshot(
    youthRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Profile subscription error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribe to business ideas updates
 */
export const subscribeToBusinessIdeas = (userId, onUpdate, onError) => {
  if (!userId) {
    if (onError) onError(new Error('User ID is required'));
    return () => {};
  }

  const ideasRef = collection(db, 'youth', userId, 'businessIdeas');
  const q = query(ideasRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const ideas = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
        };
      });
      onUpdate(ideas);
    },
    (error) => {
      console.error('Business ideas subscription error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Search for funding opportunities (public collection)
 */
export const searchFundingOpportunities = async (filters = {}) => {
  try {
    const opportunitiesRef = collection(db, 'fundingOpportunities');
    let q = query(opportunitiesRef, where('status', '==', 'active'));

    if (filters.industry) {
      q = query(q, where('industry', '==', filters.industry));
    }

    if (filters.minAmount) {
      q = query(q, where('maxAmount', '>=', filters.minAmount));
    }

    if (filters.deadline) {
      q = query(q, where('deadline', '>=', filters.deadline));
    }

    const querySnapshot = await getDocs(q);
    const opportunities = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        deadline: data.deadline?.toDate?.() || null,
      };
    });

    return { success: true, data: opportunities };
  } catch (error) {
    console.error('Error searching funding opportunities:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ==================== NETWORK MANAGEMENT ====================

/**
 * Get network connections
 */
export const getNetworkConnections = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required', data: [] };
    }

    const connectionsRef = collection(db, 'youth', userId, 'networkConnections');
    const q = query(connectionsRef, orderBy('connectedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const connections = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        connectedAt: data.connectedAt?.toDate?.() || null,
      };
    });

    return { success: true, data: connections };
  } catch (error) {
    console.error('Error fetching network connections:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Connect with another user
 */
export const connectWithUser = async (userId, targetUserId, targetUserType) => {
  try {
    if (!userId || !targetUserId) {
      return { success: false, error: 'User ID and Target User ID are required' };
    }

    const connectionsRef = collection(db, 'youth', userId, 'networkConnections');

    const connection = {
      targetUserId,
      targetUserType: targetUserType || 'unknown',
      status: 'connected',
      connectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(connectionsRef, connection);

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.networkCount': increment(1),
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
    }

    // Log activity
    logYouthActivity(userId, {
      type: 'network_connection',
      description: `Connected with a new ${targetUserType || 'user'}`,
      timestamp: serverTimestamp(),
    }).catch((err) => console.warn('Failed to log activity:', err));

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error connecting with user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove network connection
 */
export const removeNetworkConnection = async (userId, connectionId) => {
  try {
    if (!userId || !connectionId) {
      return { success: false, error: 'User ID and Connection ID are required' };
    }

    const connectionRef = doc(db, 'youth', userId, 'networkConnections', connectionId);
    await deleteDoc(connectionRef);

    // Update stats
    try {
      const youthRef = doc(db, 'youth', userId);
      await updateDoc(youthRef, {
        'stats.networkCount': increment(-1),
      });
    } catch (statsError) {
      console.warn('Failed to update stats:', statsError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing network connection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Search for mentors (public collection)
 */
export const searchMentors = async (filters = {}) => {
  try {
    const mentorsRef = collection(db, 'mentors');
    let q = query(mentorsRef, where('isAvailable', '==', true));

    if (filters.industry) {
      q = query(q, where('industries', 'array-contains', filters.industry));
    }

    if (filters.expertise) {
      q = query(q, where('expertise', 'array-contains', filters.expertise));
    }

    const querySnapshot = await getDocs(q);
    const mentors = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: mentors };
  } catch (error) {
    console.error('Error searching mentors:', error);
    return { success: false, error: error.message, data: [] };
  }
};

export default {
  getYouthProfile,
  createYouthProfile,
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
  getNetworkConnections, // Added
  connectWithUser, // Added
  removeNetworkConnection, // Added
  getRecentActivities,
  getDashboardStats,
  incrementProfileView,
  subscribeToYouthProfile,
  subscribeToBusinessIdeas,
  searchFundingOpportunities,
  searchMentors,
};
