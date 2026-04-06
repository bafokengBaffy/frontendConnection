/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';

function FundingPrograms() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [applicationData, setApplicationData] = useState({
    businessName: '',
    businessDescription: '',
    fundingAmount: '',
    supportingDocs: null,
  });
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'open',
  });
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchFundingPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, filters]);

  const fetchFundingPrograms = async () => {
    try {
      setLoading(true);

      // In a real app, this would be an API call
      // const response = await fetch('/api/funding/programs');
      // const data = await response.json();

      // Simulate API call
      setTimeout(() => {
        const mockPrograms = [
          {
            id: 1,
            name: 'Youth Startup Grant',
            provider: 'Government of Lesotho',
            amount: 'M50,000',
            deadline: '2024-02-15',
            eligibility: 'Youth 18-35, Business Plan Required',
            status: 'open',
            category: 'grant',
            description: 'Support for young entrepreneurs starting new businesses',
          },
          {
            id: 2,
            name: 'Women Entrepreneurship Fund',
            provider: 'Lesotho Development Bank',
            amount: 'M100,000',
            deadline: '2024-03-01',
            eligibility: 'Women Entrepreneurs, Registered Business',
            status: 'open',
            category: 'loan',
            description: 'Financial support for women-led businesses',
          },
          {
            id: 3,
            name: 'Agricultural Innovation Grant',
            provider: 'FAO Lesotho',
            amount: 'M75,000',
            deadline: '2024-01-31',
            eligibility: 'Agriculture Sector, Innovation Required',
            status: 'closing_soon',
            category: 'grant',
            description: 'Support for innovative agricultural projects',
          },
          {
            id: 4,
            name: 'Tech Startup Accelerator',
            provider: 'Innovation Hub Lesotho',
            amount: 'M200,000 + Mentorship',
            deadline: '2024-02-28',
            eligibility: 'Tech Startups, MVP Required',
            status: 'open',
            category: 'accelerator',
            description: 'Comprehensive support for technology startups',
          },
        ];

        setPrograms(mockPrograms);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching funding programs:', error);
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    if (filters.category !== 'all') {
      filtered = filtered.filter((program) => program.category === filters.category);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((program) => program.status === filters.status);
    }

    setFilteredPrograms(filtered);
  };

  const handleApplyClick = (program) => {
    setSelectedProgram(program);
    setApplicationData({
      businessName: userProfile?.businessName || '',
      businessDescription: '',
      fundingAmount: program.amount.replace('M', '').replace(',', ''),
      supportingDocs: null,
    });
    setShowApplyModal(true);
  };

  const handleApplicationSubmit = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/funding/apply', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     programId: selectedProgram.id,
      //     ...applicationData
      //   })
      // });

      alert('Application submitted successfully!');
      setShowApplyModal(false);
      setSelectedProgram(null);
      setApplicationData({
        businessName: '',
        businessDescription: '',
        fundingAmount: '',
        supportingDocs: null,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closing_soon':
        return 'warning';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'closing_soon':
        return 'Closing Soon';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading funding programs...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Funding Programs</h1>
        <Button variant="primary">Find More Programs</Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="all">All Categories</option>
                  <option value="grant">Grants</option>
                  <option value="loan">Loans</option>
                  <option value="accelerator">Accelerators</option>
                  <option value="investment">Investment</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closing_soon">Closing Soon</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="secondary" className="w-100" onClick={filterPrograms}>
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Programs Grid */}
      <Row>
        {filteredPrograms.length === 0 ? (
          <Col>
            <Alert variant="info">No funding programs match your filters.</Alert>
          </Col>
        ) : (
          filteredPrograms.map((program) => (
            <Col md={6} lg={4} key={program.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="h5 mb-0">{program.name}</Card.Title>
                    <span className={`badge bg-${getStatusBadge(program.status)}`}>
                      {getStatusText(program.status)}
                    </span>
                  </div>
                  <Card.Subtitle className="mb-3 text-muted">{program.provider}</Card.Subtitle>

                  <div className="mb-3">
                    <strong>Amount:</strong> {program.amount}
                  </div>

                  <div className="mb-3">
                    <strong>Deadline:</strong> {program.deadline}
                  </div>

                  <div className="mb-3">
                    <strong>Eligibility:</strong> {program.eligibility}
                  </div>

                  <div className="mb-3">
                    <p className="small">{program.description}</p>
                  </div>

                  <div className="mt-3">
                    <Button
                      variant="primary"
                      className="w-100 mb-2"
                      onClick={() => handleApplyClick(program)}
                      disabled={program.status !== 'open'}
                    >
                      Apply Now
                    </Button>
                    <Button variant="outline-secondary" className="w-100">
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Application Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Funding</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProgram && (
            <>
              <p>
                You are applying for: <strong>{selectedProgram.name}</strong>
              </p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Business Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={applicationData.businessName}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, businessName: e.target.value })
                    }
                    placeholder="Enter your business name"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Business Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={applicationData.businessDescription}
                    onChange={(e) =>
                      setApplicationData({
                        ...applicationData,
                        businessDescription: e.target.value,
                      })
                    }
                    placeholder="Describe your business"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Funding Amount Requested (M)</Form.Label>
                  <Form.Control
                    type="number"
                    value={applicationData.fundingAmount}
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, fundingAmount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Business Plan or Supporting Documents</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      setApplicationData({ ...applicationData, supportingDocs: e.target.files[0] })
                    }
                  />
                  <Form.Text className="text-muted">
                    Upload business plan, financial projections, or other relevant documents
                  </Form.Text>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplicationSubmit}>
            Submit Application
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FundingPrograms;
