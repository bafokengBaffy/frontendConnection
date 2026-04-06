/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner,
  Modal,
  Form,
  Alert,
  ButtonGroup,
  Pagination,
  Dropdown,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Bookmark,
  CheckCircle,
  XCircle,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  Upload,
} from 'react-feather';
import { formatDistanceToNow, format } from 'date-fns';

import { useAuth } from '../../context/AuthContext';
import './StudentJobs.css';

// Mock data for development
const MOCK_JOBS = [
  {
    id: 1,
    title: 'Frontend Developer',
    companyName: 'Tech Corp Inc',
    companyLogo: 'https://via.placeholder.com/40',
    type: 'full-time',
    location: 'New York, NY',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    status: 'active',
    datePosted: '2024-01-15T10:30:00Z',
    deadline: '2024-02-15',
    description: 'We are looking for a skilled Frontend Developer...',
    skills: ['React', 'JavaScript', 'CSS', 'HTML5'],
  },
  {
    id: 2,
    title: 'Backend Engineer',
    companyName: 'Data Solutions LLC',
    companyLogo: 'https://via.placeholder.com/40',
    type: 'full-time',
    location: 'San Francisco, CA',
    salaryMin: 100000,
    salaryMax: 150000,
    currency: 'USD',
    status: 'active',
    datePosted: '2024-01-16T14:20:00Z',
    deadline: '2024-02-28',
    description: 'Join our backend engineering team...',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
  },
  {
    id: 3,
    title: 'UX Designer',
    companyName: 'Creative Agency',
    companyLogo: 'https://via.placeholder.com/40',
    type: 'contract',
    location: 'Remote',
    salaryMin: 60000,
    salaryMax: 90000,
    currency: 'USD',
    status: 'active',
    datePosted: '2024-01-10T09:15:00Z',
    deadline: '2024-02-10',
    description: 'Design beautiful user experiences...',
    skills: ['Figma', 'Sketch', 'UI/UX', 'Prototyping'],
  },
  {
    id: 4,
    title: 'Data Analyst',
    companyName: 'Finance Partners',
    companyLogo: 'https://via.placeholder.com/40',
    type: 'internship',
    location: 'Chicago, IL',
    salaryMin: 45000,
    salaryMax: 55000,
    currency: 'USD',
    status: 'active',
    datePosted: '2024-01-18T11:45:00Z',
    deadline: '2024-01-31',
    description: 'Analyze financial data and create reports...',
    skills: ['Excel', 'SQL', 'Python', 'Statistics'],
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    companyName: 'Cloud Systems',
    companyLogo: 'https://via.placeholder.com/40',
    type: 'full-time',
    location: 'Austin, TX',
    salaryMin: 110000,
    salaryMax: 140000,
    currency: 'USD',
    status: 'active',
    datePosted: '2024-01-20T08:00:00Z',
    deadline: '2024-03-01',
    description: 'Build and maintain our cloud infrastructure...',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
  },
];

const STATUS_COLORS = {
  active: 'success',
  pending: 'warning',
  expired: 'secondary',
  closed: 'danger',
  draft: 'info',
};

const JOB_TYPES = {
  'full-time': { label: 'Full Time', color: 'primary' },
  'part-time': { label: 'Part Time', color: 'info' },
  internship: { label: 'Internship', color: 'success' },
  contract: { label: 'Contract', color: 'warning' },
  remote: { label: 'Remote', color: 'secondary' },
};

