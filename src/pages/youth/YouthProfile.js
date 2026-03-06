// pages/youth/YouthProfile.js
import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

const YouthProfile = () => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">Youth Profile</h1>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>Profile Information</h5>
              <p>Youth profile management coming soon...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default YouthProfile;
