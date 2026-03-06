import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaChartLine, FaLightbulb, FaUsers, FaRobot } from 'react-icons/fa';

const AIDashboard = ({ data = {}, loading = false }) => {
  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'AI Predictions',
      value: data.predictions || 0,
      icon: <FaRobot />,
      color: 'primary',
      change: data.predictionChange || '+0%',
    },
    {
      title: 'Market Insights',
      value: data.insights || 0,
      icon: <FaChartLine />,
      color: 'success',
      change: data.insightChange || '+0%',
    },
    {
      title: 'Smart Recommendations',
      value: data.recommendations || 0,
      icon: <FaLightbulb />,
      color: 'warning',
      change: data.recommendationChange || '+0%',
    },
    {
      title: 'Active Users',
      value: data.activeUsers || 0,
      icon: <FaUsers />,
      color: 'info',
      change: data.userChange || '+0%',
    },
  ];

  return (
    <div className="ai-dashboard">
      <h2 className="mb-4">AI-Powered Analytics Dashboard</h2>

      <Row className="g-4 mb-4">
        {metrics.map((metric, index) => (
          <Col key={index} md={3}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className={`d-flex align-items-center mb-3 text-${metric.color}`}>
                  <div className={`bg-${metric.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                    {metric.icon}
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">{metric.title}</h6>
                    <h3 className="mb-0">{metric.value}</h3>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <span
                    className={`badge bg-${metric.color} bg-opacity-10 text-${metric.color} me-2`}
                  >
                    {metric.change}
                  </span>
                  <small className="text-muted">vs last month</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">AI Performance Trends</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center text-muted py-5">Chart component would render here</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">AI Model Health</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Prediction Accuracy</span>
                  <span>95%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Model Confidence</span>
                  <span>88%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-info" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Data Coverage</span>
                  <span>92%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Training Frequency</span>
                  <span>78%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '78%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent AI Predictions</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">Market growth predicted: +15%</li>
                <li className="mb-2">User engagement forecast: High</li>
                <li className="mb-2">Business success rate: 87%</li>
                <li className="mb-2">Funding likelihood: Strong</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">AI Recommendations</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">Focus on youth engagement</li>
                <li className="mb-2">Expand mentor network</li>
                <li className="mb-2">Optimize funding applications</li>
                <li className="mb-2">Enhance business planning tools</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIDashboard;
