import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaStore } from 'react-icons/fa';
import './Marketplace.css';

const Marketplace = () => {
  return (
    <Container fluid className="marketplace-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaStore className="text-primary me-3" size={32} />
        <div>
          <h2>Hiring Marketplace</h2>
          <p className="text-muted">Access hiring services and tools from partners</p>
        </div>
      </div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p>Marketplace integration coming soon...</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Marketplace;
