/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Form,
  Modal,
  Spinner,
  Alert,
} from 'react-bootstrap';
import {
  FaVideo,
  FaCalendar,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarPlus,
  FaChartBar,
} from 'react-icons/fa';
import './VideoInterviews.css';

const VideoInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setTimeout(() => {
      const mockInterviews = [
        {
          id: 1,
          candidateName: 'John Doe',
          candidateRole: 'Senior Developer',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          duration: 45,
          status: 'scheduled',
          meetingLink: 'https://meet.careerconnect.ls/john-doe-123',
          interviewers: ['Sarah Johnson', 'Mike Chen'],
          preparation: ['Review portfolio', 'Technical questions'],
          aiAnalysis: { readiness: 85, confidence: 78 },
        },
        {
          id: 2,
          candidateName: 'Sarah Smith',
          candidateRole: 'Marketing Manager',
          scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 30,
          status: 'completed',
          meetingLink: '',
          interviewers: ['Alex Wilson'],
          preparation: ['Campaign analysis', 'Strategy questions'],
          aiAnalysis: { readiness: 92, confidence: 85 },
          feedback: { rating: 4.5, notes: 'Excellent strategic thinking' },
        },
        {
          id: 3,
          candidateName: 'Michael Brown',
          candidateRole: 'UX Designer',
          scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          duration: 60,
          status: 'scheduled',
          meetingLink: 'https://meet.careerconnect.ls/michael-brown-456',
          interviewers: ['Lisa Wong', 'Tom Harris'],
          preparation: ['Design portfolio review', 'UI challenges'],
          aiAnalysis: { readiness: 76, confidence: 82 },
        },
        {
          id: 4,
          candidateName: 'Jessica Wilson',
          candidateRole: 'Data Analyst',
          scheduledTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
          duration: 40,
          status: 'completed',
          meetingLink: '',
          interviewers: ['David Miller'],
          preparation: ['SQL test', 'Case study'],
          aiAnalysis: { readiness: 88, confidence: 79 },
          feedback: { rating: 4.0, notes: 'Strong technical skills' },
        },
        {
          id: 5,
          candidateName: 'Robert Johnson',
          candidateRole: 'Product Manager',
          scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 50,
          status: 'cancelled',
          meetingLink: '',
          interviewers: ['Emma Davis'],
          preparation: ['Product strategy', 'Roadmap exercise'],
          aiAnalysis: { readiness: 65, confidence: 70 },
          cancellationReason: 'Candidate unavailable',
        },
      ];

      setInterviews(mockInterviews);
      setLoading(false);
    }, 1500);
  };

  const handleJoinInterview = (interview) => {
    setSelectedInterview(interview);
    setShowJoinModal(true);
  };

  const handleScheduleInterview = () => {
    setShowScheduleModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge bg="primary">Scheduled</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'in-progress':
        return <Badge bg="warning">In Progress</Badge>;
      case 'cancelled':
        return <Badge bg="secondary">Cancelled</Badge>;
      default:
        return (
          <Badge bg="light" text="dark">
            Pending
          </Badge>
        );
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const interviewTime = new Date(date);
    const diffMs = interviewTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) return 'Past';
    if (diffHours < 1) return 'Starting soon';
    if (diffHours < 24) return `In ${diffHours} hours`;
    return `In ${Math.floor(diffHours / 24)} days`;
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (activeTab === 'upcoming') return interview.status === 'scheduled';
    if (activeTab === 'completed') return interview.status === 'completed';
    if (activeTab === 'cancelled') return interview.status === 'cancelled';
    return true;
  });

  return (
    <Container fluid className="video-interviews-container px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Video Interviews</h2>
          <p className="text-muted">Schedule and conduct video interviews with candidates</p>
        </div>
        <Button variant="primary" onClick={handleScheduleInterview}>
          <FaCalendarPlus className="me-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <FaVideo className="text-primary mb-2" size={24} />
              <h4>{interviews.filter((i) => i.status === 'scheduled').length}</h4>
              <p className="text-muted mb-0">Upcoming</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <FaCheckCircle className="text-success mb-2" size={24} />
              <h4>{interviews.filter((i) => i.status === 'completed').length}</h4>
              <p className="text-muted mb-0">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <FaChartBar className="text-info mb-2" size={24} />
              <h4>
                {Math.round(
                  interviews
                    .filter((i) => i.status === 'completed')
                    .reduce((acc, i) => acc + (i.aiAnalysis?.readiness || 0), 0) /
                    interviews.filter((i) => i.status === 'completed').length
                ) || 0}
                %
              </h4>
              <p className="text-muted mb-0">Avg. Readiness</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <FaUser className="text-warning mb-2" size={24} />
              <h4>
                {interviews
                  .filter((i) => i.status === 'completed')
                  .reduce((acc, i) => acc + (i.feedback?.rating || 0), 0) /
                  interviews.filter((i) => i.status === 'completed').length || 0}
              </h4>
              <p className="text-muted mb-0">Avg. Rating</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button
                variant={activeTab === 'all' ? 'primary' : 'light'}
                className="me-2"
                onClick={() => setActiveTab('all')}
              >
                All Interviews
              </Button>
              <Button
                variant={activeTab === 'upcoming' ? 'primary' : 'light'}
                className="me-2"
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'primary' : 'light'}
                className="me-2"
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </Button>
              <Button
                variant={activeTab === 'cancelled' ? 'primary' : 'light'}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled
              </Button>
            </div>
            <div>
              <Button variant="outline-primary" size="sm" className="me-2">
                Export
              </Button>
              <Button variant="outline-secondary" size="sm">
                <FaClock />
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading interviews...</p>
            </div>
          ) : filteredInterviews.length > 0 ? (
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Candidate</th>
                  <th>Scheduled Time</th>
                  <th>Duration</th>
                  <th>AI Readiness</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {interview.candidateName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <strong>{interview.candidateName}</strong>
                          <div className="small text-muted">{interview.candidateRole}</div>
                          <div className="small">
                            <FaUser className="me-1" />
                            {interview.interviewers.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{formatDateTime(interview.scheduledTime)}</div>
                        <div className="small text-muted">
                          {getTimeUntil(interview.scheduledTime)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaClock className="me-1 text-muted" />
                        {interview.duration} mins
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${interview.aiAnalysis.readiness}%` }}
                          ></div>
                        </div>
                        <span>{interview.aiAnalysis.readiness}%</span>
                      </div>
                      {interview.feedback && (
                        <div className="small text-muted mt-1">
                          Rated: {interview.feedback.rating}/5
                        </div>
                      )}
                    </td>
                    <td>{getStatusBadge(interview.status)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {interview.status === 'scheduled' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinInterview(interview)}
                          >
                            <FaVideo className="me-1" />
                            Join
                          </Button>
                        )}
                        {interview.status === 'completed' && (
                          <Button variant="outline-success" size="sm">
                            View Feedback
                          </Button>
                        )}
                        <Button variant="light" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <FaVideo className="text-muted mb-3" size={48} />
              <h5>No interviews found</h5>
              <p className="text-muted">Schedule your first video interview</p>
              <Button variant="primary" onClick={handleScheduleInterview}>
                Schedule Interview
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* AI Interview Assistant */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="mb-0">🤖 AI Interview Assistant</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Preparation Tips for Upcoming Interviews</h6>
              <ul className="small">
                <li>Review candidate's portfolio and previous projects</li>
                <li>Prepare behavioral questions based on role requirements</li>
                <li>Set up technical assessment if applicable</li>
                <li>Check video and audio equipment before interview</li>
                <li>Have interview scorecard ready for evaluation</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>AI-Powered Features</h6>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="info" className="p-2">
                  Real-time Transcription
                </Badge>
                <Badge bg="info" className="p-2">
                  Sentiment Analysis
                </Badge>
                <Badge bg="info" className="p-2">
                  Skill Assessment
                </Badge>
                <Badge bg="info" className="p-2">
                  Bias Detection
                </Badge>
                <Badge bg="info" className="p-2">
                  Automated Notes
                </Badge>
              </div>
              <div className="mt-3">
                <Button variant="outline-primary" size="sm">
                  Enable AI Assistant
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Join Interview Modal */}
      <Modal show={showJoinModal} onHide={() => setShowJoinModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Join Video Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInterview && (
            <div>
              <Alert variant="info">
                <strong>Interview Details:</strong>
                <br />
                Candidate: {selectedInterview.candidateName}
                <br />
                Role: {selectedInterview.candidateRole}
                <br />
                Time: {formatDateTime(selectedInterview.scheduledTime)}
                <br />
                Duration: {selectedInterview.duration} minutes
              </Alert>

              <div className="mb-3">
                <h6>Preparation Checklist</h6>
                <ul>
                  {selectedInterview.preparation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-3">
                <h6>AI Readiness Analysis</h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <div className="small">Candidate Readiness</div>
                      <ProgressBar
                        now={selectedInterview.aiAnalysis.readiness}
                        variant="success"
                        className="mt-1"
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <div className="small">Confidence Level</div>
                      <ProgressBar
                        now={selectedInterview.aiAnalysis.confidence}
                        variant="info"
                        className="mt-1"
                      />
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="text-center my-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-5"
                  href={selectedInterview.meetingLink}
                  target="_blank"
                >
                  <FaVideo className="me-2" />
                  Join Interview Room
                </Button>
                <p className="text-muted small mt-2">
                  You'll be redirected to the video interview room
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule New Interview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Candidate</Form.Label>
                  <Form.Select>
                    <option>Select a candidate...</option>
                    <option>John Doe - Senior Developer</option>
                    <option>Sarah Smith - Marketing Manager</option>
                    <option>Michael Brown - UX Designer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Interview Type</Form.Label>
                  <Form.Select>
                    <option>Technical Interview</option>
                    <option>Cultural Fit</option>
                    <option>Managerial</option>
                    <option>Final Round</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Select>
                    <option>30</option>
                    <option>45</option>
                    <option>60</option>
                    <option>90</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Interviewers</Form.Label>
                  <Form.Select multiple>
                    <option>Sarah Johnson</option>
                    <option>Mike Chen</option>
                    <option>Alex Wilson</option>
                    <option>Lisa Wong</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Meeting Agenda</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter interview agenda and topics..."
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Preparation Materials</Form.Label>
              <Form.Control type="file" multiple />
              <Form.Text className="text-muted">
                Upload candidate's resume, portfolio, or test results
              </Form.Text>
            </Form.Group>

            <div className="mt-4">
              <Form.Check type="checkbox" label="Enable AI Interview Assistant" defaultChecked />
              <Form.Check
                type="checkbox"
                label="Send calendar invites to all participants"
                defaultChecked
              />
              <Form.Check type="checkbox" label="Record interview (with consent)" />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">Schedule Interview</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VideoInterviews;
