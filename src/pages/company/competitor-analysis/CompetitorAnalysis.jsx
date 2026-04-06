import { Container, Card } from 'react-bootstrap';
import { FaChartLine } from 'react-icons/fa';
import './CompetitorAnalysis.css';

const CompetitorAnalysis = () => {
  return (
    <Container fluid className="competitor-analysis-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaChartLine className="text-primary me-3" size={32} />
        <div>
          <h2>Competitor Intelligence</h2>
          <p className="text-muted">Monitor competitor hiring and market positioning</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Competitor analysis dashboard coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CompetitorAnalysis;
