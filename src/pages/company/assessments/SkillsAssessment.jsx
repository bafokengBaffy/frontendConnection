import { Container, Card } from 'react-bootstrap';
import { FaClipboardCheck } from 'react-icons/fa';
import './SkillsAssessment.css';

const SkillsAssessment = () => {
  return (
    <Container fluid className="skills-assessment-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaClipboardCheck className="text-primary me-3" size={32} />
        <div>
          <h2>Skills Assessment Center</h2>
          <p className="text-muted">Create and manage skill assessments for candidates</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Skills assessment platform coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SkillsAssessment;
