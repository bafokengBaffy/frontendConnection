import React, { useState } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { FaLightbulb, FaHandshake, FaChartLine, FaUsers } from 'react-icons/fa';
import './YouthDashboard.css';

const YouthDashboard = () => {
  const [youthStats] = useState({
    businessIdeas: 0,
    mentors: 0,
    fundingApplied: 0,
    network: 0,
  });

  return (
    <Container className="youth-dashboard">
      <h1 className="mb-4">Youth Entrepreneur Dashboard</h1>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaLightbulb className="icon" />
              <h3>{youthStats.businessIdeas}</h3>
              <p>Business Ideas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaHandshake className="icon" />
              <h3>{youthStats.mentors}</h3>
              <p>Mentors</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaChartLine className="icon" />
              <h3>{youthStats.fundingApplied}</h3>
              <p>Funding Applied</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <FaUsers className="icon" />
              <h3>{youthStats.network}</h3>
              <p>Network</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>Business Progress</h5>
              <div className="mb-3">
                <p>Business Plan Completion</p>
                <ProgressBar now={60} label="60%" />
              </div>
              <div className="mb-3">
                <p>Market Research</p>
                <ProgressBar now={40} label="40%" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YouthDashboard;
