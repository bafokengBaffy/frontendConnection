/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Badge,
  Table,
  Pagination,
  Spinner,
  Alert,
  Modal,
  ProgressBar,
  Dropdown
} from 'react-bootstrap';
import {
  Search,
  Filter,
  Person,
  Building,
  GraduationCap,
  MapPin,
  Star,
  Eye,
  Calendar,
  FileText,
  Download,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from 'react-bootstrap-icons';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import './CompanyCandidates.css';

const CompanyCandidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    job: '',
    rating: '',
    dateApplied: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const itemsPerPage = 10;

  // Format current date for display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch candidates from Firestore
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // Sample candidate data - in real app, this would come from your applications collection
      const sampleCandidates = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          jobTitle: 'Frontend Developer',
          status: 'shortlisted',
          dateApplied: '2024-01-10',
          rating: 4,
          experience: '2 years',
          skills: ['React', 'JavaScript', 'HTML', 'CSS'],
          location: 'Maseru',
          phone: '+266 1234 5678',
          lastContact: '2024-01-12',
          interviewDate: '2024-01-20',
          notes: 'Strong portfolio, good communication skills'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          jobTitle: 'Backend Developer',
          status: 'interviewed',
          dateApplied: '2024-01-08',
          rating: 5,
          experience: '3 years',
          skills: ['Node.js', 'Python', 'MongoDB', 'AWS'],
          location: 'Leribe',
          phone: '+266 2345 6789',
          lastContact: '2024-01-15',
          interviewDate: '2024-01-18',
          notes: 'Excellent technical skills, passed coding test'
        },
        {
          id: '3',
          name: 'Robert Johnson',
          email: 'robert.j@example.com',
          jobTitle: 'UX Designer',
          status: 'new',
          dateApplied: '2024-01-14',
          rating: 3,
          experience: '1 year',
          skills: ['Figma', 'UI Design', 'Prototyping', 'User Research'],
          location: 'Maseru',
          phone: '+266 3456 7890',
          lastContact: null,
          interviewDate: null,
          notes: 'Creative portfolio, needs more experience'
        },
        {
          id: '4',
          name: 'Sarah Williams',
          email: 'sarah.w@example.com',
          jobTitle: 'Data Analyst',
          status: 'rejected',
          dateApplied: '2024-01-05',
          rating: 2,
          experience: '4 years',
          skills: ['Python', 'SQL', 'Tableau', 'Statistics'],
          location: 'Botha-Bothe',
          phone: '+266 4567 8901',
          lastContact: '2024-01-09',
          interviewDate: null,
          notes: 'Lacked specific industry experience'
        },
        {
          id: '5',
          name: 'Michael Brown',
          email: 'michael.b@example.com',
          jobTitle: 'Project Manager',
          status: 'hired',
          dateApplied: '2023-12-20',
          rating: 5,
          experience: '5 years',
          skills: ['Agile', 'Scrum', 'Jira', 'Team Leadership'],
          location: 'Maseru',
          phone: '+266 5678 9012',
          lastContact: '2024-01-03',
          interviewDate: '2023-12-28',
          notes: 'Excellent leadership skills, hired for senior position'
        },
        {
          id: '6',
          name: 'Emily Davis',
          email: 'emily.d@example.com',
          jobTitle: 'Marketing Specialist',
          status: 'interviewed',
          dateApplied: '2024-01-12',
          rating: 4,
          experience: '2 years',
          skills: ['Digital Marketing', 'SEO', 'Social Media', 'Content Creation'],
          location: 'Mokhotlong',
          phone: '+266 6789 0123',
          lastContact: '2024-01-16',
          interviewDate: '2024-01-19',
          notes: 'Creative campaign ideas, good cultural fit'
        },
        {
          id: '7',
          name: 'David Wilson',
          email: 'david.w@example.com',
          jobTitle: 'DevOps Engineer',
          status: 'shortlisted',
          dateApplied: '2024-01-11',
          rating: 4,
          experience: '3 years',
          skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
          location: 'Quthing',
          phone: '+266 7890 1234',
          lastContact: '2024-01-13',
          interviewDate: '2024-01-22',
          notes: 'Strong infrastructure skills, recommended by team'
        },
        {
          id: '8',
          name: 'Lisa Anderson',
          email: 'lisa.a@example.com',
          jobTitle: 'HR Specialist',
          status: 'new',
          dateApplied: '2024-01-15',
          rating: 3,
          experience: '2 years',
          skills: ['Recruitment', 'Onboarding', 'Employee Relations', 'HRIS'],
          location: 'Maseru',
          phone: '+266 8901 2345',
          lastContact: null,
          interviewDate: null,
          notes: 'Good academic background, needs practical experience'
        },
        {
          id: '9',
          name: 'Thomas Martinez',
          email: 'thomas.m@example.com',
          jobTitle: 'Sales Executive',
          status: 'interviewed',
          dateApplied: '2024-01-09',
          rating: 4,
          experience: '4 years',
          skills: ['Sales', 'Negotiation', 'CRM', 'Business Development'],
          location: 'Thaba-Tseka',
          phone: '+266 9012 3456',
          lastContact: '2024-01-14',
          interviewDate: '2024-01-17',
          notes: 'Impressive sales record, strong communicator'
        },
        {
          id: '10',
          name: 'Amanda Taylor',
          email: 'amanda.t@example.com',
          jobTitle: 'Finance Analyst',
          status: 'shortlisted',
          dateApplied: '2024-01-13',
          rating: 4,
          experience: '3 years',
          skills: ['Financial Analysis', 'Excel', 'QuickBooks', 'Budgeting'],
          location: 'Maseru',
          phone: '+266 0123 4567',
          lastContact: '2024-01-14',
          interviewDate: '2024-01-21',
          notes: 'Strong analytical skills, good attention to detail'
        }
      ];

      setCandidates(sampleCandidates);
      setFilteredCandidates(sampleCandidates);
      setError('');
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...candidates];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.jobTitle.toLowerCase().includes(term) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filters.status) {
      result = result.filter(candidate => candidate.status === filters.status);
    }
    
    if (filters.job) {
      result = result.filter(candidate => candidate.jobTitle === filters.job);
    }
    
    if (filters.rating) {
      const rating = parseInt(filters.rating);
      result = result.filter(candidate => candidate.rating >= rating);
    }
    
    if (filters.dateApplied) {
      const days = parseInt(filters.dateApplied);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(candidate => {
        const appliedDate = new Date(candidate.dateApplied);
        return appliedDate >= cutoffDate;
      });
    }
    
    setFilteredCandidates(result);
    setCurrentPage(1);
  }, [searchTerm, filters, candidates]);

  // Get unique values for filter dropdowns
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(candidates.map(c => c.status))];
    return uniqueStatuses.sort();
  }, [candidates]);

  const jobTitles = useMemo(() => {
    const uniqueJobs = [...new Set(candidates.map(c => c.jobTitle))];
    return uniqueJobs.sort();
  }, [candidates]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      job: '',
      rating: '',
      dateApplied: ''
    });
  };

  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetails(true);
  };

  const scheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const updateStatus = (candidateId, newStatus) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
    ));
    setFilteredCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId ? { ...candidate, status: newStatus } : candidate
    ));
  };

  const sendMessage = (candidateId) => {
    console.log('Send message to candidate:', candidateId);
    // Implement messaging functionality
  };

  const downloadResume = (candidateId) => {
    console.log('Download resume for candidate:', candidateId);
    // Implement download functionality
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <Badge bg="primary">New</Badge>;
      case 'shortlisted': return <Badge bg="info">Shortlisted</Badge>;
      case 'interviewed': return <Badge bg="warning">Interviewed</Badge>;
      case 'hired': return <Badge bg="success">Hired</Badge>;
      case 'rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Clock className="me-1" />;
      case 'shortlisted': return <Star className="me-1" />;
      case 'interviewed': return <Calendar className="me-1" />;
      case 'hired': return <CheckCircle className="me-1" />;
      case 'rejected': return <XCircle className="me-1" />;
      default: return null;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= rating ? "text-warning" : "text-muted"}
          fill={i <= rating ? "currentColor" : "none"}
        />
      );
    }
    return stars;
  };

  return (
    <Container className="CompanyCandidates-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Candidates Management</h1>
              <p className="text-muted">
                {formattedDate} | Company View
              </p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                <Filter className="me-1" /> Clear Filters
              </Button>
              <Button variant="primary" onClick={fetchCandidates}>
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Overview */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    <Person size={32} className="text-primary mb-2" />
                    <h3>{candidates.length}</h3>
                    <p className="text-muted mb-0">Total Candidates</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    <Star size={32} className="text-warning mb-2" />
                    <h3>{candidates.filter(c => c.status === 'new').length}</h3>
                    <p className="text-muted mb-0">New Applications</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    <Calendar size={32} className="text-info mb-2" />
                    <h3>{candidates.filter(c => c.status === 'interviewed').length}</h3>
                    <p className="text-muted mb-0">Interviewed</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    <CheckCircle size={32} className="text-success mb-2" />
                    <h3>{candidates.filter(c => c.status === 'hired').length}</h3>
                    <p className="text-muted mb-0">Hired</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search candidates by name, email, job title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">
                  Search Candidates
                </Button>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h6">Candidate Filters</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Job Title</Form.Label>
                    <Form.Select
                      name="job"
                      value={filters.job}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Jobs</option>
                      {jobTitles.map(job => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Minimum Rating</Form.Label>
                    <Form.Select
                      name="rating"
                      value={filters.rating}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Rating</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Applied Within</Form.Label>
                    <Form.Select
                      name="dateApplied"
                      value={filters.dateApplied}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Time</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <Card.Title as="h5" className="mb-0">
                {filteredCandidates.length} Candidates Found
              </Card.Title>
              <Badge bg="primary" pill>
                Page {currentPage} of {totalPages}
              </Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading candidates...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredCandidates.length === 0 ? (
                <Alert variant="info">No candidates found matching your criteria.</Alert>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Rating</th>
                        <th>Experience</th>
                        <th>Skills</th>
                        <th>Applied</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCandidates.map(candidate => (
                        <tr key={candidate.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="candidate-avatar me-3">
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '40px', height: '40px' }}>
                                  <Person size={20} />
                                </div>
                              </div>
                              <div>
                                <strong>{candidate.name}</strong>
                                <div className="small text-muted">{candidate.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <Building className="me-2" size={14} />
                              {candidate.jobTitle}
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(candidate.status)}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {renderStars(candidate.rating)}
                              <span className="ms-2 small">{candidate.rating}/5</span>
                            </div>
                          </td>
                          <td>
                            {candidate.experience}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {candidate.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} bg="light" text="dark" className="me-1">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills.length > 3 && (
                                <Badge bg="secondary">+{candidate.skills.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="small text-muted">
                              {new Date(candidate.dateApplied).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-primary" size="sm" id={`dropdown-${candidate.id}`}>
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => viewCandidateDetails(candidate)}>
                                  <Eye className="me-2" /> View Details
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => scheduleInterview(candidate)}>
                                  <Calendar className="me-2" /> Schedule Interview
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => sendMessage(candidate.id)}>
                             
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => downloadResume(candidate.id)}>
                                  <Download className="me-2" /> Download Resume
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Header>Update Status</Dropdown.Header>
                                <Dropdown.Item onClick={() => updateStatus(candidate.id, 'shortlisted')}>
                                  <Star className="me-2" /> Shortlist
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => updateStatus(candidate.id, 'interviewed')}>
                                  <Calendar className="me-2" /> Mark as Interviewed
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => updateStatus(candidate.id, 'hired')}>
                                  <CheckCircle className="me-2" /> Hire
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => updateStatus(candidate.id, 'rejected')}>
                                  <XCircle className="me-2" /> Reject
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First 
                          onClick={() => handlePageChange(1)} 
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1}
                        />
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <Pagination.Item
                                key={pageNumber}
                                active={pageNumber === currentPage}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </Pagination.Item>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <Pagination.Ellipsis key={pageNumber} />;
                          }
                          return null;
                        })}
                        
                        <Pagination.Next 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last 
                          onClick={() => handlePageChange(totalPages)} 
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Candidate Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Candidate Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <Row>
              <Col md={4} className="text-center">
                <div className="candidate-photo mb-3">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '120px', height: '120px' }}>
                    <Person size={48} />
                  </div>
                </div>
                <h4>{selectedCandidate.name}</h4>
                <p className="text-muted">{selectedCandidate.email}</p>
                <div className="mb-3">
                  {getStatusBadge(selectedCandidate.status)}
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-center mb-2">
                    {renderStars(selectedCandidate.rating)}
                  </div>
                  <small className="text-muted">Candidate Rating</small>
                </div>
                <Button variant="primary" className="me-2 mb-2">
             
                </Button>
                <Button variant="outline-primary" className="mb-2">
                  <Phone className="me-1" /> Call
                </Button>
              </Col>
              <Col md={8}>
                <h5>Application Information</h5>
                <Row className="mb-3">
                  <Col>
                    <strong>Job Title:</strong> {selectedCandidate.jobTitle}
                  </Col>
                  <Col>
                    <strong>Experience:</strong> {selectedCandidate.experience}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <strong>Location:</strong> {selectedCandidate.location}
                  </Col>
                  <Col>
                    <strong>Phone:</strong> {selectedCandidate.phone}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <strong>Applied:</strong> {new Date(selectedCandidate.dateApplied).toLocaleDateString()}
                  </Col>
                  <Col>
                    <strong>Last Contact:</strong> 
                    {selectedCandidate.lastContact 
                      ? new Date(selectedCandidate.lastContact).toLocaleDateString()
                      : ' Not contacted'}
                  </Col>
                </Row>
                
                <h5 className="mt-4">Skills</h5>
                <div className="mb-4">
                  <div className="d-flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, index) => (
                      <Badge key={index} bg="primary" className="p-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <h5>Notes</h5>
                <p className="text-muted">{selectedCandidate.notes}</p>
                
                {selectedCandidate.interviewDate && (
                  <>
                    <h5 className="mt-4">Interview Schedule</h5>
                    <Alert variant="info">
                      <Calendar className="me-2" />
                      Interview scheduled for: {new Date(selectedCandidate.interviewDate).toLocaleDateString()}
                    </Alert>
                  </>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => updateStatus(selectedCandidate?.id, 'hired')}>
            <CheckCircle className="me-1" /> Hire Candidate
          </Button>
          <Button variant="primary" onClick={() => scheduleInterview(selectedCandidate)}>
            <Calendar className="me-1" /> Schedule Interview
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <div>
              <p>Schedule an interview with <strong>{selectedCandidate.name}</strong> for the position of <strong>{selectedCandidate.jobTitle}</strong>.</p>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Interview Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Interview Time</Form.Label>
                  <Form.Control type="time" />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Interview Type</Form.Label>
                  <Form.Select>
                    <option value="phone">Phone Interview</option>
                    <option value="video">Video Interview</option>
                    <option value="in-person">In-person Interview</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Interviewers</Form.Label>
                  <Form.Control type="text" placeholder="Enter interviewer names" />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Any specific topics to cover..." />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInterviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            console.log('Interview scheduled for:', selectedCandidate?.name);
            setShowInterviewModal(false);
          }}>
            Schedule Interview
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyCandidates;