/* eslint-disable no-unused-vars */
import {
  getCurrentCompanyId,
  safeConvertFirebaseData,
  handleServiceError,
  COLLECTIONS,
  generateUniqueId,
  paginateResults
} from '../utils/baseService';
import { db, storage } from '../../../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// ============================
// FOLLOWERS SERVICE
// ============================
export const followersService = {
  async getFollowers(filters = {}, pagination = { page: 1, limit: 20 }) {
    try {
      const companyId = getCurrentCompanyId();
      const { status, sortBy = 'followedAt', sortOrder = 'desc' } = filters;
      const { page, limit: pageLimit } = pagination;
      
      const followersRef = collection(db, COLLECTIONS.COMPANY_FOLLOWERS);
      let q = query(
        followersRef,
        where('companyId', '==', companyId),
        orderBy(sortBy, sortOrder)
      );
      
      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      const snapshot = await getDocs(q);
      const followers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data())
      }));
      
      // Paginate results
      const paginated = paginateResults(followers, page, pageLimit);
      
      // Enrich with student data
      const enrichedFollowers = await Promise.all(
        paginated.data.map(async (follower) => {
          try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, follower.studentId);
            const studentSnap = await getDoc(studentRef);
            
            if (studentSnap.exists()) {
              follower.student = {
                id: studentSnap.id,
                ...safeConvertFirebaseData(studentSnap.data())
              };
            }
          } catch (error) {
            console.warn(`Could not fetch student ${follower.studentId}:`, error);
          }
          return follower;
        })
      );
      
      // Calculate stats
      const stats = this.calculateFollowerStats(followers);
      
      return {
        success: true,
        data: {
          followers: enrichedFollowers,
          pagination: paginated.pagination,
          stats
        }
      };
    } catch (error) {
      return handleServiceError(error, 'getFollowers');
    }
  },
  
  async addFollower(studentId) {
    try {
      const companyId = getCurrentCompanyId();
      
      // Check if already following
      const existingRef = collection(db, COLLECTIONS.COMPANY_FOLLOWERS);
      const existingQuery = query(
        existingRef,
        where('companyId', '==', companyId),
        where('studentId', '==', studentId)
      );
      
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        const followerDoc = existingSnap.docs[0];
        await updateDoc(doc(db, COLLECTIONS.COMPANY_FOLLOWERS, followerDoc.id), {
          status: 'active',
          updatedAt: serverTimestamp(),
          lastEngaged: serverTimestamp()
        });
        
        return {
          success: true,
          data: { id: followerDoc.id, action: 'updated' }
        };
      }
      
      // Create new follower
      const followersRef = collection(db, COLLECTIONS.COMPANY_FOLLOWERS);
      const followerData = {
        companyId,
        studentId,
        status: 'active',
        followedAt: serverTimestamp(),
        lastEngaged: serverTimestamp(),
        notifications: true,
        tags: [],
        source: 'platform'
      };
      
      const docRef = await addDoc(followersRef, followerData);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...followerData,
          action: 'created'
        }
      };
    } catch (error) {
      return handleServiceError(error, 'addFollower');
    }
  },
  
  async removeFollower(followerId) {
    try {
      const companyId = getCurrentCompanyId();
      const followerRef = doc(db, COLLECTIONS.COMPANY_FOLLOWERS, followerId);
      
      await updateDoc(followerRef, {
        status: 'inactive',
        unfollowedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'removeFollower');
    }
  },
  
  async sendBulkMessage(followerIds, message) {
    try {
      const companyId = getCurrentCompanyId();
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.data();
      
      // Create notifications
      const batch = writeBatch(db);
      const notificationsRef = collection(db, COLLECTIONS.COMPANY_NOTIFICATIONS);
      
      followerIds.forEach(followerId => {
        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, {
          id: notificationRef.id,
          companyId,
          followerId,
          type: 'company_message',
          title: `Message from ${companyData.name || 'Company'}`,
          message: message.content,
          read: false,
          createdAt: serverTimestamp(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      });
      
      await batch.commit();
      
      return {
        success: true,
        data: {
          sentTo: followerIds.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return handleServiceError(error, 'sendBulkMessage');
    }
  },
  
  calculateFollowerStats(followers) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let total = 0;
    let active = 0;
    let newThisWeek = 0;
    let newThisMonth = 0;
    let engagedThisMonth = 0;
    
    followers.forEach(follower => {
      total++;
      if (follower.status === 'active') active++;
      
      const followedDate = follower.followedAt || new Date(0);
      if (followedDate > oneWeekAgo) newThisWeek++;
      if (followedDate > oneMonthAgo) newThisMonth++;
      
      const lastEngaged = follower.lastEngaged || new Date(0);
      if (lastEngaged > oneMonthAgo) engagedThisMonth++;
    });
    
    return {
      total,
      active,
      newThisWeek,
      newThisMonth,
      engagedThisMonth,
      engagementRate: total > 0 ? Math.round((engagedThisMonth / total) * 100) : 0
    };
  },
  
  subscribeToFollowers(callback) {
    try {
      const companyId = getCurrentCompanyId();
      const followersRef = collection(db, COLLECTIONS.COMPANY_FOLLOWERS);
      const q = query(
        followersRef,
        where('companyId', '==', companyId),
        where('status', '==', 'active'),
        orderBy('followedAt', 'desc'),
        limit(50)
      );
      
      return onSnapshot(q, (snapshot) => {
        const followers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...safeConvertFirebaseData(doc.data())
        }));
        
        callback({
          success: true,
          data: followers,
          count: followers.length
        });
      }, (error) => {
        callback(handleServiceError(error, 'subscribeToFollowers'));
      });
    } catch (error) {
      return () => {};
    }
  }
};

