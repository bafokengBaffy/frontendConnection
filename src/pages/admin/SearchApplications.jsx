import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './SearchApplications.css';

const SearchApplications = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Container className="SearchApplications-page mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Search Applications</h1>
              <p className="text-muted">{currentDate} | Admin View</p>
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
                Welcome to the Search Applications page. This is where Admin users can access and
                manage internship applications.
              </p>
              <ul>
                <li>View detailed application information</li>
                <li>Review and process internship applications</li>
                <li>Track application status and progress</li>
                <li>Manage application workflows</li>
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
                <p className="text-muted">Pending Applications</p>
                <Button variant="outline-primary" size="sm" className="w-100">
                  View All Applications
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

export default SearchApplications;
