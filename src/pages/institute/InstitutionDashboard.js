import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionServices';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  ListGroup,
  Modal,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  PeopleFill,
  BookFill,
  ClockFill,
  CashStack,
  PlusCircle,
  Gear,
  Wifi,
  ArrowUp,
  ArrowDown,
  Clock,
  CalendarEvent,
  Mortarboard,
  CheckCircle,
  StarFill,
  Envelope,
  Calendar,
  PersonCircle,
  Inbox,
  Bell,
  BellSlash,
  X,
  GeoAlt,
  CalendarX,
  ClipboardCheck,
  Cash,
  PersonPlus,
  ExclamationTriangle,
  Chat,
  GraphUp,
  GraphDown,
} from 'react-bootstrap-icons';
import './InstitutionDashboard.css';

const InstitutionDashboard = () => {
  const { currentUser } = useAuth();
  const [institutionData, setInstitutionData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [setRevenueData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (currentUser) {
      console.log('Current user ID:', currentUser.uid);
      loadDashboardData();
      const cleanup = setupRealtimeListeners();
      return cleanup;
    } else {
      console.log('No current user found');
      setLoading(false);
      setError('Please log in to access the dashboard');
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading REAL dashboard data...');

      const institution = await institutionService.getInstitutionProfile(currentUser.uid);
      console.log('Institution data:', institution);
      setInstitutionData(institution);

      const [
        statsData,
        notificationsData,
        eventsData,
        appsData,
        enrollmentAnalytics,
        revenueAnalytics,
        institutionInsights,
      ] = await Promise.all([
        institutionService.getDashboardStats(institution.id),
        institutionService.getNotifications(institution.id),
        institutionService.getUpcomingEvents(institution.id),
        institutionService.getRecentApplications(institution.id),
        institutionService.getEnrollmentAnalytics(institution.id),
        institutionService.getRevenueAnalytics(institution.id),
        institutionService.getInstitutionInsights(institution.id),
      ]);

      setStats(statsData);
      setNotifications(notificationsData);
      setUpcomingEvents(eventsData);
      setRecentApplications(appsData);
      setEnrollmentData(enrollmentAnalytics);
      setRevenueData(revenueAnalytics);
      setInsights(institutionInsights);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!currentUser?.uid || !institutionData?.id) {
      console.log('No valid data for real-time listeners');
      return () => {};
    }

    console.log('Setting up REAL-TIME listeners...');

    const institutionId = institutionData.id;

    const unsubscribeApps = institutionService.onApplicationsUpdate(
      institutionId,
      (applications) => {
        console.log('Real-time applications update:', applications);
        setRecentApplications(applications.slice(0, 5));
      }
    );

    const unsubscribeNotifs = institutionService.onNotificationsUpdate(institutionId, (notifs) => {
      console.log('Real-time notifications update:', notifs);
      setNotifications(notifs.slice(0, 5));
    });

    const unsubscribeStats = institutionService.onStatsUpdate(institutionId, (updatedStats) => {
      console.log('Real-time stats update:', updatedStats);
      setStats(updatedStats);
    });

    const unsubscribeEvents = institutionService.onEventsUpdate(institutionId, (events) => {
      console.log('Real-time events update:', events);
      setUpcomingEvents(events);
    });

    return () => {
      console.log('Cleaning up real-time listeners');
      unsubscribeApps();
      unsubscribeNotifs();
      unsubscribeStats();
      unsubscribeEvents();
    };
  };

  const handleUpdateApplication = async (applicationId, status) => {
    try {
      await institutionService.updateApplicationStatus(applicationId, status);
      alert(`Application ${status} successfully`);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application: ' + error.message);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await institutionService.markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await institutionService.markAllNotificationsAsRead(institutionData.id);
      setNotifications([]);
      alert('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark notifications as read: ' + error.message);
    }
  };

  const handleViewApplication = (app) => {
    setSelectedApp(app);
    setShowAppModal(true);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      application_update: ClipboardCheck,
      payment_received: Cash,
      student_enrolled: PersonPlus,
      event_reminder: CalendarEvent,
      course_created: BookFill,
      faculty_update: Mortarboard,
      system_alert: ExclamationTriangle,
      message_received: Chat,
    };
    return iconMap[type] || Bell;
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading REAL dashboard data from Firebase...</p>
        </div>
      </Container>
    );
  }

  if (error && !institutionData) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={loadDashboardData}>
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="institution-dashboard py-4">
      {error && (
        <Alert variant="warning" dismissible onClose={() => setError(null)} className="mb-4">
          <Alert.Heading>Note</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Header */}
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <div>
            <h1 className="h2 mb-2">Welcome back, {institutionData?.name || 'Institution'}!</h1>
            <div className="d-flex align-items-center">
              <span className="text-muted me-3">
                Last updated: {new Date().toLocaleTimeString()} • Real-time data active
              </span>
              {stats && (
                <Badge bg="success" className="d-flex align-items-center">
                  <Wifi size={12} className="me-1" /> Live
                </Badge>
              )}
            </div>
          </div>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button
            variant="primary"
            className="me-2 mb-2 mb-sm-0"
            onClick={() => (window.location.href = '/institute/courses/create')}
          >
            <PlusCircle className="me-2" size={18} /> Create New Course
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => (window.location.href = '/institute/settings')}
          >
            <Gear className="me-2" size={18} /> Settings
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon total-students me-3">
                <PeopleFill size={24} />
              </div>
              <div>
                <h3 className="mb-1">{stats?.totalStudents?.toLocaleString() || '0'}</h3>
                <p className="text-muted mb-1">Total Students</p>
                <span
                  className={`stat-change ${stats?.studentIsIncreasing ? 'positive' : 'negative'} small`}
                >
                  {stats?.studentIsIncreasing ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{' '}
                  {stats?.studentChangePercent?.toFixed(1) || '0'}% from last month
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon active-courses me-3">
                <BookFill size={24} />
              </div>
              <div>
                <h3 className="mb-1">{stats?.activeCourses || '0'}</h3>
                <p className="text-muted mb-1">Active Courses</p>
                <span
                  className={`stat-change ${stats?.courseIsIncreasing ? 'positive' : 'negative'} small`}
                >
                  {stats?.courseIsIncreasing ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{' '}
                  {stats?.courseChangePercent?.toFixed(1) || '0'}% change
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon pending-apps me-3">
                <ClockFill size={24} />
              </div>
              <div>
                <h3 className="mb-1">{stats?.pendingApplications || '0'}</h3>
                <p className="text-muted mb-1">Pending Applications</p>
                <span className="stat-change negative small">
                  <Clock size={12} /> Needs immediate review
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon revenue me-3">
                <CashStack size={24} />
              </div>
              <div>
                <h3 className="mb-1">M{stats?.revenue?.toLocaleString() || '0'}</h3>
                <p className="text-muted mb-1">Monthly Revenue</p>
                <span
                  className={`stat-change ${stats?.revenueIsIncreasing ? 'positive' : 'negative'} small`}
                >
                  {stats?.revenueIsIncreasing ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{' '}
                  {stats?.revenueChangePercent?.toFixed(1) || '0'}% growth
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-4">
        {/* Left Column */}
        <Col lg={8}>
          {/* Enrollment Chart */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Enrollment Trends (Last 6 Months)</Card.Title>
              <Badge bg="primary" pill>
                Total: {enrollmentData?.values?.reduce((a, b) => a + b, 0) || 0}
              </Badge>
            </Card.Header>
            <Card.Body>
              {enrollmentData ? (
                <>
                  <div className="mb-4">
                    <h5 className="mb-0">
                      {enrollmentData.isIncreasing ? (
                        <>
                          <GraphUp className="me-2 text-success" /> Increase
                        </>
                      ) : (
                        <>
                          <GraphDown className="me-2 text-danger" /> Decrease
                        </>
                      )}
                      {enrollmentData.totalChange?.toFixed(1)}%
                    </h5>
                  </div>
                  <div className="enrollment-chart">
                    <div className="chart-bars d-flex align-items-end" style={{ height: '200px' }}>
                      {enrollmentData.values.map((value, index) => (
                        <div
                          key={index}
                          className="chart-bar-container flex-grow-1 text-center mx-1"
                        >
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {value} students in {enrollmentData.labels[index]}
                              </Tooltip>
                            }
                          >
                            <div
                              className="chart-bar bg-primary rounded mx-auto"
                              style={{
                                height: `${Math.max(20, (value / Math.max(...enrollmentData.values.filter((v) => v > 0)) || 1) * 100)}%`,
                                width: '80%',
                              }}
                            >
                              <span className="chart-bar-value">{value}</span>
                            </div>
                          </OverlayTrigger>
                          <div className="chart-bar-label mt-2 small">
                            {enrollmentData.labels[index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading enrollment data...</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Recent Applications */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Recent Applications</Card.Title>
              <Button variant="outline-primary" size="sm" href="/institute/applications">
                View All ({recentApplications.length})
              </Button>
            </Card.Header>
            <Card.Body>
              {recentApplications.length > 0 ? (
                <ListGroup variant="flush">
                  {recentApplications.map((app) => (
                    <ListGroup.Item key={app.id} className="border-0 py-3">
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          {app.studentPhoto ? (
                            <img
                              src={app.studentPhoto}
                              alt={app.studentName}
                              className="rounded-circle"
                              width="48"
                              height="48"
                            />
                          ) : (
                            <PersonCircle size={48} className="text-muted" />
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{app.studentName}</h6>
                              <p className="text-muted mb-1 small">
                                <Envelope size={12} className="me-1" />
                                {app.studentEmail || 'No email'}
                              </p>
                            </div>
                            <Badge bg={getStatusVariant(app.status)}>{app.status}</Badge>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">
                                Applied for: <strong>{app.program || 'N/A'}</strong>
                              </small>
                              <br />
                              <small className="text-muted">
                                <Calendar size={12} className="me-1" />
                                {app.submittedAt?.toDate
                                  ? new Date(app.submittedAt.toDate()).toLocaleString()
                                  : 'Date not available'}
                              </small>
                            </div>
                            <div>
                              {app.status === 'pending' && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleUpdateApplication(app.id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleUpdateApplication(app.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                onClick={() => handleViewApplication(app)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <Inbox size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No applications yet</h5>
                  <p className="text-muted mb-3">Applications will appear here as students apply</p>
                  <Button variant="primary" href="/institute/courses">
                    Promote Courses
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={4}>
          {/* Notifications */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Card.Title className="mb-0 me-2">Notifications</Card.Title>
                {notifications.length > 0 && (
                  <Badge bg="danger" pill>
                    {notifications.length}
                  </Badge>
                )}
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={handleMarkAllNotificationsAsRead}
                disabled={notifications.length === 0}
                className="text-decoration-none p-0"
              >
                Mark all as read
              </Button>
            </Card.Header>
            <Card.Body>
              {notifications.length > 0 ? (
                <ListGroup variant="flush">
                  {notifications.map((notif) => {
                    const Icon = getNotificationIcon(notif.type);
                    return (
                      <ListGroup.Item key={notif.id} className="border-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className="notification-icon me-3">
                            <Icon size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-1">{notif.message || notif.title}</p>
                            <small className="text-muted">
                              {notif.createdAt?.toDate
                                ? formatRelativeTime(notif.createdAt.toDate())
                                : 'Recently'}
                            </small>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-muted p-0"
                            onClick={() => handleMarkNotificationAsRead(notif.id)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center py-3">
                  <BellSlash size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No new notifications</h5>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Upcoming Events */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Upcoming Events</Card.Title>
              <Button variant="outline-primary" size="sm" href="/institute/events/create">
                <PlusCircle className="me-1" size={16} /> Add Event
              </Button>
            </Card.Header>
            <Card.Body>
              {upcomingEvents.length > 0 ? (
                <ListGroup variant="flush">
                  {upcomingEvents.map((event) => (
                    <ListGroup.Item key={event.id} className="border-0 py-3">
                      <div className="d-flex align-items-center">
                        <div className="event-date text-center me-3">
                          <div className="bg-primary text-white rounded-top py-1 px-2">
                            <small>
                              {event.date?.toDate
                                ? new Date(event.date.toDate()).toLocaleString('default', {
                                    month: 'short',
                                  })
                                : '---'}
                            </small>
                          </div>
                          <div className="border border-top-0 rounded-bottom py-2 px-2">
                            <h5 className="mb-0">
                              {event.date?.toDate ? new Date(event.date.toDate()).getDate() : '--'}
                            </h5>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="text-muted mb-1 small">
                            <GeoAlt size={12} className="me-1" />
                            {event.location || 'Location TBD'}
                          </p>
                          <small className="text-muted">
                            <Clock size={12} className="me-1" />
                            {event.date?.toDate
                              ? new Date(event.date.toDate()).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Time TBD'}
                          </small>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`/institute/events/${event.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3">
                  <CalendarX size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No upcoming events</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    href="/institute/events/create"
                    className="mt-2"
                  >
                    Create Event
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <Card.Title className="mb-0">Quick Stats</Card.Title>
              <Badge bg="info">Live</Badge>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="text-center p-3 border rounded">
                    <Mortarboard size={24} className="text-primary mb-2" />
                    <h6 className="text-muted mb-2">Active Faculty</h6>
                    <h4 className="mb-0">{stats?.totalFaculties || 0}</h4>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 border rounded">
                    <CalendarEvent size={24} className="text-success mb-2" />
                    <h6 className="text-muted mb-2">Upcoming Events</h6>
                    <h4 className="mb-0">{stats?.upcomingEvents || 0}</h4>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 border rounded">
                    <CheckCircle size={24} className="text-warning mb-2" />
                    <h6 className="text-muted mb-2">Completion Rate</h6>
                    <h4 className="mb-0">{stats?.completionRate || 0}%</h4>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center p-3 border rounded">
                    <StarFill size={24} className="text-info mb-2" />
                    <h6 className="text-muted mb-2">Satisfaction</h6>
                    <h4 className="mb-0">{stats?.satisfactionScore || 0}/5</h4>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Courses */}
      {insights?.topCourses && insights.topCourses.length > 0 && (
        <Card className="mt-4 shadow-sm">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <Card.Title className="mb-0">Top Performing Courses</Card.Title>
            <Button variant="outline-primary" size="sm" href="/institute/courses">
              View All Courses
            </Button>
          </Card.Header>
          <Card.Body>
            <Row className="g-4">
              {insights.topCourses.slice(0, 3).map((course) => (
                <Col key={course.id} lg={4} md={6}>
                  <Card className="h-100 border">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Card.Title className="h6 mb-0">{course.title}</Card.Title>
                        <Badge bg="success">{course.enrollmentCount || 0} enrolled</Badge>
                      </div>
                      <Card.Text className="text-muted small mb-3">
                        {course.description?.substring(0, 100)}...
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <StarFill size={14} className="text-warning me-1" />
                          <span className="small">{course.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`/institute/courses/${course.id}`}
                        >
                          Manage
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal show={showAppModal} onHide={() => setShowAppModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={4} className="text-center">
                {selectedApp.studentPhoto ? (
                  <img
                    src={selectedApp.studentPhoto}
                    alt={selectedApp.studentName}
                    className="rounded-circle mb-3"
                    width="120"
                    height="120"
                  />
                ) : (
                  <PersonCircle size={120} className="text-muted mb-3" />
                )}
                <h5>{selectedApp.studentName}</h5>
                <Badge bg={getStatusVariant(selectedApp.status)} className="mb-3">
                  {selectedApp.status}
                </Badge>
              </Col>
              <Col md={8}>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Email:</span>
                    <strong>{selectedApp.studentEmail || 'N/A'}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Program:</span>
                    <strong>{selectedApp.program || 'N/A'}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Submitted:</span>
                    <strong>
                      {selectedApp.submittedAt?.toDate
                        ? new Date(selectedApp.submittedAt.toDate()).toLocaleString()
                        : 'N/A'}
                    </strong>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAppModal(false)}>
              Close
            </Button>
            {selectedApp.status === 'pending' && (
              <>
                <Button
                  variant="success"
                  onClick={() => {
                    handleUpdateApplication(selectedApp.id, 'approved');
                    setShowAppModal(false);
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleUpdateApplication(selectedApp.id, 'rejected');
                    setShowAppModal(false);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default InstitutionDashboard;
