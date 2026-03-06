/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Button,
  Card,
  Badge,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Pagination,
  Modal,
  Dropdown,
  DropdownButton,
  ProgressBar,
  ListGroup,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaBriefcase,
  FaGraduationCap,
  FaMoneyBillWave,
  FaLightbulb,
  FaUsers,
  FaRocket,
  FaBook,
  FaFilter,
  FaCalendar,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaEye,
  FaHeart,
  FaShareAlt,
  FaBuilding,
  FaUserTie,
  FaBookOpen,
  FaChartLine,
  FaHandshake,
  FaShieldAlt,
  FaRegSave,
  FaExternalLinkAlt,
  FaSort,
  FaTimes,
  FaArrowRight,
  FaDownload,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaCog,
  FaBell,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

import { toast } from 'react-toastify';
import './Search.css';

const Search = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    location: '',
    experienceLevel: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    jobs: 0,
    courses: 0,
    funding: 0,
    business: 0,
    mentorship: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [popularOpportunities, setPopularOpportunities] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Categories with icons and colors
  const categories = [
    { id: 'all', name: 'All Categories', icon: FaBriefcase, color: '#6c757d', count: 0 },
    { id: OPPORTUNITY_TYPES.JOB, name: 'Jobs & Internships', icon: FaBriefcase, color: '#0d6efd' },
    {
      id: OPPORTUNITY_TYPES.COURSE,
      name: 'Courses & Training',
      icon: FaGraduationCap,
      color: '#198754',
    },
    {
      id: OPPORTUNITY_TYPES.FUNDING,
      name: 'Funding & Grants',
      icon: FaMoneyBillWave,
      color: '#ffc107',
    },
    {
      id: OPPORTUNITY_TYPES.BUSINESS_IDEA,
      name: 'Business Ideas',
      icon: FaRocket,
      color: '#dc3545',
    },
    { id: OPPORTUNITY_TYPES.MENTORSHIP, name: 'Mentorship', icon: FaUsers, color: '#6f42c1' },
    { id: OPPORTUNITY_TYPES.NETWORKING, name: 'Networking', icon: FaHandshake, color: '#20c997' },
    { id: OPPORTUNITY_TYPES.INCUBATION, name: 'Incubation', icon: FaBuilding, color: '#fd7e14' },
    {
      id: OPPORTUNITY_TYPES.COMPETITION,
      name: 'Competitions',
      icon: FaChartLine,
      color: '#e83e8c',
    },
    { id: OPPORTUNITY_TYPES.RESOURCE, name: 'Resources', icon: FaBook, color: '#17a2b8' },
  ];

  // Load opportunities on component mount
  useEffect(() => {
    fetchOpportunities();
    fetchStats();
    fetchPopularOpportunities();
    fetchRecentOpportunities();
    if (currentUser) {
      fetchSavedOpportunities();
    }
  }, [currentUser]);

  // Fetch opportunities based on current filters and search
  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const result = await searchOpportunities({
        query: searchQuery,
        type: activeTab !== 'all' ? activeTab : null,
        category: filters.category !== 'all' ? filters.category : null,
        location: filters.location || null,
        experienceLevel: filters.experienceLevel !== 'all' ? filters.experienceLevel : null,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: currentPage,
        pageSize: 10,
      });

      setSearchResults(result.opportunities || []);
      setTotalResults(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      showToast('Failed to load opportunities. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch opportunity statistics
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const statsData = await getOpportunityStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch popular opportunities
  const fetchPopularOpportunities = async () => {
    try {
      const popular = await getPopularOpportunities(5);
      setPopularOpportunities(popular || []);
    } catch (error) {
      console.error('Error fetching popular opportunities:', error);
    }
  };

  // Fetch recent opportunities
  const fetchRecentOpportunities = async () => {
    try {
      const recent = await getRecentOpportunities(5);
      setRecentOpportunities(recent || []);
    } catch (error) {
      console.error('Error fetching recent opportunities:', error);
    }
  };

  // Fetch saved opportunities for current user
  const fetchSavedOpportunities = async () => {
    try {
      const saved = await getSavedOpportunities(currentUser.uid);
      setSavedOpportunities(saved ? saved.map((opp) => opp.id) : []);
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
    }
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1);
    await fetchOpportunities();
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      location: '',
      experienceLevel: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setSearchQuery('');
    setActiveTab('all');
    setCurrentPage(1);
    fetchOpportunities();
  };

  // Toggle save opportunity
  const handleSaveOpportunity = async (opportunityId) => {
    if (!currentUser) {
      showToast('Please login to save opportunities.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const result = await toggleSaveOpportunity(currentUser.uid, opportunityId);

      if (result.saved) {
        setSavedOpportunities((prev) => [...prev, opportunityId]);
        showToast('Opportunity saved to your favorites!', 'success');
      } else {
        setSavedOpportunities((prev) => prev.filter((id) => id !== opportunityId));
        showToast('Opportunity removed from favorites.', 'success');
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      showToast('Failed to save opportunity. Please try again.', 'error');
    }
  };

  // View opportunity details
  const viewOpportunityDetails = async (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetails(true);

    // Increment view count
    try {
      await incrementViewCount(opportunity.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  // Get category icon
  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      const Icon = category.icon;
      return <Icon style={{ color: category.color }} />;
    }
    return <FaBriefcase />;
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const typeConfig = {
      [OPPORTUNITY_TYPES.JOB]: { label: 'Job', variant: 'primary', icon: FaBriefcase },
      [OPPORTUNITY_TYPES.COURSE]: { label: 'Course', variant: 'success', icon: FaGraduationCap },
      [OPPORTUNITY_TYPES.FUNDING]: { label: 'Funding', variant: 'warning', icon: FaMoneyBillWave },
      [OPPORTUNITY_TYPES.BUSINESS_IDEA]: { label: 'Business', variant: 'danger', icon: FaRocket },
      [OPPORTUNITY_TYPES.MENTORSHIP]: { label: 'Mentorship', variant: 'info', icon: FaUsers },
    };
    const config = typeConfig[type] || {
      label: 'Opportunity',
      variant: 'secondary',
      icon: FaBriefcase,
    };
    const Icon = config.icon;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <Icon className="me-1" />
        {config.label}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      [STATUS.OPEN]: { label: 'Open', variant: 'success' },
      [STATUS.CLOSED]: { label: 'Closed', variant: 'secondary' },
      [STATUS.UPCOMING]: { label: 'Upcoming', variant: 'warning' },
      [STATUS.DRAFT]: { label: 'Draft', variant: 'dark' },
    };
    const config = statusConfig[status] || { label: 'Unknown', variant: 'secondary' };
    return <Badge bg={config.variant}>{config.label}</Badge>;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOpportunities();
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  };

  if (loading && searchResults.length === 0) {
    return (
      <Container className="search-page">
        <div className="search-header">
          <h1>Search Opportunities</h1>
          <p className="lead">Find jobs, courses, funding, and more...</p>
        </div>
        <div className="loading-container text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading opportunities...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="search-page">
      {/* Alert for notifications */}
      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          {alertMessage}
        </Alert>
      )}

      {/* Header */}
      <div className="search-header">
        <h1>Search Opportunities</h1>
        <p className="lead">
          Find jobs, courses, funding, business ideas, and mentorship opportunities
        </p>
      </div>

      {/* Search Bar */}
      <Card className="search-bar-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search for jobs, courses, funding, business ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant={showFilters ? 'primary' : 'outline-secondary'}
                onClick={() => setShowFilters(!showFilters)}
                disabled={loading}
              >
                <FaFilter className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </InputGroup>

            {/* Categories */}
            <div className="categories-scroll mb-3">
              <div className="d-flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeTab === category.id;
                  const count =
                    stats[
                      category.id === 'all'
                        ? 'total'
                        : category.id === 'jobs'
                          ? 'jobs'
                          : category.id === 'courses'
                            ? 'courses'
                            : category.id === 'funding'
                              ? 'funding'
                              : category.id === 'business'
                                ? 'business'
                                : category.id === 'mentorship'
                                  ? 'mentorship'
                                  : 0
                    ];
                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => {
                        setActiveTab(category.id);
                        setCurrentPage(1);
                        fetchOpportunities();
                      }}
                      className="d-flex align-items-center"
                      style={
                        isActive
                          ? {
                              backgroundColor: category.color,
                              borderColor: category.color,
                            }
                          : {}
                      }
                      disabled={loading}
                    >
                      <Icon className="me-2" />
                      <span>{category.name}</span>
                      {count > 0 && (
                        <Badge bg={isActive ? 'light' : 'secondary'} text="dark" className="ms-2">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="filter-panel mt-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <FaFilter className="me-2" />
                      Filters
                    </h6>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={clearFilters}
                      className="text-decoration-none"
                      disabled={loading}
                    >
                      <FaTimes className="me-1" />
                      Clear All
                    </Button>
                  </div>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Select
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          disabled={loading}
                        >
                          <option value="">All Locations</option>
                          <option value="Maseru">Maseru</option>
                          <option value="Berea">Berea</option>
                          <option value="Leribe">Leribe</option>
                          <option value="Remote">Remote</option>
                          <option value="Online">Online</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          disabled={loading}
                        >
                          <option value="all">All Categories</option>
                          {Object.entries(CATEGORIES || {}).map(([key, value]) => (
                            <option key={key} value={value}>
                              {value.charAt(0).toUpperCase() + value.slice(1)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort By</Form.Label>
                        <Form.Select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          disabled={loading}
                        >
                          <option value="createdAt">Newest</option>
                          <option value="deadline">Deadline</option>
                          <option value="viewCount">Most Viewed</option>
                          <option value="applicationCount">Most Applied</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Experience Level</Form.Label>
                        <Form.Select
                          value={filters.experienceLevel}
                          onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                          disabled={loading}
                        >
                          <option value="all">All Levels</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort Order</Form.Label>
                        <Form.Select
                          value={filters.sortOrder}
                          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                          disabled={loading}
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={fetchOpportunities}
                      disabled={loading}
                    >
                      <FaSearch className="me-2" />
                      Apply Filters
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Stats Bar */}
      <Card className="stats-bar mb-4">
        <Card.Body>
          {loadingStats ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading stats...</span>
            </div>
          ) : (
            <Row className="text-center">
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.total || 0}</h3>
                  <p className="stat-label">Total</p>
                </div>
              </Col>
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.jobs || 0}</h3>
                  <p className="stat-label">Jobs</p>
                </div>
              </Col>
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.courses || 0}</h3>
                  <p className="stat-label">Courses</p>
                </div>
              </Col>
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.funding || 0}</h3>
                  <p className="stat-label">Funding</p>
                </div>
              </Col>
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.business || 0}</h3>
                  <p className="stat-label">Business</p>
                </div>
              </Col>
              <Col xs={6} md={2}>
                <div className="stat-item">
                  <h3 className="stat-number">{stats.mentorship || 0}</h3>
                  <p className="stat-label">Mentorship</p>
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Results Section */}
      <Row>
        <Col lg={8}>
          <div className="results-header d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                <FaSearch className="me-2" />
                Showing {searchResults.length} of {totalResults} opportunities
                {activeTab !== 'all' && (
                  <span className="text-muted">
                    {' '}
                    in {categories.find((c) => c.id === activeTab)?.name}
                  </span>
                )}
              </h5>
              <small className="text-muted">{searchQuery && `Results for "${searchQuery}"`}</small>
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Sort:</span>
              <DropdownButton
                variant="outline-secondary"
                title={
                  filters.sortBy === 'createdAt'
                    ? 'Newest'
                    : filters.sortBy === 'deadline'
                      ? 'Deadline'
                      : filters.sortBy === 'viewCount'
                        ? 'Most Viewed'
                        : 'Most Applied'
                }
                size="sm"
                disabled={loading}
              >
                <Dropdown.Item
                  onClick={() => {
                    handleFilterChange('sortBy', 'createdAt');
                    fetchOpportunities();
                  }}
                >
                  <FaSort className="me-2" />
                  Newest
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    handleFilterChange('sortBy', 'deadline');
                    fetchOpportunities();
                  }}
                >
                  <FaCalendar className="me-2" />
                  Deadline
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    handleFilterChange('sortBy', 'viewCount');
                    fetchOpportunities();
                  }}
                >
                  <FaEye className="me-2" />
                  Most Viewed
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    handleFilterChange('sortBy', 'applicationCount');
                    fetchOpportunities();
                  }}
                >
                  <FaUsers className="me-2" />
                  Most Applied
                </Dropdown.Item>
              </DropdownButton>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading opportunities...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <Alert variant="info" className="mt-4">
              <div className="text-center py-4">
                <FaSearch className="display-4 text-muted mb-3" />
                <h4>No opportunities found</h4>
                <p className="mb-3">Try adjusting your search or filters</p>
                <Button variant="outline-primary" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <div className="opportunities-list">
                {searchResults.map((opportunity) => (
                  <Card key={opportunity.id} className="opportunity-card mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-3">
                          <div className="d-flex align-items-center mb-2">
                            {getTypeBadge(opportunity.type)}
                            <Badge bg="light" text="dark" className="ms-2">
                              {getCategoryIcon(opportunity.category)} {opportunity.category}
                            </Badge>
                            {getStatusBadge(opportunity.status)}
                            {opportunity.deadline &&
                              new Date(opportunity.deadline) < new Date() && (
                                <Badge bg="danger" className="ms-2">
                                  Expired
                                </Badge>
                              )}
                          </div>

                          <h5 className="mb-2">{opportunity.title}</h5>

                          <p className="text-muted mb-2">
                            {opportunity.type === OPPORTUNITY_TYPES.JOB && (
                              <>
                                <FaBuilding className="me-1" />
                                {opportunity.company || 'Company not specified'} •
                                <FaMapMarkerAlt className="ms-2 me-1" />
                                {opportunity.location || 'Location not specified'} •
                                {opportunity.salary && (
                                  <>
                                    <FaMoneyBillWave className="ms-2 me-1" />
                                    {opportunity.salary}
                                  </>
                                )}
                              </>
                            )}
                            {opportunity.type === OPPORTUNITY_TYPES.COURSE && (
                              <>
                                <FaGraduationCap className="me-1" />
                                {opportunity.institution || 'Institution not specified'} •
                                <FaMapMarkerAlt className="ms-2 me-1" />
                                {opportunity.location || 'Online'} •
                                {opportunity.duration && (
                                  <>
                                    <FaClock className="ms-2 me-1" />
                                    {opportunity.duration}
                                  </>
                                )}
                              </>
                            )}
                            {opportunity.type === OPPORTUNITY_TYPES.FUNDING && (
                              <>
                                <FaShieldAlt className="me-1" />
                                {opportunity.organization || 'Organization not specified'} •
                                {opportunity.amount && (
                                  <>
                                    <FaMoneyBillWave className="ms-2 me-1" />
                                    {opportunity.amount} •
                                  </>
                                )}
                                <FaClock className="me-1" />
                                Deadline: {formatDate(opportunity.deadline)}
                              </>
                            )}
                            {opportunity.type === OPPORTUNITY_TYPES.BUSINESS_IDEA && (
                              <>
                                <FaRocket className="me-1" />
                                Business Idea •
                                <FaChartLine className="ms-2 me-1" />
                                {opportunity.industry || 'Industry not specified'}
                              </>
                            )}
                            {opportunity.type === OPPORTUNITY_TYPES.MENTORSHIP && (
                              <>
                                <FaUserTie className="me-1" />
                                {opportunity.mentorName || 'Mentor not specified'} •
                                <FaClock className="ms-2 me-1" />
                                {opportunity.duration || 'Duration not specified'}
                              </>
                            )}
                          </p>

                          <p className="mb-2">{opportunity.description?.substring(0, 200)}...</p>

                          <div className="tags mb-2">
                            {opportunity.tags?.slice(0, 5).map((tag) => (
                              <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="meta-info text-muted small">
                            <span className="me-3">
                              <FaCalendar className="me-1" />
                              Posted: {formatDate(opportunity.createdAt)}
                            </span>
                            {opportunity.deadline && (
                              <span className="me-3">
                                <FaClock className="me-1" />
                                Deadline: {formatDate(opportunity.deadline)}
                              </span>
                            )}
                            <span className="me-3">
                              <FaEye className="me-1" />
                              {opportunity.viewCount || 0} views
                            </span>
                            <span>
                              <FaUsers className="me-1" />
                              {opportunity.applicationCount || 0} applied
                            </span>
                          </div>
                        </div>

                        <div className="d-flex flex-column ms-3">
                          <Button
                            variant="primary"
                            size="sm"
                            className="mb-2 d-flex align-items-center"
                            onClick={() => viewOpportunityDetails(opportunity)}
                          >
                            <FaExternalLinkAlt className="me-2" />
                            View Details
                          </Button>
                          <Button
                            variant={
                              savedOpportunities.includes(opportunity.id)
                                ? 'warning'
                                : 'outline-secondary'
                            }
                            size="sm"
                            onClick={() => handleSaveOpportunity(opportunity.id)}
                            className="mb-2 d-flex align-items-center"
                            disabled={!currentUser}
                          >
                            <FaHeart
                              className={
                                savedOpportunities.includes(opportunity.id)
                                  ? 'text-danger me-2'
                                  : 'me-2'
                              }
                            />
                            {savedOpportunities.includes(opportunity.id) ? 'Saved' : 'Save'}
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center"
                            onClick={() => {
                              if (opportunity.type === OPPORTUNITY_TYPES.JOB) {
                                navigate('/student/apply-job', { state: { opportunity } });
                              } else if (opportunity.type === OPPORTUNITY_TYPES.COURSE) {
                                navigate('/student/apply-course', { state: { opportunity } });
                              } else if (opportunity.type === OPPORTUNITY_TYPES.FUNDING) {
                                navigate('/entrepreneur/funding', { state: { opportunity } });
                              } else {
                                navigate('/dashboard');
                              }
                            }}
                          >
                            <FaArrowRight className="me-2" />
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container mt-4">
                  <Pagination className="justify-content-center">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                    {[...Array(totalPages)].map((_, index) => (
                      <Pagination.Item
                        key={index + 1}
                        active={currentPage === index + 1}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FaBriefcase className="me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Button
                variant="primary"
                className="w-100 mb-2 d-flex align-items-center justify-content-center"
                onClick={() => navigate('/dashboard')}
              >
                <FaArrowRight className="me-2" />
                Go to Dashboard
              </Button>
              {!currentUser ? (
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/login')}
                >
                  <FaUserTie className="me-2" />
                  Login to Save Opportunities
                </Button>
              ) : (
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/profile')}
                >
                  <FaCog className="me-2" />
                  Update Profile
                </Button>
              )}
              <Button
                variant="outline-success"
                className="w-100 mb-2 d-flex align-items-center justify-content-center"
                onClick={() => navigate('/resources/guides')}
              >
                <FaBookOpen className="me-2" />
                View Resources
              </Button>
              <Button
                variant="outline-info"
                className="w-100 d-flex align-items-center justify-content-center"
                onClick={() => navigate('/ai/dashboard')}
              >
                <FaLightbulb className="me-2" />
                AI Insights
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0 d-flex align-items-center">
                <FaHeart className="me-2 text-danger" />
                Saved Opportunities
              </h5>
            </Card.Header>
            <Card.Body>
              {!currentUser ? (
                <div className="text-center py-3">
                  <FaHeart className="display-4 text-muted mb-3" />
                  <p className="text-muted">Login to save opportunities</p>
                  <Button variant="outline-primary" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </div>
              ) : savedOpportunities.length === 0 ? (
                <div className="text-center py-3">
                  <FaHeart className="display-4 text-muted mb-3" />
                  <p className="text-muted">No saved opportunities yet</p>
                  <p className="small">Click the heart icon on opportunities to save them here</p>
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      You have {savedOpportunities.length} saved opportunities
                    </h6>
                    <Badge bg="primary" pill>
                      {savedOpportunities.length}
                    </Badge>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate('/saved-opportunities')}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <FaExternalLinkAlt className="me-2" />
                    View All Saved
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {popularOpportunities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaChartLine className="me-2" />
                  Popular This Week
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {popularOpportunities.map((opp) => (
                    <ListGroup.Item
                      key={opp.id}
                      action
                      onClick={() => viewOpportunityDetails(opp)}
                      className="d-flex align-items-center"
                    >
                      <div className="popular-icon me-2">{getTypeBadge(opp.type)}</div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 small">{opp.title}</h6>
                        <small className="text-muted">{opp.viewCount || 0} views</small>
                      </div>
                      <FaArrowRight className="text-muted" />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button
                  variant="link"
                  size="sm"
                  className="w-100 mt-2"
                  onClick={() => {
                    handleFilterChange('sortBy', 'viewCount');
                    fetchOpportunities();
                  }}
                >
                  View all popular opportunities →
                </Button>
              </Card.Body>
            </Card>
          )}

          {recentOpportunities.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0 d-flex align-items-center">
                  <FaCalendar className="me-2" />
                  Recently Added
                </h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {recentOpportunities.map((opp) => (
                    <ListGroup.Item
                      key={opp.id}
                      action
                      onClick={() => viewOpportunityDetails(opp)}
                      className="d-flex align-items-center"
                    >
                      <div className="popular-icon me-2">{getTypeBadge(opp.type)}</div>
                      <div className="flex-grow-1">
                        <h6 className="mb-0 small">{opp.title}</h6>
                        <small className="text-muted">{formatDate(opp.createdAt)}</small>
                      </div>
                      <FaArrowRight className="text-muted" />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button
                  variant="link"
                  size="sm"
                  className="w-100 mt-2"
                  onClick={() => {
                    handleFilterChange('sortBy', 'createdAt');
                    fetchOpportunities();
                  }}
                >
                  View all recent opportunities →
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <h5 className="mb-0 d-flex align-items-center">
                <FaFilter className="me-2" />
                Search Tips
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="border-0">
                  <FaSearch className="text-primary me-2" />
                  Use specific keywords for better results
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaFilter className="text-primary me-2" />
                  Apply filters to narrow down results
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaHeart className="text-danger me-2" />
                  Save opportunities to apply later
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaBell className="text-primary me-2" />
                  Set up alerts for new opportunities
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaEnvelope className="text-primary me-2" />
                  Update your profile for better matches
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Opportunity Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            {selectedOpportunity?.title}
            <Badge bg="info" className="ms-2">
              {selectedOpportunity?.type?.toUpperCase()}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOpportunity && (
            <div>
              <div className="d-flex align-items-center mb-3">
                {getTypeBadge(selectedOpportunity.type)}
                <Badge bg="light" text="dark" className="ms-2">
                  {getCategoryIcon(selectedOpportunity.category)} {selectedOpportunity.category}
                </Badge>
                {getStatusBadge(selectedOpportunity.status)}
                {selectedOpportunity.deadline &&
                  new Date(selectedOpportunity.deadline) < new Date() && (
                    <Badge bg="danger" className="ms-2">
                      Expired
                    </Badge>
                  )}
              </div>

              <h5>Opportunity Details</h5>
              <p className="mb-3">{selectedOpportunity.description}</p>

              <div className="details-section">
                <h6>
                  <FaBuilding className="me-2" />
                  Basic Information
                </h6>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Type:</strong> {selectedOpportunity.type}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedOpportunity.category}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedOpportunity.status}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Posted:</strong> {formatDate(selectedOpportunity.createdAt)}
                    </p>
                    {selectedOpportunity.deadline && (
                      <p>
                        <strong>Deadline:</strong> {formatDate(selectedOpportunity.deadline)}
                      </p>
                    )}
                    <p>
                      <strong>Location:</strong> {selectedOpportunity.location || 'Not specified'}
                    </p>
                  </Col>
                </Row>
              </div>

              {selectedOpportunity.type === OPPORTUNITY_TYPES.JOB && (
                <div className="details-section">
                  <h6>
                    <FaBuilding className="me-2" />
                    Company Information
                  </h6>
                  <p>
                    <strong>Company:</strong> {selectedOpportunity.company || 'Not specified'}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedOpportunity.location || 'Not specified'}
                  </p>
                  {selectedOpportunity.salary && (
                    <p>
                      <strong>Salary Range:</strong> {selectedOpportunity.salary}
                    </p>
                  )}
                  {selectedOpportunity.experienceLevel && (
                    <p>
                      <strong>Experience Level:</strong> {selectedOpportunity.experienceLevel}
                    </p>
                  )}
                  {selectedOpportunity.requirements && (
                    <p>
                      <strong>Requirements:</strong> {selectedOpportunity.requirements}
                    </p>
                  )}
                </div>
              )}

              {selectedOpportunity.type === OPPORTUNITY_TYPES.COURSE && (
                <div className="details-section">
                  <h6>
                    <FaGraduationCap className="me-2" />
                    Course Details
                  </h6>
                  <p>
                    <strong>Institution:</strong>{' '}
                    {selectedOpportunity.institution || 'Not specified'}
                  </p>
                  <p>
                    <strong>Mode:</strong> {selectedOpportunity.location || 'Not specified'}
                  </p>
                  {selectedOpportunity.duration && (
                    <p>
                      <strong>Duration:</strong> {selectedOpportunity.duration}
                    </p>
                  )}
                  {selectedOpportunity.certification && (
                    <p>
                      <strong>Certification:</strong> {selectedOpportunity.certification}
                    </p>
                  )}
                  {selectedOpportunity.prerequisites && (
                    <p>
                      <strong>Prerequisites:</strong> {selectedOpportunity.prerequisites}
                    </p>
                  )}
                </div>
              )}

              {selectedOpportunity.type === OPPORTUNITY_TYPES.FUNDING && (
                <div className="details-section">
                  <h6>
                    <FaMoneyBillWave className="me-2" />
                    Funding Details
                  </h6>
                  <p>
                    <strong>Organization:</strong>{' '}
                    {selectedOpportunity.organization || 'Not specified'}
                  </p>
                  {selectedOpportunity.amount && (
                    <p>
                      <strong>Amount:</strong> {selectedOpportunity.amount}
                    </p>
                  )}
                  {selectedOpportunity.eligibility && (
                    <p>
                      <strong>Eligibility:</strong> {selectedOpportunity.eligibility}
                    </p>
                  )}
                  {selectedOpportunity.fundingType && (
                    <p>
                      <strong>Type:</strong> {selectedOpportunity.fundingType}
                    </p>
                  )}
                </div>
              )}

              <div className="details-section">
                <div className="tags">
                  {selectedOpportunity.tags?.map((tag) => (
                    <Badge key={tag} bg="light" text="dark" className="me-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <h6>
                  <FaChartLine className="me-2" />
                  Statistics
                </h6>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h4>{selectedOpportunity.viewCount || 0}</h4>
                      <small>Views</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4>{selectedOpportunity.applicationCount || 0}</h4>
                      <small>Applications</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4>{selectedOpportunity.savedCount || 0}</h4>
                      <small>Saved</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4>{selectedOpportunity.matchScore || 0}%</h4>
                      <small>Match Score</small>
                    </div>
                  </Col>
                </Row>
              </div>

              <Alert variant="info" className="mt-3">
                <FaLightbulb className="me-2" />
                <strong>Tip:</strong> Make sure your profile is complete to improve your match score
                and application success rate.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          {currentUser && (
            <Button
              variant="outline-primary"
              onClick={() => {
                handleSaveOpportunity(selectedOpportunity?.id);
                setShowDetails(false);
              }}
            >
              {savedOpportunities.includes(selectedOpportunity?.id)
                ? 'Remove from Saved'
                : 'Save Opportunity'}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setShowDetails(false);
              if (selectedOpportunity?.type === OPPORTUNITY_TYPES.JOB) {
                navigate('/student/apply-job', { state: { opportunity: selectedOpportunity } });
              } else if (selectedOpportunity?.type === OPPORTUNITY_TYPES.COURSE) {
                navigate('/student/apply-course', { state: { opportunity: selectedOpportunity } });
              } else if (selectedOpportunity?.type === OPPORTUNITY_TYPES.FUNDING) {
                navigate('/entrepreneur/funding', { state: { opportunity: selectedOpportunity } });
              } else {
                navigate('/dashboard');
              }
            }}
          >
            <FaArrowRight className="me-2" />
            Apply Now
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Search;
