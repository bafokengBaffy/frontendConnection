/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Container, Row, Col, Card, ListGroup, Form, Button, Badge, 
  InputGroup, Spinner, Alert, Modal, Dropdown, OverlayTrigger, Tooltip,
  Image, ProgressBar, Offcanvas
} from 'react-bootstrap';
import { 
  FaSearch, FaPaperPlane, FaUsers, FaComment, FaBell, FaRegClock, 
  FaCheckDouble, FaRegUserCircle, FaEllipsisV, FaPhone, FaVideo,
  FaPaperclip, FaSmile, FaImage, FaFile, FaMicrophone, FaTimes,
  FaTrash, FaEdit, FaReply, FaForward, FaArchive, FaCog,
  FaExternalLinkAlt, FaUserPlus, FaUserFriends, FaInfoCircle,
  FaRegSmile, FaCamera, FaMapMarkerAlt, FaLink, FaShare,
  FaThumbsUp, FaHeart, FaLaugh, FaSadTear, FaAngry,
  FaRegThumbsUp, FaRegHeart, FaRegLaugh, FaRegSadTear, FaRegAngry,
  FaDownload, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute,
  FaStar, FaRegStar, FaFilter, FaSort, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt,
  FaSync, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight,
  FaBars, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useCollaboration } from '../../../hooks/useCollaboration';
import { communicationService } from '../../../services/communicationService';
import './CompanyChat.css';
import EmojiPicker from 'emoji-picker-react';

