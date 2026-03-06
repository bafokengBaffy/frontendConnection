import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const InstituteFaculties = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="py-3">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Manage Faculties</h2>
          <p className="text-muted">Manage Manage Faculties.ToLower()</p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Manage Faculties Details</h5>
            </Card.Header>
            <Card.Body>
              <p>This page is under development.</p>
              <Button variant="primary" onClick={() => navigate('/institute/dashboard')}>
                Back to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InstituteFaculties;
