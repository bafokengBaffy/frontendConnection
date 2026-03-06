import { Card, Col, Container, Row } from 'react-bootstrap';

const Analytics = () => {
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>Investment Analytics</h1>
          <p className="text-muted">Comprehensive analytics for your investment portfolio</p>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Portfolio Performance</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <h3 className="text-success">+15.2%</h3>
                <p className="text-muted">Overall ROI</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h6 className="mb-0">Investment Distribution</h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <h3>5 Sectors</h3>
                <p className="text-muted">Diversified Portfolio</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