// ============================
// CHAT SERVICE
// ============================
export const chatService = {
  async getConversations() {
    try {
      const companyId = getCurrentCompanyId();
      const chatsRef = collection(db, COLLECTIONS.COMPANY_CHAT_MESSAGES);
      
      const q = query(
        chatsRef,
        where('companyId', '==', companyId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const conversationsMap = new Map();
      
      snapshot.forEach(doc => {
        const data = safeConvertFirebaseData(doc.data());
        const studentId = data.studentId;
        
        if (!conversationsMap.has(studentId)) {
          conversationsMap.set(studentId, {
            studentId,
            lastMessage: data.message,
            lastMessageTime: data.timestamp,
            unreadCount: data.sender === 'student' && !data.read ? 1 : 0,
            messages: []
          });
        }
        
        const conversation = conversationsMap.get(studentId);
        conversation.messages.push({
          id: doc.id,
          ...data
        });
        
        if (data.sender === 'student' && !data.read) {
          conversation.unreadCount++;
        }
      });
      
      const conversations = Array.from(conversationsMap.values());
      
      // Enrich with student data
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, conv.studentId);
            const studentSnap = await getDoc(studentRef);
            
            if (studentSnap.exists()) {
              conv.student = {
                id: studentSnap.id,
                ...safeConvertFirebaseData(studentSnap.data())
              };
            }
          } catch (error) {
            console.warn(`Could not fetch student ${conv.studentId}:`, error);
          }
          return conv;
        })
      );
      
      // Sort by last message time
      enrichedConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      
      return {
        success: true,
        data: enrichedConversations,
        unreadTotal: enrichedConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
      };
    } catch (error) {
      return handleServiceError(error, 'getConversations');
    }
  },
  
  async getMessages(studentId, limitCount = 50) {
    try {
      const companyId = getCurrentCompanyId();
      const chatsRef = collection(db, COLLECTIONS.COMPANY_CHAT_MESSAGES);
      
      const q = query(
        chatsRef,
        where('companyId', '==', companyId),
        where('studentId', '==', studentId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data())
      }));
      
      // Mark messages as read
      await this.markMessagesAsRead(studentId);
      
      // Reverse to show oldest first
      messages.reverse();
      
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      return handleServiceError(error, 'getMessages');
    }
  },
  
  async sendMessage(studentId, message, attachments = []) {
    try {
      const companyId = getCurrentCompanyId();
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.data();
      
      // Upload attachments if any
      const uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const storagePath = `company_chats/${companyId}/${studentId}/${Date.now()}_${file.name}`;
          const storageRef = ref(storage, storagePath);
          
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            url: downloadURL,
            storagePath
          };
        })
      );
      
      // Create chat message
      const chatsRef = collection(db, COLLECTIONS.COMPANY_CHAT_MESSAGES);
      const messageData = {
        companyId,
        studentId,
        message: message.trim(),
        sender: 'company',
        senderName: companyData.name || 'Company',
        timestamp: serverTimestamp(),
        read: false,
        type: uploadedAttachments.length > 0 ? 'file' : 'text',
        attachments: uploadedAttachments
      };
      
      const docRef = await addDoc(chatsRef, messageData);
      
      // Create notification for student
      const notificationsRef = collection(db, 'student_notifications');
      await addDoc(notificationsRef, {
        studentId,
        type: 'company_message',
        title: `New message from ${companyData.name}`,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        data: {
          companyId,
          companyName: companyData.name,
          messageId: docRef.id
        },
        read: false,
        createdAt: serverTimestamp()
      });
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...messageData
        }
      };
    } catch (error) {
      return handleServiceError(error, 'sendMessage');
    }
  },
  
  async markMessagesAsRead(studentId) {
    try {
      const companyId = getCurrentCompanyId();
      const chatsRef = collection(db, COLLECTIONS.COMPANY_CHAT_MESSAGES);
      const q = query(
        chatsRef,
        where('companyId', '==', companyId),
        where('studentId', '==', studentId),
        where('sender', '==', 'student'),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });
      
      if (snapshot.size > 0) {
        await batch.commit();
      }
      
      return { success: true, marked: snapshot.size };
    } catch (error) {
      return handleServiceError(error, 'markMessagesAsRead');
    }
  },
  
  subscribeToChat(studentId, callback) {
    try {
      const companyId = getCurrentCompanyId();
      const chatsRef = collection(db, COLLECTIONS.COMPANY_CHAT_MESSAGES);
      const q = query(
        chatsRef,
        where('companyId', '==', companyId),
        where('studentId', '==', studentId),
        where('deleted', '!=', true),
        orderBy('timestamp', 'asc')
      );
      
      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...safeConvertFirebaseData(doc.data())
        }));
        
        callback({
          success: true,
          data: messages,
          count: messages.length
        });
      }, (error) => {
        callback(handleServiceError(error, 'subscribeToChat'));
      });
    } catch (error) {
      return () => {};
    }
  }
};

// ============================
// COMPANY BRANDING SERVICE
// ============================
export const companyBrandingService = {
  async getBrandingAssets() {
    try {
      const companyId = getCurrentCompanyId();
      const assetsRef = collection(db, COLLECTIONS.COMPANY_BRANDING_ASSETS);
      const q = query(
        assetsRef,
        where('companyId', '==', companyId),
        orderBy('uploadedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data())
      }));
      
      // Get company profile for branding info
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.exists() ? companySnap.data() : {};
      
      return {
        success: true,
        data: {
          assets,
          branding: {
            logo: companyData.logo || '',
            coverImage: companyData.coverImage || '',
            colors: companyData.brandColors || {
              primary: '#007bff',
              secondary: '#6c757d',
              accent: '#28a745'
            },
            tagline: companyData.tagline || '',
            mission: companyData.mission || '',
            values: companyData.values || []
          }
        }
      };
    } catch (error) {
      return handleServiceError(error, 'getBrandingAssets');
    }
  },
  
  async uploadBrandingAsset(file, assetType, metadata = {}) {
    try {
      const companyId = getCurrentCompanyId();
      
      // Validate file
      const validation = this.validateBrandingAsset(file, assetType);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Upload to storage
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const storagePath = `company_branding/${companyId}/${assetType}_${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save to Firestore
      const assetsRef = collection(db, COLLECTIONS.COMPANY_BRANDING_ASSETS);
      const assetData = {
        companyId,
        assetType,
        name: file.name,
        url: downloadURL,
        storagePath,
        fileType: file.type,
        fileSize: file.size,
        tags: metadata.tags || [],
        category: metadata.category || 'general',
        description: metadata.description || '',
        uploadedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(assetsRef, assetData);
      
      // Update company profile if this is a logo or cover image
      if (assetType === 'logo' || assetType === 'cover_image') {
        await this.updateCompanyBranding(assetType, downloadURL);
      }
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...assetData,
          downloadURL
        }
      };
    } catch (error) {
      return handleServiceError(error, 'uploadBrandingAsset');
    }
  },
  
  async updateBrandingSettings(settings) {
    try {
      const companyId = getCurrentCompanyId();
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      
      const updates = {
        ...settings,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(companyRef, updates);
      
      return {
        success: true,
        data: updates
      };
    } catch (error) {
      return handleServiceError(error, 'updateBrandingSettings');
    }
  },
  
  async deleteBrandingAsset(assetId) {
    try {
      const companyId = getCurrentCompanyId();
      const assetRef = doc(db, COLLECTIONS.COMPANY_BRANDING_ASSETS, assetId);
      const assetSnap = await getDoc(assetRef);
      
      if (!assetSnap.exists()) {
        return { success: false, error: 'Asset not found' };
      }
      
      const assetData = assetSnap.data();
      
      // Check permissions
      if (assetData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }
      
      // Delete from storage
      if (assetData.storagePath) {
        try {
          const storageRef = ref(storage, assetData.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Could not delete from storage:', storageError);
        }
      }
      
      // Delete from Firestore
      await deleteDoc(assetRef);
      
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'deleteBrandingAsset');
    }
  },
  
  validateBrandingAsset(file, assetType) {
    const errors = [];
    const maxSizes = {
      logo: 5 * 1024 * 1024,
      cover_image: 10 * 1024 * 1024,
      gallery: 5 * 1024 * 1024,
      document: 20 * 1024 * 1024
    };
    
    const allowedTypes = {
      logo: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
      cover_image: ['image/jpeg', 'image/jpg', 'image/png'],
      gallery: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      document: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    };
    
    if (!allowedTypes[assetType]?.includes(file.type)) {
      errors.push(`Invalid file type for ${assetType}`);
    }
    
    if (maxSizes[assetType] && file.size > maxSizes[assetType]) {
      errors.push(`File too large for ${assetType}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  async updateCompanyBranding(assetType, url) {
    try {
      const companyId = getCurrentCompanyId();
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      
      const updateData = {};
      if (assetType === 'logo') {
        updateData.logo = url;
      } else if (assetType === 'cover_image') {
        updateData.coverImage = url;
      }
      
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(companyRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating company branding:', error);
      throw error;
    }
  }
};