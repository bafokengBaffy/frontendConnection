import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Brain, TrendingUp, Users, Target, Zap, Award } from 'lucide-react';

import {
  checkAIHealth,
  getAIModelsInfo,
  getAIAnalyticsStats,
  predictStudentInternship,
  predictFundingEligibility,
} from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const AIDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aiHealth, setAiHealth] = useState(null);
  const [modelsInfo, setModelsInfo] = useState(null);
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [personalPredictions, setPersonalPredictions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAIDashboard();
  }, [userProfile]);

  const loadAIDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check AI service health
      const healthResponse = await checkAIHealth();
      setAiHealth(healthResponse);

      // Get models information
      const modelsResponse = await getAIModelsInfo();
      setModelsInfo(modelsResponse);

      // Get analytics stats
      const statsResponse = await getAIAnalyticsStats();
      setAnalyticsStats(statsResponse);

      // Generate personal predictions if user is a student
      if (userProfile?.userType === 'student') {
        await generatePersonalPredictions();
      }
    } catch (err) {
      console.error('Error loading AI dashboard:', err);
      setError('Failed to load AI dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalPredictions = async () => {
    try {
      if (!userProfile) return;

      // Prepare student data for predictions
      const studentData = {
        gpa: userProfile.gpa || 3.0,
        skills: userProfile.skills || [],
        experienceMonths: userProfile.experienceMonths || 0,
        fieldOfStudy: userProfile.fieldOfStudy || 'General',
      };

      // Get internship prediction
      const internshipPrediction = await predictStudentInternship(studentData);

      // Get funding eligibility
      const fundingPrediction = await predictFundingEligibility(studentData);

      setPersonalPredictions({
        internship: internshipPrediction,
        funding: fundingPrediction,
      });
    } catch (err) {
      console.error('Error generating personal predictions:', err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      healthy: 'success',
      operational: 'success',
      error: 'danger',
      fallback: 'warning',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPredictionColor = (score) => {
    if (score >= 0.8) return '#28a745'; // success
    if (score >= 0.6) return '#ffc107'; // warning
    return '#dc3545'; // danger
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 text-muted">Loading AI Dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>AI Dashboard Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadAIDashboard}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Brain className="me-3" size={32} color="#007bff" />
            <div>
              <h1 className="h2 mb-0">AI Dashboard</h1>
              <p className="text-muted mb-0">Intelligent insights powered by machine learning</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* AI Service Status */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">AI Service Status</h5>
                {aiHealth &&
                  getStatusBadge(aiHealth.status || (aiHealth.fallback ? 'fallback' : 'error'))}
              </div>
              {aiHealth && (
                <div>
                  <p className="mb-1">
                    <strong>Service:</strong> {aiHealth.service || 'Career Connect AI'}
                  </p>
                  <p className="mb-1">
                    <strong>Version:</strong> {aiHealth.version || '1.0.0'}
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong> {aiHealth.success ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Available Models</h5>
                <Badge bg="info">{modelsInfo?.total || 0}</Badge>
              </div>
              {modelsInfo?.models?.map((model, index) => (
                <div key={index} className="mb-2">
                  <small className="text-muted d-block">{model.name}</small>
                  <small>{model.description}</small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Personal Predictions for Students */}
      {userProfile?.userType === 'student' && personalPredictions && (
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <div className="d-flex align-items-center">
                  <Target className="me-2" size={20} />
                  <h5 className="mb-0">Your AI Predictions</h5>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="text-center p-3">
                      <Award
                        size={48}
                        color={getPredictionColor(personalPredictions.internship?.prediction || 0)}
                      />
                      <h4
                        className="mt-3"
                        style={{
                          color: getPredictionColor(
                            personalPredictions.internship?.prediction || 0
                          ),
                        }}
                      >
                        {Math.round((personalPredictions.internship?.prediction || 0) * 100)}%
                      </h4>
                      <p className="text-muted">Internship Success</p>
                      <small className="text-muted">
                        Confidence:{' '}
                        {Math.round((personalPredictions.internship?.confidence || 0) * 100)}%
                      </small>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-center p-3">
                      <TrendingUp
                        size={48}
                        color={getPredictionColor(personalPredictions.funding?.eligibility || 0)}
                      />
                      <h4
                        className="mt-3"
                        style={{
                          color: getPredictionColor(personalPredictions.funding?.eligibility || 0),
                        }}
                      >
                        {Math.round((personalPredictions.funding?.eligibility || 0) * 100)}%
                      </h4>
                      <p className="text-muted">Funding Eligibility</p>
                      <small className="text-muted">
                        Confidence:{' '}
                        {Math.round((personalPredictions.funding?.confidence || 0) * 100)}%
                      </small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Analytics Stats */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="py-4">
              <Users size={32} className="mb-3 text-primary" />
              <h3>{analyticsStats?.stats?.models_loaded || 0}</h3>
              <p className="text-muted mb-0">AI Models Loaded</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="py-4">
              <Zap size={32} className="mb-3 text-success" />
              <h3>{aiHealth?.success ? 'Active' : 'Offline'}</h3>
              <p className="text-muted mb-0">AI Service Status</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body className="py-4">
              <Brain size={32} className="mb-3 text-info" />
              <h3>v{analyticsStats?.stats?.api_version || '1.0'}</h3>
              <p className="text-muted mb-0">API Version</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Quick AI Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-3 flex-wrap">
                <Button variant="primary" onClick={() => (window.location.href = '/ai/analytics')}>
                  <TrendingUp className="me-2" size={16} />
                  View Analytics
                </Button>
                <Button
                  variant="success"
                  onClick={() => (window.location.href = '/ai/recommendations')}
                >
                  <Brain className="me-2" size={16} />
                  Get Recommendations
                </Button>
                <Button
                  variant="info"
                  onClick={() => (window.location.href = '/ai/business-insights')}
                >
                  <Target className="me-2" size={16} />
                  Business Insights
                </Button>
                <Button variant="outline-primary" onClick={loadAIDashboard}>
                  <Zap className="me-2" size={16} />
                  Refresh Data
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AIDashboard;
