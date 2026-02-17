/* eslint-disable no-unused-vars */
import {
  getCurrentCompanyId,
  safeConvertFirebaseData,
  handleServiceError,
  COLLECTIONS,
  generateUniqueId,
  formatFileSize,
  validateEmail
} from '../utils/baseService';
import { db, storage, auth } from '../../../config/firebase';
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
  writeBatch,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

// ============================
// TEAM MANAGEMENT SERVICE
// ============================
export const teamService = {
  async getTeamMembers(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const { 
        role = 'all',
        status = 'active',
        sortBy = 'joinedAt',
        sortOrder = 'desc'
      } = filters;
      
      const teamRef = collection(db, COLLECTIONS.COMPANY_TEAM);
      let q = query(
        teamRef,
        where('companyId', '==', companyId),
        orderBy(sortBy, sortOrder)
      );
      
      if (role !== 'all') {
        q = query(q, where('role', '==', role));
      }
      
      if (status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      const snapshot = await getDocs(q);
      const teamMembers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data())
      }));
      
      return {
        success: true,
        data: teamMembers,
        stats: this.calculateTeamStats(teamMembers)
      };
    } catch (error) {
      return handleServiceError(error, 'getTeamMembers');
    }
  },
  
  async addTeamMember(memberData) {
    try {
      const companyId = getCurrentCompanyId();
      
      // Validate member data
      const validation = this.validateTeamMemberData(memberData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Create team member record
      const teamRef = collection(db, COLLECTIONS.COMPANY_TEAM);
      const teamMember = {
        companyId,
        ...memberData,
        status: 'pending',
        joinedAt: serverTimestamp(),
        metadata: {
          invitedBy: companyId,
          invitedAt: serverTimestamp()
        }
      };
      
      const docRef = await addDoc(teamRef, teamMember);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...teamMember,
          invitationSent: true
        }
      };
    } catch (error) {
      return handleServiceError(error, 'addTeamMember');
    }
  },
  
  async updateTeamMember(memberId, updates) {
    try {
      const companyId = getCurrentCompanyId();
      const memberRef = doc(db, COLLECTIONS.COMPANY_TEAM, memberId);
      const memberSnap = await getDoc(memberRef);
      
      if (!memberSnap.exists()) {
        return { success: false, error: 'Team member not found' };
      }
      
      const currentData = memberSnap.data();
      
      // Check permissions
      if (currentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }
      
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(memberRef, updatedData);
      
      return {
        success: true,
        data: {
          id: memberId,
          ...currentData,
          ...updatedData
        }
      };
    } catch (error) {
      return handleServiceError(error, 'updateTeamMember');
    }
  },
  
  validateTeamMemberData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name is required');
    }
    
    if (!data.email || !validateEmail(data.email)) {
      errors.push('Valid email is required');
    }
    
    if (!data.role || !['admin', 'recruiter', 'hiring_manager', 'interviewer', 'viewer'].includes(data.role)) {
      errors.push('Valid role is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  calculateTeamStats(teamMembers) {
    const stats = {
      total: teamMembers.length,
      active: teamMembers.filter(m => m.status === 'active').length,
      pending: teamMembers.filter(m => m.status === 'pending').length,
      byRole: {},
      byDepartment: {}
    };
    
    teamMembers.forEach(member => {
      const role = member.role || 'unknown';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      
      const department = member.department || 'unknown';
      stats.byDepartment[department] = (stats.byDepartment[department] || 0) + 1;
    });
    
    return stats;
  }
};

