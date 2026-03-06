/* eslint-disable no-unused-vars */
import React from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';

const BusinessInsights = () => {
  return (
    <Container fluid className="py-3">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">?? Business Insights</h2>
          <p className="text-muted">AI-powered insights and recommendations</p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow-sm border-primary h-100">
            <Card.Body className="text-center p-4">
              <div className="display-1 mb-3">??</div>
              <h4>AI Analytics</h4>
              <p className="text-muted">Get intelligent insights about your business</p>
              <Button variant="primary" className="mt-2">
                Generate Report
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-success h-100">
            <Card.Body className="text-center p-4">
              <div className="display-1 mb-3">??</div>
              <h4>Smart Recommendations</h4>
              <p className="text-muted">Personalized suggestions based on your data</p>
              <Button variant="success" className="mt-2">
                View Recommendations
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>AI Features</h5>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg="primary" className="p-2">
                  Predictive Analytics
                </Badge>
                <Badge bg="success" className="p-2">
                  Trend Analysis
                </Badge>
                <Badge bg="info" className="p-2">
                  Risk Assessment
                </Badge>
                <Badge bg="warning" className="p-2">
                  Opportunity Detection
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BusinessInsights;
