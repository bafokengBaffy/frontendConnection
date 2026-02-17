import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import './ReferralProgram.css';

const ReferralProgram = () => {
  return (
    <Container fluid className="referral-program-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaUserPlus className="text-primary me-3" size={32} />
        <div>
          <h2>Referral Program Management</h2>
          <p className="text-muted">Manage employee referral programs and incentives</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Referral program management coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReferralProgram;
