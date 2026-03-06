import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';

const Mentorship = () => {
  const mentors = [
    {
      id: 1,
      name: 'Dr. Thabo Molefi',
      role: 'Senior Software Engineer',
      company: 'Google',
      expertise: ['JavaScript', 'React', 'Cloud Computing'],
      availability: '2 slots this week',
      match: 95,
    },
    {
      id: 2,
      name: 'Ms. Lerato Mokone',
      role: 'Product Manager',
      company: 'Microsoft',
      expertise: ['Product Strategy', 'UX Design', 'Agile'],
      availability: '1 slot this week',
      match: 88,
    },
    {
      id: 3,
      name: 'Mr. Sello Mokoena',
      role: 'Entrepreneur & Investor',
      company: 'Tech Startup Lesotho',
      expertise: ['Startups', 'Funding', 'Business Strategy'],
      availability: 'Available now',
      match: 82,
    },
  ];

  const sessions = [
    {
      id: 1,
      mentor: 'Dr. Thabo Molefi',
      date: '2024-01-18',
      time: '2:00 PM',
      topic: 'Career Path in Software Engineering',
      status: 'scheduled',
    },
    {
      id: 2,
      mentor: 'Ms. Lerato Mokone',
      date: '2024-01-10',
      time: '11:00 AM',
      topic: 'Product Management Interview Prep',
      status: 'completed',
    },
    {
      id: 3,
      mentor: 'Mr. Sello Mokoena',
      date: '2024-01-05',
      time: '3:00 PM',
      topic: 'Startup Funding Strategies',
      status: 'completed',
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Mentorship Program</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-primary mb-2">3</div>
              <Card.Title>Active Mentors</Card.Title>
              <p className="text-muted">Available for guidance</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-success mb-2">5</div>
              <Card.Title>Sessions Completed</Card.Title>
              <p className="text-muted">Total mentorship hours: 10</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-warning mb-2">95%</div>
              <Card.Title>Match Score</Card.Title>
              <p className="text-muted">With your career goals</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>👥 Recommended Mentors</span>
                <Badge bg="primary">{mentors.length} available</Badge>
              </Card.Title>

              {mentors.map((mentor) => (
                <Card key={mentor.id} className="mb-3 border">
                  <Card.Body>
                    <Row>
                      <Col md={3} className="text-center">
                        <div className="bg-primary-subtle p-3 rounded-circle d-inline-flex">
                          <i className="bi bi-person text-primary" style={{ fontSize: '2rem' }}></i>
                        </div>
                      </Col>

                      <Col md={6}>
                        <h5 className="mb-1">{mentor.name}</h5>
                        <p className="text-muted mb-2">
                          {mentor.role} at {mentor.company}
                        </p>
                        <div className="mb-2">
                          {mentor.expertise.map((skill, index) => (
                            <Badge key={index} bg="light" text="dark" className="me-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="mb-0 text-success">
                          <i className="bi bi-clock me-1"></i>
                          {mentor.availability}
                        </p>
                      </Col>

                      <Col md={3} className="text-end">
                        <div className="mb-3">
                          <Badge bg="success">{mentor.match}% Match</Badge>
                        </div>
                        <Button variant="primary" className="mb-2">
                          Request Session
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          View Profile
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>📅 Upcoming Sessions</Card.Title>

              {sessions.map((session) => (
                <div key={session.id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{session.topic}</h6>
                      <p className="text-muted small mb-1">{session.mentor}</p>
                      <small className="text-muted">
                        {new Date(session.date).toLocaleDateString()} • {session.time}
                      </small>
                    </div>
                    <Badge bg={session.status === 'completed' ? 'success' : 'primary'}>
                      {session.status}
                    </Badge>
                  </div>

                  {session.status === 'scheduled' && (
                    <div className="mt-2">
                      <Button variant="outline-primary" size="sm" className="me-2">
                        Join
                      </Button>
                      <Button variant="outline-secondary" size="sm">
                        Reschedule
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4">
                <h6>Mentorship Progress</h6>
                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <small>Career Guidance</small>
                    <small>75%</small>
                  </div>
                  <ProgressBar now={75} className="mb-3" />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <small>Skill Development</small>
                    <small>60%</small>
                  </div>
                  <ProgressBar now={60} variant="success" className="mb-3" />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between">
                    <small>Network Building</small>
                    <small>40%</small>
                  </div>
                  <ProgressBar now={40} variant="info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>🎯 Mentorship Goals</Card.Title>
          <Row>
            <Col md={4}>
              <div className="p-3 text-center">
                <h4 className="text-primary">Short-term</h4>
                <ul className="list-unstyled">
                  <li className="mb-2">✓ Resume review</li>
                  <li className="mb-2">✓ Interview preparation</li>
                  <li>◻ Portfolio building</li>
                </ul>
              </div>
            </Col>

            <Col md={4}>
              <div className="p-3 text-center">
                <h4 className="text-success">Medium-term</h4>
                <ul className="list-unstyled">
                  <li className="mb-2">◻ Skill certification</li>
                  <li className="mb-2">◻ Project collaboration</li>
                  <li>◻ Industry networking</li>
                </ul>
              </div>
            </Col>

            <Col md={4}>
              <div className="p-3 text-center">
                <h4 className="text-warning">Long-term</h4>
                <ul className="list-unstyled">
                  <li className="mb-2">◻ Career advancement</li>
                  <li className="mb-2">◻ Leadership development</li>
                  <li>◻ Mentorship giving back</li>
                </ul>
              </div>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button variant="primary" size="lg" className="me-3">
              <i className="bi bi-search me-2"></i>
              Find More Mentors
            </Button>
            <Button variant="outline-success" size="lg">
              <i className="bi bi-calendar-plus me-2"></i>
              Schedule New Session
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Mentorship;
