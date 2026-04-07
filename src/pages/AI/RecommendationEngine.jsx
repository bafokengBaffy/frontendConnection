import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  ProgressBar,
  ListGroup,
} from 'react-bootstrap';
import {
  Brain,
  Target,
  TrendingUp,
  Award,
  Users,
  Lightbulb,
  Star,
  AlertTriangle,
} from 'lucide-react';

import {
  predictStudentInternship,
  predictStudentCompanyMatch,
  predictFundingEligibility,
  getAIAnalyticsStats,
} from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const RecommendationEngine = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [userProfile]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics data
      const stats = await getAIAnalyticsStats();
      setAnalyticsData(stats);

      // Generate personalized recommendations based on user type
      if (userProfile) {
        await generatePersonalizedRecommendations();
      } else {
        // Generate general recommendations
        setRecommendations({
          career: [
            {
              id: 1,
              title: 'Complete Your Profile',
              description:
                'Add your skills, GPA, and experience to get personalized AI recommendations',
              priority: 'high',
              type: 'action',
              impact: 0.9,
            },
            {
              id: 2,
              title: 'Explore Internship Opportunities',
              description:
                'Based on current market trends, internships in tech and business are highly recommended',
              priority: 'medium',
              type: 'insight',
              impact: 0.7,
            },
          ],
          business: [
            {
              id: 3,
              title: 'Digital Skills Training',
              description:
                'Invest in digital skills training to improve employability in the modern economy',
              priority: 'high',
              type: 'opportunity',
              impact: 0.8,
            },
          ],
          funding: [
            {
              id: 4,
              title: 'Scholarship Opportunities',
              description:
                'Multiple scholarships available for students with strong academic performance',
              priority: 'medium',
              type: 'funding',
              impact: 0.6,
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedRecommendations = async () => {
    try {
      if (!userProfile) return;

      const recommendations = {
        career: [],
        business: [],
        funding: [],
      };

      // Career recommendations based on user profile
      if (userProfile.userType === 'student') {
        const studentData = {
          gpa: userProfile.gpa || 3.0,
          skills: userProfile.skills || [],
          experienceMonths: userProfile.experienceMonths || 0,
          fieldOfStudy: userProfile.fieldOfStudy || 'General',
        };

        // Get internship prediction
        const internshipPrediction = await predictStudentInternship(studentData);

        if (internshipPrediction.prediction > 0.7) {
          recommendations.career.push({
            id: 1,
            title: 'High Internship Success Potential',
            description: `Your profile shows ${Math.round(internshipPrediction.prediction * 100)}% success rate for internships. Focus on applying to top companies in your field.`,
            priority: 'high',
            type: 'opportunity',
            impact: internshipPrediction.prediction,
          });
        }

        // Skills-based recommendations
        if (studentData.skills.length < 3) {
          recommendations.career.push({
            id: 2,
            title: 'Expand Your Skill Set',
            description:
              'Consider adding more technical skills to improve your marketability. Popular skills include Python, JavaScript, and data analysis.',
            priority: 'medium',
            type: 'action',
            impact: 0.6,
          });
        }

        // Experience recommendations
        if (studentData.experienceMonths < 6) {
          recommendations.career.push({
            id: 3,
            title: 'Gain Practical Experience',
            description:
              'Look for part-time roles, volunteer work, or projects to build your experience portfolio.',
            priority: 'high',
            type: 'action',
            impact: 0.8,
          });
        }
      }

      // Business recommendations for entrepreneurs
      if (userProfile.userType === 'entrepreneur') {
        const fundingPrediction = await predictFundingEligibility({
          businessType: userProfile.businessType || 'General',
          experienceYears: userProfile.experienceYears || 0,
          fundingNeeded: userProfile.fundingNeeded || 0,
        });

        if (fundingPrediction.eligibility > 0.6) {
          recommendations.business.push({
            id: 4,
            title: 'Strong Funding Potential',
            description: `Your business idea has a ${Math.round(fundingPrediction.eligibility * 100)}% chance of securing funding. Prepare a solid business plan.`,
            priority: 'high',
            type: 'funding',
            impact: fundingPrediction.eligibility,
          });
        }

        recommendations.business.push({
          id: 5,
          title: 'Market Research Opportunity',
          description:
            'Conduct thorough market research to validate your business idea and identify target customers.',
          priority: 'medium',
          type: 'action',
          impact: 0.7,
        });
      }

      // Funding recommendations
      if (userProfile.gpa && userProfile.gpa >= 3.5) {
        recommendations.funding.push({
          id: 6,
          title: 'Academic Excellence Scholarships',
          description:
            'Your high GPA qualifies you for merit-based scholarships. Apply to academic excellence programs.',
          priority: 'high',
          type: 'funding',
          impact: 0.9,
        });
      }

      setRecommendations(recommendations);
    } catch (err) {
      console.error('Error generating personalized recommendations:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'opportunity':
        return <Target size={16} />;
      case 'action':
        return <Lightbulb size={16} />;
      case 'funding':
        return <Award size={16} />;
      case 'insight':
        return <TrendingUp size={16} />;
      default:
        return <Brain size={16} />;
    }
  };

  const renderRecommendationsSection = (title, items, icon) => (
    <Col md={4} className="mb-4">
      <Card className="shadow-sm h-100">
        <Card.Header className="d-flex align-items-center">
          {icon}
          <h5 className="mb-0 ms-2">{title}</h5>
        </Card.Header>
        <Card.Body>
          {items && items.length > 0 ? (
            <ListGroup variant="flush">
              {items.map((rec) => (
                <ListGroup.Item key={rec.id} className="px-0">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      {getTypeIcon(rec.type)}
                      <strong className="ms-2 small">{rec.title}</strong>
                    </div>
                    <Badge bg={getPriorityColor(rec.priority)} className="ms-2">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="small text-muted mb-2">{rec.description}</p>
                  <div className="d-flex align-items-center">
                    <small className="text-muted me-2">Impact:</small>
                    <ProgressBar
                      now={rec.impact * 100}
                      style={{ flex: 1, height: '4px' }}
                      variant={
                        rec.impact > 0.7 ? 'success' : rec.impact > 0.5 ? 'warning' : 'danger'
                      }
                    />
                    <small className="ms-2">{Math.round(rec.impact * 100)}%</small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center text-muted py-4">
              <Brain size={48} className="mb-3 opacity-50" />
              <p>No recommendations available</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 text-muted">Generating AI recommendations...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Recommendation Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadRecommendations}>
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
              <h1 className="h2 mb-0">AI Recommendation Engine</h1>
              <p className="text-muted mb-0">Personalized insights powered by machine learning</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* AI Stats Overview */}
      {analyticsData?.stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body className="py-3">
                <Star size={24} className="mb-2 text-warning" />
                <h4 className="mb-1">{analyticsData.stats.models_loaded || 0}</h4>
                <small className="text-muted">AI Models Active</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body className="py-3">
                <Users size={24} className="mb-2 text-primary" />
                <h4 className="mb-1">{analyticsData.stats.successful_predictions || 0}</h4>
                <small className="text-muted">Predictions Made</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body className="py-3">
                <TrendingUp size={24} className="mb-2 text-success" />
                <h4 className="mb-1">{Math.round((analyticsData.stats.accuracy || 0) * 100)}%</h4>
                <small className="text-muted">Accuracy Rate</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body className="py-3">
                <Award size={24} className="mb-2 text-info" />
                <h4 className="mb-1">
                  {recommendations ? Object.values(recommendations).flat().length : 0}
                </h4>
                <small className="text-muted">Recommendations</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recommendations Sections */}
      <Row>
        {renderRecommendationsSection(
          'Career Recommendations',
          recommendations?.career,
          <Target className="text-primary" size={20} />
        )}
        {renderRecommendationsSection(
          'Business Insights',
          recommendations?.business,
          <TrendingUp className="text-success" size={20} />
        )}
        {renderRecommendationsSection(
          'Funding Opportunities',
          recommendations?.funding,
          <Award className="text-warning" size={20} />
        )}
      </Row>

      {/* Action Buttons */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Button variant="primary" onClick={loadRecommendations}>
                  <Brain className="me-2" size={16} />
                  Refresh Recommendations
                </Button>
                <Button variant="outline-success">
                  <Star className="me-2" size={16} />
                  Export Insights
                </Button>
                <Button variant="outline-info">
                  <TrendingUp className="me-2" size={16} />
                  View Analytics
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecommendationEngine;