const CompanyChat = () => {
  const { currentUser, userProfile } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    unreadCount,
    startConversation,
    sendMessage,
    selectConversation,
    uploadFile,
    searchConversations,
    addReaction,
    deleteMessage,
    updateMessage,
    clearError,
    hasActiveConversation,
    getOtherParticipant
  } = useCollaboration();

  // State
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileInfoPanel, setShowMobileInfoPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter conversations
  useEffect(() => {
    if (!conversations.length) {
      setFilteredConversations([]);
      return;
    }

    let filtered = [...conversations];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(conv => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in conversation name
        if (conv.name?.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Search in participant names
        const participantNames = conv.participants
          .filter(p => p.id !== currentUser?.uid)
          .map(p => p.name.toLowerCase());
        
        if (participantNames.some(name => name.includes(searchLower))) {
          return true;
        }

        // Search in last message
        if (conv.lastMessage?.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    // Apply status filter
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conv => {
        const participant = conv.participants.find(p => p.id === currentUser?.uid);
        return participant?.unreadCount > 0;
      });
    } else if (activeFilter === 'group') {
      filtered = filtered.filter(conv => conv.type === 'group');
    } else if (activeFilter === 'direct') {
      filtered = filtered.filter(conv => conv.type === 'direct');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, activeFilter, sortOrder, currentUser]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format message time
  const formatMessageTime = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format conversation time
  const formatConversationTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const convDate = new Date(date);
    const diffMs = now - convDate;
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) {
      return convDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return convDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return convDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      let attachments = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const result = await uploadFile(file);
          if (result.success) {
            attachments.push(result.file);
          }
        }
        setSelectedFiles([]);
      }

      // Send message
      const result = await sendMessage(message, attachments);
      
      if (result.success) {
        setMessage('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} not supported`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setIsTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, []);

  // Get conversation display name
  const getConversationName = (conversation) => {
    if (conversation.name) return conversation.name;
    
    const otherParticipants = conversation.participants.filter(
      p => p.id !== currentUser?.uid
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    } else if (otherParticipants.length > 1) {
      return otherParticipants.map(p => p.name.split(' ')[0]).join(', ');
    }
    
    return 'Conversation';
  };

  // Get conversation avatar
  const getConversationAvatar = (conversation) => {
    if (conversation.avatar) return conversation.avatar;
    
    const otherParticipants = conversation.participants.filter(
      p => p.id !== currentUser?.uid
    );
    
    if (otherParticipants.length === 1) {
      return otherParticipants[0].avatar;
    }
    
    return null;
  };

  // Render message attachments
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="message-attachments mt-2">
        {attachments.map((attachment, index) => (
          <div key={index} className="attachment-item mb-2">
            {attachment.type.startsWith('image/') ? (
              <div className="image-attachment">
                <Image 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="img-fluid rounded"
                  style={{ maxWidth: '250px', maxHeight: '250px' }}
                  onClick={() => window.open(attachment.url, '_blank')}
                />
                <div className="attachment-info mt-1 small text-muted">
                  <FaImage className="me-1" />
                  {attachment.name}
                </div>
              </div>
            ) : (
              <div className="file-attachment p-2 border rounded">
                <div className="d-flex align-items-center">
                  <FaFile className="me-2" size={20} />
                  <div className="flex-grow-1">
                    <div className="small">{attachment.name}</div>
                    <div className="text-muted extra-small">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="p-0"
                  >
                    <FaDownload />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render message reactions
  const renderReactions = (reactions) => {
    if (!reactions || reactions.length === 0) return null;

    const groupedReactions = reactions.reduce((acc, reaction) => {
      acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="message-reactions mt-1">
        {Object.entries(groupedReactions).map(([reaction, count]) => (
          <Badge 
            key={reaction}
            bg="light" 
            text="dark" 
            className="me-1 reaction-badge"
          >
            {reaction} {count > 1 ? count : ''}
          </Badge>
        ))}
      </div>
    );
  };

  // Render emoji picker
  const renderEmojiPicker = () => {
    if (!showEmojiPicker) return null;

    return (
      <div className="emoji-picker-container position-absolute bottom-100 end-0 mb-2">
        <EmojiPicker 
          onEmojiClick={handleEmojiClick}
          width={300}
          height={400}
        />
      </div>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <div className="typing-indicator">
        <div className="d-flex align-items-center gap-2 px-3">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <small className="text-muted">Typing...</small>
        </div>
      </div>
    );
  };

  // Mobile header
  const renderMobileHeader = () => (
    <div className="mobile-chat-header d-md-none sticky-top bg-white shadow-sm">
      <div className="d-flex align-items-center justify-content-between p-3">
        <Button 
          variant="link" 
          className="p-0 text-dark"
          onClick={() => setShowMobileSidebar(true)}
        >
          <FaBars size={20} />
        </Button>
        
        <div className="d-flex align-items-center">
          <div className="mobile-logo-circle">
            <i className="bi bi-chat-left-text-fill text-primary"></i>
          </div>
          <span className="fw-bold ms-2">Company Chat</span>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {hasActiveConversation && (
            <Button 
              variant="link" 
              className="p-0 text-dark"
              onClick={() => setShowMobileInfoPanel(true)}
            >
              <FaInfoCircle size={18} />
            </Button>
          )}
          <Badge bg="primary" pill>{unreadCount}</Badge>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <Container fluid className="h-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading messages...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="company-chat-container p-0 h-100">
      {/* Mobile Header */}
      {isMobile && renderMobileHeader()}

      <Row className="g-0 h-100">
        {/* Left Sidebar - Conversations */}
        <Col md={4} lg={3} className={`sidebar-col h-100 ${isMobile ? 'd-none d-md-block' : ''}`}>
          <Card className="h-100 border-0 rounded-0 border-end">
            <Card.Header className="bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Messages</h5>
                <div className="d-flex gap-1">
                  <Badge bg="primary" pill>{unreadCount}</Badge>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowNewChatModal(true)}
                    title="New Chat"
                    className="rounded-circle"
                  >
                    <FaComment size={14} />
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mt-3">
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-light border-end-0">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0 bg-light"
                  />
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="bg-light border-start-0"
                    >
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </div>

              {/* Filters */}
              <div className="mt-2 d-flex gap-1">
                <Button
                  variant={activeFilter === 'all' ? 'primary' : 'light'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="flex-grow-1"
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'unread' ? 'primary' : 'light'}
                  size="sm"
                  onClick={() => setActiveFilter('unread')}
                  className="flex-grow-1"
                >
                  Unread
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  title={`Sort ${sortOrder === 'desc' ? 'newest first' : 'oldest first'}`}
                  className="px-3"
                >
                  <FaSort />
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="p-0 overflow-auto flex-grow-1">
              {filteredConversations.length > 0 ? (
                <ListGroup variant="flush" className="conversations-list">
                  {filteredConversations.map(conversation => {
                    const participant = conversation.participants.find(
                      p => p.id === currentUser?.uid
                    );
                    const unread = participant?.unreadCount || 0;
                    const otherParticipant = conversation.participants.find(
                      p => p.id !== currentUser?.uid
                    );

                    return (
                      <ListGroup.Item
                        key={conversation.id}
                        action
                        active={activeConversation?.id === conversation.id}
                        onClick={() => {
                          selectConversation(conversation);
                          if (isMobile) {
                            setShowMobileSidebar(false);
                          }
                        }}
                        className="py-3 px-3 border-bottom conversation-item"
                      >
                        <div className="d-flex align-items-start">
                          {/* Avatar */}
                          <div className="position-relative me-3">
                            {getConversationAvatar(conversation) ? (
                              <Image
                                src={getConversationAvatar(conversation)}
                                alt={getConversationName(conversation)}
                                className="rounded-circle"
                                style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                   style={{ width: '48px', height: '48px' }}>
                                {getConversationName(conversation).charAt(0)}
                              </div>
                            )}
                            {otherParticipant?.isOnline && (
                              <span className="position-absolute bottom-0 end-0 translate-middle p-1 border border-2 border-white rounded-circle bg-success"
                                    style={{ width: '12px', height: '12px' }}></span>
                            )}
                          </div>

                          {/* Conversation Info */}
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="mb-0 fw-semibold">
                                {getConversationName(conversation)}
                                {conversation.type === 'group' && (
                                  <FaUserFriends className="ms-2 text-muted" size={12} />
                                )}
                              </h6>
                              <small className="text-muted">
                                {formatConversationTime(conversation.updatedAt)}
                              </small>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <p className="mb-0 text-truncate small text-muted"
                                 style={{ maxWidth: '180px' }}>
                                {conversation.lastMessage || 'No messages yet'}
                              </p>
                              {unread > 0 && (
                                <Badge bg="danger" pill className="ms-1">{unread}</Badge>
                              )}
                            </div>

                            {/* Participants for groups */}
                            {conversation.type === 'group' && (
                              <small className="text-muted extra-small mt-1">
                                {conversation.participants.length} members
                              </small>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <FaComment className="text-muted mb-3" size={48} />
                  <p className="text-muted mb-2">No conversations found</p>
                  {searchTerm && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Main Chat Area */}
        <Col md={8} lg={9} className={`chat-col h-100 ${isMobile && !hasActiveConversation ? 'd-none' : ''}`}>
          <Card className="h-100 border-0 rounded-0">
            {hasActiveConversation ? (
              <>
                {/* Chat Header */}
                <Card.Header className="bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="link" 
                        className="d-lg-none me-2 p-0 text-dark"
                        onClick={() => {
                          if (isMobile) {
                            setShowMobileSidebar(true);
                          }
                        }}
                      >
                        <FaArrowLeft />
                      </Button>
                      
                      {/* Conversation Info */}
                      <div className="d-flex align-items-center">
                        <div className="position-relative me-3">
                          {getConversationAvatar(activeConversation) ? (
                            <Image
                              src={getConversationAvatar(activeConversation)}
                              alt={getConversationName(activeConversation)}
                              className="rounded-circle"
                              style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                 style={{ width: '42px', height: '42px' }}>
                              {getConversationName(activeConversation).charAt(0)}
                            </div>
                          )}
                          {getOtherParticipant?.isOnline && (
                            <span className="position-absolute bottom-0 end-0 translate-middle p-1 border border-2 border-white rounded-circle bg-success"
                                  style={{ width: '10px', height: '10px' }}></span>
                          )}
                        </div>
                        <div>
                          <h5 className="mb-0 fw-semibold">
                            {getConversationName(activeConversation)}
                          </h5>
                          <small className="text-muted">
                            {activeConversation.type === 'direct' 
                              ? (getOtherParticipant?.isOnline ? 'Online' : 'Offline')
                              : `${activeConversation.participants.length} members • Online`}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm" className="rounded-circle">
                        <FaPhone size={14} />
                      </Button>
                      <Button variant="outline-success" size="sm" className="rounded-circle">
                        <FaVideo size={14} />
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => setShowInfoPanel(!showInfoPanel)}
                        className="d-none d-lg-block rounded-circle"
                      >
                        <FaInfoCircle size={14} />
                      </Button>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm" className="rounded-circle">
                          <FaEllipsisV size={14} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                          <Dropdown.Item>
                            <FaArchive className="me-2" /> Archive
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <FaBell className="me-2" /> Mute
                          </Dropdown.Item>
                          <Dropdown.Item className="text-danger">
                            <FaTrash className="me-2" /> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </Card.Header>

                {/* Chat Messages */}
                <Card.Body className="p-0 d-flex flex-column" ref={chatContainerRef}>
                  <div className="chat-messages flex-grow-1 p-3 overflow-auto">
                    {messages.length > 0 ? (
                      <>
                        {messages.map(msg => (
                          <div 
                            key={msg.id} 
                            className={`message-wrapper mb-3 ${msg.senderId === currentUser?.uid ? 'message-sent' : 'message-received'}`}
                          >
                            {/* Reply indicator */}
                            {msg.replyingTo && (
                              <div className="reply-indicator small text-muted mb-1">
                                <FaReply className="me-1" />
                                Replying to {msg.replyingTo.sender?.name}
                              </div>
                            )}

                            {/* Message bubble */}
                            <div className="d-flex align-items-start">
                              {msg.senderId !== currentUser?.uid && (
                                <Image
                                  src={msg.sender?.avatar}
                                  alt={msg.sender?.name}
                                  className="rounded-circle me-2"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                      <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                                           style="width: 32px; height: 32px">
                                        ${msg.sender?.name?.charAt(0) || 'U'}
                                      </div>
                                    `;
                                  }}
                                />
                              )}

                              <div className="flex-grow-1">
                                {/* Sender name for received messages */}
                                {msg.senderId !== currentUser?.uid && activeConversation.type === 'group' && (
                                  <small className="fw-medium d-block mb-1">
                                    {msg.sender?.name}
                                  </small>
                                )}

                                <div className={`message-bubble p-3 ${msg.senderId === currentUser?.uid ? 'bg-primary text-white' : 'bg-light'}`}
                                     style={{ 
                                       borderRadius: '18px', 
                                       maxWidth: '85%',
                                       borderTopLeftRadius: msg.senderId === currentUser?.uid ? '18px' : '4px',
                                       borderTopRightRadius: msg.senderId === currentUser?.uid ? '4px' : '18px'
                                     }}>
                                  
                                  {/* Message content */}
                                  {msg.content && (
                                    <div className="message-content">
                                      {msg.content}
                                    </div>
                                  )}

                                  {/* Attachments */}
                                  {renderAttachments(msg.attachments)}

                                  {/* Message metadata */}
                                  <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className={`${msg.senderId === currentUser?.uid ? 'text-white-50' : 'text-muted'}`}>
                                      {formatMessageTime(msg.createdAt)}
                                      {msg.edited && ' (edited)'}
                                    </small>
                                    {msg.senderId === currentUser?.uid && (
                                      <div className="d-flex align-items-center">
                                        {msg.status === 'sent' && <FaCheckCircle className="ms-2" size={12} />}
                                        {msg.status === 'delivered' && <FaCheckDouble className="ms-2" size={12} />}
                                        {msg.status === 'read' && <FaCheckDouble className="ms-2 text-info" size={12} />}
                                      </div>
                                    )}
                                  </div>

                                  {/* Reactions */}
                                  {renderReactions(msg.reactions)}
                                </div>

                                {/* Message actions */}
                                <div className="message-actions mt-1 d-flex gap-2">
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 text-decoration-none"
                                    onClick={() => setReplyingTo(msg)}
                                  >
                                    <FaReply className="me-1" /> Reply
                                  </Button>
                                  {msg.senderId === currentUser?.uid && (
                                    <>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 text-decoration-none"
                                        onClick={() => setEditingMessage(msg)}
                                      >
                                        <FaEdit className="me-1" /> Edit
                                      </Button>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 text-decoration-none text-danger"
                                        onClick={() => {
                                          if (window.confirm('Delete this message?')) {
                                            deleteMessage(msg.id);
                                          }
                                        }}
                                      >
                                        <FaTrash className="me-1" /> Delete
                                      </Button>
                                    </>
                                  )}
                                  <Dropdown>
                                    <Dropdown.Toggle variant="link" size="sm" className="p-0 text-decoration-none">
                                      <FaRegSmile />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                      <Dropdown.Item onClick={() => addReaction(msg.id, '👍')}>
                                        <FaThumbsUp className="me-2" /> Like
                                      </Dropdown.Item>
                                      <Dropdown.Item onClick={() => addReaction(msg.id, '❤️')}>
                                        <FaHeart className="me-2" /> Love
                                      </Dropdown.Item>
                                      <Dropdown.Item onClick={() => addReaction(msg.id, '😂')}>
                                        <FaLaugh className="me-2" /> Laugh
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {renderTypingIndicator()}
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <FaComment className="text-muted mb-3" size={48} />
                        <h5>Start a conversation</h5>
                        <p className="text-muted">
                          Send your first message to {getConversationName(activeConversation)}
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </Card.Body>

                {/* Message Input Area */}
                <Card.Footer className="bg-white border-top py-3">
                  {/* Reply indicator */}
                  {replyingTo && (
                    <div className="reply-preview p-2 mb-2 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <small className="fw-medium">Replying to {replyingTo.sender?.name}</small>
                          <p className="mb-0 small text-truncate">{replyingTo.content}</p>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-2"
                          onClick={() => setReplyingTo(null)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Edit indicator */}
                  {editingMessage && (
                    <div className="edit-preview p-2 mb-2 border rounded bg-warning bg-opacity-10">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <small className="fw-medium">Editing message</small>
                        </div>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 ms-2"
                          onClick={() => setEditingMessage(null)}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* File previews */}
                  {selectedFiles.length > 0 && (
                    <div className="file-previews mb-2 p-2 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-medium">Attachments ({selectedFiles.length})</small>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 text-danger"
                          onClick={() => setSelectedFiles([])}
                        >
                          <FaTimes /> Clear all
                        </Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="file-preview p-2 border rounded">
                            <div className="d-flex align-items-center">
                              {file.type.startsWith('image/') ? (
                                <FaImage className="me-2" />
                              ) : (
                                <FaFile className="me-2" />
                              )}
                              <small className="me-2">{file.name}</small>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 text-danger"
                                onClick={() => removeFile(index)}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input area */}
                  <div className="d-flex align-items-center gap-2">
                    {/* Attachment button */}
                    <Button 
                      variant="light" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-circle"
                    >
                      <FaPaperclip />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      multiple
                    />

                    {/* Emoji button */}
                    <Button 
                      variant="light" 
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="rounded-circle position-relative"
                    >
                      <FaRegSmile />
                      {renderEmojiPicker()}
                    </Button>

                    {/* Message input */}
                    <div className="flex-grow-1">
                      <Form.Control
                        ref={messageInputRef}
                        as="textarea"
                        rows={1}
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="border-0 bg-light rounded-pill px-3"
                        style={{ resize: 'none' }}
                      />
                    </div>

                    {/* Send button */}
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!message.trim() && selectedFiles.length === 0}
                      className="rounded-circle px-3"
                    >
                      <FaPaperPlane />
                    </Button>
                  </div>
                </Card.Footer>
              </>
            ) : (
              /* Empty state - Only show on desktop when no conversation is selected */
              <div className="h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center">
                <div className="empty-chat-illustration mb-4">
                  <div className="chat-bubble-large">
                    <FaComment className="text-primary" size={64} />
                  </div>
                </div>
                <h4 className="fw-bold mb-2">Welcome to Company Chat</h4>
                <p className="text-muted mb-4">
                  Select a conversation or start a new one to begin messaging
                </p>
                <div className="d-flex gap-3">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowNewChatModal(true)}
                    className="rounded-pill px-4"
                  >
                    <FaComment className="me-2" /> New Message
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={() => setShowGroupModal(true)}
                    className="rounded-pill px-4"
                  >
                    <FaUsers className="me-2" /> Create Group
                  </Button>
                </div>
                {isMobile && (
                  <Button 
                    variant="link" 
                    className="mt-4"
                    onClick={() => setShowMobileSidebar(true)}
                  >
                    <FaBars className="me-2" /> Browse Conversations
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* Info Panel - Desktop */}
        {showInfoPanel && hasActiveConversation && !isMobile && (
          <Col lg={3} className="info-col d-none d-lg-block h-100">
            <Card className="h-100 border-0 rounded-0 border-start">
              <Card.Header className="bg-white border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Conversation Info</h6>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0"
                    onClick={() => setShowInfoPanel(false)}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="overflow-auto">
                {/* Participants */}
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold">
                    Participants ({activeConversation.participants.length})
                  </h6>
                  <ListGroup variant="flush">
                    {activeConversation.participants.map(participant => (
                      <ListGroup.Item key={participant.id} className="border-0 px-0 py-2">
                        <div className="d-flex align-items-center">
                          <div className="position-relative me-3">
                            <Image
                              src={participant.avatar}
                              alt={participant.name}
                              className="rounded-circle"
                              style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                            />
                            {participant.isOnline && (
                              <span className="position-absolute bottom-0 end-0 translate-middle p-1 border border-2 border-white rounded-circle bg-success"
                                    style={{ width: '10px', height: '10px' }}></span>
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center">
                              <h6 className="mb-0 small fw-semibold">{participant.name}</h6>
                              {participant.id === currentUser?.uid && (
                                <Badge bg="light" text="dark" className="ms-2 small px-2 py-1">You</Badge>
                              )}
                            </div>
                            <small className="text-muted">
                              {participant.isOnline ? 'Online' : 'Offline'}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>

                {/* Media and Files */}
                <div className="mb-4">
                  <h6 className="mb-3 fw-semibold">Shared Media</h6>
                  <div className="d-grid gap-2">
                    <Button variant="outline-light" size="sm" className="text-start p-3 border rounded">
                      <FaImage className="me-2" /> Photos & Videos
                    </Button>
                    <Button variant="outline-light" size="sm" className="text-start p-3 border rounded">
                      <FaFile className="me-2" /> Files & Documents
                    </Button>
                    <Button variant="outline-light" size="sm" className="text-start p-3 border rounded">
                      <FaLink className="me-2" /> Links
                    </Button>
                  </div>
                </div>

                {/* Conversation Settings */}
                <div>
                  <h6 className="mb-3 fw-semibold">Settings</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item action className="border-0 px-0 py-2 d-flex align-items-center">
                      <FaBell className="me-3 text-muted" />
                      <span>Notifications</span>
                    </ListGroup.Item>
                    <ListGroup.Item action className="border-0 px-0 py-2 d-flex align-items-center">
                      <FaStar className="me-3 text-muted" />
                      <span>Starred Messages</span>
                    </ListGroup.Item>
                    <ListGroup.Item action className="border-0 px-0 py-2 d-flex align-items-center">
                      <FaArchive className="me-3 text-muted" />
                      <span>Archive Chat</span>
                    </ListGroup.Item>
                    <ListGroup.Item action className="border-0 px-0 py-2 d-flex align-items-center text-danger">
                      <FaTrash className="me-3" />
                      <span>Delete Chat</span>
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Mobile Sidebar Offcanvas */}
      <Offcanvas show={showMobileSidebar} onHide={() => setShowMobileSidebar(false)} placement="start">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Messages</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {/* Search Bar */}
          <div className="p-3 border-bottom">
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-end-0">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 bg-light"
              />
            </InputGroup>
          </div>

          {/* Filters */}
          <div className="p-3 border-bottom">
            <div className="d-flex gap-1">
              <Button
                variant={activeFilter === 'all' ? 'primary' : 'light'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className="flex-grow-1"
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'unread' ? 'primary' : 'light'}
                size="sm"
                onClick={() => setActiveFilter('unread')}
                className="flex-grow-1"
              >
                Unread
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="conversations-list overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
            {filteredConversations.map(conversation => {
              const participant = conversation.participants.find(
                p => p.id === currentUser?.uid
              );
              const unread = participant?.unreadCount || 0;

              return (
                <div
                  key={conversation.id}
                  className={`p-3 border-bottom ${activeConversation?.id === conversation.id ? 'bg-light' : ''}`}
                  onClick={() => {
                    selectConversation(conversation);
                    setShowMobileSidebar(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    {/* Avatar */}
                    <div className="position-relative me-3">
                      {getConversationAvatar(conversation) ? (
                        <Image
                          src={getConversationAvatar(conversation)}
                          alt={getConversationName(conversation)}
                          className="rounded-circle"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                             style={{ width: '48px', height: '48px' }}>
                          {getConversationName(conversation).charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-semibold">
                          {getConversationName(conversation)}
                        </h6>
                        <small className="text-muted">
                          {formatConversationTime(conversation.updatedAt)}
                        </small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="mb-0 text-truncate small text-muted"
                           style={{ maxWidth: '200px' }}>
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                        {unread > 0 && (
                          <Badge bg="danger" pill className="ms-1">{unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Mobile Info Panel Offcanvas */}
      <Offcanvas show={showMobileInfoPanel} onHide={() => setShowMobileInfoPanel(false)} placement="end">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Conversation Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Participants */}
          <div className="mb-4">
            <h6 className="mb-3 fw-semibold">
              Participants ({activeConversation?.participants?.length || 0})
            </h6>
            <ListGroup variant="flush">
              {activeConversation?.participants?.map(participant => (
                <ListGroup.Item key={participant.id} className="border-0 px-0 py-3">
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <Image
                        src={participant.avatar}
                        alt={participant.name}
                        className="rounded-circle"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      {participant.isOnline && (
                        <span className="position-absolute bottom-0 end-0 translate-middle p-1 border border-2 border-white rounded-circle bg-success"
                              style={{ width: '12px', height: '12px' }}></span>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <h6 className="mb-0 fw-semibold">{participant.name}</h6>
                        {participant.id === currentUser?.uid && (
                          <Badge bg="light" text="dark" className="ms-2 small px-2 py-1">You</Badge>
                        )}
                      </div>
                      <small className="text-muted">
                        {participant.isOnline ? 'Online' : 'Offline'}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Media and Files */}
          <div className="mb-4">
            <h6 className="mb-3 fw-semibold">Shared Media</h6>
            <div className="d-grid gap-2">
              <Button variant="outline-light" size="sm" className="text-start p-3 border rounded">
                <FaImage className="me-2" /> Photos & Videos
              </Button>
              <Button variant="outline-light" size="sm" className="text-start p-3 border rounded">
                <FaFile className="me-2" /> Files & Documents
              </Button>
            </div>
          </div>

          {/* Conversation Settings */}
          <div>
            <h6 className="mb-3 fw-semibold">Settings</h6>
            <ListGroup variant="flush">
              <ListGroup.Item action className="border-0 px-0 py-3">
                <div className="d-flex align-items-center">
                  <FaBell className="me-3 text-muted" />
                  <span>Notifications</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item action className="border-0 px-0 py-3">
                <div className="d-flex align-items-center">
                  <FaStar className="me-3 text-muted" />
                  <span>Starred Messages</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item action className="border-0 px-0 py-3">
                <div className="d-flex align-items-center">
                  <FaArchive className="me-3 text-muted" />
                  <span>Archive Chat</span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item action className="border-0 px-0 py-3 text-danger">
                <div className="d-flex align-items-center">
                  <FaTrash className="me-3" />
                  <span>Delete Chat</span>
                </div>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Modals */}
      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <FaComment className="text-muted mb-3" size={48} />
            <p className="text-muted mb-0">Start a conversation</p>
            <p className="small text-muted">
              Select a contact to start chatting
            </p>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <FaUsers className="text-muted mb-3" size={48} />
            <p className="text-muted mb-0">Create group chat</p>
            <p className="small text-muted">
              Select participants for your group
            </p>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CompanyChat;