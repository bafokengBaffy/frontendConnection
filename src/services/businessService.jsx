/* eslint-disable no-undef */
// src/services/businessService.jsx
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

/**
 * Business Service
 * Handles all business-related operations with Firebase Firestore
 */
class BusinessService {
  constructor() {
    this.collectionName = 'businesses';
    this.canvasCollectionName = 'businessCanvases';
  }

  /**
   * Create a new business
   * @param {Object} businessData - Business data
   * @returns {Promise<string>} - Business ID
   */
  async createBusiness(businessData) {
    try {
      const businessesRef = collection(db, this.collectionName);
      const docRef = await addDoc(businessesRef, {
        ...businessData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        viewCount: 0,
        applicationCount: 0,
      });

      logger.info('Business created successfully', { businessId: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error('Error creating business:', error);
      throw new Error('Failed to create business');
    }
  }

  /**
   * Get business by ID
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} - Business data
   */
  async getBusiness(businessId) {
    try {
      const businessRef = doc(db, this.collectionName, businessId);
      const businessSnap = await getDoc(businessRef);

      if (!businessSnap.exists()) {
        throw new Error('Business not found');
      }

      return {
        id: businessSnap.id,
        ...businessSnap.data(),
      };
    } catch (error) {
      logger.error('Error getting business:', error);
      throw new Error('Failed to get business');
    }
  }

  /**
   * Update business
   * @param {string} businessId - Business ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateBusiness(businessId, updates) {
    try {
      const businessRef = doc(db, this.collectionName, businessId);
      await updateDoc(businessRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      logger.info('Business updated successfully', { businessId });
    } catch (error) {
      logger.error('Error updating business:', error);
      throw new Error('Failed to update business');
    }
  }

  /**
   * Delete business
   * @param {string} businessId - Business ID
   * @returns {Promise<void>}
   */
  async deleteBusiness(businessId) {
    try {
      const businessRef = doc(db, this.collectionName, businessId);
      await deleteDoc(businessRef);

      logger.info('Business deleted successfully', { businessId });
    } catch (error) {
      logger.error('Error deleting business:', error);
      throw new Error('Failed to delete business');
    }
  }

  /**
   * Get businesses by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of businesses
   */
  async getUserBusinesses(userId) {
    try {
      const businessesRef = collection(db, this.collectionName);
      const q = query(
        businessesRef,
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      logger.error('Error getting user businesses:', error);
      throw new Error('Failed to get user businesses');
    }
  }

  /**
   * Search businesses
   * @param {Object} filters - Search filters
   * @param {string} searchTerm - Search term
   * @param {number} resultsLimit - Limit results
   * @returns {Promise<Array>} - Array of businesses
   */
  async searchBusinesses(filters = {}, searchTerm = '', resultsLimit = 20) {
    try {
      const businessesRef = collection(db, this.collectionName);
      let constraints = [where('status', '==', 'active')];

      // Apply filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.stage) {
        constraints.push(where('stage', '==', filters.stage));
      }

      if (filters.industry) {
        constraints.push(where('industry', '==', filters.industry));
      }

      // Add search if provided
      if (searchTerm) {
        // Note: For production, implement proper search with Algolia or similar
        constraints.push(orderBy('name'));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      constraints.push(limit(resultsLimit));

      const q = query(businessesRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let businesses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Simple client-side search (replace with proper search in production)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        businesses = businesses.filter(
          (business) =>
            business.name?.toLowerCase().includes(term) ||
            business.description?.toLowerCase().includes(term) ||
            business.tags?.some((tag) => tag.toLowerCase().includes(term))
        );
      }

      return businesses;
    } catch (error) {
      logger.error('Error searching businesses:', error);
      throw new Error('Failed to search businesses');
    }
  }

  /**
   * Save business canvas
   * @param {string} businessId - Business ID
   * @param {Object} canvasData - Canvas data
   * @returns {Promise<void>}
   */
  async updateBusinessCanvas(businessId, canvasData) {
    try {
      const canvasRef = doc(db, this.canvasCollectionName, businessId);

      // Check if canvas exists
      const canvasSnap = await getDoc(canvasRef);

      if (canvasSnap.exists()) {
        // Update existing canvas
        await updateDoc(canvasRef, {
          ...canvasData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new canvas
        await addDoc(collection(db, this.canvasCollectionName), {
          id: businessId,
          ...canvasData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      logger.info('Business canvas updated successfully', { businessId });
    } catch (error) {
      logger.error('Error updating business canvas:', error);
      throw new Error('Failed to update business canvas');
    }
  }

  /**
   * Get business canvas
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} - Canvas data
   */
  async getBusinessCanvas(businessId) {
    try {
      const canvasRef = doc(db, this.canvasCollectionName, businessId);
      const canvasSnap = await getDoc(canvasRef);

      if (!canvasSnap.exists()) {
        // Return empty canvas template
        return {
          valueProposition: '',
          customerSegments: '',
          channels: '',
          customerRelationships: '',
          revenueStreams: '',
          keyResources: '',
          keyActivities: '',
          keyPartnerships: '',
          costStructure: '',
        };
      }

      return canvasSnap.data();
    } catch (error) {
      logger.error('Error getting business canvas:', error);
      throw new Error('Failed to get business canvas');
    }
  }

  /**
   * Increment business view count
   * @param {string} businessId - Business ID
   * @returns {Promise<void>}
   */
  async incrementViewCount(businessId) {
    try {
      const businessRef = doc(db, this.collectionName, businessId);
      await updateDoc(businessRef, {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      });
    } catch (error) {
      logger.error('Error incrementing view count:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get business analytics
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} - Analytics data
   */
  async getBusinessAnalytics(businessId) {
    try {
      const business = await this.getBusiness(businessId);
      const canvas = await this.getBusinessCanvas(businessId);

      // Calculate completion percentage
      const canvasSections = Object.values(canvas).filter(Boolean);
      const completionPercentage =
        canvasSections.length > 0
          ? Math.round(
              (canvasSections.filter((section) => section && section.length > 10).length / 9) * 100
            )
          : 0;

      return {
        viewCount: business.viewCount || 0,
        applicationCount: business.applicationCount || 0,
        canvasCompletion: completionPercentage,
        createdAt: business.createdAt,
        lastUpdated: business.updatedAt,
        status: business.status,
      };
    } catch (error) {
      logger.error('Error getting business analytics:', error);
      throw new Error('Failed to get business analytics');
    }
  }

  /**
   * Get recommended businesses for user
   * @param {string} userId - User ID
   * @param {number} recommendationsLimit - Limit recommendations
   * @returns {Promise<Array>} - Array of recommended businesses
   */
  async getRecommendedBusinesses(userId, recommendationsLimit = 6) {
    try {
      // Get user's businesses to understand their preferences
      const userBusinesses = await this.getUserBusinesses(userId);

      // Get all active businesses
      const businessesRef = collection(db, this.collectionName);
      const q = query(
        businessesRef,
        where('status', '==', 'active'),
        orderBy('viewCount', 'desc'),
        limit(recommendationsLimit * 2)
      );

      const querySnapshot = await getDocs(q);
      let businesses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out user's own businesses
      const userBusinessIds = new Set(userBusinesses.map((b) => b.id));
      businesses = businesses.filter((b) => !userBusinessIds.has(b.id));

      // Sort by relevance (simple implementation - enhance with ML in production)
      businesses.sort((a, b) => {
        // Prioritize businesses with similar categories/industries
        const aScore = (a.viewCount || 0) + (a.completionScore || 0);
        const bScore = (b.viewCount || 0) + (b.completionScore || 0);
        return bScore - aScore;
      });

      return businesses.slice(0, recommendationsLimit);
    } catch (error) {
      logger.error('Error getting recommended businesses:', error);
      throw new Error('Failed to get recommendations');
    }
  }
}

// Create and export singleton instance
export const businessService = new BusinessService();

// Also export individual functions for flexibility
export const {
  createBusiness,
  getBusiness,
  updateBusiness,
  deleteBusiness,
  getUserBusinesses,
  searchBusinesses,
  updateBusinessCanvas,
  getBusinessCanvas,
  incrementViewCount,
  getBusinessAnalytics,
  getRecommendedBusinesses,
} = businessService;

// Default export for convenience
export default businessService;
