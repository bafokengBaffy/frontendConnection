/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// frontend/src/pages/company/predictive-analytics/PredictiveAnalytics.js (Enhanced)
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Spinner,
  Alert,
  ProgressBar,
} from 'react-bootstrap';
import {
  FaChartLine,
  FaBrain,
  FaLightbulb,
  FaRobot,
  FaCalendarAlt,
  FaUserCheck,
} from 'react-icons/fa';

import analyticsService from '../../../services/companyExtendedServices';
import { useAuth } from '../../../context/AuthContext';
import './PredictiveAnalytics.css';

const PredictiveAnalytics = () => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    generatePredictions();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const result = await analyticsService.getCompanyAnalytics(currentUser.uid, timeRange);

      if (result.success) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = () => {
    // Mock predictions - in real app, this would come from AI service
    const mockPredictions = [
      {
        id: 1,
        type: 'hiring_success',
        title: 'Q1 Hiring Success Prediction',
        confidence: 85,
        prediction: 'High success rate expected',
        factors: ['Strong candidate pool', 'Competitive salaries', 'Good employer brand'],
        timeline: 'Next 3 months',
        impact: 'high',
      },
      {
        id: 2,
        type: 'attrition_risk',
        title: 'Employee Retention Risk',
        confidence: 72,
        prediction: 'Moderate attrition risk',
        factors: ['Market competition', 'Salary benchmarks', 'Remote work options'],
        timeline: 'Next 6 months',
        impact: 'medium',
      },
      {
        id: 3,
        type: 'skill_gap',
        title: 'Emerging Skill Gaps',
        confidence: 91,
        prediction: 'AI/ML skills becoming critical',
        factors: ['Industry trends', 'Job requirements', 'Candidate skills'],
        timeline: 'Next 12 months',
        impact: 'high',
      },
      {
        id: 4,
        type: 'recruitment_cost',
        title: 'Recruitment Cost Forecast',
        confidence: 78,
        prediction: 'Costs may increase by 15%',
        factors: ['Platform fees', 'Agency costs', 'Time to hire'],
        timeline: 'Next quarter',
        impact: 'medium',
      },
    ];

    setPredictions(mockPredictions);
  };

  const getImpactBadge = (impact) => {
    const variants = {
      high: { bg: 'danger', text: 'High Impact' },
      medium: { bg: 'warning', text: 'Medium Impact' },
      low: { bg: 'info', text: 'Low Impact' },
    };

    const variant = variants[impact] || { bg: 'secondary', text: 'Unknown' };

    return <span className={`badge bg-${variant.bg}`}>{variant.text}</span>;
  };

  if (loading && !analytics) {
    return (
      <Container fluid className="predictive-analytics-container px-4 py-3">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading predictive analytics...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="predictive-analytics-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaBrain className="text-primary me-3" size={32} />
        <div>
          <h2>Predictive Analytics Hub</h2>
          <p className="text-muted">AI-powered insights for smarter hiring decisions</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Analytics Period</h5>
              <p className="text-muted small mb-0">Select time range for predictions</p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'year' ? 'primary' : 'outline-primary'}
                onClick={() => setTimeRange('year')}
              >
                Year
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* AI Predictions Grid */}
      <Row className="mb-4">
        <Col>
          <h4 className="mb-3">🤖 AI Predictions & Insights</h4>
          <Row className="g-4">
            {predictions.map((prediction) => (
              <Col key={prediction.id} xl={6} lg={6} md={12}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">{prediction.title}</h5>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-info">{prediction.type.replace('_', ' ')}</span>
                          {getImpactBadge(prediction.impact)}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="display-6">{prediction.confidence}%</div>
                        <div className="small text-muted">Confidence</div>
                      </div>
                    </div>

                    <p className="mb-3">{prediction.prediction}</p>

                    <div className="mb-3">
                      <div className="small text-muted mb-2">Key Factors:</div>
                      <div className="d-flex flex-wrap gap-1">
                        {prediction.factors.map((factor, idx) => (
                          <span key={idx} className="badge bg-light text-dark">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <FaCalendarAlt className="me-1 text-muted" />
                        <span className="small">{prediction.timeline}</span>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Current Analytics */}
      {analytics && (
        <Row className="g-4">
          <Col xl={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Current Performance Metrics</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Trend</th>
                      <th>Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Hire Rate</td>
                      <td>{analytics.overview.hireRate}%</td>
                      <td>
                        <span className="text-success">↑ 5%</span>
                      </td>
                      <td>25%</td>
                    </tr>
                    <tr>
                      <td>Interview Rate</td>
                      <td>{analytics.overview.interviewRate}%</td>
                      <td>
                        <span className="text-warning">→ 0%</span>
                      </td>
                      <td>30%</td>
                    </tr>
                    <tr>
                      <td>Avg Time to Hire</td>
                      <td>{analytics.overview.avgTimeToHire} days</td>
                      <td>
                        <span className="text-success">↓ 2 days</span>
                      </td>
                      <td>21 days</td>
                    </tr>
                    <tr>
                      <td>Avg Response Time</td>
                      <td>{analytics.overview.avgResponseTime} days</td>
                      <td>
                        <span className="text-danger">↑ 0.5 days</span>
                      </td>
                      <td>2 days</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Top Skills in Demand</h5>
              </Card.Header>
              <Card.Body>
                {analytics.topSkills && analytics.topSkills.length > 0 ? (
                  <div>
                    {analytics.topSkills.slice(0, 5).map((skill, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{skill.skill}</span>
                          <span>{skill.count} candidates</span>
                        </div>
                        <ProgressBar
                          now={(skill.count / analytics.topSkills[0].count) * 100}
                          variant={index === 0 ? 'success' : index === 1 ? 'info' : 'warning'}
                          style={{ height: '8px' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No skill data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* AI Recommendations */}
      <Card className="border-0 shadow-sm mt-4 bg-light">
        <Card.Body>
          <div className="d-flex align-items-start">
            <FaRobot className="text-primary me-3 mt-1" size={24} />
            <div className="flex-grow-1">
              <h5>AI Recommendations</h5>
              <ul className="mb-0">
                <li>Consider offering remote work options to attract 30% more candidates</li>
                <li>Increase salary benchmarks by 15% to remain competitive</li>
                <li>Focus on AI/ML skills in next quarter&apos;s hiring</li>
                <li>Implement skills assessment tests to improve hiring quality</li>
              </ul>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="mt-4 text-center">
        <Button variant="primary" className="me-3">
          <FaChartLine className="me-2" />
          Export Report
        </Button>
        <Button variant="outline-primary" className="me-3">
          <FaLightbulb className="me-2" />
          Generate New Insights
        </Button>
        <Button variant="outline-success">
          <FaUserCheck className="me-2" />
          Optimize Hiring Strategy
        </Button>
      </div>
    </Container>
  );
};

export default PredictiveAnalytics;
