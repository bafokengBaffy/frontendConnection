/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { communicationService } from '../services/communicationService';

export const useCollaboration = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const unsubscribeRef = useRef({ conversations: null, messages: null });

  // Initialize collaboration
  const initialize = useCallback(async () => {
    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      
      // Load initial conversations
      const result = await communicationService.getConversations(
        currentUser.uid,
        userProfile.userType
      );

      if (result.success) {
        setConversations(result.conversations);
        
        // Calculate total unread count
        const totalUnread = result.conversations.reduce((sum, conv) => {
          const participant = conv.participants.find(p => p.id === currentUser.uid);
          return sum + (participant?.unreadCount || 0);
        }, 0);
        
        setUnreadCount(totalUnread);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  // Set up real-time subscriptions
  const setupSubscriptions = useCallback(() => {
    if (!currentUser || !userProfile) return;

    // Clean up existing subscriptions
    if (unsubscribeRef.current.conversations) {
      unsubscribeRef.current.conversations();
    }
    if (unsubscribeRef.current.messages) {
      unsubscribeRef.current.messages();
    }

    // Subscribe to conversations
    unsubscribeRef.current.conversations = communicationService.subscribeToConversations(
      currentUser.uid,
      userProfile.userType,
      (updatedConversations) => {
        setConversations(updatedConversations);
        
        // Update unread count
        const totalUnread = updatedConversations.reduce((sum, conv) => {
          const participant = conv.participants.find(p => p.id === currentUser.uid);
          return sum + (participant?.unreadCount || 0);
        }, 0);
        
        setUnreadCount(totalUnread);
      }
    );
  }, [currentUser, userProfile]);

  // Start conversation with a user
  const startConversation = useCallback(async (otherParticipant, conversationData = {}) => {
    if (!currentUser || !userProfile || !otherParticipant) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await communicationService.createConversation(
        {
          currentUser: {
            id: currentUser.uid,
            type: userProfile.userType
          },
          otherParticipants: [otherParticipant]
        },
        conversationData
      );

      if (result.success && result.isNew) {
        setConversations(prev => [result.conversation, ...prev]);
        setActiveConversation(result.conversation);
      } else if (result.success && !result.isNew) {
        setActiveConversation(result.conversation);
      }

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  // Create group conversation
  const createGroupConversation = useCallback(async (participants, groupData) => {
    if (!currentUser || !userProfile || !participants || participants.length === 0) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await communicationService.createConversation(
        {
          currentUser: {
            id: currentUser.uid,
            type: userProfile.userType
          },
          otherParticipants: participants
        },
        {
          type: 'group',
          ...groupData
        }
      );

      if (result.success && result.isNew) {
        setConversations(prev => [result.conversation, ...prev]);
        setActiveConversation(result.conversation);
      }

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [currentUser, userProfile]);

  // Send message
  const sendMessage = useCallback(async (content, attachments = [], type = 'text') => {
    if (!activeConversation || !currentUser || !userProfile) {
      return { success: false, error: 'No active conversation' };
    }

    if (!content.trim() && attachments.length === 0) {
      return { success: false, error: 'Message content required' };
    }

    try {
      setError(null);

      const result = await communicationService.sendMessage(
        activeConversation.id,
        {
          senderId: currentUser.uid,
          senderType: userProfile.userType,
          content,
          attachments,
          type
        }
      );

      if (result.success) {
        setMessages(prev => [...prev, result.message]);
        
        // Update conversation in list
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversation.id) {
            return {
              ...conv,
              lastMessage: content,
              lastMessageAt: new Date(),
              updatedAt: new Date()
            };
          }
          return conv;
        }));
      }

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [activeConversation, currentUser, userProfile]);

  // Load conversation messages
  const loadMessages = useCallback(async (conversationId, options = {}) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      
      const result = await communicationService.getMessages(conversationId, options);
      
      if (result.success) {
        setMessages(result.messages);
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Select conversation
  const selectConversation = useCallback(async (conversation) => {
    if (!conversation || !currentUser) return;

    // Mark as read
    await communicationService.markConversationAsRead(conversation.id, currentUser.uid);
    
    // Set active conversation
    setActiveConversation(conversation);
    
    // Load messages
    await loadMessages(conversation.id);
    
    // Set up message subscription
    if (unsubscribeRef.current.messages) {
      unsubscribeRef.current.messages();
    }
    
    unsubscribeRef.current.messages = communicationService.subscribeToMessages(
      conversation.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
      }
    );
  }, [currentUser, loadMessages]);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    if (!activeConversation || !currentUser) {
      return { success: false, error: 'No active conversation' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await communicationService.uploadFile(
        file,
        activeConversation.id,
        currentUser.uid
      );

      if (result.success) {
        // Send message with file attachment
        await sendMessage('', [result.file], 'file');
      }

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [activeConversation, currentUser, sendMessage]);

  // Search conversations
  const searchConversations = useCallback(async (searchTerm) => {
    if (!currentUser || !searchTerm.trim()) {
      return { success: false, error: 'Search term required' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await communicationService.searchConversations(
        currentUser.uid,
        searchTerm
      );

      return result;
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId, reaction) => {
    if (!currentUser || !messageId || !reaction) return;

    try {
      await communicationService.addReaction(
        messageId,
        currentUser.uid,
        reaction
      );
    } catch (error) {
      setError(error.message);
    }
  }, [currentUser]);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    if (!currentUser || !messageId) return;

    try {
      await communicationService.deleteMessage(
        messageId,
        currentUser.uid
      );
    } catch (error) {
      setError(error.message);
    }
  }, [currentUser]);

  // Update message
  const updateMessage = useCallback(async (messageId, content) => {
    if (!currentUser || !messageId || !content.trim()) return;

    try {
      await communicationService.updateMessage(messageId, {
        content,
        edited: true,
        editedAt: new Date().toISOString()
      });
    } catch (error) {
      setError(error.message);
    }
  }, [currentUser]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clean up subscriptions
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current.conversations) {
      unsubscribeRef.current.conversations();
    }
    if (unsubscribeRef.current.messages) {
      unsubscribeRef.current.messages();
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
    setupSubscriptions();

    return () => {
      cleanup();
    };
  }, [initialize, setupSubscriptions, cleanup]);

  return {
    // State
    loading,
    error,
    conversations,
    activeConversation,
    messages,
    unreadCount,
    onlineUsers,
    
    // Actions
    initialize,
    startConversation,
    createGroupConversation,
    sendMessage,
    selectConversation,
    uploadFile,
    searchConversations,
    addReaction,
    deleteMessage,
    updateMessage,
    clearError,
    
    // Utilities
    hasActiveConversation: !!activeConversation,
    getOtherParticipant: activeConversation ? 
      activeConversation.participants.find(p => p.id !== currentUser?.uid) : null
  };
};