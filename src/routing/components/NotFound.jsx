/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FiHome, FiSearch, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center p-5">
              <div className="mb-4">
                <FiAlertTriangle size={64} className="text-warning mb-3" />
                <h1 className="display-4 fw-bold">404</h1>
                <h2 className="h4 mb-3">Page Not Found</h2>
                <p className="text-muted mb-4">
                  The page you're looking for doesn't exist or has been moved.
                </p>
              </div>
              
              <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FiHome />
                  Go Home
                </Button>
                
                <Button 
                  as={Link} 
                  to="/search" 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-center gap-2"
                >
                  <FiSearch />
                  Search
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
              
              <div className="mt-5 pt-4 border-top">
                <p className="text-muted small mb-2">
                  If you believe this is an error, please contact support.
                </p>
                <Link to="/contact" className="small text-decoration-none">
                  Contact Support →
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;