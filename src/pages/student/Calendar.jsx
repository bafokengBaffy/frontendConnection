/* eslint-disable no-empty-pattern */
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal, Form } from 'react-bootstrap';

const Calendar = () => {
  const [showModal, setShowModal] = useState(false);
  const [] = useState(new Date());

  const events = [
    {
      id: 1,
      title: 'Job Interview - Tech Solutions',
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'interview',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Course Assignment Due',
      date: '2024-01-16',
      time: '11:59 PM',
      type: 'academic',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Mentor Session',
      date: '2024-01-18',
      time: '2:00 PM',
      type: 'mentorship',
      status: 'confirmed'
    },
    {
      id: 4,
      title: 'Application Deadline - Basotho Bank',
      date: '2024-01-20',
      time: '11:59 PM',
      type: 'deadline',
      status: 'urgent'
    },
    {
      id: 5,
      title: 'Career Workshop',
      date: '2024-01-22',
      time: '9:00 AM',
      type: 'workshop',
      status: 'registered'
    }
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const getEventBadge = (type) => {
    switch(type) {
      case 'interview': return <Badge bg="primary">Interview</Badge>;
      case 'academic': return <Badge bg="success">Academic</Badge>;
      case 'mentorship': return <Badge bg="info">Mentorship</Badge>;
      case 'deadline': return <Badge bg="danger">Deadline</Badge>;
      case 'workshop': return <Badge bg="warning" text="dark">Workshop</Badge>;
      default: return <Badge bg="secondary">Event</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'scheduled': return <Badge bg="info">Scheduled</Badge>;
      case 'pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'confirmed': return <Badge bg="success">Confirmed</Badge>;
      case 'urgent': return <Badge bg="danger">Urgent</Badge>;
      case 'registered': return <Badge bg="primary">Registered</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Calendar & Events</h2>
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  {currentMonth} {currentYear}
                </h4>
                <div>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    <i className="bi bi-chevron-left"></i>
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Today
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </div>
              
              <div className="calendar-grid mb-4">
                <Row className="text-center border-bottom mb-2 pb-2">
                  {daysOfWeek.map(day => (
                    <Col key={day} className="fw-bold">
                      {day}
                    </Col>
                  ))}
                </Row>
                
                <Row className="text-center">
                  {Array.from({ length: 35 }).map((_, index) => {
                    const day = index - 2 + 1; // Start from 1st
                    const isToday = day === currentDate.getDate();
                    const hasEvent = events.some(event => 
                      new Date(event.date).getDate() === day
                    );
                    
                    return (
                      <Col key={index} className="p-2 border">
                        <div className={`d-flex flex-column ${isToday ? 'bg-primary text-white rounded p-1' : ''}`}>
                          <div className={hasEvent ? 'fw-bold' : ''}>
                            {day > 0 && day <= 31 ? day : ''}
                          </div>
                          {hasEvent && (
                            <div className="mt-1">
                              <i className="bi bi-circle-fill text-primary" style={{fontSize: '8px'}}></i>
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
              
              <div className="text-center">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Event
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>📅 Upcoming Events</Card.Title>
              <ListGroup variant="flush">
                {events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map(event => (
                    <ListGroup.Item key={event.id}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{event.title}</h6>
                          <small className="text-muted">
                            {new Date(event.date).toLocaleDateString()} • {event.time}
                          </small>
                        </div>
                        {getEventBadge(event.type)}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        {getStatusBadge(event.status)}
                        <Button variant="outline-primary" size="sm">
                          View
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📊 This Month Overview</Card.Title>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Interviews</span>
                  <span className="fw-bold">2</span>
                </div>
                <div className="progress" style={{height: '6px'}}>
                  <div className="progress-bar bg-primary" style={{width: '40%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Deadlines</span>
                  <span className="fw-bold">3</span>
                </div>
                <div className="progress" style={{height: '6px'}}>
                  <div className="progress-bar bg-danger" style={{width: '60%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Workshops</span>
                  <span className="fw-bold">1</span>
                </div>
                <div className="progress" style={{height: '6px'}}>
                  <div className="progress-bar bg-warning" style={{width: '20%'}}></div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Quick Actions:</h6>
                <Button variant="outline-success" size="sm" className="w-100 mb-2">
                  <i className="bi bi-download me-2"></i>
                  Export Calendar
                </Button>
                <Button variant="outline-info" size="sm" className="w-100">
                  <i className="bi bi-share me-2"></i>
                  Share Schedule
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Add Event Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control type="text" placeholder="Enter event title" />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Select>
                <option value="interview">Interview</option>
                <option value="deadline">Deadline</option>
                <option value="academic">Academic</option>
                <option value="workshop">Workshop</option>
                <option value="mentorship">Mentorship</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Save Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Calendar;