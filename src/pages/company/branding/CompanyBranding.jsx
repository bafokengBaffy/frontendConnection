/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Tab, Nav, Badge } from 'react-bootstrap';
import { FaCamera, FaPalette, FaFont, FaImage, FaVideo, FaBullhorn } from 'react-icons/fa';
import './CompanyBranding.css';

const CompanyBranding = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [brandColors, setBrandColors] = useState({
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#ffc107',
  });

  return (
    <Container fluid className="company-branding-container px-4 py-3">
      <div className="d-flex align-items-center mb-4">
        <FaPalette className="text-primary me-3" size={32} />
        <div>
          <h2>Employer Branding Studio</h2>
          <p className="text-muted">Build and showcase your company culture</p>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">Company Profile</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="media">Media Gallery</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="culture">Culture & Values</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="team">Team Showcase</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="branding">Brand Assets</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="social">Social Media</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="profile">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Company Profile</h5>
                  </Card.Header>
                  <Card.Body>
                    {/* Profile content would go here */}
                    <p>Company branding profile editor...</p>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              <Tab.Pane eventKey="media">
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Media Gallery</h5>
                  </Card.Header>
                  <Card.Body>
                    <p>Image and video gallery for company...</p>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CompanyBranding;
