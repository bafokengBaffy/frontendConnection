/* eslint-disable no-unused-vars */
// src/pages/company/ScheduleInterview.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Modal,
  Badge,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  Dropdown,
} from 'react-bootstrap';
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaBriefcase,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSearch,
  FaCalendarCheck,
  FaUsers,
  FaPaperPlane,
  FaBell,
  FaLink,
  FaCopy,
  FaWhatsapp,
  FaEnvelope,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { companyFirebaseService } from '../../services/companyServices';

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    applicationId: '',
    interviewType: 'video',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    interviewerName: '',
    interviewerEmail: '',
    meetingLink: '',
    location: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubscribe = companyFirebaseService.subscribeToInterviews((updatedInterviews) => {
      setInterviews(updatedInterviews);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interviewsData, applicationsData] = await Promise.all([
        companyFirebaseService.getCompanyInterviews(),
        companyFirebaseService.getCompanyApplications('interview'),
      ]);

      setInterviews(interviewsData || []);
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.applicationId) {
      newErrors.applicationId = 'Please select an application';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Please select a date and time';
    } else if (new Date(formData.scheduledAt) < new Date()) {
      newErrors.scheduledAt = 'Interview date must be in the future';
    }

    if (!formData.duration || formData.duration < 15 || formData.duration > 240) {
      newErrors.duration = 'Duration must be between 15 and 240 minutes';
    }

    if (formData.interviewType === 'video' && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for video interviews';
    }

    if (formData.interviewType === 'in-person' && !formData.location) {
      newErrors.location = 'Location is required for in-person interviews';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScheduleInterview = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await companyFirebaseService.scheduleInterview(formData);

      setSuccess('Interview scheduled successfully!');
      setShowScheduleModal(false);
      resetForm();

      // Send notification (simulated)
      sendInterviewNotification();

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setErrors({ submit: 'Failed to schedule interview. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterview = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (selectedInterview && selectedInterview.id) {
        await companyFirebaseService.updateInterview(selectedInterview.id, formData);
        setSuccess('Interview updated successfully!');
        setShowEditModal(false);
        resetForm();
        await loadData();
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      setErrors({ submit: 'Failed to update interview. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (window.confirm('Are you sure you want to cancel this interview?')) {
      try {
        setLoading(true);
        await companyFirebaseService.updateInterview(interviewId, {
          status: 'cancelled',
          cancellationReason: 'Cancelled by company',
        });

        setSuccess('Interview cancelled successfully!');
        await loadData();
      } catch (error) {
        console.error('Error cancelling interview:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const sendInterviewNotification = () => {
    // In a real app, this would send email/SMS notifications
    console.log('Interview notification sent');
  };

  const resetForm = () => {
    setFormData({
      applicationId: '',
      interviewType: 'video',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 30,
      interviewerName: '',
      interviewerEmail: '',
      meetingLink: '',
      location: '',
      notes: '',
    });
    setErrors({});
  };

  const getStatusBadge = (status) => {
    const variants = {
      scheduled: { bg: 'primary', text: 'white' },
      completed: { bg: 'success', text: 'white' },
      cancelled: { bg: 'danger', text: 'white' },
      rescheduled: { bg: 'warning', text: 'dark' },
      'no-show': { bg: 'secondary', text: 'white' },
    };

    const variant = variants[status] || { bg: 'light', text: 'dark' };

    return (
      <Badge bg={variant.bg} text={variant.text}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <FaVideo className="text-primary" />;
      case 'phone':
        return <FaPhone className="text-info" />;
      case 'in-person':
        return <FaMapMarkerAlt className="text-success" />;
      default:
        return <FaCalendarAlt className="text-secondary" />;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'Not scheduled';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';

    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (!interview) return false;

    if (filter !== 'all' && interview.status !== filter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const candidateName = (interview.application?.candidate?.fullName || '').toLowerCase();
      const jobTitle = (interview.application?.job?.title || '').toLowerCase();
      const interviewer = (interview.interviewerName || '').toLowerCase();

      return candidateName.includes(term) || jobTitle.includes(term) || interviewer.includes(term);
    }

    return true;
  });

  const handleApplicationSelect = (applicationId) => {
    const application = applications.find((app) => app.id === applicationId);
    if (application) {
      setSelectedApplication(application);
      setFormData((prev) => ({
        ...prev,
        applicationId,
        candidateName: application.candidate?.fullName || '',
        jobTitle: application.job?.title || '',
      }));
    }
  };

  const handleEditClick = (interview) => {
    if (!interview) return;

    setSelectedInterview(interview);
    setFormData({
      applicationId: interview.applicationId || '',
      interviewType: interview.interviewType || 'video',
      scheduledAt: interview.scheduledAt
        ? new Date(interview.scheduledAt)
        : new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: interview.duration || 30,
      interviewerName: interview.interviewerName || '',
      interviewerEmail: interview.interviewerEmail || '',
      meetingLink: interview.meetingLink || '',
      location: interview.location || '',
      notes: interview.notes || '',
    });
    setShowEditModal(true);
  };

  const copyMeetingLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      setSuccess('Meeting link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading && interviews.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading interviews...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <FaCalendarCheck className="me-2 text-primary" />
                Schedule Interviews
              </h1>
              <p className="text-muted mb-0">Manage candidate interviews and meeting schedules</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowScheduleModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaCalendarAlt /> Schedule New Interview
            </Button>
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

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-primary">{interviews.length || 0}</h2>
              <p className="text-muted mb-0">Total Interviews</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-success">
                {interviews.filter((i) => i?.status === 'scheduled').length}
              </h2>
              <p className="text-muted mb-0">Scheduled</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-warning">
                {interviews.filter((i) => i?.status === 'completed').length}
              </h2>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <h2 className="mb-0 text-danger">
                {interviews.filter((i) => i?.status === 'cancelled').length}
              </h2>
              <p className="text-muted mb-0">Cancelled</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={8}>
          <div className="d-flex gap-2">
            <div className="flex-grow-1">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch />
                </span>
                <Form.Control
                  type="search"
                  placeholder="Search by candidate, job, or interviewer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0"
                />
              </div>
            </div>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                className="d-flex align-items-center gap-2"
              >
                <FaFilter /> Filter:{' '}
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setFilter('all')}>All Interviews</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('scheduled')}>Scheduled</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('completed')}>Completed</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('cancelled')}>Cancelled</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter('rescheduled')}>Rescheduled</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
      </Row>

      {/* Interviews List */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <FaCalendarAlt className="me-2" />
                Upcoming Interviews
                <Badge bg="light" text="dark" className="ms-2">
                  {filteredInterviews.length}
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredInterviews.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredInterviews.map((interview) => (
                    <ListGroup.Item key={interview.id} className="border-0 p-4 hover-highlight">
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="d-flex align-items-center mb-2">
                            {getInterviewTypeIcon(interview.interviewType)}
                            <h5 className="mb-0 ms-2">
                              {interview.application?.candidate?.fullName || 'Candidate'}
                            </h5>
                            <div className="ms-3">{getStatusBadge(interview.status)}</div>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex align-items-center gap-3 mb-1">
                              <span className="text-muted">
                                <FaBriefcase className="me-1" />
                                {interview.application?.job?.title || 'Position'}
                              </span>
                              <span className="text-muted">
                                <FaCalendarAlt className="me-1" />
                                {formatDateTime(interview.scheduledAt)}
                              </span>
                              <span className="text-muted">
                                <FaClock className="me-1" />
                                {interview.duration || 30} minutes
                              </span>
                            </div>

                            {interview.interviewerName && (
                              <div className="text-muted">
                                <FaUser className="me-1" />
                                Interviewer: {interview.interviewerName}
                                {interview.interviewerEmail && ` (${interview.interviewerEmail})`}
                              </div>
                            )}

                            {interview.interviewType === 'video' && interview.meetingLink && (
                              <div className="mt-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => window.open(interview.meetingLink, '_blank')}
                                >
                                  <FaVideo className="me-1" /> Join Meeting
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => copyMeetingLink(interview.meetingLink)}
                                >
                                  <FaCopy className="me-1" /> Copy Link
                                </Button>
                              </div>
                            )}

                            {interview.interviewType === 'in-person' && interview.location && (
                              <div className="mt-2">
                                <FaMapMarkerAlt className="me-1 text-muted" />
                                <span className="text-muted">{interview.location}</span>
                              </div>
                            )}
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="d-flex justify-content-end gap-2">
                            <OverlayTrigger overlay={<Tooltip>Edit Interview</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditClick(interview)}
                              >
                                <FaEdit />
                              </Button>
                            </OverlayTrigger>

                            <OverlayTrigger overlay={<Tooltip>Send Reminder</Tooltip>}>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => sendInterviewNotification()}
                              >
                                <FaBell />
                              </Button>
                            </OverlayTrigger>

                            {interview.status === 'scheduled' && (
                              <OverlayTrigger overlay={<Tooltip>Cancel Interview</Tooltip>}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCancelInterview(interview.id)}
                                >
                                  <FaTimes />
                                </Button>
                              </OverlayTrigger>
                            )}

                            <OverlayTrigger overlay={<Tooltip>View Application</Tooltip>}>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() =>
                                  navigate(`/company/applications/${interview.applicationId}`)
                                }
                              >
                                <FaUser />
                              </Button>
                            </OverlayTrigger>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <FaCalendarAlt
                    className="text-muted mb-3"
                    style={{ fontSize: '3rem', opacity: 0.5 }}
                  />
                  <h5>No interviews found</h5>
                  <p className="text-muted mb-3">
                    {filter === 'all'
                      ? 'Schedule your first interview to get started'
                      : `No ${filter} interviews found`}
                  </p>
                  {filter === 'all' && (
                    <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                      <FaCalendarAlt className="me-2" /> Schedule Interview
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Schedule Interview Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Schedule New Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Application *</Form.Label>
              <Form.Select
                value={formData.applicationId}
                onChange={(e) => handleApplicationSelect(e.target.value)}
                isInvalid={!!errors.applicationId}
              >
                <option value="">Select an application...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.candidate?.fullName || 'Candidate'} - {app.job?.title || 'Position'}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.applicationId}</Form.Control.Feedback>
            </Form.Group>

            {selectedApplication && (
              <Alert variant="info" className="mb-3">
                <div className="d-flex align-items-center">
                  <FaUser className="me-2" />
                  <div>
                    <strong>{selectedApplication.candidate?.fullName || 'Candidate'}</strong>
                    <div className="small">
                      Applied for: {selectedApplication.job?.title || 'Position'}
                    </div>
                  </div>
                </div>
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Interview Type *</Form.Label>
                  <Form.Select
                    value={formData.interviewType}
                    onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes) *</Form.Label>
                  <Form.Select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                    isInvalid={!!errors.duration}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.duration}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time *</Form.Label>
                  <DatePicker
                    selected={formData.scheduledAt}
                    onChange={(date) => setFormData({ ...formData, scheduledAt: date })}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="form-control"
                    minDate={new Date()}
                    isInvalid={!!errors.scheduledAt}
                  />
                  <Form.Control.Feedback type="invalid">{errors.scheduledAt}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Interviewer Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter interviewer name"
                    value={formData.interviewerName}
                    onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {formData.interviewType === 'video' && (
              <Form.Group className="mb-3">
                <Form.Label>Meeting Link *</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  isInvalid={!!errors.meetingLink}
                />
                <Form.Control.Feedback type="invalid">{errors.meetingLink}</Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Enter Zoom, Google Meet, or other video conference link
                </Form.Text>
              </Form.Group>
            )}

            {formData.interviewType === 'in-person' && (
              <Form.Group className="mb-3">
                <Form.Label>Location *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Office address, building, room number"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  isInvalid={!!errors.location}
                />
                <Form.Control.Feedback type="invalid">{errors.location}</Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Additional instructions, preparation materials, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interviewer Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="interviewer@company.com"
                value={formData.interviewerEmail}
                onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
              />
              <Form.Text className="text-muted">
                Send calendar invite and reminders to this email
              </Form.Text>
            </Form.Group>

            {errors.submit && (
              <Alert variant="danger" className="mt-3">
                {errors.submit}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleScheduleInterview} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Scheduling...
              </>
            ) : (
              <>
                <FaCalendarAlt className="me-2" />
                Schedule Interview
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Interview Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Interview Type</Form.Label>
                  <Form.Select
                    value={formData.interviewType}
                    onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={selectedInterview?.status || 'scheduled'}
                    onChange={(e) => {
                      if (selectedInterview) {
                        setFormData({ ...formData, status: e.target.value });
                      }
                    }}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="no-show">No Show</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time</Form.Label>
                  <DatePicker
                    selected={formData.scheduledAt}
                    onChange={(date) => setFormData({ ...formData, scheduledAt: date })}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="form-control"
                    minDate={new Date()}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {formData.interviewType === 'video' && (
              <Form.Group className="mb-3">
                <Form.Label>Meeting Link</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                />
              </Form.Group>
            )}

            {formData.interviewType === 'in-person' && (
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Office address, building, room number"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Interviewer Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.interviewerName}
                onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            {errors.submit && (
              <Alert variant="danger" className="mt-3">
                {errors.submit}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateInterview} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Interview'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ScheduleInterview;
