/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  ListGroup,
  Badge,
  Alert,
  Spinner,
  Modal,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  InputGroup,
  Tab,
  Tabs,
} from 'react-bootstrap';
import {
  FaCommentDots,
  FaPaperPlane,
  FaSearch,
  FaFilter,
  FaUser,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaFileAlt,
  FaVideo,
  FaPaperclip,
  FaTimes,
  FaCheck,
  FaClock,
  FaRegStar,
  FaStar,
  FaTrash,
  FaReply,
  FaForward,
  FaArchive,
  FaBell,
  FaRegBell,
  FaUsers,
  FaUserPlus,
  FaCog,
  FaRegSmile,
  FaImage,
  FaFile,
  FaMicrophone,
  FaEllipsisV,
  FaExternalLinkAlt,
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaRegCopy,
  FaRegEnvelope,
} from 'react-icons/fa';
import { companyFirebaseService } from '../../services/companyServices';

const Communication = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [messageTo, setMessageTo] = useState({
    type: 'candidate',
    recipientId: '',
    recipientName: '',
    recipientEmail: '',
  });
  const [replyTo, setReplyTo] = useState(null);
  const [success, setSuccess] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sample data for demonstration
  const conversations = [
    {
      id: '1',
      type: 'candidate',
      participant: {
        id: 'c1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '',
        role: 'Software Developer Applicant',
      },
      lastMessage: 'Thank you for the interview opportunity!',
      lastMessageTime: '2024-01-15T10:30:00',
      unreadCount: 2,
      status: 'active',
    },
    {
      id: '2',
      type: 'admin',
      participant: {
        id: 'a1',
        name: 'CareerConnect Admin',
        email: 'admin@careerconnect.ls',
        avatar: '',
        role: 'Platform Administrator',
      },
      lastMessage: 'Your company profile has been verified.',
      lastMessageTime: '2024-01-14T14:20:00',
      unreadCount: 0,
      status: 'read',
    },
    {
      id: '3',
      type: 'company',
      participant: {
        id: 'comp1',
        name: 'Tech Solutions Ltd',
        email: 'info@techsolutions.ls',
        avatar: '',
        role: 'Partner Company',
      },
      lastMessage: 'Looking forward to our partnership meeting.',
      lastMessageTime: '2024-01-13T09:15:00',
      unreadCount: 1,
      status: 'active',
    },
  ];

  const sampleMessages = [
    {
      id: 'm1',
      conversationId: '1',
      senderId: 'c1',
      senderName: 'John Doe',
      content:
        'Hello, I wanted to follow up on my application for the Software Developer position.',
      timestamp: '2024-01-15T09:30:00',
      type: 'text',
      status: 'delivered',
      isRead: true,
    },
    {
      id: 'm2',
      conversationId: '1',
      senderId: 'company',
      senderName: 'Your Company',
      content:
        'Thank you for your application. We have scheduled an interview for tomorrow at 2 PM.',
      timestamp: '2024-01-15T10:00:00',
      type: 'text',
      status: 'read',
      isRead: true,
    },
    {
      id: 'm3',
      conversationId: '1',
      senderId: 'c1',
      senderName: 'John Doe',
      content: "Thank you for the interview opportunity! I'm looking forward to it.",
      timestamp: '2024-01-15T10:30:00',
      type: 'text',
      status: 'delivered',
      isRead: false,
    },
  ];

  useEffect(() => {
    // Load initial data
    setMessages(sampleMessages);
    setLoading(false);

    // Scroll to bottom of messages
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const newMsg = {
        id: `m${Date.now()}`,
        conversationId: selectedConversation?.id || 'new',
        senderId: 'company',
        senderName: 'Your Company',
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: attachments.length > 0 ? 'file' : 'text',
        attachments: attachments.length > 0 ? attachments : undefined,
        status: 'sent',
        isRead: false,
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
      setAttachments([]);

      // In real app, save to Firebase
      if (messageTo.recipientId) {
        try {
          await companyFirebaseService.sendMessage({
            to: messageTo.recipientId,
            toName: messageTo.recipientName,
            subject: `Message from your company`,
            content: newMessage,
            type: 'candidate',
          });
        } catch (error) {
          console.log('Note: Firebase service not fully implemented');
        }
      }

      setSuccess('Message sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const getConversationBadge = (conversation) => {
    if (conversation.unreadCount > 0) {
      return (
        <Badge bg="danger" pill className="ms-2">
          {conversation.unreadCount}
        </Badge>
      );
    }
    return null;
  };

  const getParticipantIcon = (type) => {
    switch (type) {
      case 'candidate':
        return <FaUser className="text-primary" />;
      case 'admin':
        return <FaBuilding className="text-warning" />;
      case 'company':
        return <FaBuilding className="text-info" />;
      default:
        return <FaUser className="text-secondary" />;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        conv.participant.name.toLowerCase().includes(term) ||
        conv.participant.email.toLowerCase().includes(term) ||
        conv.lastMessage.toLowerCase().includes(term)
      );
    }

    if (activeTab === 'unread') {
      return conv.unreadCount > 0;
    }

    if (activeTab === 'starred') {
      return conv.status === 'starred';
    }

    return true;
  });

  const handleStartNewConversation = () => {
    setMessageTo({
      type: 'candidate',
      recipientId: '',
      recipientName: '',
      recipientEmail: '',
    });
    setShowNewMessageModal(true);
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setNewMessage(`@${message.senderName} `);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading messages...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 communication-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <FaCommentDots className="me-2 text-primary" />
                Communication Hub
              </h1>
              <p className="text-muted mb-0">
                Connect with candidates, companies, and administrators
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowGroupModal(true)}
                className="d-flex align-items-center gap-2"
              >
                <FaUsers /> Create Group
              </Button>
              <Button
                variant="primary"
                onClick={handleStartNewConversation}
                className="d-flex align-items-center gap-2"
              >
                <FaPaperPlane /> New Message
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {success && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              <FaCheck className="me-2" />
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="g-4">
        {/* Left Sidebar - Conversations List */}
        <Col lg={4} xl={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Conversations</h5>
                <Badge bg="primary" pill>
                  {filteredConversations.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Search Bar */}
              <div className="p-3 border-bottom">
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="search"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </div>

              {/* Tabs */}
              <div className="px-3 pt-3">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                  <Tab eventKey="inbox" title="Inbox" />
                  <Tab eventKey="unread" title="Unread" />
                  <Tab eventKey="starred" title="Starred" />
                </Tabs>
              </div>

              {/* Conversations List */}
              <div className="conversations-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {filteredConversations.map((conversation) => (
                    <ListGroup.Item
                      key={conversation.id}
                      action
                      active={selectedConversation?.id === conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="border-0 py-3 px-3 hover-highlight"
                    >
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          <div
                            className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '45px',
                              height: '45px',
                              background:
                                selectedConversation?.id === conversation.id ? 'white' : '#f8f9fa',
                            }}
                          >
                            {getParticipantIcon(conversation.type)}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <h6 className="mb-0 fw-medium">
                              {conversation.participant.name}
                              {getConversationBadge(conversation)}
                            </h6>
                            <small className="text-muted">
                              {formatMessageTime(conversation.lastMessageTime)}
                            </small>
                          </div>
                          <p className="text-muted small mb-1 line-clamp-2">
                            {conversation.lastMessage}
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <small className="text-muted">{conversation.participant.role}</small>
                            {conversation.type === 'candidate' && (
                              <Badge bg="light" text="dark" className="small">
                                Candidate
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel - Chat Area */}
        <Col lg={8} xl={9}>
          <Card className="border-0 shadow-sm h-100">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Card.Header className="bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div
                          className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                          style={{ width: '50px', height: '50px' }}
                        >
                          {getParticipantIcon(selectedConversation.type)}
                        </div>
                      </div>
                      <div>
                        <h5 className="mb-1">{selectedConversation.participant.name}</h5>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">
                            <FaEnvelope className="me-1" />
                            {selectedConversation.participant.email}
                          </small>
                          <Badge
                            bg={selectedConversation.type === 'candidate' ? 'info' : 'warning'}
                          >
                            {selectedConversation.type === 'candidate'
                              ? 'Candidate'
                              : selectedConversation.type === 'admin'
                                ? 'Admin'
                                : 'Company'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <OverlayTrigger overlay={<Tooltip>Voice Call</Tooltip>}>
                        <Button variant="outline-primary" size="sm">
                          <FaPhone />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>Video Call</Tooltip>}>
                        <Button variant="outline-success" size="sm">
                          <FaVideo />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger overlay={<Tooltip>View Profile</Tooltip>}>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => {
                            if (selectedConversation.type === 'candidate') {
                              // Navigate to candidate profile
                              console.log('View candidate profile');
                            }
                          }}
                        >
                          <FaUser />
                        </Button>
                      </OverlayTrigger>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>
                            <FaRegStar className="me-2" /> Star Conversation
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <FaArchive className="me-2" /> Archive
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <FaTrash className="me-2" /> Delete
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item>
                            <FaBell className="me-2" /> Mute Notifications
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <FaCog className="me-2" /> Settings
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </Card.Header>

                {/* Chat Messages */}
                <Card.Body
                  className="chat-messages p-0"
                  style={{
                    height: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                    background: '#f8f9fa',
                  }}
                >
                  <div className="p-4">
                    {messages
                      .filter((msg) => msg.conversationId === selectedConversation.id)
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`message-bubble mb-3 ${message.senderId === 'company' ? 'sent' : 'received'}`}
                        >
                          <div className="d-flex align-items-start mb-1">
                            <small className="fw-medium">{message.senderName}</small>
                            <small className="text-muted ms-2">
                              {formatMessageTime(message.timestamp)}
                            </small>
                          </div>
                          <div
                            className={`message-content p-3 rounded ${message.senderId === 'company' ? 'bg-primary text-white' : 'bg-white'}`}
                          >
                            {message.content}

                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2">
                                {message.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="attachment-item p-2 rounded bg-light mb-1"
                                  >
                                    <div className="d-flex align-items-center">
                                      <FaFileAlt className="me-2" />
                                      <span>{att.name}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="d-flex gap-2 mt-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none"
                              onClick={() => handleReply(message)}
                            >
                              <FaReply className="me-1" /> Reply
                            </Button>
                            <Button variant="link" size="sm" className="p-0 text-decoration-none">
                              <FaForward className="me-1" /> Forward
                            </Button>
                          </div>
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </div>
                </Card.Body>

                {/* Message Input */}
                <Card.Footer className="bg-white border-0 py-3">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="mb-3 p-2 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-medium">Attachments ({attachments.length})</small>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => setAttachments([])}
                        >
                          <FaTimes /> Clear All
                        </Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="attachment-preview p-2 border rounded"
                          >
                            <div className="d-flex align-items-center">
                              <FaFile className="me-2" />
                              <small className="me-2">{attachment.name}</small>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 text-danger"
                                onClick={() => removeAttachment(attachment.id)}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Input Area */}
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex gap-1">
                        <OverlayTrigger overlay={<Tooltip>Attach File</Tooltip>}>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FaPaperclip />
                          </Button>
                        </OverlayTrigger>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                          multiple
                        />
                        <OverlayTrigger overlay={<Tooltip>Add Emoji</Tooltip>}>
                          <Button variant="outline-secondary" size="sm">
                            <FaRegSmile />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>Record Audio</Tooltip>}>
                          <Button variant="outline-secondary" size="sm">
                            <FaMicrophone />
                          </Button>
                        </OverlayTrigger>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && attachments.length === 0}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FaPaperPlane />
                      </Button>
                    </div>
                  </div>
                </Card.Footer>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-5">
                <FaCommentDots
                  className="text-muted mb-3"
                  style={{ fontSize: '3rem', opacity: 0.5 }}
                />
                <h4>No conversation selected</h4>
                <p className="text-muted mb-3">
                  Select a conversation from the list or start a new one
                </p>
                <Button
                  variant="primary"
                  onClick={handleStartNewConversation}
                  className="d-flex align-items-center gap-2 mx-auto"
                >
                  <FaPaperPlane /> Start New Conversation
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* New Message Modal */}
      <Modal show={showNewMessageModal} onHide={() => setShowNewMessageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Recipient Type</Form.Label>
              <Form.Select
                value={messageTo.type}
                onChange={(e) => setMessageTo({ ...messageTo, type: e.target.value })}
              >
                <option value="candidate">Candidate</option>
                <option value="company">Other Company</option>
                <option value="admin">Administrator</option>
              </Form.Select>
            </Form.Group>

            {messageTo.type === 'candidate' && (
              <Form.Group className="mb-3">
                <Form.Label>Select Candidate</Form.Label>
                <Form.Select
                  value={messageTo.recipientId}
                  onChange={(e) => {
                    const selected = e.target.value;
                    // In real app, this would fetch candidate details
                    setMessageTo({
                      ...messageTo,
                      recipientId: selected,
                      recipientName: 'John Doe', // Example
                      recipientEmail: 'john@example.com', // Example
                    });
                  }}
                >
                  <option value="">Select a candidate...</option>
                  <option value="c1">John Doe (Software Developer)</option>
                  <option value="c2">Jane Smith (Marketing Intern)</option>
                  <option value="c3">Mike Johnson (Data Analyst)</option>
                </Form.Select>
              </Form.Group>
            )}

            {messageTo.type === 'company' && (
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter company name"
                  value={messageTo.recipientName}
                  onChange={(e) => setMessageTo({ ...messageTo, recipientName: e.target.value })}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Message subject"
                defaultValue={`Message from ${selectedConversation?.participant.name || 'Your Company'}`}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Attachments</Form.Label>
              <div className="border rounded p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span>No files selected</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaPaperclip className="me-1" /> Add Files
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  multiple
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowNewMessageModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleSendMessage();
              setShowNewMessageModal(false);
            }}
            disabled={!messageTo.recipientId && !messageTo.recipientName}
          >
            <FaPaperPlane className="me-2" /> Send Message
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Group Modal */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Group Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control type="text" placeholder="Enter group name" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Add Participants</Form.Label>
              <Form.Select multiple>
                <option value="c1">John Doe (Candidate)</option>
                <option value="c2">Jane Smith (Candidate)</option>
                <option value="comp1">Tech Solutions Ltd (Company)</option>
                <option value="admin">CareerConnect Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Hold Ctrl/Cmd to select multiple participants
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Group Description</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Brief description of the group" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowGroupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            <FaUsers className="me-2" /> Create Group
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Communication;
