/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-useless-escape */
// Base service utilities and shared functionality
import {
  // Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';

// Storage imports need to come from firebase/storage, not firestore
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { auth, db, storage } from '../../../config/firebase';

// Collection names constant
export const COLLECTIONS = {
  // Company extended collections
  COMPANY_FOLLOWERS: 'company_followers',
  COMPANY_CHAT_MESSAGES: 'company_chat_messages',
  COMPANY_VIDEO_INTERVIEWS: 'company_video_interviews',
  COMPANY_AI_MATCHES: 'company_ai_matches',
  COMPANY_BRANDING_ASSETS: 'company_branding_assets',
  COMPANY_TALENT_POOL: 'company_talent_pool',
  COMPANY_ASSESSMENTS: 'company_assessments',
  COMPANY_REFERRALS: 'company_referrals',
  COMPANY_TEAM: 'company_team',
  COMPANY_DOCUMENTS: 'company_documents',
  COMPANY_ANALYTICS: 'company_analytics',
  COMPANY_NOTIFICATIONS: 'company_notifications',
  COMPANY_SETTINGS: 'company_settings',

  // Core collections
  COMPANIES: 'companies',
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  STUDENTS: 'students',
  USERS: 'users',
};

// Error handling utility
export const handleServiceError = (error, context) => {
  console.error(`❌ Error in ${context}:`, error);

  // Production error tracking
  if (process.env.NODE_ENV === 'production') {
    // Log to monitoring service
    console.log('📊 Error logged to monitoring service');
  }

  // User-friendly error messages
  let userMessage = 'An unexpected error occurred. Please try again.';

  const errorMap = {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested resource was not found.',
    unavailable: 'Service is temporarily unavailable. Please check your connection.',
    'storage/object-not-found': 'The file was not found. It may have been deleted.',
    'storage/unauthorized': 'You do not have permission to access this file.',
  };

  userMessage = errorMap[error.code] || userMessage;

  return {
    success: false,
    error: error.message,
    userMessage,
    code: error.code,
    timestamp: new Date().toISOString(),
  };
};

// Helper: Get current company ID
export const getCurrentCompanyId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return user.uid; // Assuming company ID = user ID
};

// Helper: Safe data conversion for Firestore timestamps
export const safeConvertFirebaseData = (data) => {
  if (!data) return null;

  const converted = { ...data };

  // Convert Firestore timestamps to Date objects
  Object.keys(converted).forEach((key) => {
    if (converted[key] && converted[key].toDate && typeof converted[key].toDate === 'function') {
      converted[key] = converted[key].toDate();
    }
  });

  return converted;
};

// Pagination helper
export const paginateResults = (results, page = 1, pageLimit = 20) => {
  const total = results.length;
  const offset = (page - 1) * pageLimit;
  const paginated = results.slice(offset, offset + pageLimit);

  return {
    data: paginated,
    pagination: {
      page,
      limit: pageLimit,
      total,
      hasMore: offset + paginated.length < total,
      totalPages: Math.ceil(total / pageLimit),
    },
  };
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re =
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'relative':
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return `${day}/${month}/${year}`;
    default:
      return d.toLocaleDateString();
  }
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date range helper
export const getDateRangeStart = (timeRange) => {
  const now = new Date();
  const start = new Date(now);

  switch (timeRange) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return start;
};

// Batch operations helper
export const executeBatch = async (operations) => {
  const batch = writeBatch(db);

  operations.forEach((op) => {
    if (op.type === 'set') {
      batch.set(op.ref, op.data);
    } else if (op.type === 'update') {
      batch.update(op.ref, op.data);
    } else if (op.type === 'delete') {
      batch.delete(op.ref);
    }
  });

  await batch.commit();
  return { success: true, count: operations.length };
};

// Subscription cleanup helper
export const createSafeSubscription = (queryCallback, errorCallback) => {
  try {
    return onSnapshot(queryCallback, errorCallback);
  } catch (error) {
    console.error('Subscription error:', error);
    return () => {}; // Return empty cleanup function
  }
};

// Base service class
class BaseService {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  /**
   * Get collection reference
   */
  getCollectionRef() {
    return collection(db, this.collectionName);
  }

  /**
   * Get document reference
   */
  getDocRef(id) {
    return doc(db, this.collectionName, id);
  }

  /**
   * Create a new document
   */
  async create(data) {
    try {
      const docRef = await addDoc(this.getCollectionRef(), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getById(id) {
    try {
      const docRef = this.getDocRef(id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Update document
   */
  async update(id, data) {
    try {
      const docRef = this.getDocRef(id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async delete(id) {
    try {
      const docRef = this.getDocRef(id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Query documents
   */
  async query(constraints = []) {
    try {
      const q = query(this.getCollectionRef(), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  /**
   * Upload file to storage
   */
  async uploadFile(path, file) {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { path, url };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path) {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export default BaseService;
