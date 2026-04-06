import { Container, Card } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';
import './DiversityAnalytics.css';

const DiversityAnalytics = () => {
  return (
    <Container fluid className="diversity-analytics-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaUsers className="text-primary me-3" size={32} />
        <div>
          <h2>Diversity & Inclusion Analytics</h2>
          <p className="text-muted">Track and improve diversity in your hiring process</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Diversity analytics dashboard coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DiversityAnalytics;
