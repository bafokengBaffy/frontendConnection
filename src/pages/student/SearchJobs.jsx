/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// src/pages/student/SearchJobs.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Pagination,
  Modal,
} from 'react-bootstrap';
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaStar,
  FaBookmark,
  FaShareAlt,
  FaSync,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Import your Firebase configuration
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import cloudinaryService from '../../services/cloudinaryService';
import jobService from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

const SearchJobs = () => {
  const { currentUser: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    experienceLevel: '',
    salaryRange: '',
    remote: false,
  });
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeUrl: '',
    portfolioUrl: '',
    additionalInfo: '',
  });
  const [uploadingResume, setUploadingResume] = useState(false);

  const JOBS_PER_PAGE = 10;

  // Fetch jobs from Firebase
  const fetchJobs = useCallback(
    async (page = 1, isNewSearch = false) => {
      try {
        setLoading(true);

        let jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'active'),
          where('deadline', '>=', new Date().toISOString().split('T')[0]),
          orderBy('deadline', 'asc'),
          orderBy('createdAt', 'desc')
        );

        // Apply filters
        if (filters.jobType) {
          jobsQuery = query(jobsQuery, where('jobType', '==', filters.jobType));
        }
        if (filters.location) {
          jobsQuery = query(jobsQuery, where('location', '==', filters.location));
        }
        if (filters.experienceLevel) {
          jobsQuery = query(jobsQuery, where('experienceLevel', '==', filters.experienceLevel));
        }
        if (filters.remote) {
          jobsQuery = query(jobsQuery, where('isRemote', '==', true));
        }

        // Pagination
        if (!isNewSearch && lastVisible && page > 1) {
          jobsQuery = query(jobsQuery, startAfter(lastVisible));
        }
        jobsQuery = query(jobsQuery, limit(JOBS_PER_PAGE));

        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = [];

        querySnapshot.forEach((doc) => {
          jobsData.push({
            id: doc.id,
            ...doc.data(),
            deadline: formatDate(doc.data().deadline),
            postedDate: formatDate(doc.data().createdAt),
          });
        });

        // Update last visible document for pagination
        if (querySnapshot.docs.length > 0) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }

        // Fetch company details for each job
        const jobsWithCompany = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const companyDoc = await getDocs(
                query(collection(db, 'companies'), where('companyId', '==', job.companyId))
              );
              if (!companyDoc.empty) {
                const companyData = companyDoc.docs[0].data();
                return {
                  ...job,
                  companyName: companyData.companyName,
                  companyLogo: companyData.logoUrl,
                  companyIndustry: companyData.industry,
                };
              }
              return job;
            } catch (error) {
              console.error('Error fetching company details:', error);
              return job;
            }
          })
        );

        if (isNewSearch || page === 1) {
          setJobs(jobsWithCompany);
          setFilteredJobs(jobsWithCompany);
        } else {
          setJobs((prev) => [...prev, ...jobsWithCompany]);
          setFilteredJobs((prev) => [...prev, ...jobsWithCompany]);
        }

        // Calculate total pages
        const totalCountQuery = query(collection(db, 'jobs'), where('status', '==', 'active'));
        const totalSnapshot = await getDocs(totalCountQuery);
        setTotalPages(Math.ceil(totalSnapshot.size / JOBS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [filters, lastVisible]
  );

  // Fetch user's saved and applied jobs
  const fetchUserJobStatus = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch saved jobs
      const savedQuery = query(collection(db, 'savedJobs'), where('userId', '==', user.uid));
      const savedSnapshot = await getDocs(savedQuery);
      const saved = savedSnapshot.docs.map((doc) => doc.data().jobId);
      setSavedJobs(saved);

      // Fetch applied jobs
      const appliedQuery = query(collection(db, 'applications'), where('userId', '==', user.uid));
      const appliedSnapshot = await getDocs(appliedQuery);
      const applied = appliedSnapshot.docs.map((doc) => doc.data().jobId);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Error fetching user job status:', error);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchJobs(1, true);
    fetchUserJobStatus();
  }, [fetchJobs, fetchUserJobStatus]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.requirements?.some((req) => req.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    setLastVisible(null);
    fetchJobs(1, true);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      jobType: '',
      location: '',
      experienceLevel: '',
      salaryRange: '',
      remote: false,
    });
    setSearchTerm('');
    setCurrentPage(1);
    setLastVisible(null);
    fetchJobs(1, true);
  };

  // Handle save job
  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      const isSaved = savedJobs.includes(jobId);

      if (isSaved) {
        // Remove from saved
        const savedQuery = query(
          collection(db, 'savedJobs'),
          where('userId', '==', user.uid),
          where('jobId', '==', jobId)
        );
        const savedSnapshot = await getDocs(savedQuery);
        savedSnapshot.docs.forEach(async (doc) => {
          await doc.ref.delete();
        });

        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
        toast.success('Job removed from saved');
      } else {
        // Add to saved
        await collection(db, 'savedJobs').add({
          userId: user.uid,
          jobId,
          savedAt: new Date().toISOString(),
        });

        setSavedJobs((prev) => [...prev, jobId]);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  // Handle apply for job
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  // Upload resume to Cloudinary
  const handleResumeUpload = async (file) => {
    try {
      setUploadingResume(true);

      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadFile(file, 'resumes');

      if (uploadResult.url) {
        setApplicationData((prev) => ({
          ...prev,
          resumeUrl: uploadResult.url,
        }));
        toast.success('Resume uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!user || !selectedJob) return;

    try {
      const application = {
        userId: user.uid,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        companyId: selectedJob.companyId,
        companyName: selectedJob.companyName,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        ...applicationData,
      };

      // Save to Firebase
      await submitApplication(application);

      // Update applied jobs list
      setAppliedJobs((prev) => [...prev, selectedJob.id]);

      // Close modal and reset
      setShowApplyModal(false);
      setSelectedJob(null);
      setApplicationData({
        coverLetter: '',
        resumeUrl: '',
        portfolioUrl: '',
        additionalInfo: '',
      });

      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'salary':
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      default:
        return 0;
    }
  });

  // Get job type badge color
  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'success';
      case 'part-time':
        return 'warning';
      case 'contract':
        return 'info';
      case 'internship':
        return 'primary';
      case 'remote':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  // Get experience level badge
  const getExperienceBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'entry':
        return <Badge bg="success">Entry Level</Badge>;
      case 'mid':
        return <Badge bg="warning">Mid Level</Badge>;
      case 'senior':
        return <Badge bg="danger">Senior Level</Badge>;
      default:
        return <Badge bg="secondary">{level || 'Not Specified'}</Badge>;
    }
  };

  // Format salary
  const formatSalary = (min, max, currency = 'LSL') => {
    if (!min && !max) return 'Negotiable';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${currency} ${min.toLocaleString()}`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Negotiable';
  };

  // Job Card Component
  const JobCard = ({ job }) => {
    const isSaved = savedJobs.includes(job.id);
    const hasApplied = appliedJobs.includes(job.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-4 shadow-sm hover-shadow">
          <Card.Body>
            <Row>
              <Col xs={2} md={1} className="d-flex align-items-center">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <FaBriefcase size={24} className="text-muted" />
                  </div>
                )}
              </Col>

              <Col xs={10} md={9}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{job.title}</h5>
                    <p className="text-muted mb-1">
                      <FaBriefcase className="me-1" />
                      {job.companyName || 'Company not specified'}
                      {job.companyIndustry && (
                        <Badge bg="light" text="dark" className="ms-2">
                          {job.companyIndustry}
                        </Badge>
                      )}
                    </p>

                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <Badge bg={getJobTypeColor(job.jobType)}>{job.jobType || 'Full-time'}</Badge>
                      {getExperienceBadge(job.experienceLevel)}
                      {job.isRemote && <Badge bg="dark">Remote</Badge>}
                    </div>

                    <div className="d-flex flex-wrap gap-3 text-muted small">
                      <span>
                        <FaMapMarkerAlt className="me-1" />
                        {job.location || 'Location not specified'}
                      </span>
                      <span>
                        <FaMoneyBillWave className="me-1" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span>
                        <FaCalendarAlt className="me-1" />
                        Apply by: {job.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSaveJob(job.id)}
                    >
                      <FaBookmark className={isSaved ? 'text-primary' : ''} />
                      {isSaved ? ' Saved' : ' Save'}
                    </Button>

                    <Button
                      variant={hasApplied ? 'success' : 'primary'}
                      size="sm"
                      onClick={() => handleApplyClick(job)}
                      disabled={hasApplied || new Date(job.deadline) < new Date()}
                    >
                      {hasApplied ? 'Applied' : 'Apply Now'}
                      {!hasApplied && <FaExternalLinkAlt className="ms-1" />}
                    </Button>
                  </div>
                </div>

                {job.description && (
                  <p className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
                    {job.description.length > 200
                      ? `${job.description.substring(0, 200)}...`
                      : job.description}
                  </p>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-2">
                    <strong className="me-2">Skills:</strong>
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 5 && (
                      <Badge bg="light" text="dark">
                        +{job.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">Search Jobs</h2>
          <p className="text-muted">
            Find your dream job from {jobs.length} available opportunities
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => setShowFilters(!showFilters)}
            className="me-2"
          >
            <FaFilter className="me-1" />
            Filters
          </Button>
          <Button variant="outline-secondary" onClick={() => fetchJobs(1, true)}>
            <FaSync className="me-1" />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="lg"
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select
                      value={filters.jobType}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Experience Level</Form.Label>
                    <Form.Select
                      value={filters.experienceLevel}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    >
                      <option value="">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Salary Range</Form.Label>
                    <Form.Select
                      value={filters.salaryRange}
                      onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                    >
                      <option value="">Any Salary</option>
                      <option value="0-10000">Up to LSL 10,000</option>
                      <option value="10000-25000">LSL 10,000 - 25,000</option>
                      <option value="25000-50000">LSL 25,000 - 50,000</option>
                      <option value="50000+">Above LSL 50,000</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Check
                    type="switch"
                    id="remote-switch"
                    label="Remote Jobs Only"
                    checked={filters.remote}
                    onChange={(e) => handleFilterChange('remote', e.target.checked)}
                    className="mb-3"
                  />
                </Col>
                <Col className="text-end">
                  <Button variant="outline-secondary" onClick={resetFilters} className="me-2">
                    Reset Filters
                  </Button>
                  <Button variant="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>
      )}

      {/* Sort and Results Info */}
      <Row className="mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center">
            <span className="me-3">Sort by:</span>
            <Button
              variant={sortBy === 'recent' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className="me-2"
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === 'deadline' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSortBy('deadline')}
              className="me-2"
            >
              Deadline
            </Button>
            <Button
              variant={sortBy === 'salary' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setSortBy('salary')}
            >
              Salary (High to Low)
            </Button>
          </div>
        </Col>
        <Col xs="auto">
          <span className="text-muted">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </span>
        </Col>
      </Row>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading jobs...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredJobs.length === 0 && (
        <Alert variant="info" className="text-center">
          <FaSearch size={48} className="mb-3" />
          <h4>No jobs found</h4>
          <p>Try adjusting your search or filters</p>
          <Button variant="outline-primary" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </Alert>
      )}

      {/* Jobs List */}
      {!loading && filteredJobs.length > 0 && (
        <>
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                />
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        fetchJobs(pageNum, pageNum === 1);
                      }}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                {totalPages > 5 && <Pagination.Ellipsis />}
                <Pagination.Next
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Apply Job Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <div className="mb-4">
                <h5>{selectedJob.title}</h5>
                <p className="text-muted mb-2">
                  {selectedJob.companyName} • {selectedJob.location}
                </p>
                <p>{selectedJob.description?.substring(0, 150)}...</p>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Cover Letter *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={applicationData.coverLetter}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        coverLetter: e.target.value,
                      }))
                    }
                    placeholder="Explain why you're a good fit for this position..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Resume/CV *</Form.Label>
                  <div className="d-flex align-items-center">
                    <Form.Control
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleResumeUpload(file);
                      }}
                      disabled={uploadingResume}
                    />
                    {uploadingResume && <Spinner animation="border" size="sm" className="ms-2" />}
                  </div>
                  {applicationData.resumeUrl && (
                    <Alert variant="success" className="mt-2 mb-0 py-2">
                      ✓ Resume uploaded successfully
                    </Alert>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Portfolio/Website URL (Optional)</Form.Label>
                  <Form.Control
                    type="url"
                    value={applicationData.portfolioUrl}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        portfolioUrl: e.target.value,
                      }))
                    }
                    placeholder="https://yourportfolio.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Additional Information (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={applicationData.additionalInfo}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        additionalInfo: e.target.value,
                      }))
                    }
                    placeholder="Any additional comments or information..."
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitApplication}
            disabled={!applicationData.coverLetter.trim() || !applicationData.resumeUrl}
          >
            Submit Application
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SearchJobs;
