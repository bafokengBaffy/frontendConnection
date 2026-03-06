import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';

const Communications = () => {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Communications</h1>
          <p className="text-muted">Manage communications with startups and partners</p>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Recent Messages</h6>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>TechFarm Solutions - Funding Update</ListGroup.Item>
              <ListGroup.Item>Mentor Network - Monthly Meeting</ListGroup.Item>
              <ListGroup.Item>Investor Partner - Collaboration Opportunity</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Communications;
