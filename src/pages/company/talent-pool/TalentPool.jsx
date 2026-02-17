import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaUserFriends } from 'react-icons/fa';
import './TalentPool.css';

const TalentPool = () => {
  return (
    <Container fluid className="talent-pool-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaUserFriends className="text-primary me-3" size={32} />
        <div>
          <h2>Talent Pool Management</h2>
          <p className="text-muted">Build and manage your private talent community</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Talent pool management system coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TalentPool;
