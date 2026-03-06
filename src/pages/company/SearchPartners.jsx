/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
import { useState, useEffect, useMemo } from 'react';
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
} from 'react-bootstrap';
import { Search, Filter, Building, People, Star, Eye, Phone, Globe } from 'react-bootstrap-icons';
import { db } from '../../config/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './SearchPartners.css';

const SearchPartners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    companySize: '',
    partnershipType: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 10;

  // Format current date for display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch partners from Firestore
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const partnersRef = collection(db, 'companies');
      const q = query(partnersRef, where('userType', '==', 'company'));
      const querySnapshot = await getDocs(q);

      const partnersList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        partnersList.push({
          id: doc.id,
          name: data.companyName || data.name || 'Unnamed Company',
          email: data.email,
          industry: data.industry || 'Not specified',
          location: data.location || 'Not specified',
          description: data.description || 'No description available',
          companySize: data.companySize || 'Not specified',
          website: data.website,
          phone: data.phone,
          partnershipTypes: data.partnershipTypes || ['General Partnership'],
          rating: data.rating || Math.floor(Math.random() * 3) + 3, // Random rating 3-5
          projectsCompleted: data.projectsCompleted || Math.floor(Math.random() * 50),
          yearsInBusiness: data.yearsInBusiness || Math.floor(Math.random() * 20) + 1,
        });
      });

      setPartners(partnersList);
      setFilteredPartners(partnersList);
      setError('');
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...partners];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (partner) =>
          partner.name.toLowerCase().includes(term) ||
          partner.industry.toLowerCase().includes(term) ||
          partner.description.toLowerCase().includes(term) ||
          partner.location.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.industry) {
      result = result.filter((partner) => partner.industry === filters.industry);
    }

    if (filters.location) {
      result = result.filter((partner) => partner.location === filters.location);
    }

    if (filters.companySize) {
      result = result.filter((partner) => partner.companySize === filters.companySize);
    }

    if (filters.partnershipType) {
      result = result.filter(
        (partner) =>
          partner.partnershipTypes &&
          (Array.isArray(partner.partnershipTypes)
            ? partner.partnershipTypes.includes(filters.partnershipType)
            : partner.partnershipTypes === filters.partnershipType)
      );
    }

    setFilteredPartners(result);
    setCurrentPage(1);
  }, [searchTerm, filters, partners]);

  // Get unique values for filter dropdowns
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(partners.map((p) => p.industry).filter(Boolean))];
    return uniqueIndustries.sort();
  }, [partners]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(partners.map((p) => p.location).filter(Boolean))];
    return uniqueLocations.sort();
  }, [partners]);

  const companySizes = useMemo(() => {
    const uniqueSizes = [...new Set(partners.map((p) => p.companySize).filter(Boolean))];
    return uniqueSizes.sort();
  }, [partners]);

  const partnershipTypes = useMemo(() => {
    const typesSet = new Set();
    partners.forEach((partner) => {
      if (partner.partnershipTypes) {
        if (Array.isArray(partner.partnershipTypes)) {
          partner.partnershipTypes.forEach((type) => typesSet.add(type));
        } else {
          typesSet.add(partner.partnershipTypes);
        }
      }
    });
    return [...typesSet].sort();
  }, [partners]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      industry: '',
      location: '',
      companySize: '',
      partnershipType: '',
    });
  };

  const viewPartnerDetails = (partner) => {
    setSelectedPartner(partner);
    setShowDetails(true);
  };

  const sendConnectionRequest = (partnerId) => {
    console.log('Send connection request to partner:', partnerId);
    // Implement connection request functionality
  };

  const scheduleMeeting = (partnerId) => {
    console.log('Schedule meeting with partner:', partnerId);
    // Implement meeting scheduling functionality
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'text-warning' : 'text-muted'}
          fill={i <= rating ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };

  return (
    <Container className="SearchPartners-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Find Business Partners</h1>
              <p className="text-muted">{formattedDate} | Company View</p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                <Filter className="me-1" /> Clear Filters
              </Button>
              <Button variant="primary" onClick={fetchPartners}>
                Refresh
              </Button>
            </div>
          </div>
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
                  placeholder="Search partners by name, industry, location, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary"></Button>
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
              <Card.Title as="h6">Partner Filters</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Industry</Form.Label>
                    <Form.Select
                      name="industry"
                      value={filters.industry}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Industries</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Company Size</Form.Label>
                    <Form.Select
                      name="companySize"
                      value={filters.companySize}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Sizes</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Partnership Type</Form.Label>
                    <Form.Select
                      name="partnershipType"
                      value={filters.partnershipType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Types</option>
                      {partnershipTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
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
                {filteredPartners.length} Potential Partners Found
              </Card.Title>
              <Badge bg="primary" pill>
                Page {currentPage} of {totalPages}
              </Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading partners...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredPartners.length === 0 ? (
                <Alert variant="info">No partners found matching your criteria.</Alert>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Industry</th>
                        <th>Location</th>
                        <th>Company Size</th>
                        <th>Partnership Types</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentPartners.map((partner) => (
                        <tr key={partner.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="company-avatar me-3">
                                <div
                                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <Building size={20} />
                                </div>
                              </div>
                              <div>
                                <strong>{partner.name}</strong>
                                <div className="small text-muted">{partner.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="light" text="dark" className="me-1">
                              {partner.industry}
                            </Badge>
                          </td>
                          <td>
                            <div>{partner.location}</div>
                          </td>
                          <td>
                            <Badge
                              bg={
                                partner.companySize === 'Large'
                                  ? 'primary'
                                  : partner.companySize === 'Medium'
                                    ? 'warning'
                                    : 'secondary'
                              }
                            >
                              {partner.companySize}
                            </Badge>
                          </td>
                          <td>
                            {partner.partnershipTypes ? (
                              Array.isArray(partner.partnershipTypes) ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {partner.partnershipTypes.slice(0, 2).map((type, index) => (
                                    <Badge key={index} bg="info" className="me-1">
                                      {type}
                                    </Badge>
                                  ))}
                                  {partner.partnershipTypes.length > 2 && (
                                    <Badge bg="secondary">
                                      +{partner.partnershipTypes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <Badge bg="info">{partner.partnershipTypes}</Badge>
                              )
                            ) : (
                              <span className="text-muted">Not specified</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {renderStars(partner.rating)}
                              <span className="ms-2 small">
                                ({partner.projectsCompleted} projects)
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => viewPartnerDetails(partner)}
                              >
                                <Eye className="me-1" /> View
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => sendConnectionRequest(partner.id)}
                              ></Button>
                            </div>
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

      {/* Partner Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Partner Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPartner && (
            <Row>
              <Col md={4} className="text-center">
                <div className="company-logo mb-3">
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <Building size={48} />
                  </div>
                </div>
                <h4>{selectedPartner.name}</h4>
                <p className="text-muted">{selectedPartner.email}</p>
                <div className="mb-3">
                  <Badge bg="primary" className="me-2">
                    {selectedPartner.companySize}
                  </Badge>
                  <Badge bg="info">{selectedPartner.yearsInBusiness} years</Badge>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-center mb-2">
                    {renderStars(selectedPartner.rating)}
                  </div>
                  <small className="text-muted">
                    Based on {selectedPartner.projectsCompleted} completed projects
                  </small>
                </div>
              </Col>
              <Col md={8}>
                <h5>Company Information</h5>
                <Row className="mb-3">
                  <Col>
                    <strong>Industry:</strong> {selectedPartner.industry}
                  </Col>
                  <Col>
                    <strong>Location:</strong> {selectedPartner.location}
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <strong>Contact:</strong> {selectedPartner.phone || 'Not provided'}
                  </Col>
                  <Col>
                    <strong>Website:</strong>
                    {selectedPartner.website ? (
                      <a
                        href={selectedPartner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        <Globe size={14} /> Visit Site
                      </a>
                    ) : (
                      ' Not provided'
                    )}
                  </Col>
                </Row>

                <h5 className="mt-4">Partnership Types</h5>
                <div className="mb-4">
                  {selectedPartner.partnershipTypes ? (
                    Array.isArray(selectedPartner.partnershipTypes) ? (
                      <div className="d-flex flex-wrap gap-2">
                        {selectedPartner.partnershipTypes.map((type, index) => (
                          <Badge key={index} bg="info" className="p-2">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge bg="info" className="p-2">
                        {selectedPartner.partnershipTypes}
                      </Badge>
                    )
                  ) : (
                    <p className="text-muted">No partnership types specified</p>
                  )}
                </div>

                <h5>Company Description</h5>
                <p className="text-muted">{selectedPartner.description}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => sendConnectionRequest(selectedPartner?.id)}
          ></Button>
          <Button variant="primary" onClick={() => scheduleMeeting(selectedPartner?.id)}>
            <Phone className="me-1" /> Schedule Meeting
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Partnership Stats */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Partnership Insights</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center p-3">
                    <People size={32} className="text-primary mb-2" />
                    <h3>{partners.length}</h3>
                    <p className="text-muted mb-0">Active Companies</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <h3>{partnershipTypes.length}</h3>
                    <p className="text-muted mb-0">Partnership Types</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3">
                    <Building size={32} className="text-warning mb-2" />
                    <h3>{industries.length}</h3>
                    <p className="text-muted mb-0">Industries</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchPartners;