// ============================
// DOCUMENTS SERVICE
// ============================
export const documentsService = {
  async getDocuments(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const { 
        category = 'all',
        type = 'all',
        status = 'active',
        sortBy = 'uploadedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = filters;
      
      const docsRef = collection(db, COLLECTIONS.COMPANY_DOCUMENTS);
      let q = query(
        docsRef,
        where('companyId', '==', companyId),
        orderBy(sortBy, sortOrder)
      );
      
      if (category !== 'all') {
        q = query(q, where('category', '==', category));
      }
      
      if (type !== 'all') {
        q = query(q, where('type', '==', type));
      }
      
      if (status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      const snapshot = await getDocs(q);
      const total = snapshot.size;
      const offset = (page - 1) * limit;
      
      const documents = [];
      snapshot.forEach((doc, index) => {
        if (index >= offset && index < offset + limit) {
          const data = safeConvertFirebaseData(doc.data());
          documents.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      const hasMore = offset + documents.length < total;
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: {
          documents,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore
          },
          stats: this.calculateDocumentStats(documents)
        }
      };
    } catch (error) {
      return handleServiceError(error, 'getDocuments');
    }
  },
  
  async uploadDocument(file, metadata = {}) {
    try {
      const companyId = getCurrentCompanyId();
      
      // Validate file
      const validation = this.validateDocument(file, metadata.type);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }
      
      // Upload to storage
      const timestamp = Date.now();
      const storagePath = `company_documents/${companyId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create document record
      const docsRef = collection(db, COLLECTIONS.COMPANY_DOCUMENTS);
      const documentData = {
        companyId,
        name: metadata.name || file.name,
        description: metadata.description || '',
        category: metadata.category || 'general',
        type: metadata.type || this.getFileType(file),
        tags: metadata.tags || [],
        accessLevel: metadata.accessLevel || 'private',
        status: 'active',
        downloadURL,
        storagePath,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(docsRef, documentData);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...documentData
        }
      };
    } catch (error) {
      return handleServiceError(error, 'uploadDocument');
    }
  },
  
  async updateDocument(documentId, updates) {
    try {
      const companyId = getCurrentCompanyId();
      const docRef = doc(db, COLLECTIONS.COMPANY_DOCUMENTS, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Document not found' };
      }
      
      const currentData = docSnap.data();
      
      // Check permissions
      if (currentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }
      
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
      
      return {
        success: true,
        data: {
          id: documentId,
          ...currentData,
          ...updatedData
        }
      };
    } catch (error) {
      return handleServiceError(error, 'updateDocument');
    }
  },
  
  async deleteDocument(documentId) {
    try {
      const companyId = getCurrentCompanyId();
      const docRef = doc(db, COLLECTIONS.COMPANY_DOCUMENTS, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { success: false, error: 'Document not found' };
      }
      
      const documentData = docSnap.data();
      
      // Check permissions
      if (documentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }
      
      // Delete from storage
      if (documentData.storagePath) {
        try {
          const storageRef = ref(storage, documentData.storagePath);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.warn('Could not delete from storage:', storageError);
        }
      }
      
      // Soft delete
      await updateDoc(docRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'deleteDocument');
    }
  },
  
  validateDocument(file, docType) {
    const errors = [];
    const maxSize = 50 * 1024 * 1024;
    
    const allowedTypes = {
      pdf: ['application/pdf'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      document: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    };
    
    if (file.size > maxSize) {
      errors.push(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
    }
    
    if (docType && allowedTypes[docType]) {
      if (!allowedTypes[docType].includes(file.type)) {
        errors.push(`Invalid file type for ${docType}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  getFileType(file) {
    const type = file.type;
    
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word')) return 'document';
    if (type.includes('excel') || type.includes('sheet')) return 'spreadsheet';
    if (type.includes('powerpoint')) return 'presentation';
    
    return 'other';
  },
  
  calculateDocumentStats(documents) {
    const stats = {
      total: documents.length,
      active: documents.filter(d => d.status === 'active').length,
      totalSize: 0,
      byType: {},
      byCategory: {}
    };
    
    documents.forEach(doc => {
      if (doc.fileSize) {
        stats.totalSize += doc.fileSize;
      }
      
      const fileType = doc.type || 'other';
      stats.byType[fileType] = (stats.byType[fileType] || 0) + 1;
      
      const category = doc.category || 'general';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });
    
    stats.formattedTotalSize = formatFileSize(stats.totalSize);
    
    return stats;
  }
};

// ============================
// SETTINGS SERVICE
// ============================
export const settingsService = {
  async getCompanySettings() {
    try {
      const companyId = getCurrentCompanyId();
      const settingsRef = collection(db, COLLECTIONS.COMPANY_SETTINGS);
      const q = query(
        settingsRef,
        where('companyId', '==', companyId)
      );
      
      const snapshot = await getDocs(q);
      let settings = {};
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        settings = safeConvertFirebaseData(doc.data());
        settings.id = doc.id;
      } else {
        settings = await this.createDefaultSettings(companyId);
      }
      
      return {
        success: true,
        data: settings
      };
    } catch (error) {
      return handleServiceError(error, 'getCompanySettings');
    }
  },
  
  async updateCompanySettings(updates) {
    try {
      const companyId = getCurrentCompanyId();
      const settingsRef = collection(db, COLLECTIONS.COMPANY_SETTINGS);
      const q = query(
        settingsRef,
        where('companyId', '==', companyId)
      );
      
      const snapshot = await getDocs(q);
      let docRef;
      
      if (!snapshot.empty) {
        docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } else {
        const newSettings = {
          companyId,
          ...updates,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        docRef = await addDoc(settingsRef, newSettings);
      }
      
      const updatedDoc = await getDoc(docRef);
      const updatedSettings = {
        id: updatedDoc.id,
        ...safeConvertFirebaseData(updatedDoc.data())
      };
      
      return {
        success: true,
        data: updatedSettings
      };
    } catch (error) {
      return handleServiceError(error, 'updateCompanySettings');
    }
  },
  
  async updateNotificationPreferences(preferences) {
    try {
      const updates = {
        notificationPreferences: preferences,
        updatedAt: serverTimestamp()
      };
      
      return await this.updateCompanySettings(updates);
    } catch (error) {
      return handleServiceError(error, 'updateNotificationPreferences');
    }
  },
  
  async createDefaultSettings(companyId) {
    try {
      const settingsRef = collection(db, COLLECTIONS.COMPANY_SETTINGS);
      
      const defaultSettings = {
        companyId,
        notificationPreferences: {
          email: {
            newApplication: true,
            applicationStatusChange: true,
            interviewScheduled: true,
            interviewCancelled: true
          },
          push: {
            newApplication: true,
            interviewReminder: true,
            messageReceived: true
          },
          frequency: 'real-time'
        },
        generalSettings: {
          timezone: 'Africa/Maseru',
          dateFormat: 'DD/MM/YYYY',
          language: 'en'
        },
        securitySettings: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          loginNotifications: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(settingsRef, defaultSettings);
      
      return {
        id: docRef.id,
        ...defaultSettings
      };
    } catch (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }
  }
};