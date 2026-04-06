/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '../config/firebase';

// Collection names
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';
const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';
const STUDENTS_COLLECTION = 'students';

// Helper functions
const safeDateConvert = (firebaseDate) => {
  if (!firebaseDate) return null;
  if (firebaseDate.toDate && typeof firebaseDate.toDate === 'function') {
    return firebaseDate.toDate();
  }
  if (firebaseDate instanceof Date) {
    return firebaseDate;
  }
  if (typeof firebaseDate === 'string') {
    return new Date(firebaseDate);
  }
  return null;
};

const getParticipantInfo = async (participantId, participantType) => {
  try {
    let collectionName = '';
    switch (participantType) {
      case 'company':
        collectionName = COMPANIES_COLLECTION;
        break;
      case 'student':
        collectionName = STUDENTS_COLLECTION;
        break;
      case 'admin':
        collectionName = USERS_COLLECTION;
        break;
      default:
        collectionName = USERS_COLLECTION;
    }

    const docRef = doc(db, collectionName, participantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: participantId,
        name: data.name || data.fullName || data.displayName || 'Unknown User',
        email: data.email || '',
        avatar: data.logo || data.profileImage || data.photoURL || '',
        role: data.userType || participantType,
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen ? safeDateConvert(data.lastSeen) : null,
      };
    }

    // Fallback to users collection
    const userRef = doc(db, USERS_COLLECTION, participantId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        id: participantId,
        name: userData.displayName || userData.fullName || 'Unknown User',
        email: userData.email || '',
        avatar: userData.photoURL || '',
        role: userData.userType || participantType,
        isOnline: userData.isOnline || false,
        lastSeen: userData.lastSeen ? safeDateConvert(userData.lastSeen) : null,
      };
    }

    return {
      id: participantId,
      name: 'Unknown User',
      email: '',
      avatar: '',
      role: participantType,
      isOnline: false,
      lastSeen: null,
    };
  } catch (error) {
    console.error('Error getting participant info:', error);
    return {
      id: participantId,
      name: 'Unknown User',
      email: '',
      avatar: '',
      role: participantType,
      isOnline: false,
      lastSeen: null,
    };
  }
};

