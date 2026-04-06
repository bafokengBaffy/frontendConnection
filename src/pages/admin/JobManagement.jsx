/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Modal,
  InputGroup,
  Pagination,
} from 'react-bootstrap';
import {
  FaSearch,
  FaBriefcase,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const JobManagement = () => {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    jobType: 'all',
    approved: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 10,
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.jobs.getAllJobs(
        {
          ...filters,
          search: searchTerm,
        },
        page,
        pagination.limit
      );

      if (response.success) {
        setJobs(response.data.jobs);
        setPagination({
          page: response.data.page,
          total: response.data.total,
          totalPages: response.data.totalPages,
          limit: response.data.limit,
        });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleApproveJob = async () => {
    try {
      setActionLoading(true);
      const response = await adminService.jobs.approveJob(selectedJob.id, currentUser, userProfile);
      if (response.success) {
        fetchJobs(pagination.page);
        setShowApproveModal(false);
        setSelectedJob(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectJob = async () => {
    try {
      setActionLoading(true);
      const response = await adminService.jobs.rejectJob(selectedJob.id, currentUser, userProfile);
      if (response.success) {
        fetchJobs(pagination.page);
        setShowRejectModal(false);
        setSelectedJob(null);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (job) => {
    setJobDetails(job);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status, approved) => {
    if (approved === false) return <Badge bg="danger">Rejected</Badge>;
    if (approved === true) return <Badge bg="success">Approved</Badge>;

    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'closed':
        return <Badge bg="secondary">Closed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getJobTypeBadge = (jobType) => {
    const types = {
      'full-time': 'primary',
      'part-time': 'info',
      internship: 'success',
      freelance: 'warning',
      volunteer: 'secondary',
      remote: 'dark',
    };

    const variant = types[jobType] || 'secondary';
    return <Badge bg={variant}>{jobType || 'N/A'}</Badge>;
  };

  const handlePageChange = (pageNumber) => {
    fetchJobs(pageNumber);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="job-management">
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">
            <FaBriefcase className="me-2" />
            Job Management
          </h4>
          <p className="text-muted mb-0">Review and approve job postings</p>
        </Card.Header>
        <Card.Body>
          {/* Search and Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search jobs by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={8}>
              <Row>
                <Col>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="remote">Remote</option>
                  </Form.Select>
                </Col>
                <Col>
                  <Form.Select
                    value={filters.approved}
                    onChange={(e) => handleFilterChange('approved', e.target.value)}
                  >
                    <option value="all">All Approval</option>
                    <option value="true">Approved</option>
                    <option value="false">Not Approved</option>
                  </Form.Select>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {/* Jobs Table */}
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <Alert variant="info" className="text-center">
                No jobs found matching your criteria.
              </Alert>
            ) : (
              <>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <div>
                            <strong>{job.title}</strong>
                            <div className="text-muted small">{job.location || 'Remote'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="small">{job.companyName || 'Unknown Company'}</div>
                        </td>
                        <td>{getJobTypeBadge(job.jobType)}</td>
                        <td>{getStatusBadge(job.status, job.approved)}</td>
                        <td>
                          <div className="small">{formatDate(job.createdAt)}</div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(job)}
                              title="View Details"
                            >
                              <FaEye />
                            </Button>
                            {!job.approved && job.status !== 'rejected' && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowApproveModal(true);
                                  }}
                                  disabled={actionLoading}
                                  title="Approve Job"
                                >
                                  <FaCheckCircle />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setShowRejectModal(true);
                                  }}
                                  disabled={actionLoading}
                                  title="Reject Job"
                                >
                                  <FaTimesCircle />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                      />
                      <Pagination.Prev
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      />
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === pagination.page}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      />
                      <Pagination.Last
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to approve job: <strong>{selectedJob?.title}</strong>?
          <br />
          <small className="text-muted">This job will become visible to all users.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleApproveJob} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" /> : 'Approve'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reject job: <strong>{selectedJob?.title}</strong>?
          <br />
          <small className="text-muted">
            This job will be marked as rejected and won&apos;t be visible to users.
          </small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRejectJob} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" /> : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {jobDetails ? (
            <Row>
              <Col md={6}>
                <h6>Job Information</h6>
                <dl className="row">
                  <dt className="col-sm-4">Title</dt>
                  <dd className="col-sm-8">{jobDetails.title}</dd>

                  <dt className="col-sm-4">Company</dt>
                  <dd className="col-sm-8">{jobDetails.companyName}</dd>

                  <dt className="col-sm-4">Type</dt>
                  <dd className="col-sm-8">{getJobTypeBadge(jobDetails.jobType)}</dd>

                  <dt className="col-sm-4">Status</dt>
                  <dd className="col-sm-8">
                    {getStatusBadge(jobDetails.status, jobDetails.approved)}
                  </dd>

                  <dt className="col-sm-4">Location</dt>
                  <dd className="col-sm-8">{jobDetails.location || 'Remote'}</dd>

                  <dt className="col-sm-4">Salary</dt>
                  <dd className="col-sm-8">{jobDetails.salary || 'Not specified'}</dd>
                </dl>
              </Col>
              <Col md={6}>
                <h6>Additional Information</h6>
                <dl className="row">
                  <dt className="col-sm-4">Created</dt>
                  <dd className="col-sm-8">{formatDate(jobDetails.createdAt)}</dd>

                  <dt className="col-sm-4">Deadline</dt>
                  <dd className="col-sm-8">{formatDate(jobDetails.deadline) || 'No deadline'}</dd>

                  <dt className="col-sm-4">Approval</dt>
                  <dd className="col-sm-8">
                    {jobDetails.approved ? (
                      <Badge bg="success">Approved</Badge>
                    ) : (
                      <Badge bg="warning">Pending Approval</Badge>
                    )}
                  </dd>
                </dl>

                {jobDetails.description && (
                  <>
                    <h6 className="mt-3">Description</h6>
                    <p className="small text-muted">
                      {jobDetails.description.substring(0, 200)}...
                    </p>
                  </>
                )}
              </Col>
            </Row>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobManagement;
