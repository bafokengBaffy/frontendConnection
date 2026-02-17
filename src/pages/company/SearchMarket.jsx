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
  ProgressBar
} from 'react-bootstrap';
import {
  Search,
  Filter,
  Building,
  BarChart,
  Eye,
  Bookmark,
  Share
} from 'react-bootstrap-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './SearchMarket.css';

const SearchMarket = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    growthRate: '',
    marketSize: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Format current date for display
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch market data from Firestore
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      // This would typically come from a market analysis collection
      // For now, we'll create some sample data
      const sampleMarketData = [
        {
          id: '1',
          industry: 'Technology',
          location: 'Maseru',
          marketSize: 'Large',
          growthRate: 15,
          competition: 'High',
          opportunity: 'Medium',
          trends: ['AI Adoption', 'Remote Work', 'Cloud Migration'],
          keyPlayers: ['TechSolutions LS', 'Digital Innovations']
        },
        {
          id: '2',
          industry: 'Agriculture',
          location: 'Mokhotlong',
          marketSize: 'Medium',
          growthRate: 8,
          competition: 'Low',
          opportunity: 'High',
          trends: ['Sustainable Farming', 'Organic Products'],
          keyPlayers: ['GreenHarvest LS', 'AgroTech Solutions']
        },
        {
          id: '3',
          industry: 'Education',
          location: 'Maseru',
          marketSize: 'Large',
          growthRate: 12,
          competition: 'Medium',
          opportunity: 'High',
          trends: ['E-Learning', 'Skills Development'],
          keyPlayers: ['EduConnect LS', 'LearnSmart']
        },
        {
          id: '4',
          industry: 'Healthcare',
          location: 'Botha-Bothe',
          marketSize: 'Medium',
          growthRate: 18,
          competition: 'Medium',
          opportunity: 'High',
          trends: ['Telemedicine', 'Health Tech'],
          keyPlayers: ['MediCare LS', 'HealthFirst']
        },
        {
          id: '5',
          industry: 'Tourism',
          location: 'Quthing',
          marketSize: 'Small',
          growthRate: 5,
          competition: 'Low',
          opportunity: 'High',
          trends: ['Eco-Tourism', 'Cultural Experiences'],
          keyPlayers: ['TourLesotho', 'Mountain Adventures']
        },
        {
          id: '6',
          industry: 'Retail',
          location: 'Maseru',
          marketSize: 'Large',
          growthRate: 10,
          competition: 'High',
          opportunity: 'Medium',
          trends: ['E-commerce', 'Mobile Shopping'],
          keyPlayers: ['ShopEasy LS', 'RetailPlus']
        },
        {
          id: '7',
          industry: 'Manufacturing',
          location: 'Leribe',
          marketSize: 'Medium',
          growthRate: 7,
          competition: 'Medium',
          opportunity: 'Medium',
          trends: ['Automation', 'Local Production'],
          keyPlayers: ['MadeInLesotho', 'Industrial Works']
        },
        {
          id: '8',
          industry: 'Finance',
          location: 'Maseru',
          marketSize: 'Medium',
          growthRate: 14,
          competition: 'High',
          opportunity: 'High',
          trends: ['Fintech', 'Mobile Banking'],
          keyPlayers: ['Bank of Lesotho', 'FinTech LS']
        },
        {
          id: '9',
          industry: 'Construction',
          location: 'Maseru',
          marketSize: 'Large',
          growthRate: 9,
          competition: 'High',
          opportunity: 'Medium',
          trends: ['Affordable Housing', 'Infrastructure'],
          keyPlayers: ['BuildRight LS', 'Construction Pro']
        },
        {
          id: '10',
          industry: 'Energy',
          location: 'Thaba-Tseka',
          marketSize: 'Small',
          growthRate: 20,
          competition: 'Low',
          opportunity: 'High',
          trends: ['Renewable Energy', 'Solar Power'],
          keyPlayers: ['SolarLesotho', 'GreenEnergy LS']
        }
      ];

      setMarketData(sampleMarketData);
      setFilteredData(sampleMarketData);
      setError('');
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...marketData];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.industry.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.trends.some(trend => trend.toLowerCase().includes(term)) ||
        item.keyPlayers.some(player => player.toLowerCase().includes(term))
      );
    }
    
    // Apply filters
    if (filters.industry) {
      result = result.filter(item => item.industry === filters.industry);
    }
    
    if (filters.location) {
      result = result.filter(item => item.location === filters.location);
    }
    
    if (filters.growthRate) {
      const rate = parseInt(filters.growthRate);
      if (rate === 10) {
        result = result.filter(item => item.growthRate >= 10);
      } else if (rate === 5) {
        result = result.filter(item => item.growthRate >= 5 && item.growthRate < 10);
      } else {
        result = result.filter(item => item.growthRate < 5);
      }
    }
    
    if (filters.marketSize) {
      result = result.filter(item => item.marketSize === filters.marketSize);
    }
    
    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, filters, marketData]);

  // Get unique values for filter dropdowns
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(marketData.map(item => item.industry))];
    return uniqueIndustries.sort();
  }, [marketData]);

  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(marketData.map(item => item.location))];
    return uniqueLocations.sort();
  }, [marketData]);

  const marketSizes = useMemo(() => {
    const uniqueSizes = [...new Set(marketData.map(item => item.marketSize))];
    return uniqueSizes.sort();
  }, [marketData]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
      industry: '',
      location: '',
      growthRate: '',
      marketSize: ''
    });
  };

  const getCompetitionColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };

  const getOpportunityColor = (level) => {
    switch (level.toLowerCase()) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="SearchMarket-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Market Research</h1>
              <p className="text-muted">
                {formattedDate} | Company View
              </p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                <Filter className="me-1" /> Clear Filters
              </Button>
              <Button variant="primary" onClick={fetchMarketData}>
                Refresh Data
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
                  placeholder="Search markets by industry, location, trends, or key players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="primary">
                  Analyze
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
              <Card.Title as="h6">Market Filters</Card.Title>
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
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
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
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Growth Rate</Form.Label>
                    <Form.Select
                      name="growthRate"
                      value={filters.growthRate}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Growth</option>
                      <option value="10">High Growth (10%+)</option>
                      <option value="5">Medium Growth (5-10%)</option>
                      <option value="0">Low Growth (&lt;5%)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Market Size</Form.Label>
                    <Form.Select
                      name="marketSize"
                      value={filters.marketSize}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Sizes</option>
                      {marketSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Market Overview */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Market Analysis Overview</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <div className="p-3">
         
                    <h3>{marketData.length}</h3>
                    <p className="text-muted mb-0">Industries Analyzed</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
            
                    <h3>{locations.length}</h3>
                    <p className="text-muted mb-0">Regions Covered</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    
                    <h3>{Math.round(marketData.reduce((sum, item) => sum + item.growthRate, 0) / marketData.length)}%</h3>
                    <p className="text-muted mb-0">Avg. Growth Rate</p>
                  </div>
                </Col>
                <Col md={3} className="text-center">
                  <div className="p-3">
                    <BarChart size={32} className="text-info mb-2" />
                    <h3>{marketData.filter(item => item.opportunity === 'High').length}</h3>
                    <p className="text-muted mb-0">High Opportunity Markets</p>
                  </div>
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
                {filteredData.length} Market Segments Found
              </Card.Title>
              <Badge bg="primary" pill>
                Page {currentPage} of {totalPages}
              </Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Loading market data...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredData.length === 0 ? (
                <Alert variant="info">No market segments found matching your criteria.</Alert>
              ) : (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Industry</th>
                        <th>Location</th>
                        <th>Market Size</th>
                        <th>Growth Rate</th>
                        <th>Competition</th>
                        <th>Opportunity</th>
                        <th>Key Trends</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong><Building className="me-2" />{item.industry}</strong>
                          </td>
                          <td>
                   
                            {item.location}
                          </td>
                          <td>
                            <Badge bg={item.marketSize === 'Large' ? 'primary' : item.marketSize === 'Medium' ? 'warning' : 'secondary'}>
                              {item.marketSize}
                            </Badge>
                          </td>
                          <td>
                            <div>
                              <div className="d-flex justify-content-between">
                                <span>{item.growthRate}%</span>
                                <small className="text-muted">Annual</small>
                              </div>
                              <ProgressBar 
                                now={item.growthRate} 
                                max={25} 
                                variant={item.growthRate >= 15 ? 'success' : item.growthRate >= 8 ? 'warning' : 'danger'}
                                className="mt-1"
                              />
                            </div>
                          </td>
                          <td>
                            <Badge bg={getCompetitionColor(item.competition)}>
                              {item.competition}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getOpportunityColor(item.opportunity)}>
                              {item.opportunity}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {item.trends.slice(0, 2).map((trend, index) => (
                                <Badge key={index} bg="light" text="dark" className="me-1">
                                  {trend}
                                </Badge>
                              ))}
                              {item.trends.length > 2 && (
                                <Badge bg="secondary">+{item.trends.length - 2}</Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm">
                                <Eye className="me-1" /> Details
                              </Button>
                              <Button variant="outline-success" size="sm">
                                <Bookmark className="me-1" /> Save
                              </Button>
                              <Button variant="outline-info" size="sm">
                                <Share className="me-1" /> Share
                              </Button>
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

      {/* Market Insights */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Top Growth Industries</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                {[...marketData]
                  .sort((a, b) => b.growthRate - a.growthRate)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="list-group-item border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.industry}</strong>
                          <div className="small text-muted">{item.location}</div>
                        </div>
                        <Badge bg="success">{item.growthRate}%</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">High Opportunity Markets</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                {marketData
                  .filter(item => item.opportunity === 'High')
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="list-group-item border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.industry}</strong>
                          <div className="small text-muted">{item.location}</div>
                        </div>
                        <div>
                          <Badge bg={getCompetitionColor(item.competition)} className="me-2">
                            {item.competition} Competition
                          </Badge>
                          <Badge bg="light" text="dark">
                            {item.marketSize}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchMarket;