import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaUsersCog } from 'react-icons/fa';
import './TeamWorkspace.css';

const TeamWorkspace = () => {
  return (
    <Container fluid className="team-workspace-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaUsersCog className="text-primary me-3" size={32} />
        <div>
          <h2>Team Collaboration Workspace</h2>
          <p className="text-muted">Collaborate with your hiring team on candidates and jobs</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Team workspace collaboration coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeamWorkspace;
