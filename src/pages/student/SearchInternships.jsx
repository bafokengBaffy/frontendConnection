/* eslint-disable no-undef */
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './SearchInternships.css';

const SearchInternships = () => {
  // Get current date in a JavaScript-friendly way
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Container className="SearchInternships-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Search Internships</h1>
              <p className="text-muted">
                {currentDate} | Student View
              </p>
            </div>
            <Button variant="primary">Refresh</Button>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title as="h5">Overview</Card.Title>
            </Card.Header>
            <Card.Body>
              <p>
                Welcome to the Search Internships page. This is where Student users can 
                access and manage their internships-related content.
              </p>
              <ul>
                <li>View detailed information</li>
                <li>Perform actions specific to your role</li>
                <li>Access relevant tools and features</li>
                <li>Monitor updates and notifications</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title as="h5">Quick Stats</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <h3>0</h3>
                <p className="text-muted">Active Items</p>
                <Button variant="outline-primary" size="sm" className="w-100">
                  View All
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <Card.Title as="h5">Recent Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <p className="small text-muted">No recent activity</p>
              <Button variant="outline-secondary" size="sm" className="w-100">
                View Activity Log
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SearchInternships;