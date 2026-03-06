import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';

const CompanyProfile = () => {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Organization Profile</h1>
          <p className="text-muted">Manage your funding organization&apos;s profile and settings</p>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Organization Information</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Organization Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter organization name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry Focus</Form.Label>
                  <Form.Control type="text" placeholder="e.g., Technology, Agriculture" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Organization description" />
            </Form.Group>
            <Button variant="primary">Save Changes</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CompanyProfile;
