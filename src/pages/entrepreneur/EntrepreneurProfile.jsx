// pages/entrepreneur/EntrepreneurProfile.js
import { Container, Card, Row, Col } from 'react-bootstrap';

const EntrepreneurProfile = () => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">Entrepreneur Profile</h1>
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <h5>Profile Information</h5>
              <p>Entrepreneur profile management coming soon...</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EntrepreneurProfile;
