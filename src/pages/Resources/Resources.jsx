/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Form,
  InputGroup,
  Alert,
  Spinner,
  Modal,
  FormControl,
} from 'react-bootstrap';
import {
  FaBook,
  FaGraduationCap,
  FaFilePdf,
  FaVideo,
  FaDownload,
  FaBookmark,
  FaSearch,
  FaFilter,
  FaRegStar,
  FaRegEye,
  FaRegClock,
  FaUserGraduate,
  FaLightbulb,
  FaChartLine,
  FaMoneyBillWave,
  FaUsers,
  FaRocket,
  FaBullhorn,
  FaRegFileAlt,
  FaRegBookmark,
  FaBuilding,
  FaCogs,
  FaLaptopCode,
  FaBalanceScale,
  FaGlobeAmericas,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Resources.css';

// Import resource service with correct function names
import {
  getResources,
  getResourceCategoriesWithCounts,
  getResourceStats,
  getBookmarkedResources,
  toggleResourceBookmark,
  incrementResourceDownloads,
  getFeaturedResources,
  getPopularResources,
  getRecentResources,
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  DIFFICULTY_LEVELS,
} from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';

const Resources = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [bookmarked, setBookmarked] = useState([]);
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    sortBy: 'downloads',
    sortOrder: 'desc',
  });

  // Resource types matching your service constants
  const resourceTypes = [
    { id: RESOURCE_TYPES.GUIDE, name: 'Guides', icon: FaBook },
    { id: RESOURCE_TYPES.TEMPLATE, name: 'Templates', icon: FaRegFileAlt },
    { id: RESOURCE_TYPES.VIDEO, name: 'Videos', icon: FaVideo },
    { id: RESOURCE_TYPES.COURSE, name: 'Courses', icon: FaGraduationCap },
    { id: RESOURCE_TYPES.TOOL, name: 'Tools', icon: FaBullhorn },
    { id: RESOURCE_TYPES.EBOOK, name: 'eBooks', icon: FaFilePdf },
    { id: RESOURCE_TYPES.CHECKLIST, name: 'Checklists', icon: FaRegFileAlt },
    { id: RESOURCE_TYPES.PRESENTATION, name: 'Presentations', icon: FaFilePdf },
  ];

  // Default categories matching your service constants
  const defaultCategories = [
    { id: 'all', name: 'All Resources', icon: FaBook, count: 0 },
    { id: RESOURCE_CATEGORIES.BUSINESS, name: 'Business', icon: FaBuilding, count: 0 },
    { id: RESOURCE_CATEGORIES.CAREER, name: 'Career', icon: FaUserGraduate, count: 0 },
    { id: RESOURCE_CATEGORIES.FUNDING, name: 'Funding', icon: FaMoneyBillWave, count: 0 },
    {
      id: RESOURCE_CATEGORIES.ENTREPRENEURSHIP,
      name: 'Entrepreneurship',
      icon: FaRocket,
      count: 0,
    },
    { id: RESOURCE_CATEGORIES.SKILLS, name: 'Skills', icon: FaLightbulb, count: 0 },
    { id: RESOURCE_CATEGORIES.MARKETING, name: 'Marketing', icon: FaGlobeAmericas, count: 0 },
    { id: RESOURCE_CATEGORIES.FINANCE, name: 'Finance', icon: FaChartLine, count: 0 },
    { id: RESOURCE_CATEGORIES.TECHNOLOGY, name: 'Technology', icon: FaLaptopCode, count: 0 },
    { id: RESOURCE_CATEGORIES.LEGAL, name: 'Legal', icon: FaBalanceScale, count: 0 },
    { id: RESOURCE_CATEGORIES.OTHER, name: 'Other', icon: FaCogs, count: 0 },
  ];

  // Difficulty levels matching your service constants
  const difficultyLevels = [
    { id: DIFFICULTY_LEVELS.BEGINNER, name: 'Beginner', variant: 'success' },
    { id: DIFFICULTY_LEVELS.INTERMEDIATE, name: 'Intermediate', variant: 'warning' },
    { id: DIFFICULTY_LEVELS.ADVANCED, name: 'Advanced', variant: 'danger' },
  ];

  useEffect(() => {
    loadResources();
    loadCategories();
    loadStats();
    loadBookmarks();
  }, [currentUser, filters, activeTab, searchQuery]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = {
        category: activeTab !== 'all' ? activeTab : null,
        type: filters.type !== 'all' ? filters.type : null,
        difficulty: filters.difficulty !== 'all' ? filters.difficulty : null,
        searchQuery,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const data = await getResources(params);
      setResources(data.resources || []);
      setPagination({
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Error loading resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryCounts = await getResourceCategoriesWithCounts();
      const updatedCategories = defaultCategories.map((category) => {
        if (category.id === 'all') {
          return { ...category, count: Object.values(categoryCounts).reduce((a, b) => a + b, 0) };
        }
        return { ...category, count: categoryCounts[category.id] || 0 };
      });
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(defaultCategories);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getResourceStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        free: 0,
        premium: 0,
        totalDownloads: 0,
        totalBookmarks: 0,
      });
    }
  };

  const loadBookmarks = async () => {
    if (!currentUser) {
      setBookmarked([]);
      return;
    }

    try {
      const bookmarkedResources = await getBookmarkedResources(currentUser.uid);
      setBookmarked(bookmarkedResources.map((r) => r.id));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setBookmarked([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadResources();
  };

  const handleDownload = async (resourceId, resourceName) => {
    if (!currentUser) {
      alert('Please login to download resources');
      return;
    }

    try {
      setDownloading(true);

      // Increment download count in database
      await incrementResourceDownloads(resourceId);

      // Update local state
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
      );

      // Show success message
      alert(`Downloaded ${resourceName} successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resource. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleBookmark = async (resourceId) => {
    if (!currentUser) {
      alert('Please login to bookmark resources');
      return;
    }

    try {
      const result = await toggleResourceBookmark(currentUser.uid, resourceId);

      if (result.bookmarked) {
        setBookmarked((prev) => [...prev, resourceId]);
      } else {
        setBookmarked((prev) => prev.filter((id) => id !== resourceId));
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const previewResource = (resource) => {
    setSelectedResource(resource);
    setShowPreview(true);
  };

  const getDifficultyBadge = (difficulty) => {
    const level = difficultyLevels.find((l) => l.id === difficulty);
    if (!level) return <Badge bg="secondary">All Levels</Badge>;

    return <Badge bg={level.variant}>{level.name}</Badge>;
  };

  const getTypeIcon = (type) => {
    const typeConfig = resourceTypes.find((t) => t.id === type);
    if (!typeConfig) {
      const Icon = FaBook;
      return <Icon style={{ color: '#6c757d' }} />;
    }

    const Icon = typeConfig.icon;
    const colors = {
      [RESOURCE_TYPES.GUIDE]: '#0d6efd',
      [RESOURCE_TYPES.TEMPLATE]: '#198754',
      [RESOURCE_TYPES.VIDEO]: '#dc3545',
      [RESOURCE_TYPES.COURSE]: '#6f42c1',
      [RESOURCE_TYPES.TOOL]: '#fd7e14',
      [RESOURCE_TYPES.EBOOK]: '#e83e8c',
      [RESOURCE_TYPES.CHECKLIST]: '#20c997',
      [RESOURCE_TYPES.PRESENTATION]: '#6610f2',
    };

    return <Icon style={{ color: colors[type] || '#6c757d' }} />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading && resources.length === 0) {
    return (
      <Container className="resources-page">
        <div className="resources-header">
          <h1>Resources & Guides</h1>
          <p className="lead">Educational resources and guides for your success</p>
        </div>
        <div className="loading-container text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading resources...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="resources-page">
      {/* Header */}
      <div className="resources-header mb-4">
        <h1>Resources & Guides</h1>
        <p className="lead">
          Educational resources, guides, and tools for career and business success
        </p>
      </div>

      {/* Search Bar */}
      <Card className="search-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <FormControl
                placeholder="Search resources, guides, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Search
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setFilters({
                    type: 'all',
                    difficulty: 'all',
                    sortBy: 'downloads',
                    sortOrder: 'desc',
                  });
                }}
              >
                <FaFilter className="me-2" />
                Clear Filters
              </Button>
            </InputGroup>
          </Form>

          {/* Categories */}
          <div className="categories-scroll mb-3">
            <div className="d-flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={activeTab === category.id ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setActiveTab(category.id)}
                    className="d-flex align-items-center"
                  >
                    <Icon className="me-2" />
                    {category.name}
                    {category.count > 0 && (
                      <Badge bg="light" text="dark" className="ms-2">
                        {category.count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Featured Resources */}
      {activeTab === 'all' && (
        <div className="featured-section mb-5">
          <h3 className="mb-3">
            <FaRegStar className="me-2 text-warning" />
            Featured Resources
          </h3>
          <Row>
            {resources
              .filter((r) => r.featured)
              .slice(0, 3)
              .map((resource) => (
                <Col md={6} lg={4} key={resource.id} className="mb-4">
                  <Card className="featured-resource-card h-100">
                    <div className="featured-badge">FEATURED</div>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        {getTypeIcon(resource.type)}
                        <div className="ms-2">
                          <h5 className="mb-0">{resource.title}</h5>
                          <small className="text-muted">
                            by {resource.author || 'CareerConnect'}
                          </small>
                        </div>
                      </div>
                      <p className="resource-description">{resource.description}</p>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        {getDifficultyBadge(resource.difficulty)}
                        <div className="text-muted small">
                          <FaRegClock className="me-1" />
                          {formatDate(resource.createdAt)}
                        </div>
                      </div>
                      <div className="tags mb-3">
                        {resource.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} bg="light" text="dark" className="me-1">
                            {tag}
                          </Badge>
                        )) || []}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="resource-stats">
                          <span className="text-muted small me-3">
                            <FaDownload className="me-1" />
                            {resource.downloads?.toLocaleString() || '0'}
                          </span>
                          <span className="text-warning small">
                            <FaRegStar className="me-1" />
                            {resource.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => previewResource(resource)}
                          >
                            Preview
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleDownload(resource.id, resource.title)}
                            disabled={downloading}
                          >
                            <FaDownload className="me-1" />
                            {downloading ? 'Downloading...' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      )}

      {/* All Resources */}
      <div className="all-resources-section">
        <div className="section-header d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            {activeTab === 'all'
              ? 'All Resources'
              : categories.find((c) => c.id === activeTab)?.name || 'Resources'}
            <Badge bg="light" text="dark" className="ms-2">
              {pagination.total}
            </Badge>
          </h3>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Sort by:</span>
            <Form.Select
              size="sm"
              style={{ width: 'auto' }}
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="downloads">Most Downloads</option>
              <option value="createdAt">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="title">Title A-Z</option>
            </Form.Select>
            <Form.Select
              size="sm"
              style={{ width: 'auto' }}
              value={filters.sortOrder}
              onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Form.Select>
          </div>
        </div>

        <Row>
          <Col lg={3} className="mb-4">
            <Card className="filters-card">
              <Card.Header>
                <h5 className="mb-0">Filters</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Resource Type</Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="all">All Types</option>
                      {resourceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Difficulty Level</Form.Label>
                    <Form.Select
                      value={filters.difficulty}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                      <option value="all">All Levels</option>
                      {difficultyLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Access Type</Form.Label>
                    <Form.Select>
                      <option value="all">All Access</option>
                      <option value="free">Free Only</option>
                      <option value="premium">Premium Only</option>
                    </Form.Select>
                  </Form.Group>

                  <hr />

                  <div className="mb-3">
                    <h6>Quick Links</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item action as={Link} to="/resources/business-plan">
                        <FaBook className="me-2" />
                        Business Plan Guide
                      </ListGroup.Item>
                      <ListGroup.Item action as={Link} to="/resources/funding-guide">
                        <FaMoneyBillWave className="me-2" />
                        Funding Guide
                      </ListGroup.Item>
                      <ListGroup.Item action as={Link} to="/resources/career-tools">
                        <FaUserGraduate className="me-2" />
                        Career Tools
                      </ListGroup.Item>
                      <ListGroup.Item action as={Link} to="/resources/legal-templates">
                        <FaBalanceScale className="me-2" />
                        Legal Templates
                      </ListGroup.Item>
                    </ListGroup>
                  </div>

                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => {
                      setFilters({
                        type: 'all',
                        difficulty: 'all',
                        sortBy: 'downloads',
                        sortOrder: 'desc',
                      });
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Resource Types</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {resourceTypes.map((type) => {
                    const Icon = type.icon;
                    const count = resources.filter((r) => r.type === type.id).length;
                    return (
                      <ListGroup.Item
                        key={type.id}
                        action
                        className="d-flex justify-content-between align-items-center"
                        onClick={() => setFilters({ ...filters, type: type.id })}
                      >
                        <span>
                          <Icon className="me-2" />
                          {type.name}
                        </span>
                        <Badge bg="light" text="dark">
                          {count}
                        </Badge>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            {resources.length === 0 ? (
              <Alert variant="info">
                <div className="text-center py-4">
                  <FaSearch className="display-4 text-muted mb-3" />
                  <h4>No resources found</h4>
                  <p className="mb-0">Try adjusting your search or filters</p>
                </div>
              </Alert>
            ) : (
              <>
                <Row>
                  {resources.map((resource) => (
                    <Col md={6} className="mb-4" key={resource.id}>
                      <Card className="resource-card h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="d-flex align-items-center mb-2">
                                {getTypeIcon(resource.type)}
                                <span className="ms-2 text-muted small text-uppercase">
                                  {resource.type}
                                </span>
                                {resource.premium && (
                                  <Badge bg="warning" className="ms-2">
                                    PREMIUM
                                  </Badge>
                                )}
                              </div>
                              <h5 className="mb-1">{resource.title}</h5>
                              <p className="text-muted small mb-2">
                                by {resource.author || 'CareerConnect'}
                              </p>
                            </div>
                            <Button
                              variant="link"
                              onClick={() => handleToggleBookmark(resource.id)}
                              className="p-0"
                            >
                              {bookmarked.includes(resource.id) ? (
                                <FaBookmark className="text-warning" />
                              ) : (
                                <FaRegBookmark className="text-muted" />
                              )}
                            </Button>
                          </div>

                          <p className="resource-description-small">{resource.description}</p>

                          <div className="d-flex justify-content-between align-items-center mb-3">
                            {getDifficultyBadge(resource.difficulty)}
                            <div className="text-muted small">
                              <FaRegClock className="me-1" />
                              {formatDate(resource.createdAt)}
                            </div>
                          </div>

                          <div className="tags mb-3">
                            {resource.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} bg="light" text="dark" className="me-1 mb-1">
                                {tag}
                              </Badge>
                            )) || []}
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <div className="resource-stats">
                              <span className="text-muted small me-3">
                                <FaDownload className="me-1" />
                                {resource.downloads?.toLocaleString() || '0'}
                              </span>
                              <span className="text-warning small">
                                <FaRegStar className="me-1" />
                                {resource.rating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => previewResource(resource)}
                              >
                                <FaRegEye className="me-1" />
                                Preview
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleDownload(resource.id, resource.title)}
                                disabled={downloading}
                              >
                                <FaDownload className="me-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <nav>
                      <ul className="pagination">
                        <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            Previous
                          </button>
                        </li>

                        {[...Array(pagination.totalPages).keys()].map((num) => (
                          <li
                            key={num + 1}
                            className={`page-item ${pagination.page === num + 1 ? 'active' : ''}`}
                          >
                            <button className="page-link" onClick={() => handlePageChange(num + 1)}>
                              {num + 1}
                            </button>
                          </li>
                        ))}

                        <li
                          className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* Resource Statistics */}
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Resource Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center">
                    <h2 className="text-primary">{stats?.total || resources.length}</h2>
                    <p className="text-muted mb-0">Total Resources</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h2 className="text-success">
                      {stats?.free || resources.filter((r) => !r.premium).length}
                    </h2>
                    <p className="text-muted mb-0">Free Resources</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h2 className="text-warning">
                      {stats?.premium || resources.filter((r) => r.premium).length}
                    </h2>
                    <p className="text-muted mb-0">Premium Resources</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h2 className="text-info">
                      {stats?.totalDownloads?.toLocaleString() ||
                        resources.reduce((sum, r) => sum + (r.downloads || 0), 0).toLocaleString()}
                    </h2>
                    <p className="text-muted mb-0">Total Downloads</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Resource Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedResource?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResource && (
            <div>
              <div className="d-flex align-items-center mb-3">
                {getTypeIcon(selectedResource.type)}
                <div className="ms-3">
                  <h5 className="mb-1">{selectedResource.title}</h5>
                  <p className="text-muted mb-0">by {selectedResource.author || 'CareerConnect'}</p>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                {getDifficultyBadge(selectedResource.difficulty)}
                <span className="ms-3 text-muted">
                  <FaRegClock className="me-1" />
                  Added: {formatDate(selectedResource.createdAt)}
                </span>
                <span className="ms-3 text-warning">
                  <FaRegStar className="me-1" />
                  {selectedResource.rating?.toFixed(1) || '0.0'} rating
                </span>
                <span className="ms-3 text-muted">
                  <FaDownload className="me-1" />
                  {selectedResource.downloads?.toLocaleString() || '0'} downloads
                </span>
              </div>

              <p className="mb-3">{selectedResource.description}</p>

              {selectedResource.content && (
                <div className="mb-3">
                  <strong>Content Preview:</strong>
                  <div className="preview-content mt-2 p-3 bg-light rounded">
                    {selectedResource.content.substring(0, 500)}...
                  </div>
                </div>
              )}

              <div className="mb-3">
                <strong>Tags:</strong>
                <div className="mt-2">
                  {selectedResource.tags?.map((tag) => (
                    <Badge key={tag} bg="light" text="dark" className="me-1">
                      {tag}
                    </Badge>
                  )) || []}
                </div>
              </div>

              <Alert variant="info">
                <strong>Preview Note:</strong> This is a preview of the resource. Download the full
                version for complete access.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (selectedResource) {
                handleDownload(selectedResource.id, selectedResource.title);
                setShowPreview(false);
              }
            }}
            disabled={downloading}
          >
            <FaDownload className="me-2" />
            {downloading ? 'Downloading...' : 'Download Full Resource'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Resources;
