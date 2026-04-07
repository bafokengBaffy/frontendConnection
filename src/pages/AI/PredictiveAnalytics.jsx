import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
  Badge,
  ProgressBar,
} from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, Target, Award, AlertTriangle, CheckCircle } from 'lucide-react';

import {
  predictStudentInternship,
  predictStudentCompanyMatch,
  predictFundingEligibility,
  batchPredict,
  getAIAnalyticsStats,
} from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const PredictiveAnalytics = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState('internship');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const stats = await getAIAnalyticsStats();
      setAnalyticsData(stats);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const runPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sample student data for demonstration
      const sampleStudents = [
        {
          gpa: 3.8,
          skills: ['Python', 'JavaScript', 'React'],
          experienceMonths: 12,
          fieldOfStudy: 'Computer Science',
        },
        {
          gpa: 3.2,
          skills: ['Java', 'SQL', 'HTML'],
          experienceMonths: 6,
          fieldOfStudy: 'Information Technology',
        },
        {
          gpa: 3.9,
          skills: ['Python', 'Machine Learning', 'Data Analysis'],
          experienceMonths: 18,
          fieldOfStudy: 'Data Science',
        },
      ];

      // Run batch predictions
      const batchResults = await batchPredict(sampleStudents);

      // Individual predictions
      const internshipPredictions = await Promise.all(
        sampleStudents.map((student) => predictStudentInternship(student))
      );

      const fundingPredictions = await Promise.all(
        sampleStudents.map((student) => predictFundingEligibility(student))
      );

      setPredictions({
        batch: batchResults,
        internship: internshipPredictions,
        funding: fundingPredictions,
        sampleStudents,
      });
    } catch (err) {
      console.error('Error running predictions:', err);
      setError('Failed to run AI predictions');
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (score) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.6) return '#ffc107';
    return '#dc3545';
  };

  const getPredictionIcon = (score) => {
    if (score >= 0.8) return <CheckCircle size={20} color="#28a745" />;
    if (score >= 0.6) return <AlertTriangle size={20} color="#ffc107" />;
    return <AlertTriangle size={20} color="#dc3545" />;
  };

  const renderPredictionChart = () => {
    if (!predictions) return null;

    const data = predictions.sampleStudents.map((student, index) => ({
      student: `Student ${index + 1}`,
      internship: Math.round((predictions.internship[index]?.prediction || 0) * 100),
      funding: Math.round((predictions.funding[index]?.eligibility || 0) * 100),
      gpa: student.gpa * 25, // Scale GPA for chart
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="student" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="internship" fill="#007bff" name="Internship Success %" />
          <Bar dataKey="funding" fill="#28a745" name="Funding Eligibility %" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderAnalyticsCharts = () => {
    if (!analyticsData?.stats) return null;

    const pieData = [
      {
        name: 'Successful Predictions',
        value: analyticsData.stats.successful_predictions || 0,
        color: '#28a745',
      },
      {
        name: 'Failed Predictions',
        value: analyticsData.stats.failed_predictions || 0,
        color: '#dc3545',
      },
      {
        name: 'Fallback Used',
        value: analyticsData.stats.fallback_predictions || 0,
        color: '#ffc107',
      },
    ];

    return (
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Prediction Success Rate</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Model Performance</h6>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Accuracy</small>
                  <small>{Math.round((analyticsData.stats.accuracy || 0) * 100)}%</small>
                </div>
                <ProgressBar now={(analyticsData.stats.accuracy || 0) * 100} variant="success" />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Precision</small>
                  <small>{Math.round((analyticsData.stats.precision || 0) * 100)}%</small>
                </div>
                <ProgressBar now={(analyticsData.stats.precision || 0) * 100} variant="info" />
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <small>Recall</small>
                  <small>{Math.round((analyticsData.stats.recall || 0) * 100)}%</small>
                </div>
                <ProgressBar now={(analyticsData.stats.recall || 0) * 100} variant="warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <TrendingUp className="me-3" size={32} color="#007bff" />
            <div>
              <h1 className="h2 mb-0">Predictive Analytics</h1>
              <p className="text-muted mb-0">AI-powered insights and predictions</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Prediction Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Analytics Overview */}
      {renderAnalyticsCharts()}

      {/* Prediction Controls */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Run AI Predictions</h5>
                <Button variant="primary" onClick={runPredictions} disabled={loading}>
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Target className="me-2" size={16} />
                  )}
                  Run Predictions
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Click to run AI predictions on sample student data. This will demonstrate internship
                success rates, company matching scores, and funding eligibility predictions.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Prediction Results */}
      {predictions && (
        <>
          {/* Chart Visualization */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Prediction Results Overview</h5>
                </Card.Header>
                <Card.Body>{renderPredictionChart()}</Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Detailed Results */}
          <Row>
            {predictions.sampleStudents.map((student, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Header>
                    <h6 className="mb-0">Student {index + 1}</h6>
                    <small className="text-muted">{student.fieldOfStudy}</small>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small className="text-muted d-block">GPA: {student.gpa}</small>
                      <small className="text-muted d-block">
                        Experience: {student.experienceMonths} months
                      </small>
                      <small className="text-muted d-block">
                        Skills: {student.skills.join(', ')}
                      </small>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        {getPredictionIcon(predictions.internship[index]?.prediction || 0)}
                        <span className="ms-2 fw-bold">Internship Success</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <ProgressBar
                          now={(predictions.internship[index]?.prediction || 0) * 100}
                          style={{ flex: 1, height: '8px' }}
                          variant={
                            predictions.internship[index]?.prediction >= 0.8
                              ? 'success'
                              : predictions.internship[index]?.prediction >= 0.6
                                ? 'warning'
                                : 'danger'
                          }
                        />
                        <span className="ms-2 small">
                          {Math.round((predictions.internship[index]?.prediction || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex align-items-center mb-2">
                        {getPredictionIcon(predictions.funding[index]?.eligibility || 0)}
                        <span className="ms-2 fw-bold">Funding Eligibility</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <ProgressBar
                          now={(predictions.funding[index]?.eligibility || 0) * 100}
                          style={{ flex: 1, height: '8px' }}
                          variant={
                            predictions.funding[index]?.eligibility >= 0.8
                              ? 'success'
                              : predictions.funding[index]?.eligibility >= 0.6
                                ? 'warning'
                                : 'danger'
                          }
                        />
                        <span className="ms-2 small">
                          {Math.round((predictions.funding[index]?.eligibility || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Loading State */}
      {loading && !predictions && (
        <Row className="mt-4">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3 text-muted">Running AI predictions...</p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PredictiveAnalytics;
