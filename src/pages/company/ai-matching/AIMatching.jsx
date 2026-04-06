/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from 'react-bootstrap';
import {
  FaRobot,
  FaUserCheck,
  FaChartLine,
  FaFilter,
  FaSync,
  FaStar,
  FaGraduationCap,
  FaBriefcase,
  FaLightbulb,
} from 'react-icons/fa';
import './AIMatching.css';

const AIMatching = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFilters, setJobFilters] = useState({
    department: '',
    experience: '',
    location: '',
    remote: false,
  });
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    fetchAIMatches();
    fetchAIInsights();
  }, []);

  const fetchAIMatches = async () => {
    setTimeout(() => {
      const mockCandidates = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Candidate ${i + 1}`,
        matchScore: Math.floor(Math.random() * 30) + 70,
        skills: [
          'React',
          'JavaScript',
          'Node.js',
          'Python',
          'AWS',
          'Docker',
          'TypeScript',
          'MongoDB',
        ].slice(0, Math.floor(Math.random() * 5) + 3),
        experience: `${Math.floor(Math.random() * 10) + 1} years`,
        location: ['Maseru', 'Remote', 'South Africa', 'International'][i % 4],
        education: ['BSc Computer Science', 'MSc Data Science', 'Diploma IT', 'Self-Taught'][i % 4],
        noticePeriod: `${Math.floor(Math.random() * 30) + 1} days`,
        salaryExpectation: `M${Math.floor(Math.random() * 20000) + 10000}`,
        aiNotes: [
          'Strong React experience with modern hooks',
          'Excellent problem-solving skills',
          'Good cultural fit based on personality assessment',
          'Previous experience in similar industries',
        ][i % 4],
        strengths: [
          { skill: 'React', score: 95 },
          { skill: 'JavaScript', score: 92 },
          { skill: 'Problem Solving', score: 88 },
        ],
        risks: ['Limited experience with TypeScript', 'No prior remote work experience'].slice(
          0,
          (i % 2) + 1
        ),
      }));

      setCandidates(mockCandidates);
      setLoading(false);
    }, 2000);
  };

  const fetchAIInsights = async () => {
    setTimeout(() => {
      setAiInsights({
        totalCandidates: 124,
        avgMatchScore: 72,
        topSkills: ['JavaScript', 'React', 'Python', 'Node.js', 'AWS'],
        missingSkills: ['Go', 'Rust', 'Kubernetes'],
        salaryBenchmark: 'M15,000 - M25,000',
        marketDemand: 'High demand for Full Stack Developers',
        competitorHiring: '5 companies hiring for similar roles',
        recommendations: [
          'Consider remote candidates to expand talent pool',
          'Offer competitive salary for top 10% candidates',
          'Focus on candidates with cloud experience',
        ],
      });
    }, 1500);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  return (
    <Container fluid className="ai-matching-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaRobot className="text-primary me-3" size={32} />
        <div>
          <h2>AI Candidate Matching</h2>
          <p className="text-muted">Smart matching using artificial intelligence</p>
        </div>
      </div>

      {/* AI Insights Card */}
      {aiInsights && (
        <Card className="border-0 shadow-sm mb-4 bg-primary text-white">
          <Card.Body>
            <Row>
              <Col md={8}>
                <h4 className="mb-3">🤖 AI Hiring Insights</h4>
                <Row>
                  <Col md={4}>
                    <div className="mb-3">
                      <div className="small">Market Demand</div>
                      <h5>{aiInsights.marketDemand}</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <div className="small">Salary Benchmark</div>
                      <h5>{aiInsights.salaryBenchmark}</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="mb-3">
                      <div className="small">Competitor Activity</div>
                      <h5>{aiInsights.competitorHiring}</h5>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3">
                  <h6>AI Recommendations:</h6>
                  <ul className="mb-0">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="small">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
              <Col md={4} className="text-center">
                <div className="mb-3">
                  <div className="display-4">{aiInsights.avgMatchScore}%</div>
                  <div className="small">Average Match Score</div>
                </div>
                <Button variant="light" className="mt-2">
                  <FaChartLine className="me-2" />
                  View Detailed Analysis
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">Filter Candidates</h5>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select
                value={jobFilters.department}
                onChange={(e) => setJobFilters({ ...jobFilters, department: e.target.value })}
              >
                <option value="">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="design">Design</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={jobFilters.experience}
                onChange={(e) => setJobFilters({ ...jobFilters, experience: e.target.value })}
              >
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={jobFilters.location}
                onChange={(e) => setJobFilters({ ...jobFilters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="maseru">Maseru</option>
                <option value="remote">Remote</option>
                <option value="south-africa">South Africa</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button variant="primary" className="w-100" onClick={fetchAIMatches}>
                <FaSync className="me-2" />
                Refresh Matches
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Candidates Grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">AI is analyzing candidates...</p>
        </div>
      ) : (
        <Row className="g-4">
          {candidates.map((candidate) => (
            <Col key={candidate.id} xl={6} lg={6} md={12}>
              <Card className="border-0 shadow-sm h-100 hover-lift">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{candidate.name}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="light" text="dark">
                          <FaBriefcase className="me-1" />
                          {candidate.experience}
                        </Badge>
                        <Badge bg="light" text="dark">
                          <FaGraduationCap className="me-1" />
                          {candidate.education}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-end">
                      <div
                        className={`match-score display-6 text-${getMatchColor(candidate.matchScore)}`}
                      >
                        {candidate.matchScore}%
                      </div>
                      <div className="small text-muted">AI Match Score</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted mb-2">Skills Match</div>
                    <div className="d-flex flex-wrap gap-1">
                      {candidate.skills.map((skill, idx) => (
                        <Badge key={idx} bg="info" className="me-1 mb-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted mb-2">AI Assessment</div>
                    <ul className="small mb-0">
                      {candidate.aiNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-3">
                    <div className="small text-muted mb-2">Strengths</div>
                    <div className="d-flex flex-wrap gap-2">
                      {candidate.strengths.map((strength, idx) => (
                        <div key={idx} className="d-flex align-items-center">
                          <span className="me-2">{strength.skill}</span>
                          <ProgressBar
                            now={strength.score}
                            variant="success"
                            style={{ width: '60px', height: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {candidate.risks.length > 0 && (
                    <Alert variant="warning" className="small py-2 mb-3">
                      <FaLightbulb className="me-2" />
                      <strong>Considerations:</strong> {candidate.risks.join(', ')}
                    </Alert>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <div className="small text-muted">Location</div>
                      <div>{candidate.location}</div>
                    </div>
                    <div>
                      <div className="small text-muted">Expected Salary</div>
                      <div>{candidate.salaryExpectation}</div>
                    </div>
                    <div>
                      <div className="small text-muted">Notice Period</div>
                      <div>{candidate.noticePeriod}</div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <Button variant="primary" className="flex-grow-1">
                      <FaUserCheck className="me-2" />
                      Shortlist
                    </Button>
                    <Button variant="outline-primary">View Profile</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* AI Features Info */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h5 className="mb-3">🎯 How AI Matching Works</h5>
          <Row>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="mb-3">
                  <div className="ai-feature-icon bg-primary-light text-primary">
                    <FaChartLine size={24} />
                  </div>
                </div>
                <h6>Skill Analysis</h6>
                <p className="small text-muted mb-0">
                  Analyzes 100+ data points including skills, experience, and project history
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="mb-3">
                  <div className="ai-feature-icon bg-success-light text-success">
                    <FaStar size={24} />
                  </div>
                </div>
                <h6>Cultural Fit</h6>
                <p className="small text-muted mb-0">
                  Assesses personality traits and work style compatibility
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="mb-3">
                  <div className="ai-feature-icon bg-info-light text-info">
                    <FaLightbulb size={24} />
                  </div>
                </div>
                <h6>Predictive Success</h6>
                <p className="small text-muted mb-0">
                  Predicts candidate success based on historical hiring data
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AIMatching;
