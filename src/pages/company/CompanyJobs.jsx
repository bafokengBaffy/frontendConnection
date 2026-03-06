/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Spinner,
  Modal,
  Dropdown,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import {
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaFilter,
  FaDollarSign,
  FaMapMarkerAlt,
  FaClock,
  FaChartLine,
  FaSearch,
  FaEllipsisV,
} from 'react-icons/fa';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { jobService } from '../../services/companyServices';
import './CompanyJobs.css';

const CompanyJobs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    salaryType: 'monthly',
    currency: 'M',
    salaryNegotiable: false,
    type: 'Full-time',
    experience: 'Entry Level',
    requirements: '',
    responsibilities: '',
    qualifications: '',
    benefits: [],
    status: 'Active',
    applicationDeadline: '',
    maxApplications: 0,
    remote: false,
    hybrid: false,
  });

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getCompanyJobs();

      // Process jobs to ensure salary is properly formatted
      const processedJobs = jobsData.map((job) => ({
        ...job,
        // Convert salary object to string if needed
        salaryDisplay: formatSalaryForDisplay(job),
        date: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A',
      }));

      setJobs(processedJobs);
      setFilteredJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.error('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format salary for display
  const formatSalaryForDisplay = (job) => {
    if (!job.salary) return 'Not specified';

    // If salary is an object (old format), convert it
    if (typeof job.salary === 'object') {
      const salaryObj = job.salary;
      const amount = salaryObj.amount || salaryObj.range || '';
      const currency = salaryObj.currency || 'M';
      const type = salaryObj.type || 'monthly';
      const negotiable = salaryObj.negotiable ? ' (Negotiable)' : '';

      const typeMap = {
        monthly: 'per month',
        yearly: 'per year',
        hourly: 'per hour',
      };

      return `${currency}${amount} ${typeMap[type] || type}${negotiable}`;
    }

    // If salary is already a string, return it
    if (typeof job.salary === 'string') {
      return job.salary;
    }

    // If we have separate salary fields (new format)
    if (job.salaryAmount || job.salaryRange) {
      const amount = job.salaryAmount || job.salaryRange || '';
      const currency = job.currency || 'M';
      const type = job.salaryType || 'monthly';
      const negotiable = job.salaryNegotiable ? ' (Negotiable)' : '';

      const typeMap = {
        monthly: 'per month',
        yearly: 'per year',
        hourly: 'per hour',
      };

      return `${currency}${amount} ${typeMap[type] || type}${negotiable}`;
    }

    return 'Not specified';
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term) ||
          job.type.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleEdit = (job = null) => {
    setEditingJob(job);
    if (job) {
      // Handle old salary object format
      let salaryValue = '';
      if (typeof job.salary === 'object' && job.salary.amount) {
        salaryValue = job.salary.amount;
      } else if (typeof job.salary === 'string') {
        salaryValue = job.salary;
      } else if (job.salaryAmount) {
        salaryValue = job.salaryAmount;
      }

      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        salary: salaryValue,
        salaryType:
          job.salaryType || (typeof job.salary === 'object' ? job.salary.type : 'monthly'),
        currency: job.currency || (typeof job.salary === 'object' ? job.salary.currency : 'M'),
        salaryNegotiable:
          job.salaryNegotiable || (typeof job.salary === 'object' ? job.salary.negotiable : false),
        type: job.type || 'Full-time',
        experience: job.experience || 'Entry Level',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        qualifications: job.qualifications || '',
        benefits: job.benefits || [],
        status: job.status || 'Active',
        applicationDeadline: job.applicationDeadline || '',
        maxApplications: job.maxApplications || 0,
        remote: job.remote || false,
        hybrid: job.hybrid || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        salaryType: 'monthly',
        currency: 'M',
        salaryNegotiable: false,
        type: 'Full-time',
        experience: 'Entry Level',
        requirements: '',
        responsibilities: '',
        qualifications: '',
        benefits: [],
        status: 'Active',
        applicationDeadline: '',
        maxApplications: 0,
        remote: false,
        hybrid: false,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Prepare job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        // Store salary as separate fields (new format)
        salaryAmount: formData.salary,
        salaryType: formData.salaryType,
        currency: formData.currency,
        salaryNegotiable: formData.salaryNegotiable,
        type: formData.type,
        experience: formData.experience,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        qualifications: formData.qualifications,
        benefits: formData.benefits,
        status: formData.status,
        applicationDeadline: formData.applicationDeadline,
        maxApplications: formData.maxApplications || 0,
        remote: formData.remote,
        hybrid: formData.hybrid,
        updatedAt: new Date().toISOString(),
      };

      if (editingJob) {
        // Update existing job
        await jobService.updateJob(editingJob.id, jobData);
      } else {
        // Add new job
        jobData.createdAt = new Date().toISOString();
        jobData.applicantsCount = 0;
        jobData.views = 0;
        jobData.companyId = 'current-company-id'; // Should come from auth context
        jobData.companyName = 'Your Company'; // Should come from user profile
        jobData.isActive = formData.status === 'Active';

        await jobService.createJob(jobData);
      }

      await fetchJobs();
      setShowModal(false);
      setEditingJob(null);

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        salary: '',
        salaryType: 'monthly',
        currency: 'M',
        salaryNegotiable: false,
        type: 'Full-time',
        experience: 'Entry Level',
        requirements: '',
        responsibilities: '',
        qualifications: '',
        benefits: [],
        status: 'Active',
        applicationDeadline: '',
        maxApplications: 0,
        remote: false,
        hybrid: false,
      });
    } catch (error) {
      console.error('Error saving job:', error);
      Alert.error('Failed to save job. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await jobService.deleteJob(id);
      await fetchJobs();
      setDeleteConfirm(null);
      Alert.success('Job deleted successfully.');
    } catch (error) {
      console.error('Error deleting job:', error);
      Alert.error('Failed to delete job. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: { bg: 'success', text: 'white' },
      Draft: { bg: 'secondary', text: 'white' },
      Closed: { bg: 'danger', text: 'white' },
      Paused: { bg: 'warning', text: 'dark' },
    };

    const variant = variants[status] || { bg: 'secondary', text: 'white' };

    return (
      <Badge bg={variant.bg} text={variant.text}>
        {status}
      </Badge>
    );
  };

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === 'Active').length,
    totalApplicants: jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0),
    fullTimeJobs: jobs.filter((j) => j.type === 'Full-time').length,
  };

  if (loading && jobs.length === 0) {
    return (
      <Container fluid className="mt-4 text-center px-2">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Jobs...</p>
      </Container>
    );
  }

  // Mobile-friendly job card view
  const MobileJobCard = ({ job }) => (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1 me-2">
            <h6 className="fw-bold mb-1 text-truncate">{job.title}</h6>
            <div className="d-flex align-items-center mb-1 small text-muted">
              <FaMapMarkerAlt className="me-1" size={12} />
              <span className="text-truncate">{job.location}</span>
            </div>
          </div>
          <div>{getStatusBadge(job.status)}</div>
        </div>

        <div className="d-flex align-items-center mb-2">
          <Badge bg="info" className="me-2">
            {job.type}
          </Badge>
          <div className="d-flex align-items-center">
            <FaUsers className="text-muted me-1" size={12} />
            <small className="text-muted">{job.applicantsCount || 0} applicants</small>
          </div>
        </div>

        <div className="mb-2 small">
          <strong>Salary:</strong> {job.salaryDisplay || formatSalaryForDisplay(job)}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Posted: {job.date}</small>
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => navigate(`/company/jobs/${job.id}`)}
              className="px-2"
            >
              <FaEye size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline-warning"
              onClick={() => handleEdit(job)}
              className="px-2"
            >
              <FaEdit size={14} />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => setDeleteConfirm(job.id)}
              className="px-2"
            >
              <FaTrash size={14} />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="company-jobs-container px-0">
      {/* Header - Fixed with proper padding */}
      <div className="bg-white border-bottom px-3 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1 me-2">
            <h1 className="h5 mb-1 fw-bold">
              <FaBriefcase className="me-2 text-primary" />
              Job Postings
            </h1>
            <p className="text-muted mb-0 small">Manage your company&apos;s job openings</p>
          </div>
          <Button
            variant="primary"
            size={isMobile ? 'sm' : undefined}
            onClick={() => handleEdit()}
            className="flex-shrink-0"
          >
            <FaPlus className="me-1" />
            {isMobile ? 'New' : 'Post New Job'}
          </Button>
        </div>
      </div>

      {/* Main Content with vertical scrolling only */}
      <div className="p-3" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
        {/* Stats Cards - Mobile optimized */}
        <Row className="mb-3 g-2">
          <Col xs={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="stat-icon-circle bg-primary-light">
                    <FaBriefcase className="text-primary" size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{stats.totalJobs}</h5>
                <p className="text-muted mb-0 small">Total Jobs</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="stat-icon-circle bg-success-light">
                    <FaChartLine className="text-success" size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{stats.activeJobs}</h5>
                <p className="text-muted mb-0 small">Active Jobs</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="stat-icon-circle bg-info-light">
                    <FaUsers className="text-info" size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{stats.totalApplicants}</h5>
                <p className="text-muted mb-0 small">Applicants</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-3">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="stat-icon-circle bg-warning-light">
                    <FaClock className="text-warning" size={20} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1">{stats.fullTimeJobs}</h5>
                <p className="text-muted mb-0 small">Full-time</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search - Stacked on mobile */}
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <div className="mb-3">
              <InputGroup size={isMobile ? 'sm' : undefined}>
                <InputGroup.Text className="bg-light">
                  <FaFilter size={isMobile ? 14 : undefined} />
                </InputGroup.Text>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size={isMobile ? 'sm' : undefined}
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Closed">Closed</option>
                  <option value="Paused">Paused</option>
                </Form.Select>
              </InputGroup>
            </div>

            <div className="mb-3">
              <InputGroup size={isMobile ? 'sm' : undefined}>
                <InputGroup.Text className="bg-light">
                  <FaSearch size={isMobile ? 14 : undefined} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={isMobile ? 'sm' : undefined}
                />
              </InputGroup>
            </div>

            <div className="d-grid">
              <Button
                variant="outline-secondary"
                onClick={fetchJobs}
                size={isMobile ? 'sm' : undefined}
              >
                <FaFilter className="me-2" />
                Refresh
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Jobs List - Different view for mobile */}
        {isMobile ? (
          // Mobile view: Card-based
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Job Listings</h6>
              <small className="text-muted">{filteredJobs.length} jobs</small>
            </div>

            {filteredJobs.map((job) => (
              <MobileJobCard key={job.id} job={job} />
            ))}

            {filteredJobs.length === 0 && (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <FaBriefcase className="mb-3 text-muted" size={48} />
                  <h6 className="fw-bold mb-2">
                    {jobs.length === 0 ? 'No jobs posted yet' : 'No matching jobs'}
                  </h6>
                  <p className="text-muted mb-3 small">
                    {jobs.length === 0
                      ? 'Click "New" to create your first job posting.'
                      : 'Try changing your filters or search term.'}
                  </p>
                  {jobs.length === 0 && (
                    <Button variant="primary" size="sm" onClick={() => handleEdit()}>
                      <FaPlus className="me-1" />
                      Create First Job
                    </Button>
                  )}
                </Card.Body>
              </Card>
            )}
          </div>
        ) : (
          // Desktop view: Table
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Position</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Salary</th>
                      <th>Applicants</th>
                      <th>Status</th>
                      <th>Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="align-middle">
                        <td>
                          <div>
                            <strong>{job.title}</strong>
                            <div className="small text-muted">
                              {job.companyName || 'Your Company'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <FaMapMarkerAlt className="text-muted" size={14} />
                            <span>{job.location}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{job.type}</Badge>
                        </td>
                        <td>
                          {/* Fixed: Using formatted salary instead of raw object */}
                          {job.salaryDisplay || formatSalaryForDisplay(job)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <FaUsers className="text-muted" size={14} />
                            <Badge bg="secondary">{job.applicantsCount || 0}</Badge>
                          </div>
                        </td>
                        <td>{getStatusBadge(job.status)}</td>
                        <td className="text-muted">{job.date}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => navigate(`/company/jobs/${job.id}`)}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => handleEdit(job)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => setDeleteConfirm(job.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredJobs.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          {jobs.length === 0 ? (
                            <>
                              <FaBriefcase className="mb-2" size={32} />
                              <p className="mb-1">No jobs posted yet</p>
                              <p className="mb-0">
                                Click "Post New Job" to create your first job posting.
                              </p>
                            </>
                          ) : (
                            'No jobs match your filters'
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Job Form Modal - Mobile optimized */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size={isMobile ? 'md' : 'lg'}
        scrollable
      >
        <Modal.Header closeButton className="px-3 py-3">
          <Modal.Title className="h6">{editingJob ? 'Edit Job' : 'Post New Job'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-3">
          <Form>
            <Row className="g-2">
              <Col xs={12} md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Job Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Software Engineer"
                    required
                    size={isMobile ? 'sm' : undefined}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Job Type *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Freelance">Freelance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2">
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g., Maseru, Lesotho"
                    required
                    size={isMobile ? 'sm' : undefined}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Experience Level</Form.Label>
                  <Form.Select
                    name="experience"
                    value={formData.experience}
                    onChange={handleFormChange}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <option value="Entry Level">Entry Level (0-2 years)</option>
                    <option value="Mid Level">Mid Level (3-5 years)</option>
                    <option value="Senior Level">Senior Level (6+ years)</option>
                    <option value="Lead/Manager">Lead / Manager</option>
                    <option value="Executive">Executive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2">
              <Col xs={12} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Salary Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleFormChange}
                    placeholder="e.g., 10,000 - 15,000"
                    size={isMobile ? 'sm' : undefined}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={formData.currency}
                    onChange={handleFormChange}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <option value="M">M (Maloti)</option>
                    <option value="$">$ (Dollar)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="£">£ (Pound)</option>
                    <option value="R">R (Rand)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Salary Type</Form.Label>
                  <Form.Select
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleFormChange}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <option value="monthly">Per Month</option>
                    <option value="yearly">Per Year</option>
                    <option value="hourly">Per Hour</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3 g-2">
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="salaryNegotiable"
                  label="Salary is negotiable"
                  name="salaryNegotiable"
                  checked={formData.salaryNegotiable}
                  onChange={handleFormChange}
                  className="small"
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="remote"
                  label="Remote work allowed"
                  name="remote"
                  checked={formData.remote}
                  onChange={handleFormChange}
                  className="small"
                />
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  id="hybrid"
                  label="Hybrid work arrangement"
                  name="hybrid"
                  checked={formData.hybrid}
                  onChange={handleFormChange}
                  className="small"
                />
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Job Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Describe the job responsibilities..."
                required
                size={isMobile ? 'sm' : undefined}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="requirements"
                value={formData.requirements}
                onChange={handleFormChange}
                placeholder="List job requirements..."
                size={isMobile ? 'sm' : undefined}
              />
            </Form.Group>

            <Row className="g-2">
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Application Deadline</Form.Label>
                  <Form.Control
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleFormChange}
                    size={isMobile ? 'sm' : undefined}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">
                    Max Applications (0 = unlimited)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="maxApplications"
                    value={formData.maxApplications}
                    onChange={handleFormChange}
                    min="0"
                    size={isMobile ? 'sm' : undefined}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                size={isMobile ? 'sm' : undefined}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
                <option value="Paused">Paused</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="px-3 py-3">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            size={isMobile ? 'sm' : undefined}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} size={isMobile ? 'sm' : undefined}>
            {editingJob ? 'Update Job' : 'Post Job'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton className="px-3 py-3">
          <Modal.Title className="h6">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-3">
          Are you sure you want to delete this job? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="px-3 py-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(null)}
            size={isMobile ? 'sm' : undefined}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDelete(deleteConfirm)}
            size={isMobile ? 'sm' : undefined}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyJobs;
