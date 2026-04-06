import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="py-3">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Entrepreneur Dashboard</h2>
          <p className="text-muted">Manage Entrepreneur Dashboard.ToLower()</p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Entrepreneur Dashboard Details</h5>
            </Card.Header>
            <Card.Body>
              <p>This page is under development.</p>
              <Button variant="primary" onClick={() => navigate('/entrepreneur/dashboard')}>
                Back to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EntrepreneurDashboard;