// Main communication service
export const communicationService = {
  // ==================== CONVERSATION MANAGEMENT ====================

  // Create a new conversation
  async createConversation(participants, conversationData = {}) {
    try {
      const { currentUser, otherParticipants } = participants;

      if (!currentUser || !otherParticipants || otherParticipants.length === 0) {
        throw new Error('Invalid participants');
      }

      // Check if conversation already exists
      const existingConversation = await this.findExistingConversation(
        currentUser.id,
        otherParticipants
      );

      if (existingConversation) {
        return {
          success: true,
          conversation: existingConversation,
          isNew: false,
        };
      }

      // Create new conversation
      const conversation = {
        participants: [
          {
            id: currentUser.id,
            type: currentUser.type,
            joinedAt: serverTimestamp(),
            isAdmin: true,
            unreadCount: 0,
          },
          ...otherParticipants.map((p) => ({
            id: p.id,
            type: p.type,
            joinedAt: serverTimestamp(),
            isAdmin: false,
            unreadCount: 0,
          })),
        ],
        type: otherParticipants.length > 1 ? 'group' : 'direct',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        lastMessageAt: null,
        isActive: true,
        metadata: {
          createdBy: currentUser.id,
          ...conversationData.metadata,
        },
        name: conversationData.name || null,
        description: conversationData.description || null,
        avatar: conversationData.avatar || null,
      };

      const conversationRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversation);

      // Get participants info for response
      const enrichedParticipants = await Promise.all(
        conversation.participants.map(async (p) => {
          const info = await getParticipantInfo(p.id, p.type);
          return { ...p, ...info };
        })
      );

      const newConversation = {
        id: conversationRef.id,
        ...conversation,
        participants: enrichedParticipants,
      };

      return {
        success: true,
        conversation: newConversation,
        isNew: true,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Find existing conversation between participants
  async findExistingConversation(currentUserId, otherParticipants) {
    try {
      const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);

      // For direct messages (2 participants)
      if (otherParticipants.length === 1) {
        const otherParticipant = otherParticipants[0];

        // Query conversations where both participants exist
        const q1 = query(
          conversationsRef,
          where('participants', 'array-contains', {
            id: currentUserId,
            type: 'company', // Assuming company for now
          }),
          where('type', '==', 'direct')
        );

        const snapshot = await getDocs(q1);

        for (const docSnap of snapshot.docs) {
          const conversation = docSnap.data();
          const hasOtherParticipant = conversation.participants.some(
            (p) => p.id === otherParticipant.id && p.type === otherParticipant.type
          );

          if (hasOtherParticipant) {
            const enrichedParticipants = await Promise.all(
              conversation.participants.map(async (p) => {
                const info = await getParticipantInfo(p.id, p.type);
                return { ...p, ...info };
              })
            );

            return {
              id: docSnap.id,
              ...conversation,
              participants: enrichedParticipants,
              createdAt: safeDateConvert(conversation.createdAt),
              updatedAt: safeDateConvert(conversation.updatedAt),
              lastMessageAt: safeDateConvert(conversation.lastMessageAt),
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing conversation:', error);
      return null;
    }
  },

  // Get conversations for a user
  async getConversations(userId, userType = 'company', options = {}) {
    try {
      const { limitCount = 20, lastDoc = null } = options;

      const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);

      // Query conversations where user is a participant
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', {
          id: userId,
          type: userType,
        }),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const conversations = [];

      for (const docSnap of snapshot.docs) {
        const conversation = docSnap.data();

        // Enrich participants with their info
        const enrichedParticipants = await Promise.all(
          conversation.participants.map(async (p) => {
            const info = await getParticipantInfo(p.id, p.type);
            return { ...p, ...info };
          })
        );

        conversations.push({
          id: docSnap.id,
          ...conversation,
          participants: enrichedParticipants,
          createdAt: safeDateConvert(conversation.createdAt),
          updatedAt: safeDateConvert(conversation.updatedAt),
          lastMessageAt: safeDateConvert(conversation.lastMessageAt),
        });
      }

      return {
        success: true,
        conversations,
        hasMore: conversations.length === limitCount,
      };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return {
        success: false,
        error: error.message,
        conversations: [],
      };
    }
  },

  // Get single conversation by ID
  async getConversationById(conversationId, userId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        return { success: false, error: 'Conversation not found' };
      }

      const conversation = conversationSnap.data();

      // Check if user is a participant
      const isParticipant = conversation.participants.some((p) => p.id === userId);

      if (!isParticipant) {
        return { success: false, error: 'Access denied' };
      }

      // Enrich participants with their info
      const enrichedParticipants = await Promise.all(
        conversation.participants.map(async (p) => {
          const info = await getParticipantInfo(p.id, p.type);
          return { ...p, ...info };
        })
      );

      // Get last messages
      const messages = await this.getMessages(conversationId, { limitCount: 20 });

      return {
        success: true,
        conversation: {
          id: conversationSnap.id,
          ...conversation,
          participants: enrichedParticipants,
          createdAt: safeDateConvert(conversation.createdAt),
          updatedAt: safeDateConvert(conversation.updatedAt),
          lastMessageAt: safeDateConvert(conversation.lastMessageAt),
          messages: messages.success ? messages.messages : [],
        },
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update conversation
  async updateConversation(conversationId, updates) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return { success: false, error: error.message };
    }
  },

  // Add participant to conversation
  async addParticipant(conversationId, participant) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

      await updateDoc(conversationRef, {
        participants: arrayUnion({
          id: participant.id,
          type: participant.type,
          joinedAt: serverTimestamp(),
          isAdmin: false,
          unreadCount: 0,
        }),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding participant:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove participant from conversation
  async removeParticipant(conversationId, participantId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        return { success: false, error: 'Conversation not found' };
      }

      const conversation = conversationSnap.data();
      const participant = conversation.participants.find((p) => p.id === participantId);

      if (!participant) {
        return { success: false, error: 'Participant not found' };
      }

      await updateDoc(conversationRef, {
        participants: arrayRemove(participant),
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing participant:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark conversation as read
  async markConversationAsRead(conversationId, userId) {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        return { success: false, error: 'Conversation not found' };
      }

      const conversation = conversationSnap.data();
      const updatedParticipants = conversation.participants.map((p) => {
        if (p.id === userId) {
          return { ...p, unreadCount: 0 };
        }
        return p;
      });

      await updateDoc(conversationRef, {
        participants: updatedParticipants,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== MESSAGE MANAGEMENT ====================

  // Send a message
  async sendMessage(conversationId, messageData) {
    try {
      const { senderId, senderType, content, attachments = [], type = 'text' } = messageData;

      if (!content.trim() && attachments.length === 0) {
        return { success: false, error: 'Message content is required' };
      }

      // Create message
      const message = {
        conversationId,
        senderId,
        senderType,
        content: content.trim(),
        type,
        attachments,
        status: 'sent',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        readBy: [senderId],
        reactions: [],
      };

      // Add message to collection
      const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);

      // Update conversation
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update unread counts for other participants
      const conversationSnap = await getDoc(conversationRef);
      if (conversationSnap.exists()) {
        const conversation = conversationSnap.data();
        const updatedParticipants = conversation.participants.map((p) => {
          if (p.id !== senderId) {
            return { ...p, unreadCount: (p.unreadCount || 0) + 1 };
          }
          return p;
        });

        await updateDoc(conversationRef, {
          participants: updatedParticipants,
        });
      }

      // Get sender info for response
      const senderInfo = await getParticipantInfo(senderId, senderType);

      return {
        success: true,
        message: {
          id: messageRef.id,
          ...message,
          sender: senderInfo,
          createdAt: new Date(),
        },
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId, options = {}) {
    try {
      const { limitCount = 50, lastDoc = null } = options;

      const messagesRef = collection(db, MESSAGES_COLLECTION);
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const messages = [];

      for (const docSnap of snapshot.docs) {
        const message = docSnap.data();

        // Get sender info
        const senderInfo = await getParticipantInfo(message.senderId, message.senderType);

        messages.push({
          id: docSnap.id,
          ...message,
          sender: senderInfo,
          createdAt: safeDateConvert(message.createdAt),
          updatedAt: safeDateConvert(message.updatedAt),
        });
      }

      // Sort by date (oldest first for display)
      messages.sort((a, b) => a.createdAt - b.createdAt);

      return {
        success: true,
        messages,
        hasMore: messages.length === limitCount,
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  },

  // Update message
  async updateMessage(messageId, updates) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating message:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete message (soft delete)
  async deleteMessage(messageId, deletedBy) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
        deletedBy,
        content: '[Message deleted]',
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  },

  // Add reaction to message
  async addReaction(messageId, userId, reaction) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageSnap = await getDoc(messageRef);

      if (!messageSnap.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const message = messageSnap.data();
      const existingReactions = message.reactions || [];

      // Remove existing reaction from same user
      const filteredReactions = existingReactions.filter((r) => r.userId !== userId);

      // Add new reaction
      const updatedReactions = [
        ...filteredReactions,
        {
          userId,
          reaction,
          timestamp: serverTimestamp(),
        },
      ];

      await updateDoc(messageRef, {
        reactions: updatedReactions,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark message as read
  async markMessageAsRead(messageId, userId) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageSnap = await getDoc(messageRef);

      if (!messageSnap.exists()) {
        return { success: false, error: 'Message not found' };
      }

      const message = messageSnap.data();
      const readBy = message.readBy || [];

      if (!readBy.includes(userId)) {
        await updateDoc(messageRef, {
          readBy: [...readBy, userId],
          updatedAt: serverTimestamp(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  // Subscribe to conversation updates
  subscribeToConversations(userId, userType, callback) {
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);

    const q = query(
      conversationsRef,
      where('participants', 'array-contains', {
        id: userId,
        type: userType,
      }),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations = [];

      for (const docSnap of snapshot.docs) {
        const conversation = docSnap.data();

        // Enrich participants
        const enrichedParticipants = await Promise.all(
          conversation.participants.map(async (p) => {
            const info = await getParticipantInfo(p.id, p.type);
            return { ...p, ...info };
          })
        );

        conversations.push({
          id: docSnap.id,
          ...conversation,
          participants: enrichedParticipants,
          createdAt: safeDateConvert(conversation.createdAt),
          updatedAt: safeDateConvert(conversation.updatedAt),
          lastMessageAt: safeDateConvert(conversation.lastMessageAt),
        });
      }

      callback(conversations);
    });
  },

  // Subscribe to messages in a conversation
  subscribeToMessages(conversationId, callback) {
    const messagesRef = collection(db, MESSAGES_COLLECTION);

    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, async (snapshot) => {
      const messages = [];

      for (const docSnap of snapshot.docs) {
        const message = docSnap.data();

        // Get sender info
        const senderInfo = await getParticipantInfo(message.senderId, message.senderType);

        messages.push({
          id: docSnap.id,
          ...message,
          sender: senderInfo,
          createdAt: safeDateConvert(message.createdAt),
          updatedAt: safeDateConvert(message.updatedAt),
        });
      }

      callback(messages);
    });
  },

  // ==================== FILE UPLOAD ====================

  // Upload file to Firebase Storage
  async uploadFile(file, conversationId, senderId) {
    try {
      if (!file) {
        return { success: false, error: 'No file provided' };
      }

      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { success: false, error: 'File size must be less than 10MB' };
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'File type not supported' };
      }

      // Create file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${conversationId}/${senderId}/${timestamp}.${fileExtension}`;
      const filePath = `chat/${fileName}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        success: true,
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          url: downloadURL,
          storagePath: filePath,
        },
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ==================== SEARCH ====================

  // Search conversations
  async searchConversations(userId, searchTerm) {
    try {
      if (!searchTerm.trim()) {
        return { success: false, error: 'Search term required' };
      }

      const conversations = await this.getConversations(userId);
      if (!conversations.success) {
        return conversations;
      }

      const filteredConversations = conversations.conversations.filter((conv) => {
        // Search in conversation name
        if (conv.name && conv.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }

        // Search in participant names
        const participantNames = conv.participants
          .filter((p) => p.id !== userId)
          .map((p) => p.name.toLowerCase());

        if (participantNames.some((name) => name.includes(searchTerm.toLowerCase()))) {
          return true;
        }

        // Search in last message
        if (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }

        return false;
      });

      return {
        success: true,
        conversations: filteredConversations,
      };
    } catch (error) {
      console.error('Error searching conversations:', error);
      return {
        success: false,
        error: error.message,
        conversations: [],
      };
    }
  },

  // Search messages in conversation
  async searchMessages(conversationId, searchTerm) {
    try {
      if (!searchTerm.trim()) {
        return { success: false, error: 'Search term required' };
      }

      const messages = await this.getMessages(conversationId, { limitCount: 1000 });
      if (!messages.success) {
        return messages;
      }

      const filteredMessages = messages.messages.filter(
        (msg) => msg.content.toLowerCase().includes(searchTerm.toLowerCase()) && !msg.deleted
      );

      return {
        success: true,
        messages: filteredMessages,
      };
    } catch (error) {
      console.error('Error searching messages:', error);
      return {
        success: false,
        error: error.message,
        messages: [],
      };
    }
  },

  // ==================== STATISTICS ====================

  // Get conversation statistics
  async getConversationStats(userId) {
    try {
      const conversations = await this.getConversations(userId, 'company', { limitCount: 1000 });

      if (!conversations.success) {
        return conversations;
      }

      const totalConversations = conversations.conversations.length;
      const unreadConversations = conversations.conversations.filter(
        (conv) => conv.participants.find((p) => p.id === userId)?.unreadCount > 0
      ).length;

      const groupConversations = conversations.conversations.filter(
        (conv) => conv.type === 'group'
      ).length;

      const directConversations = totalConversations - groupConversations;

      return {
        success: true,
        stats: {
          totalConversations,
          unreadConversations,
          groupConversations,
          directConversations,
          totalMessages: 0, // Would need to calculate from messages
        },
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default communicationService;