// Mock services for development
const mockJobService = {
  getJobs: async (filters = {}) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredJobs = [...MOCK_JOBS];

    // Apply filters
    if (filters.jobType && filters.jobType !== 'all') {
      filteredJobs = filteredJobs.filter((job) => job.type === filters.jobType);
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter((job) =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.experienceLevel && filters.experienceLevel !== 'all') {
      // Simple mock experience filter
      if (filters.experienceLevel === 'entry') {
        filteredJobs = filteredJobs.filter((job) => job.salaryMax < 70000);
      } else if (filters.experienceLevel === 'mid') {
        filteredJobs = filteredJobs.filter(
          (job) => job.salaryMax >= 70000 && job.salaryMax < 120000
        );
      } else if (filters.experienceLevel === 'senior') {
        filteredJobs = filteredJobs.filter((job) => job.salaryMax >= 120000);
      }
    }

    // Apply sorting
    if (filters.sortBy === 'datePosted') {
      filteredJobs.sort((a, b) => {
        const dateA = new Date(a.datePosted);
        const dateB = new Date(b.datePosted);
        return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (filters.sortBy === 'salary') {
      filteredJobs.sort((a, b) => {
        const salaryA = a.salaryMax || a.salaryMin || 0;
        const salaryB = b.salaryMax || b.salaryMin || 0;
        return filters.sortOrder === 'asc' ? salaryA - salaryB : salaryB - salaryA;
      });
    } else if (filters.sortBy === 'title') {
      filteredJobs.sort((a, b) => {
        return filters.sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      });
    }

    // Pagination
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || 10);
    const endIndex = startIndex + (filters.limit || 10);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(filteredJobs.length / (filters.limit || 10)),
      matches: filteredJobs.length,
    };
  },

  getSavedJobs: async (userId) => {
    if (!userId) return [];
    // Mock saved jobs
    const saved = JSON.parse(localStorage.getItem(`savedJobs_${userId}`) || '[]');
    return saved;
  },

  saveJob: async (userId, jobId) => {
    const saved = JSON.parse(localStorage.getItem(`savedJobs_${userId}`) || '[]');
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(saved));
    }
    return true;
  },

  unsaveJob: async (userId, jobId) => {
    const saved = JSON.parse(localStorage.getItem(`savedJobs_${userId}`) || '[]');
    const newSaved = saved.filter((id) => id !== jobId);
    localStorage.setItem(`savedJobs_${userId}`, JSON.stringify(newSaved));
    return true;
  },
};

const mockApplicationService = {
  getUserApplications: async (userId) => {
    if (!userId) return [];
    const apps = JSON.parse(localStorage.getItem(`applications_${userId}`) || '[]');
    return apps;
  },

  submitApplication: async (applicationData) => {
    const apps = JSON.parse(
      localStorage.getItem(`applications_${applicationData.applicantId}`) || '[]'
    );
    apps.push({
      ...applicationData,
      id: Date.now(),
      appliedAt: new Date().toISOString(),
    });
    localStorage.setItem(`applications_${applicationData.applicantId}`, JSON.stringify(apps));
    return { success: true, id: Date.now() };
  },
};

// Simple notification utility
const showNotification = (title, message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  // You can replace this with a proper notification system later
  alert(`${title}: ${message}`);
};

function StudentJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    saved: 0,
    matches: 0,
  });
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    coverLetter: '',
    resumeUrl: '',
    additionalInfo: '',
  });
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: 'all',
    location: '',
    salaryRange: [0, 100000],
    experienceLevel: 'all',
    deadline: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });
  const [sortBy, setSortBy] = useState('datePosted');
  const [sortOrder, setSortOrder] = useState('desc');

  const { user } = useAuth();

  // Load jobs and applications
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load jobs with filters
      const jobsData = await mockJobService.getJobs({
        status: 'active',
        sortBy,
        sortOrder,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      });

      // Load user's applications
      const appsData = await mockApplicationService.getUserApplications(user?.uid);

      // Load saved jobs
      const savedData = await mockJobService.getSavedJobs(user?.uid);

      setJobs(jobsData.jobs || []);
      setFilteredJobs(jobsData.jobs || []);
      setApplications(appsData || []);
      setSavedJobs(savedData || []);

      // Calculate stats
      setStats({
        total: jobsData.total || 0,
        applied: appsData?.length || 0,
        saved: savedData?.length || 0,
        matches: jobsData.matches || 0,
      });

      setPagination((prev) => ({
        ...prev,
        totalPages: jobsData.totalPages || 1,
      }));
    } catch (error) {
      console.error('Error loading jobs:', error);
      showNotification('Load Error', 'Failed to load job opportunities', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage, filters, user?.uid]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // If no user, still show jobs but disable apply/save features
      const loadPublicJobs = async () => {
        setLoading(true);
        const jobsData = await mockJobService.getJobs({
          status: 'active',
          sortBy,
          sortOrder,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          ...filters,
        });
        setJobs(jobsData.jobs || []);
        setFilteredJobs(jobsData.jobs || []);
        setStats({
          total: jobsData.total || 0,
          applied: 0,
          saved: 0,
          matches: jobsData.matches || 0,
        });
        setLoading(false);
      };
      loadPublicJobs();
    }
  }, [user, loadData, filters, sortBy, sortOrder, pagination.currentPage, pagination.itemsPerPage]);

  // Apply for job
  const handleApply = async (job) => {
    if (!user) {
      showNotification('Authentication Required', 'Please login to apply for jobs', 'warning');
      return;
    }

    try {
      setUploading(true);

      // Check if already applied
      const hasApplied = applications.some((app) => app.jobId === job.id);
      if (hasApplied) {
        showNotification('Already Applied', `You have already applied for "${job.title}"`, 'info');
        return;
      }

      // Submit application
      const applicationData = {
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName,
        applicantId: user.uid,
        applicantName: user.displayName || user.email,
        coverLetter: applyForm.coverLetter,
        resumeUrl: applyForm.resumeUrl || '',
        status: 'submitted',
        appliedAt: new Date().toISOString(),
        additionalInfo: applyForm.additionalInfo,
      };

      await mockApplicationService.submitApplication(applicationData);

      // Add to local state
      setApplications((prev) => [...prev, applicationData]);

      // Update stats
      setStats((prev) => ({
        ...prev,
        applied: prev.applied + 1,
      }));

      showNotification(
        'Application Submitted',
        `Successfully applied for "${job.title}"`,
        'success'
      );

      setShowApplyModal(false);
      setApplyForm({
        coverLetter: '',
        resumeUrl: '',
        additionalInfo: '',
      });
    } catch (error) {
      console.error('Error applying for job:', error);
      showNotification('Application Failed', 'Failed to submit application', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Save/Unsave job
  const handleSaveJob = async (jobId, save = true) => {
    if (!user) {
      showNotification('Authentication Required', 'Please login to save jobs', 'warning');
      return;
    }

    try {
      if (save) {
        await mockJobService.saveJob(user.uid, jobId);
        setSavedJobs((prev) => [...prev, jobId]);
        setStats((prev) => ({ ...prev, saved: prev.saved + 1 }));

        showNotification('Job Saved', 'Job added to your saved list', 'success');
      } else {
        await mockJobService.unsaveJob(user.uid, jobId);
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
        setStats((prev) => ({ ...prev, saved: prev.saved - 1 }));

        showNotification('Job Removed', 'Job removed from saved list', 'info');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      showNotification('Save Failed', 'Failed to update saved jobs', 'error');
    }
  };

  // Upload resume (mock implementation)
  const handleResumeUpload = async (file) => {
    try {
      setUploading(true);
      // Mock upload - in production, this would upload to Cloudinary
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a mock URL
      const mockUrl = URL.createObjectURL(file);

      setApplyForm((prev) => ({
        ...prev,
        resumeUrl: mockUrl,
      }));

      showNotification('Upload Successful', 'Resume uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading resume:', error);
      showNotification('Upload Failed', 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Search and filter
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term.toLowerCase()) ||
        job.companyName.toLowerCase().includes(term.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(term.toLowerCase())) ||
        (job.skills && job.skills.some((skill) => skill.toLowerCase().includes(term.toLowerCase())))
    );

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Sort jobs
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Pagination
  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // Check if job is saved
  const isJobSaved = (jobId) => savedJobs.includes(jobId);

  // Check if job is applied
  const hasAppliedToJob = (jobId) => applications.some((app) => app.jobId === jobId);

  // Format salary
  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Negotiable';
    if (!max) return `${currency} ${min?.toLocaleString() || '0'}+`;
    return `${currency} ${(min || 0).toLocaleString()} - ${max.toLocaleString()}`;
  };

  // Get application status for a job
  const getApplicationStatus = (jobId) => {
    const application = applications.find((app) => app.jobId === jobId);
    return application ? application.status : null;
  };

  // Format date safely
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Open';
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time ago safely
  const formatTimeAgo = (dateString) => {
    try {
      if (!dateString) return '';
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  if (loading && !jobs.length) {
    return (
      <Container className="mt-4 text-center loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Job Opportunities...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4 student-jobs-container">
      {/* Header with Stats */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h1 className="h2 mb-1">Job Opportunities</h1>
          <p className="text-muted mb-0">
            Find your next career opportunity from {stats.total} available jobs
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} className="me-2" />
            Filters
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              showNotification(
                'Feature Coming Soon',
                'Resume upload feature will be available soon',
                'info'
              )
            }
          >
            <Upload size={16} className="me-2" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <Briefcase size={24} className="text-primary mb-2" />
              <h3 className="mb-1">{stats.total}</h3>
              <p className="text-muted mb-0">Available Jobs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <CheckCircle size={24} className="text-success mb-2" />
              <h3 className="mb-1">{stats.applied}</h3>
              <p className="text-muted mb-0">Applied</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <Bookmark size={24} className="text-warning mb-2" />
              <h3 className="mb-1">{stats.saved}</h3>
              <p className="text-muted mb-0">Saved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <Users size={24} className="text-info mb-2" />
              <h3 className="mb-1">{stats.matches}</h3>
              <p className="text-muted mb-0">Matches</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4} className="text-end mt-2 mt-md-0">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Sort by:{' '}
                  {sortBy === 'datePosted'
                    ? 'Date Posted'
                    : sortBy === 'salary'
                      ? 'Salary'
                      : 'Title'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleSort('datePosted')}>
                    Date Posted {sortBy === 'datePosted' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('salary')}>
                    Salary {sortBy === 'salary' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSort('title')}>
                    Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {showFilters && (
            <div className="mt-3 pt-3 border-top">
              <Row>
                <Col md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select
                      value={filters.jobType}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {Object.entries(JOB_TYPES).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Experience Level</Form.Label>
                    <Form.Select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="City, Country"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.deadline}
                      onChange={(e) => handleFilterChange('deadline', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="mt-3 text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      jobType: 'all',
                      location: '',
                      salaryRange: [0, 100000],
                      experienceLevel: 'all',
                      deadline: '',
                    });
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Jobs Table */}
      <Card>
        <Card.Body>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-5 empty-state">
              <Briefcase size={48} className="text-muted mb-3" />
              <h4>No jobs found</h4>
              <p className="text-muted">
                {searchTerm || Object.values(filters).some((f) => f !== 'all' && f !== '')
                  ? 'Try adjusting your search terms or filters'
                  : 'Check back later for new opportunities'}
              </p>
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    jobType: 'all',
                    location: '',
                    salaryRange: [0, 100000],
                    experienceLevel: 'all',
                    deadline: '',
                  });
                }}
              >
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="jobs-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Company</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Salary</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th className="text-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => {
                      const isSaved = isJobSaved(job.id);
                      const hasApplied = hasAppliedToJob(job.id);
                      const applicationStatus = getApplicationStatus(job.id);

                      return (
                        <tr key={job.id} className="job-row">
                          <td>
                            <div className="d-flex flex-column">
                              <strong className="job-title">{job.title}</strong>
                              <small className="text-muted">{formatTimeAgo(job.datePosted)}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {job.companyLogo && (
                                <img
                                  src={job.companyLogo}
                                  alt={job.companyName}
                                  className="company-logo me-2"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/40';
                                  }}
                                />
                              )}
                              <span className="company-name">{job.companyName}</span>
                            </div>
                          </td>
                          <td>
                            <Badge
                              bg={JOB_TYPES[job.type]?.color || 'secondary'}
                              className="badge-job-type"
                            >
                              {JOB_TYPES[job.type]?.label || job.type}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <MapPin size={14} className="me-1 text-muted" />
                              <span className="location">{job.location}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center salary-display">
                              <DollarSign size={14} className="me-1 text-muted" />
                              <span>
                                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Calendar size={14} className="me-1 text-muted" />
                              <span>{formatDate(job.deadline)}</span>
                            </div>
                          </td>
                          <td>
                            {hasApplied ? (
                              <Badge bg="info" pill className="application-status">
                                {applicationStatus || 'Applied'}
                              </Badge>
                            ) : (
                              <Badge
                                bg={STATUS_COLORS[job.status] || 'secondary'}
                                className="job-status"
                              >
                                {job.status}
                              </Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex job-actions">
                              <ButtonGroup size="sm">
                                <Button
                                  variant="outline-primary"
                                  className="me-1"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    // Navigate to job details or show modal
                                    showNotification(
                                      'Job Details',
                                      `Viewing details for "${job.title}"`,
                                      'info'
                                    );
                                  }}
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  variant={isSaved ? 'warning' : 'outline-warning'}
                                  className="me-1"
                                  onClick={() => handleSaveJob(job.id, !isSaved)}
                                  disabled={!user}
                                  title={isSaved ? 'Unsave Job' : 'Save Job'}
                                >
                                  <Bookmark size={14} fill={isSaved} />
                                </Button>
                                {!hasApplied ? (
                                  <Button
                                    variant="primary"
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setShowApplyModal(true);
                                    }}
                                    disabled={!user || job.status !== 'active'}
                                    title={!user ? 'Login to Apply' : 'Apply Now'}
                                  >
                                    Apply
                                  </Button>
                                ) : (
                                  <Button variant="outline-secondary" disabled>
                                    Applied
                                  </Button>
                                )}
                              </ButtonGroup>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    <Pagination.Prev
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    />
                    {[...Array(pagination.totalPages).keys()].map((page) => (
                      <Pagination.Item
                        key={page + 1}
                        active={page + 1 === pagination.currentPage}
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Application Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div className="mb-4">
              <h5>{selectedJob.companyName}</h5>
              <p className="text-muted">
                <MapPin size={14} className="me-1" /> {selectedJob.location} •
                <Badge bg={JOB_TYPES[selectedJob.type]?.color || 'secondary'} className="ms-2">
                  {JOB_TYPES[selectedJob.type]?.label || selectedJob.type}
                </Badge>
              </p>
              <p className="mb-0">
                <strong>Salary:</strong>{' '}
                {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.currency)}
              </p>
              <p className="mb-0">
                <strong>Deadline:</strong> {formatDate(selectedJob.deadline)}
              </p>
            </div>
          )}

          {!user ? (
            <Alert variant="warning">
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>Please login to apply for this job.</p>
            </Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  Cover Letter <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Explain why you're a good fit for this position..."
                  value={applyForm.coverLetter}
                  onChange={(e) =>
                    setApplyForm((prev) => ({
                      ...prev,
                      coverLetter: e.target.value,
                    }))
                  }
                  required
                />
                <Form.Text className="text-muted">
                  Tell us about your skills and experience relevant to this position.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Resume</Form.Label>
                {applyForm.resumeUrl ? (
                  <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                    <span className="text-success">
                      <CheckCircle size={16} className="me-2" />
                      Resume uploaded successfully
                    </span>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setApplyForm((prev) => ({ ...prev, resumeUrl: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            showNotification(
                              'File Too Large',
                              'File must be less than 5MB',
                              'error'
                            );
                            return;
                          }
                          handleResumeUpload(file);
                        }
                      }}
                      disabled={uploading}
                    />
                    <Form.Text className="text-muted">
                      Upload PDF, DOC, or DOCX (Max 5MB). Optional - you can add it later.
                    </Form.Text>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Information</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Any additional information you'd like to share (portfolio links, references, etc.)..."
                  value={applyForm.additionalInfo}
                  onChange={(e) =>
                    setApplyForm((prev) => ({
                      ...prev,
                      additionalInfo: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
            Cancel
          </Button>
          {user && (
            <Button
              variant="primary"
              onClick={() => handleApply(selectedJob)}
              disabled={uploading || !applyForm.coverLetter.trim()}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* User Info Alert */}
      {!user && (
        <Alert variant="info" className="mt-4">
          <Alert.Heading>Login Required for Full Features</Alert.Heading>
          <p>Please login to apply for jobs, save job listings, and track your applications.</p>
        </Alert>
      )}
    </Container>
  );
}

export default StudentJobs;
