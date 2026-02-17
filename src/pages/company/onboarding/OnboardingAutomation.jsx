import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaUserCheck } from 'react-icons/fa';
import './OnboardingAutomation.css';

const OnboardingAutomation = () => {
  return (
    <Container fluid className="onboarding-automation-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaUserCheck className="text-primary me-3" size={32} />
        <div>
          <h2>Onboarding Automation</h2>
          <p className="text-muted">Automate and streamline new hire onboarding</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Onboarding automation platform coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OnboardingAutomation;
