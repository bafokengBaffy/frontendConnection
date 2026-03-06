/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
// src/pages/company/BrowseCandidates.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Modal,
  Alert,
  Spinner,
  Badge,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  InputGroup,
  Pagination,
  ProgressBar,
  ListGroup,
} from 'react-bootstrap';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaStar,
  FaRegStar,
  FaDownload,
  FaPaperclip,
  FaUserPlus,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaLinkedin,
  FaTwitter,
  FaGlobe,
  FaCode,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaBookmark,
  FaRegBookmark,
  FaShareAlt,
  FaFilePdf,
  FaFileWord,
  FaArrowRight,
  FaArrowLeft,
  FaPaperPlane, // ADD THIS IMPORT
} from 'react-icons/fa';
import { companyFirebaseService } from '../../services/companyServices';

const BrowseCandidates = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    education: '',
    experience: '',
    availability: 'all',
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [success, setSuccess] = useState('');

  // Sample candidate data for demonstration
  const sampleCandidates = [
    {
      id: 'c1',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+266 1234 5678',
      location: 'Maseru, Lesotho',
      education: 'BSc Computer Science, National University of Lesotho',
      experience: '3 years',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      summary:
        'Experienced software developer with strong background in full-stack development. Passionate about creating efficient and scalable applications.',
      profileImage: '',
      resumeUrl: '',
      matchScore: 92,
      availability: 'immediately',
      expectedSalary: 'M15,000 - M20,000',
      noticePeriod: '1 month',
      lastActive: '2024-01-15T10:30:00',
    },
    {
      id: 'c2',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+266 2345 6789',
      location: 'Leribe, Lesotho',
      education: 'MBA, Botho University',
      experience: '5 years',
      skills: ['Marketing', 'SEO', 'Social Media', 'Content Strategy', 'Analytics'],
      summary:
        'Digital marketing specialist with proven track record in growing online presence and driving customer engagement.',
      profileImage: '',
      resumeUrl: '',
      matchScore: 85,
      availability: '2 weeks',
      expectedSalary: 'M12,000 - M16,000',
      noticePeriod: '2 weeks',
      lastActive: '2024-01-14T14:20:00',
    },
    {
      id: 'c3',
      fullName: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+266 3456 7890',
      location: 'Berea, Lesotho',
      education: 'Diploma in Accounting, Limkokwing University',
      experience: '2 years',
      skills: ['Accounting', 'QuickBooks', 'Excel', 'Financial Reporting', 'Taxation'],
      summary:
        'Detail-oriented accountant with experience in financial reporting and tax preparation for small businesses.',
      profileImage: '',
      resumeUrl: '',
      matchScore: 78,
      availability: '1 month',
      expectedSalary: 'M10,000 - M14,000',
      noticePeriod: '1 month',
      lastActive: '2024-01-13T09:15:00',
    },
  ];

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    filterAndSortCandidates();
  }, [candidates, searchTerm, filters, sortBy]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      // In real app, fetch from Firebase
      const candidatesData = await companyFirebaseService.browseCandidates(filters);
      setCandidates(candidatesData.length > 0 ? candidatesData : sampleCandidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates(sampleCandidates);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCandidates = () => {
    let result = [...candidates];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (candidate) =>
          candidate.fullName?.toLowerCase().includes(term) ||
          candidate.email?.toLowerCase().includes(term) ||
          candidate.location?.toLowerCase().includes(term) ||
          candidate.skills?.some((skill) => skill.toLowerCase().includes(term)) ||
          candidate.education?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.skills.length > 0) {
      result = result.filter((candidate) =>
        filters.skills.every((filterSkill) =>
          candidate.skills?.some((candidateSkill) =>
            candidateSkill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    if (filters.location) {
      result = result.filter((candidate) =>
        candidate.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.education) {
      result = result.filter((candidate) =>
        candidate.education?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    if (filters.experience) {
      result = result.filter((candidate) =>
        candidate.experience?.toLowerCase().includes(filters.experience.toLowerCase())
      );
    }

    if (filters.availability !== 'all') {
      result = result.filter(
        (candidate) => candidate.availability?.toLowerCase() === filters.availability.toLowerCase()
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'recent':
          return new Date(b.lastActive) - new Date(a.lastActive);
        default:
          return 0;
      }
    });

    setFilteredCandidates(result);
    setCurrentPage(1);
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setShowProfileModal(true);
  };

  const handleContact = (candidate) => {
    setSelectedCandidate(candidate);
    setShowContactModal(true);
  };

  const handleBookmark = (candidateId) => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(candidateId)) {
      newBookmarked.delete(candidateId);
      setSuccess('Candidate removed from bookmarks');
    } else {
      newBookmarked.add(candidateId);
      setSuccess('Candidate added to bookmarks');
    }
    setBookmarked(newBookmarked);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDownloadResume = (candidate) => {
    if (candidate.resumeUrl) {
      window.open(candidate.resumeUrl, '_blank');
    } else {
      setSuccess('Resume not available for this candidate');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleInviteToApply = (candidate) => {
    // In real app, send invitation
    setSuccess(`Invitation sent to ${candidate.fullName}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const getAvailabilityBadge = (availability) => {
    const variants = {
      immediately: { bg: 'success', text: 'Available Immediately' },
      '2 weeks': { bg: 'warning', text: 'Available in 2 Weeks' },
      '1 month': { bg: 'info', text: 'Available in 1 Month' },
      '3 months': { bg: 'secondary', text: 'Available in 3 Months' },
    };

    const variant = variants[availability] || { bg: 'light', text: 'Not Specified' };

    return (
      <Badge bg={variant.bg} className="px-2 py-1">
        {variant.text}
      </Badge>
    );
  };

  const getMatchScoreBadge = (score) => {
    if (score >= 90) {
      return (
        <Badge bg="success" className="px-3 py-2 fs-6">
          <FaStar className="me-1" /> {score}% Match
        </Badge>
      );
    } else if (score >= 80) {
      return (
        <Badge bg="info" className="px-3 py-2 fs-6">
          {score}% Match
        </Badge>
      );
    } else if (score >= 70) {
      return (
        <Badge bg="warning" className="px-3 py-2 fs-6">
          {score}% Match
        </Badge>
      );
    } else {
      return (
        <Badge bg="secondary" className="px-3 py-2 fs-6">
          {score}% Match
        </Badge>
      );
    }
  };

  const getExperienceBadge = (experience) => {
    const years = parseInt(experience) || 0;
    if (years >= 5) {
      return <Badge bg="success">Senior ({experience})</Badge>;
    } else if (years >= 3) {
      return <Badge bg="info">Mid-Level ({experience})</Badge>;
    } else if (years >= 1) {
      return <Badge bg="warning">Junior ({experience})</Badge>;
    } else {
      return <Badge bg="secondary">Entry Level ({experience})</Badge>;
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const clearFilters = () => {
    setFilters({
      skills: [],
      location: '',
      education: '',
      experience: '',
      availability: 'all',
    });
    setSearchTerm('');
    setSortBy('relevance');
  };

  if (loading && candidates.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading candidates...</p>
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
                <FaUsers className="me-2 text-primary" />
                Browse Candidates
              </h1>
              <p className="text-muted mb-0">Discover talented candidates for your job openings</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                className="d-flex align-items-center gap-2"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2"
                onClick={() => console.log('Save search')}
              >
                <FaBookmark /> Save Search
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {success && (
        <Row className="mb-4">
          <Col>
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              <FaCheckCircle className="me-2" />
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Search Candidates</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="search"
                          placeholder="Search by name, skills, location, or education..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-start-0"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., Maseru"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort By</Form.Label>
                      <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="relevance">Best Match</option>
                        <option value="experience">Most Experienced</option>
                        <option value="name">Name A-Z</option>
                        <option value="recent">Most Recent</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Skills</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., React, Python, Marketing"
                        value={filters.skills.join(', ')}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            skills: e.target.value
                              .split(',')
                              .map((skill) => skill.trim())
                              .filter((skill) => skill),
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Education Level</Form.Label>
                      <Form.Select
                        value={filters.education}
                        onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                      >
                        <option value="">Any Education</option>
                        <option value="bachelor">Bachelor&apos;s Degree</option>
                        <option value="master">Master&apos;s Degree</option>
                        <option value="diploma">Diploma</option>
                        <option value="certificate">Certificate</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Availability</Form.Label>
                      <Form.Select
                        value={filters.availability}
                        onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                      >
                        <option value="all">Any Availability</option>
                        <option value="immediately">Immediately</option>
                        <option value="2 weeks">Within 2 Weeks</option>
                        <option value="1 month">Within 1 Month</option>
                        <option value="3 months">Within 3 Months</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="mb-3">
                <FaFilter className="me-2" />
                Quick Stats
              </h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between border-0 py-2">
                  <span>Total Candidates</span>
                  <Badge bg="primary">{candidates.length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 py-2">
                  <span>Filtered Results</span>
                  <Badge bg="info">{filteredCandidates.length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 py-2">
                  <span>High Matches (&gt;80%)</span>
                  <Badge bg="success">{candidates.filter((c) => c.matchScore >= 80).length}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-0 py-2">
                  <span>Available Immediately</span>
                  <Badge bg="warning">
                    {candidates.filter((c) => c.availability === 'immediately').length}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Candidates List */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Found {filteredCandidates.length} Candidates</h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {currentCandidates.length > 0 ? (
                <div className="candidates-list">
                  {currentCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="candidate-item border-bottom p-4 hover-highlight"
                    >
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="d-flex align-items-start mb-3">
                            <div className="me-3">
                              <div
                                className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                                style={{ width: '60px', height: '60px' }}
                              >
                                {candidate.fullName?.charAt(0) || 'C'}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h5 className="mb-1">{candidate.fullName}</h5>
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    {getMatchScoreBadge(candidate.matchScore)}
                                    {getExperienceBadge(candidate.experience)}
                                    {getAvailabilityBadge(candidate.availability)}
                                  </div>
                                </div>
                                <div>
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip>
                                        {bookmarked.has(candidate.id)
                                          ? 'Remove from Bookmarks'
                                          : 'Add to Bookmarks'}
                                      </Tooltip>
                                    }
                                  >
                                    <Button
                                      variant="link"
                                      className="p-0"
                                      onClick={() => handleBookmark(candidate.id)}
                                    >
                                      {bookmarked.has(candidate.id) ? (
                                        <FaBookmark className="text-warning" size={20} />
                                      ) : (
                                        <FaRegBookmark className="text-muted" size={20} />
                                      )}
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </div>

                              <div className="mb-3">
                                <div className="d-flex align-items-center gap-3 mb-2">
                                  <span className="text-muted">
                                    <FaMapMarkerAlt className="me-1" />
                                    {candidate.location}
                                  </span>
                                  <span className="text-muted">
                                    <FaGraduationCap className="me-1" />
                                    {candidate.education?.split(',')[0] ||
                                      'Education not specified'}
                                  </span>
                                  <span className="text-muted">
                                    <FaBriefcase className="me-1" />
                                    {candidate.experience} experience
                                  </span>
                                </div>

                                {candidate.summary && <p className="mb-3">{candidate.summary}</p>}

                                {candidate.skills && candidate.skills.length > 0 && (
                                  <div className="d-flex flex-wrap gap-1">
                                    {candidate.skills.map((skill) => (
                                      <Badge
                                        key={skill}
                                        bg="light"
                                        text="dark"
                                        className="px-2 py-1"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Col>

                        <Col md={4}>
                          <div className="d-flex flex-column gap-2">
                            <Button
                              variant="primary"
                              className="d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleViewProfile(candidate)}
                            >
                              <FaEye /> View Profile
                            </Button>
                            <Button
                              variant="outline-primary"
                              className="d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleContact(candidate)}
                            >
                              <FaEnvelope /> Contact
                            </Button>
                            <Button
                              variant="outline-success"
                              className="d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleDownloadResume(candidate)}
                            >
                              <FaDownload /> Download Resume
                            </Button>
                            <Button
                              variant="outline-warning"
                              className="d-flex align-items-center justify-content-center gap-2"
                              onClick={() => handleInviteToApply(candidate)}
                            >
                              <FaUserPlus /> Invite to Apply
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaUsers className="text-muted mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                  <h4>No candidates found</h4>
                  <p className="text-muted mb-3">
                    {searchTerm || Object.values(filters).some((f) => f && f !== 'all')
                      ? 'Try adjusting your search criteria'
                      : 'No candidates available at the moment'}
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Candidate Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Candidate Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <div>
              <Row className="mb-4">
                <Col md={8}>
                  <div className="d-flex align-items-start">
                    <div className="me-4">
                      <div
                        className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white"
                        style={{ width: '80px', height: '80px' }}
                      >
                        {selectedCandidate.fullName?.charAt(0) || 'C'}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h3 className="mb-2">{selectedCandidate.fullName}</h3>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {getMatchScoreBadge(selectedCandidate.matchScore)}
                        {getExperienceBadge(selectedCandidate.experience)}
                        {getAvailabilityBadge(selectedCandidate.availability)}
                      </div>
                      <div className="d-flex flex-wrap gap-3">
                        <span className="text-muted">
                          <FaEnvelope className="me-1" />
                          {selectedCandidate.email}
                        </span>
                        <span className="text-muted">
                          <FaPhone className="me-1" />
                          {selectedCandidate.phone}
                        </span>
                        <span className="text-muted">
                          <FaMapMarkerAlt className="me-1" />
                          {selectedCandidate.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="primary"
                      className="d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleContact(selectedCandidate)}
                    >
                      <FaEnvelope /> Contact Candidate
                    </Button>
                    <Button
                      variant="outline-primary"
                      className="d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleDownloadResume(selectedCandidate)}
                    >
                      <FaDownload /> Download Resume
                    </Button>
                    <Button
                      variant="outline-success"
                      className="d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleInviteToApply(selectedCandidate)}
                    >
                      <FaUserPlus /> Invite to Apply
                    </Button>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={8}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Professional Summary</h5>
                      <p>{selectedCandidate.summary}</p>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Skills & Expertise</h5>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedCandidate.skills?.map((skill) => (
                          <Badge key={skill} bg="primary" className="px-3 py-2 fs-6">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Education</h5>
                      <p>{selectedCandidate.education}</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Details</h5>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-2">
                          <span>Expected Salary</span>
                          <strong>{selectedCandidate.expectedSalary}</strong>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-2">
                          <span>Notice Period</span>
                          <strong>{selectedCandidate.noticePeriod}</strong>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between border-0 px-0 py-2">
                          <span>Last Active</span>
                          <strong>
                            {new Date(selectedCandidate.lastActive).toLocaleDateString()}
                          </strong>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">Match Analysis</h5>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Skills Match</span>
                          <span>92%</span>
                        </div>
                        <ProgressBar variant="success" now={92} />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Experience Level</span>
                          <span>85%</span>
                        </div>
                        <ProgressBar variant="info" now={85} />
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Cultural Fit</span>
                          <span>78%</span>
                        </div>
                        <ProgressBar variant="warning" now={78} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleContact(selectedCandidate);
              setShowProfileModal(false);
            }}
          >
            <FaEnvelope className="me-2" /> Contact Now
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Contact Candidate Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <Form>
              <Alert variant="info" className="mb-3">
                You are contacting: <strong>{selectedCandidate.fullName}</strong>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Interview Invitation for Software Developer Position"
                  defaultValue="Opportunity at Your Company"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message Template</Form.Label>
                <Form.Select>
                  <option>Select a template...</option>
                  <option value="interview">Interview Invitation</option>
                  <option value="info">Request for Information</option>
                  <option value="apply">Invitation to Apply</option>
                  <option value="followup">Follow-up Message</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Your Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Type your message here..."
                  defaultValue={`Dear ${selectedCandidate.fullName},

We were impressed by your profile and would like to discuss potential opportunities at our company.

Best regards,
Your Company Team`}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Send a copy to my email" defaultChecked />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowContactModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSuccess(`Message sent to ${selectedCandidate?.fullName}`);
              setShowContactModal(false);
              setTimeout(() => setSuccess(''), 3000);
            }}
          >
            <FaPaperPlane className="me-2" /> Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BrowseCandidates;
