/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Dropdown,
  Alert,
  Spinner,
  Modal,
  Pagination,
  ProgressBar,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiTrash2,
  FiDownload,
  FiShare2,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiCalendar,
  FiBriefcase,
  FiChevronRight,
  FiChevronLeft,
  FiRefreshCw,
  FiPlus,
  FiFileText,
  FiExternalLink,
  FiCopy,
  FiArchive,
  FiMessageSquare,
} from 'react-icons/fi';
import { MdAssignment, MdWork, MdBusiness, MdLocationOn, MdAccessTime } from 'react-icons/md';

import { useAuth, useStudent } from '../../context';
import {
  getStudentApplications,
  deleteApplication,
  withdrawApplication,
  updateApplicationStatus,
  exportApplications,
  shareApplication,
} from '../../services/applicationService';
import { formatDate, formatCurrency, truncateText } from '../../utils/dataFormatters';
import { sendNotification } from '../../services/notificationService';
import './StudentApplications.css';

const Applications = () => {
  const { currentUser, userData } = useAuth();
  const { studentData } = useStudent();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    interviewing: 0,
    submitted: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    dateRange: 'all',
    sortBy: 'newest',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    if (!studentData?.id) {
      setError('Student profile not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getStudentApplications(studentData.id);

      if (result.success) {
        const apps = result.data || [];
        setApplications(apps);
        setFilteredApplications(apps);

        // Calculate stats
        calculateStats(apps);

        // Set pagination
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(apps.length / prev.itemsPerPage),
        }));
      } else {
        setError(result.error || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('An error occurred while loading applications');
    } finally {
      setLoading(false);
    }
  }, [studentData?.id]);

  // Calculate statistics
  const calculateStats = (apps) => {
    const stats = {
      total: apps.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      interviewing: 0,
      submitted: 0,
    };

    apps.forEach((app) => {
      const status = app.status?.toLowerCase();
      switch (status) {
        case 'pending':
        case 'under_review':
          stats.pending++;
          break;
        case 'accepted':
        case 'approved':
        case 'hired':
          stats.accepted++;
          break;
        case 'rejected':
        case 'declined':
        case 'not_selected':
          stats.rejected++;
          break;
        case 'interview':
        case 'interviewing':
          stats.interviewing++;
          break;
        case 'submitted':
        case 'applied':
          stats.submitted++;
          break;
        default:
          stats.submitted++;
      }
    });

    setStats(stats);
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...applications];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.jobTitle?.toLowerCase().includes(searchTerm) ||
          app.companyName?.toLowerCase().includes(searchTerm) ||
          app.jobDescription?.toLowerCase().includes(searchTerm) ||
          app.applicationId?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((app) => {
        const status = app.status?.toLowerCase();
        switch (filters.status) {
          case 'pending':
            return status === 'pending' || status === 'under_review';
          case 'accepted':
            return status === 'accepted' || status === 'approved' || status === 'hired';
          case 'rejected':
            return status === 'rejected' || status === 'declined' || status === 'not_selected';
          case 'interview':
            return status === 'interview' || status === 'interviewing';
          case 'submitted':
            return status === 'submitted' || status === 'applied';
          default:
            return true;
        }
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter((app) => app.jobType === filters.type);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }

      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appliedAt || app.createdAt);
        return appDate >= cutoffDate;
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt)
        );
        break;
      case 'oldest':
        filtered.sort(
          (a, b) => new Date(a.appliedAt || a.createdAt) - new Date(b.appliedAt || b.createdAt)
        );
        break;
      case 'deadline':
        filtered.sort(
          (a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31')
        );
        break;
      case 'title':
        filtered.sort((a, b) => (a.jobTitle || '').localeCompare(b.jobTitle || ''));
        break;
      default:
        break;
    }

    // Update filtered applications and pagination
    setFilteredApplications(filtered);
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
    }));
  }, [applications, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle delete application
  const handleDelete = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const result = await deleteApplication(selectedApplication.id);

      if (result.success) {
        // Remove from state
        setApplications((prev) => prev.filter((app) => app.id !== selectedApplication.id));

        // Send notification
        await sendNotification({
          userId: currentUser.uid,
          type: 'application_deleted',
          title: 'Application Deleted',
          message: `Your application for ${selectedApplication.jobTitle} has been deleted`,
          data: { applicationId: selectedApplication.id },
        });

        // Close modal and show success
        setShowDeleteModal(false);
        setSelectedApplication(null);

        // Refresh applications
        fetchApplications();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle withdraw application
  const handleWithdraw = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const result = await withdrawApplication(selectedApplication.id);

      if (result.success) {
        // Update status in state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id
              ? { ...app, status: 'withdrawn', updatedAt: new Date().toISOString() }
              : app
          )
        );

        // Send notification
        await sendNotification({
          userId: currentUser.uid,
          type: 'application_withdrawn',
          title: 'Application Withdrawn',
          message: `You have withdrawn your application for ${selectedApplication.jobTitle}`,
          data: { applicationId: selectedApplication.id },
        });

        // Close modal
        setShowWithdrawModal(false);
        setSelectedApplication(null);

        // Refresh applications
        fetchApplications();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle share application
  const handleShare = async (shareMethod) => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const result = await shareApplication(selectedApplication.id, shareMethod);

      if (result.success) {
        // Show success message
        alert(`Application shared successfully via ${shareMethod}`);
        setShowShareModal(false);
        setSelectedApplication(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error sharing application:', err);
      setError('Failed to share application');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle export applications
  const handleExport = async (format) => {
    try {
      setActionLoading(true);
      const result = await exportApplications(format);

      if (result.success && result.data) {
        // Create download link
        const blob = new Blob([result.data], {
          type: format === 'pdf' ? 'application/pdf' : 'text/csv',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error exporting applications:', err);
      setError('Failed to export applications');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    if (!status) return 'secondary';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted':
      case 'approved':
      case 'hired':
        return 'success';
      case 'rejected':
      case 'declined':
      case 'not_selected':
        return 'danger';
      case 'under_review':
      case 'pending':
      case 'reviewing':
        return 'warning';
      case 'submitted':
      case 'applied':
        return 'primary';
      case 'interview':
      case 'interviewing':
        return 'info';
      case 'withdrawn':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/../g, (l) => l.toUpperCase());
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return <FiAlertCircle />;

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'accepted':
      case 'approved':
      case 'hired':
        return <FiCheckCircle />;
      case 'rejected':
      case 'declined':
      case 'not_selected':
        return <FiXCircle />;
      case 'under_review':
      case 'pending':
      case 'reviewing':
        return <FiClock />;
      case 'interview':
      case 'interviewing':
        return <FiMessageSquare />;
      default:
        return <FiFileText />;
    }
  };

  // Get paginated applications
  const getPaginatedApplications = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: pageNumber,
    }));
  };

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Check if user is student
  useEffect(() => {
    if (userData?.userType && userData.userType !== 'student') {
      navigate('/dashboard');
    }
  }, [userData, navigate]);

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Redirecting to login...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="applications-page py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <MdAssignment className="me-2" />
                My Applications
              </h1>
              <p className="text-muted mb-0">
                Track and manage all your job applications in one place
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={fetchApplications}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spin' : ''} />
                <span className="ms-1 d-none d-md-inline">Refresh</span>
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/student/search/jobs')}>
                <FiPlus />
                <span className="ms-1 d-none d-md-inline">Apply for Jobs</span>
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-primary">{stats.total}</h3>
              <p className="text-muted mb-0 small">Total</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-warning">{stats.pending}</h3>
              <p className="text-muted mb-0 small">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-info">{stats.interviewing}</h3>
              <p className="text-muted mb-0 small">Interviewing</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-success">{stats.accepted}</h3>
              <p className="text-muted mb-0 small">Accepted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-danger">{stats.rejected}</h3>
              <p className="text-muted mb-0 small">Rejected</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2} sm={4} xs={6} className="mb-3">
          <Card className="stat-card h-100">
            <Card.Body className="text-center">
              <h3 className="mb-1 text-primary">{stats.submitted}</h3>
              <p className="text-muted mb-0 small">Submitted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending Review</option>
                <option value="interview">Interviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="deadline">Deadline</option>
                <option value="title">Title (A-Z)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Applications Table */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Application History ({filteredApplications.length})</h5>
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <FiDownload className="me-1" />
                Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('csv')}>Export as CSV</Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('pdf')}>Export as PDF</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-5">
              <FiBriefcase size={48} className="text-muted mb-3" />
              <h5>No applications found</h5>
              <p className="text-muted mb-3">
                {applications.length === 0
                  ? "You haven't applied to any jobs yet."
                  : 'No applications match your filters.'}
              </p>
              {applications.length === 0 && (
                <Button variant="primary" onClick={() => navigate('/student/search/jobs')}>
                  <FiSearch className="me-2" />
                  Browse Jobs
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Company</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedApplications().map((application) => (
                      <tr key={application.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="application-icon me-3">
                              {getStatusIcon(application.status)}
                            </div>
                            <div>
                              <strong className="d-block">
                                <Link
                                  to={`/student/application/${application.id}`}
                                  className="text-decoration-none"
                                >
                                  {application.jobTitle || 'N/A'}
                                </Link>
                              </strong>
                              <small className="text-muted">
                                {application.jobType || 'N/A'} � {application.location || 'Remote'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong className="d-block">{application.companyName || 'N/A'}</strong>
                            <small className="text-muted">{application.industry || 'N/A'}</small>
                          </div>
                        </td>
                        <td>
                          {formatDate(application.appliedAt || application.createdAt)}
                          {application.submittedAt && (
                            <div className="text-muted small">
                              Submitted: {formatDate(application.submittedAt, true)}
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge bg={getStatusBadge(application.status)}>
                            {formatStatus(application.status)}
                          </Badge>
                          {application.lastUpdated && (
                            <div className="text-muted small mt-1">
                              Updated: {formatDate(application.lastUpdated, true)}
                            </div>
                          )}
                        </td>
                        <td>
                          {application.deadline ? (
                            <>
                              <div>{formatDate(application.deadline)}</div>
                              {new Date(application.deadline) < new Date() ? (
                                <small className="text-danger">Expired</small>
                              ) : new Date(application.deadline) <
                                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
                                <small className="text-warning">Due Soon</small>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-muted">No deadline</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/student/application/${application.id}`)}
                              title="View Details"
                            >
                              <FiEye />
                            </Button>
                            {application.status?.toLowerCase() === 'pending' && (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setShowWithdrawModal(true);
                                }}
                                title="Withdraw"
                              >
                                <FiArchive />
                              </Button>
                            )}
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowShareModal(true);
                              }}
                              title="Share"
                            >
                              <FiShare2 />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center py-3 border-top">
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      <FiChevronLeft />
                    </Pagination.Prev>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === pagination.currentPage}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}

                    <Pagination.Next
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      <FiChevronRight />
                    </Pagination.Next>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Quick Tips */}
      <Row>
        <Col>
          <Card className="border-info">
            <Card.Body>
              <h5 className="d-flex align-items-center mb-3">
                <FiAlertCircle className="me-2 text-info" />
                Application Tips
              </h5>
              <Row>
                <Col md={4}>
                  <div className="d-flex mb-2">
                    <FiCheckCircle className="text-success me-2 mt-1" />
                    <div>
                      <strong>Follow Up</strong>
                      <p className="small text-muted mb-0">
                        Follow up on pending applications after 1-2 weeks
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex mb-2">
                    <FiFileText className="text-primary me-2 mt-1" />
                    <div>
                      <strong>Customize Applications</strong>
                      <p className="small text-muted mb-0">
                        Tailor your resume and cover letter for each application
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex mb-2">
                    <FiCalendar className="text-warning me-2 mt-1" />
                    <div>
                      <strong>Track Deadlines</strong>
                      <p className="small text-muted mb-0">
                        Set reminders for application deadlines
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete your application for:</p>
          <p className="fw-bold">{selectedApplication?.jobTitle}</p>
          <p className="text-muted small">
            This action cannot be undone. All application data will be permanently deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Withdraw Confirmation Modal */}
      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to withdraw your application for:</p>
          <p className="fw-bold">{selectedApplication?.jobTitle}</p>
          <p className="text-muted small">
            The company will be notified that you've withdrawn your application.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowWithdrawModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button variant="warning" onClick={handleWithdraw} disabled={actionLoading}>
            {actionLoading ? 'Withdrawing...' : 'Withdraw Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Share your application for <strong>{selectedApplication?.jobTitle}</strong>
          </p>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              onClick={() => handleShare('email')}
              disabled={actionLoading}
            >
              <FiExternalLink className="me-2" />
              Share via Email
            </Button>
            <Button
              variant="outline-success"
              onClick={() => handleShare('link')}
              disabled={actionLoading}
            >
              <FiCopy className="me-2" />
              Copy Shareable Link
            </Button>
            <Button
              variant="outline-info"
              onClick={() => handleShare('pdf')}
              disabled={actionLoading}
            >
              <FiDownload className="me-2" />
              Download as PDF
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Applications;
