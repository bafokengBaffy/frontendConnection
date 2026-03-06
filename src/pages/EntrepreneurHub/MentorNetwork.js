import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

function MentorNetwork() {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestData, setRequestData] = useState({
    goals: '',
    timeframe: '3months',
    meetingPreference: 'virtual',
  });
  const [filters, setFilters] = useState({
    expertise: 'all',
    availability: 'all',
  });
  useAuth();

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [mentors, filters]);

  const fetchMentors = async () => {
    try {
      setLoading(true);

      // In a real app, this would be an API call
      // const response = await fetch('/api/mentors');
      // const data = await response.json();

      // Simulate API call
      setTimeout(() => {
        const mockMentors = [
          {
            id: 1,
            name: 'Dr. Thabo Moloi',
            expertise: 'Business Strategy & Finance',
            experience: '15+ years',
            availability: 'part_time',
            rate: 'Free for Youth',
            status: 'available',
            industry: ['tech', 'finance'],
            bio: 'Experienced business consultant with focus on startups',
          },
          {
            id: 2,
            name: 'Ms. Lerato Mokoena',
            expertise: 'Marketing & Sales',
            experience: '12 years',
            availability: 'full_time',
            rate: 'M500/hour',
            status: 'available',
            industry: ['retail', 'services'],
            bio: 'Marketing expert specializing in digital transformation',
          },
          {
            id: 3,
            name: 'Mr. David Smith',
            expertise: 'Tech & Innovation',
            experience: '20+ years',
            availability: 'consultation',
            rate: 'M800/hour',
            status: 'limited',
            industry: ['tech', 'manufacturing'],
            bio: 'Technology advisor for innovation-driven businesses',
          },
          {
            id: 4,
            name: 'Prof. Anna Jones',
            expertise: 'Agriculture & Agribusiness',
            experience: '25 years',
            availability: 'mentorship_program',
            rate: 'Free',
            status: 'available',
            industry: ['agriculture'],
            bio: 'Agricultural expert with focus on sustainable practices',
          },
        ];

        setMentors(mockMentors);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = [...mentors];

    if (filters.expertise !== 'all') {
      filtered = filtered.filter((mentor) =>
        mentor.expertise.toLowerCase().includes(filters.expertise.toLowerCase())
      );
    }

    if (filters.availability !== 'all') {
      filtered = filtered.filter((mentor) => mentor.availability === filters.availability);
    }

    setFilteredMentors(filtered);
  };

  const handleRequestClick = (mentor) => {
    setSelectedMentor(mentor);
    setRequestData({
      goals: '',
      timeframe: '3months',
      meetingPreference: 'virtual',
    });
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch('/api/mentorship/request', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     mentorId: selectedMentor.id,
      //     ...requestData
      //   })
      // });

      alert('Mentorship request sent successfully!');
      setShowRequestModal(false);
      setSelectedMentor(null);
      setRequestData({
        goals: '',
        timeframe: '3months',
        meetingPreference: 'virtual',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'limited':
        return 'warning';
      case 'unavailable':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'limited':
        return 'Limited';
      case 'unavailable':
        return 'Unavailable';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading mentor network...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">Mentor Network</h1>
        <Button variant="primary">Find More Mentors</Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Expertise Area</Form.Label>
                <Form.Select
                  value={filters.expertise}
                  onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                >
                  <option value="all">All Expertise</option>
                  <option value="strategy">Business Strategy</option>
                  <option value="marketing">Marketing & Sales</option>
                  <option value="tech">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="agriculture">Agriculture</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Availability</Form.Label>
                <Form.Select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                >
                  <option value="all">All Availability</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="consultation">Consultation</option>
                  <option value="mentorship_program">Program</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="secondary" className="w-100" onClick={filterMentors}>
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mentors Grid */}
      <Row>
        {filteredMentors.length === 0 ? (
          <Col>
            <Alert variant="info">No mentors match your filters.</Alert>
          </Col>
        ) : (
          filteredMentors.map((mentor) => (
            <Col md={6} lg={4} key={mentor.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title className="h5 mb-0">{mentor.name}</Card.Title>
                    <span className={`badge bg-${getStatusBadge(mentor.status)}`}>
                      {getStatusText(mentor.status)}
                    </span>
                  </div>
                  <Card.Subtitle className="mb-3 text-muted">{mentor.expertise}</Card.Subtitle>

                  <div className="mb-3">
                    <strong>Experience:</strong> {mentor.experience}
                  </div>

                  <div className="mb-3">
                    <strong>Rate:</strong> {mentor.rate}
                  </div>

                  <div className="mb-3">
                    <p className="small">{mentor.bio}</p>
                  </div>

                  <div className="mt-3">
                    <Button
                      variant="primary"
                      className="w-100 mb-2"
                      onClick={() => handleRequestClick(mentor)}
                      disabled={mentor.status !== 'available'}
                    >
                      Request Mentorship
                    </Button>
                    <Button variant="outline-secondary" className="w-100">
                      View Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Mentorship</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMentor && (
            <>
              <p>
                Requesting mentorship from: <strong>{selectedMentor.name}</strong>
              </p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Mentorship Goals</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={requestData.goals}
                    onChange={(e) => setRequestData({ ...requestData, goals: e.target.value })}
                    placeholder="What do you hope to achieve through mentorship?"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Timeframe</Form.Label>
                  <Form.Select
                    value={requestData.timeframe}
                    onChange={(e) => setRequestData({ ...requestData, timeframe: e.target.value })}
                  >
                    <option value="1month">1 Month</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Meeting Preference</Form.Label>
                  <Form.Select
                    value={requestData.meetingPreference}
                    onChange={(e) =>
                      setRequestData({ ...requestData, meetingPreference: e.target.value })
                    }
                  >
                    <option value="virtual">Virtual Meetings</option>
                    <option value="in_person">In-person Meetings</option>
                    <option value="hybrid">Hybrid (Both)</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRequestSubmit}>
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MentorNetwork;
