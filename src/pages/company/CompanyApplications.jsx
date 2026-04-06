// src/pages/company/CompanyApplications.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Dropdown,
  Form,
  InputGroup,
  Spinner,
  Pagination,
  Modal,
} from 'react-bootstrap';
import {
  FaEye,
  FaFilter,
  FaSortAmountDown,
  FaSearch,
  FaUserTie,
  FaCalendarAlt,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaDownload,
  FaCommentDots,
  FaArrowLeft,
} from 'react-icons/fa';

import { applicationService } from '../../services/companyServices';
import './CompanyApplications.css';

const CompanyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getCompanyApplications();
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      applied: { bg: 'light', text: 'dark', label: 'Applied' },
      reviewed: { bg: 'info', text: 'white', label: 'Reviewed' },
      interview: { bg: 'primary', text: 'white', label: 'Interview' },
      hired: { bg: 'success', text: 'white', label: 'Hired' },
      rejected: { bg: 'danger', text: 'white', label: 'Rejected' },
      withdrawn: { bg: 'secondary', text: 'white', label: 'Withdrawn' },
    };

    const variant = variants[status] || { bg: 'secondary', text: 'white', label: status };

    return (
      <Badge bg={variant.bg} text={variant.text} className="status-badge">
        {variant.label}
      </Badge>
    );
  };

  const getFilteredApplications = () => {
    let filtered = [...applications];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((app) => app.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.candidate?.fullName?.toLowerCase().includes(term) ||
          app.job?.title?.toLowerCase().includes(term) ||
          app.candidate?.email?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt) - new Date(a.appliedAt);
        case 'oldest':
          return new Date(a.appliedAt) - new Date(b.appliedAt);
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'name':
          return (a.candidate?.fullName || '').localeCompare(b.candidate?.fullName || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      await fetchApplications();

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDownloadResume = (application) => {
    if (application.candidate?.resume) {
      window.open(application.candidate.resume, '_blank');
    } else {
      alert('No resume available for this candidate');
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return 'N/A';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const filteredApplications = getFilteredApplications();
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <Spinner animation="border" variant="primary" />
          <span className="ms-3">Loading applications...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="company-applications-container px-4 py-3">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 fw-bold">
                <FaFileAlt className="me-2 text-primary" />
                Job Applications
              </h1>
              <p className="text-muted mb-0">
                Manage and review applications for your job postings
              </p>
            </div>
            <Button variant="outline-primary" onClick={() => navigate('/company/dashboard')}>
              <FaArrowLeft className="me-2" />
              Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Card */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <Row>
                <Col>
                  <div className="text-center">
                    <h3 className="mb-1">{applications.length}</h3>
                    <p className="text-muted mb-0">Total Applications</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center">
                    <h3 className="mb-1 text-info">
                      {
                        applications.filter(
                          (app) => app.status === 'applied' || app.status === 'reviewed'
                        ).length
                      }
                    </h3>
                    <p className="text-muted mb-0">Pending Review</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center">
                    <h3 className="mb-1 text-success">
                      {applications.filter((app) => app.status === 'hired').length}
                    </h3>
                    <p className="text-muted mb-0">Hired</p>
                  </div>
                </Col>
                <Col>
                  <div className="text-center">
                    <h3 className="mb-1 text-warning">
                      {applications.filter((app) => app.status === 'interview').length}
                    </h3>
                    <p className="text-muted mb-0">In Interview</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters & Search */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by candidate name, job title, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100">
                      <FaFilter className="me-2" />
                      Status:{' '}
                      {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setFilter('all')}>
                        All Applications
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilter('applied')}>
                        New Applications
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilter('reviewed')}>Reviewed</Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilter('interview')}>
                        Interview Stage
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilter('hired')}>Hired</Dropdown.Item>
                      <Dropdown.Item onClick={() => setFilter('rejected')}>Rejected</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" className="w-100">
                      <FaSortAmountDown className="me-2" />
                      Sort By
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setSortBy('newest')}>
                        Newest First
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy('oldest')}>
                        Oldest First
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy('match')}>Best Match</Dropdown.Item>
                      <Dropdown.Item onClick={() => setSortBy('name')}>
                        Candidate Name
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applications Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {paginatedApplications.length > 0 ? (
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Candidate</th>
                      <th>Job Position</th>
                      <th>Applied</th>
                      <th>Match Score</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => (
                      <tr key={application.id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center">
                            {application.candidate?.profileImage ? (
                              <img
                                src={application.candidate.profileImage}
                                alt={application.candidate.fullName}
                                className="rounded-circle me-3"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="avatar-placeholder rounded-circle me-3 d-flex align-items-center justify-content-center bg-primary text-white"
                                style={{ width: '40px', height: '40px' }}
                              >
                                {application.candidate?.fullName?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div>
                              <strong>
                                {application.candidate?.fullName || 'Unknown Candidate'}
                              </strong>
                              <div className="small text-muted">
                                <FaEnvelope className="me-1" size={12} />
                                {application.candidate?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{application.job?.title || 'Unknown Position'}</strong>
                            <div className="small text-muted">
                              {application.job?.location || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="text-muted">{getTimeAgo(application.appliedAt)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                              <div
                                className={`progress-bar ${application.matchScore > 80 ? 'bg-success' : application.matchScore > 60 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${application.matchScore || 0}%` }}
                              />
                            </div>
                            <span>{application.matchScore || 0}%</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(application.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleDownloadResume(application)}
                              title="Download Resume"
                            >
                              <FaDownload />
                            </Button>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                                id="dropdown-status"
                              >
                                Update
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(application.id, 'reviewed')}
                                >
                                  Mark as Reviewed
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(application.id, 'interview')}
                                >
                                  Schedule Interview
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(application.id, 'hired')}
                                >
                                  Mark as Hired
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                >
                                  Reject Application
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <FaFileAlt
                    className="text-muted mb-3"
                    style={{ fontSize: '3rem', opacity: 0.5 }}
                  />
                  <h5>No applications found</h5>
                  <p className="text-muted mb-3">
                    {filter !== 'all'
                      ? `No applications with status "${filter}"`
                      : 'No applications yet'}
                  </p>
                  <Button variant="primary" onClick={() => navigate('/company/jobs')}>
                    View Job Postings
                  </Button>
                </div>
              )}
            </Card.Body>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card.Footer className="bg-white border-0">
                <div className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, idx) => (
                      <Pagination.Item
                        key={idx + 1}
                        active={idx + 1 === currentPage}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Application Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              {/* Candidate Info */}
              <Row className="mb-4">
                <Col md={3}>
                  {selectedApplication.candidate?.profileImage ? (
                    <img
                      src={selectedApplication.candidate.profileImage}
                      alt={selectedApplication.candidate.fullName}
                      className="rounded-circle img-fluid"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white mx-auto"
                      style={{ width: '120px', height: '120px' }}
                    >
                      <span className="display-4">
                        {selectedApplication.candidate?.fullName?.charAt(0) || 'C'}
                      </span>
                    </div>
                  )}
                </Col>
                <Col md={9}>
                  <h4>{selectedApplication.candidate?.fullName || 'Unknown Candidate'}</h4>
                  <p className="text-muted mb-2">
                    <FaEnvelope className="me-2" />
                    {selectedApplication.candidate?.email || 'N/A'}
                  </p>
                  {selectedApplication.candidate?.phone && (
                    <p className="text-muted mb-2">
                      <FaPhone className="me-2" />
                      {selectedApplication.candidate.phone}
                    </p>
                  )}
                  {selectedApplication.candidate?.location && (
                    <p className="text-muted mb-2">
                      <FaUserTie className="me-2" />
                      {selectedApplication.candidate.location}
                    </p>
                  )}
                  <div className="mt-3">{getStatusBadge(selectedApplication.status)}</div>
                </Col>
              </Row>

              {/* Job Details */}
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Job Applied For</h6>
                </Card.Header>
                <Card.Body>
                  <h5>{selectedApplication.job?.title || 'Unknown Position'}</h5>
                  <p className="text-muted mb-2">{selectedApplication.job?.location || 'N/A'}</p>
                  <p className="mb-0">
                    {selectedApplication.job?.description?.substring(0, 200)}...
                  </p>
                </Card.Body>
              </Card>

              {/* Application Info */}
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="mb-3">Application Details</h6>
                      <p>
                        <strong>Applied:</strong> {getTimeAgo(selectedApplication.appliedAt)}
                      </p>
                      <p>
                        <strong>Match Score:</strong> {selectedApplication.matchScore || 0}%
                      </p>
                      <p>
                        <strong>Last Updated:</strong> {getTimeAgo(selectedApplication.updatedAt)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h6 className="mb-3">Candidate Skills</h6>
                      {selectedApplication.candidate?.skills &&
                      selectedApplication.candidate.skills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {selectedApplication.candidate.skills.map((skill, index) => (
                            <Badge key={index} bg="light" text="dark" className="p-2">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No skills listed</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Actions */}
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Actions</h6>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => handleDownloadResume(selectedApplication)}
                    >
                      <FaDownload className="me-2" />
                      Download Resume
                    </Button>
                    <Button
                      variant="outline-success"
                      onClick={() => {
                        handleUpdateStatus(selectedApplication.id, 'interview');
                        setShowDetailsModal(false);
                      }}
                    >
                      <FaCalendarAlt className="me-2" />
                      Schedule Interview
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate(`/company/applications/${selectedApplication.id}/review`)
                      }
                    >
                      <FaCommentDots className="me-2" />
                      Review Application
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowDetailsModal(false);
              navigate(`/company/applications/${selectedApplication?.id}`);
            }}
          >
            View Full Details
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyApplications;
