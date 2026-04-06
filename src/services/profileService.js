/* eslint-disable no-unused-vars */
// src/services/profileService.js
/**
 * Production-Ready Profile Service with Cloudinary & Firebase Storage Fallback
 * Mobile-optimized with offline support and progressive enhancement
 */

import { doc, getDoc, updateDoc, serverTimestamp, setDoc, arrayUnion } from 'firebase/firestore';
import { getAuth, updateProfile as updateAuthProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../config/firebase';

import { cloudinaryService } from './cloudinaryService';

class ProfileService {
  constructor() {
    this.auth = getAuth();
    this.storage = storage;
    this.maxRetries = 2;
  }

  // ==================== PROFILE CRUD OPERATIONS ====================

  async fetchProfile(userId, options = {}) {
    const { cacheFirst = true, refresh = false } = options;

    try {
      if (!userId) throw new Error('User ID is required');

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const normalizedData = this.normalizeProfileData(data);

        // Calculate profile completion
        normalizedData.profileCompletion = this.calculateProfileCompletion(normalizedData);

        return {
          success: true,
          data: normalizedData,
          message: 'Profile loaded successfully',
          timestamp: new Date().toISOString(),
        };
      }

      // Create initial profile if doesn't exist
      return await this.createInitialProfile(userId);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to load profile',
        code: 'PROFILE_FETCH_FAILED',
      };
    }
  }

  async createInitialProfile(userId) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const initialProfile = {
        fullName: user.displayName || '',
        email: user.email || '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        studentId: '',
        course: '',
        yearOfStudy: '',
        institution: '',
        skills: [],
        bio: '',
        careerGoals: '',
        resumeUrl: '',
        profilePhoto: '',
        profileCompletion: 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'student',
        userType: 'student',
        isProfileComplete: false,
        socialLinks: {
          linkedin: '',
          github: '',
          portfolio: '',
        },
        preferences: {
          notifications: true,
          emailUpdates: true,
          theme: 'light',
          language: 'en',
        },
        metadata: {
          lastActive: serverTimestamp(),
          deviceType: this.getDeviceType(),
          appVersion: process.env.REACT_APP_VERSION || '1.0.0',
        },
      };

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, initialProfile);

      return {
        success: true,
        data: initialProfile,
        message: 'Initial profile created',
      };
    } catch (error) {
      console.error('❌ Error creating initial profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create profile',
      };
    }
  }

  async updateProfile(userId, updates, options = {}) {
    const { validate = true, updateAuth = true, silent = false } = options;

    try {
      if (!userId) throw new Error('User ID is required');

      // Validate updates if requested
      if (validate) {
        const validation = this.validateProfile(updates);
        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors,
            message: 'Validation failed',
          };
        }
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        profileCompletion: this.calculateProfileCompletion(updates),
        'metadata.lastActive': serverTimestamp(),
      };

      // Update Firestore with batch support for multiple fields
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateData);

      // Update Firebase Auth if needed
      if (updateAuth && updates.fullName) {
        try {
          await updateAuthProfile(this.auth.currentUser, {
            displayName: updates.fullName,
            photoURL: updates.profilePhoto || this.auth.currentUser.photoURL,
          });
        } catch (authError) {
          console.warn('⚠️ Could not update auth profile:', authError);
        }
      }

      return {
        success: true,
        data: updateData,
        message: silent ? '' : 'Profile updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_FAILED',
      };
    }
  }

  async partialUpdate(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        'metadata.lastActive': serverTimestamp(),
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Partial update error:', error);
      return {
        success: false,
        error: error.message,
        code: 'PARTIAL_UPDATE_FAILED',
      };
    }
  }

  // ==================== FILE UPLOAD OPERATIONS ====================

  async uploadProfilePhoto(userId, file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024,
      optimize = true,
      useCloudinary = true,
      fallbackToFirebase = true,
    } = options;

    try {
      if (!file) throw new Error('No file provided');
      if (!userId) throw new Error('User ID is required');

      console.log('🔄 Starting profile photo upload:', {
        userId,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)}KB`,
        fileType: file.type,
      });

      // Validate file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload JPEG, PNG, or WebP images only');
      }

      if (file.size > maxSize) {
        throw new Error(`Image size must be less than ${maxSize / (1024 * 1024)}MB`);
      }

      let uploadResult;
      let storageType = 'none';

      // Try Cloudinary first if enabled
      if (useCloudinary) {
        try {
          const optimizedFile = optimize ? await this.optimizeImageForUpload(file) : file;

          uploadResult = await cloudinaryService.uploadImage(optimizedFile, {
            folder: `career-connect/users/${userId}/profile`,
            transformation: {
              width: 500,
              height: 500,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto:best',
              format: 'auto',
              responsive: true,
              dpr: 'auto',
            },
            tags: ['profile-photo', `user-${userId}`],
          });

          if (uploadResult.success) {
            storageType = 'cloudinary';
            console.log('✅ Cloudinary upload successful:', uploadResult.public_id);
          } else {
            throw new Error(uploadResult.error || 'Cloudinary upload failed');
          }
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary upload failed:', cloudinaryError.message);

          // Fallback to Firebase Storage if enabled
          if (fallbackToFirebase) {
            uploadResult = await this.uploadToFirebaseStorage(userId, file, 'profile-photos');
            storageType = 'firebase';
          } else {
            throw cloudinaryError;
          }
        }
      } else {
        // Direct to Firebase Storage
        uploadResult = await this.uploadToFirebaseStorage(userId, file, 'profile-photos');
        storageType = 'firebase';
      }

      // Update profile with new photo URL
      const updateData = {
        profilePhoto: uploadResult.url,
        profilePhotoUpdated: new Date().toISOString(),
      };

      if (storageType === 'cloudinary') {
        updateData.profilePhotoCloudinaryId = uploadResult.public_id;
        updateData.profilePhotoThumbnail = uploadResult.thumbnail_url;
      }

      if (storageType === 'firebase') {
        updateData.profilePhotoStoragePath = uploadResult.path;
      }

      const updateResult = await this.updateProfile(userId, updateData, { silent: true });

      return {
        success: true,
        url: uploadResult.url,
        storageType,
        thumbnailUrl: uploadResult.thumbnail_url || uploadResult.url,
        publicId: uploadResult.public_id,
        path: uploadResult.path,
        message: 'Profile photo uploaded successfully',
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          optimized: optimize,
          uploadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Profile photo upload error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to upload profile photo',
        code: 'PHOTO_UPLOAD_FAILED',
        storageType: 'none',
      };
    }
  }

  async uploadResume(userId, file) {
    try {
      if (!file) throw new Error('No file provided');

      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload PDF or Word documents only');
      }

      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Try Cloudinary first for documents
      let uploadResult;
      try {
        uploadResult = await cloudinaryService.uploadFile(file, {
          folder: `career-connect/users/${userId}/resumes`,
          resource_type: 'raw',
          tags: ['resume', `user-${userId}`],
          context: `filename=${file.name}|uploaded=${new Date().toISOString()}`,
        });

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }
      } catch (cloudinaryError) {
        console.warn(
          '⚠️ Cloudinary resume upload failed, falling back to Firebase:',
          cloudinaryError
        );
        uploadResult = await this.uploadToFirebaseStorage(userId, file, 'resumes');
      }

      // Update profile
      await this.updateProfile(userId, {
        resumeUrl: uploadResult.url,
        resumeFileName: file.name,
        resumeFileSize: file.size,
        resumeUploadedAt: new Date().toISOString(),
        resumeFileType: file.type,
        resumeStorageType: uploadResult.storageType || 'cloudinary',
      });

      return {
        success: true,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        message: 'Resume uploaded successfully',
        metadata: {
          uploadedAt: new Date().toISOString(),
          storageType: uploadResult.storageType || 'cloudinary',
        },
      };
    } catch (error) {
      console.error('❌ Resume upload error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to upload resume',
        code: 'RESUME_UPLOAD_FAILED',
      };
    }
  }

  async uploadDocument(userId, file, documentType, metadata = {}) {
    try {
      if (!file) throw new Error('No file provided');
      if (!documentType) throw new Error('Document type is required');

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${documentType}_${timestamp}_${safeFileName}`;

      // Determine storage based on file type
      let uploadResult;
      if (file.type.startsWith('image/')) {
        // Images to Cloudinary
        uploadResult = await cloudinaryService.uploadImage(file, {
          folder: `career-connect/users/${userId}/documents/${documentType}`,
          transformation: {
            quality: 'auto:good',
            format: 'auto',
          },
          tags: [documentType, 'document', `user-${userId}`],
          context: Object.entries(metadata)
            .map(([key, value]) => `${key}=${value}`)
            .join('|'),
        });
      } else {
        // Other files to Firebase
        uploadResult = await this.uploadToFirebaseStorage(
          userId,
          file,
          `documents/${documentType}`
        );
      }

      // Add to user's documents array
      const documentData = {
        id: `${documentType}_${timestamp}`,
        name: file.name,
        type: documentType,
        url: uploadResult.url,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        metadata: metadata,
        storageType: uploadResult.storageType || 'firebase',
        ...uploadResult,
      };

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        documents: arrayUnion(documentData),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        document: documentData,
        message: 'Document uploaded successfully',
      };
    } catch (error) {
      console.error('❌ Document upload error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to upload document',
      };
    }
  }

  async deleteProfilePhoto(userId, publicId) {
    try {
      // Delete from Cloudinary if publicId exists
      if (publicId) {
        const deleteResult = await cloudinaryService.deleteImage(publicId);
        if (!deleteResult.success) {
          console.warn('⚠️ Could not delete from Cloudinary:', deleteResult.error);
        }
      }

      // Update profile
      await this.updateProfile(userId, {
        profilePhoto: '',
        profilePhotoCloudinaryId: '',
        profilePhotoThumbnail: '',
        profilePhotoStoragePath: '',
      });

      return {
        success: true,
        message: 'Profile photo deleted successfully',
      };
    } catch (error) {
      console.error('❌ Error deleting profile photo:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ==================== STORAGE HELPERS ====================

  async uploadToFirebaseStorage(userId, file, folder) {
    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `users/${userId}/${folder}/${timestamp}_${safeFileName}`;
      const storageRef = ref(this.storage, filePath);

      console.log('📤 Uploading to Firebase Storage:', filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        customMetadata: {
          userId: userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          mimeType: file.type,
          size: file.size.toString(),
        },
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: filePath,
        storageType: 'firebase',
        snapshot: snapshot,
      };
    } catch (error) {
      console.error('❌ Firebase Storage upload error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  normalizeProfileData(data) {
    const defaults = {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      studentId: '',
      course: '',
      yearOfStudy: '',
      institution: '',
      skills: [],
      bio: '',
      careerGoals: '',
      resumeUrl: '',
      profilePhoto: '',
      profileCompletion: 0,
      socialLinks: {
        linkedin: '',
        github: '',
        portfolio: '',
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light',
        language: 'en',
      },
      metadata: {
        lastActive: null,
        deviceType: 'desktop',
        appVersion: '1.0.0',
      },
      documents: [],
    };

    return {
      ...defaults,
      ...data,
      skills: Array.isArray(data.skills) ? data.skills : [],
      documents: Array.isArray(data.documents) ? data.documents : [],
    };
  }

  validateProfile(profile) {
    const errors = {};

    // Required field validations
    if (!profile.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!profile.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(profile.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!profile.studentId?.trim()) {
      errors.studentId = 'Student ID is required';
    }

    if (!profile.institution?.trim()) {
      errors.institution = 'Institution is required';
    }

    if (!profile.course?.trim()) {
      errors.course = 'Course/program is required';
    }

    if (!profile.yearOfStudy) {
      errors.yearOfStudy = 'Year of study is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateEmail(email) {
    const emailRegex = /^[^.@]+@[^.@]+.[^.@]+$/;
    return emailRegex.test(email);
  }

  calculateProfileCompletion(profile) {
    if (!profile) return 0;

    let completion = 0;
    const fieldWeights = {
      personalInfo: {
        fields: ['fullName', 'email', 'phone', 'dateOfBirth', 'gender'],
        weight: 30,
      },
      academicInfo: {
        fields: ['studentId', 'course', 'institution', 'yearOfStudy'],
        weight: 30,
      },
      professionalInfo: {
        fields: ['skills', 'bio', 'careerGoals'],
        weight: 25,
      },
      documents: {
        fields: ['profilePhoto', 'resumeUrl'],
        weight: 15,
      },
    };

    Object.values(fieldWeights).forEach(({ fields, weight }) => {
      const completedFields = fields.filter((field) => {
        const value = profile[field];
        if (field === 'skills') return value && value.length > 0;
        if (field === 'profilePhoto' || field === 'resumeUrl') return !!value;
        return value && value.toString().trim() !== '';
      }).length;

      const sectionCompletion = (completedFields / fields.length) * weight;
      completion += sectionCompletion;
    });

    return Math.min(100, Math.round(completion));
  }

  async optimizeImageForUpload(file) {
    return new Promise((resolve) => {
      if (file.size <= 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Mobile-optimized dimensions (max 1200px)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw optimized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP for better compression
          canvas.toBlob(
            (blob) => {
              resolve(
                new File([blob], file.name.replace(/.[^/.]+$/, '') + '.webp', {
                  type: 'image/webp',
                  lastModified: Date.now(),
                })
              );
            },
            'image/webp',
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  getProfileCompletionBreakdown(profile) {
    if (!profile) return [];

    return [
      {
        label: 'Personal Information',
        completed: !!(profile.fullName && profile.email && profile.studentId),
      },
      {
        label: 'Academic Details',
        completed: !!(profile.institution && profile.course && profile.yearOfStudy),
      },
      {
        label: 'Contact Information',
        completed: !!(profile.phone || profile.address),
      },
      {
        label: 'Skills',
        completed: !!(profile.skills && profile.skills.length > 0),
      },
      {
        label: 'Resume',
        completed: !!profile.resumeUrl,
      },
      {
        label: 'Career Preferences',
        completed: !!(profile.jobType || profile.industryInterests),
      },
    ];
  }

  getDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'ios';
    }
    if (/tablet/i.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
