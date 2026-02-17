import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      id: 1,
      title: 'Apply for Jobs',
      description: 'Browse and apply to available job positions',
      icon: 'bi-briefcase',
      color: 'primary',
      link: '/student/browse-jobs',
      count: 15
    },
    {
      id: 2,
      title: 'Register for Courses',
      description: 'Find and enroll in relevant courses',
      icon: 'bi-book',
      color: 'success',
      link: '/student/browse-courses',
      count: 8
    },
    {
      id: 3,
      title: 'Upload Documents',
      description: 'Update your resume, certificates, and portfolio',
      icon: 'bi-upload',
      color: 'info',
      link: '/student/documents/upload',
      count: 3
    },
    {
      id: 4,
      title: 'Check Applications',
      description: 'Review your application status',
      icon: 'bi-clipboard-check',
      color: 'warning',
      link: '/student/applications',
      count: 5
    },
    {
      id: 5,
      title: 'Update Profile',
      description: 'Keep your profile information current',
      icon: 'bi-person',
      color: 'secondary',
      link: '/student/profile',
      urgent: true
    },
    {
      id: 6,
      title: 'View Calendar',
      description: 'Check deadlines and scheduled interviews',
      icon: 'bi-calendar',
      color: 'danger',
      link: '/student/calendar',
      count: 2
    }
  ];

  const pendingTasks = [
    { id: 1, task: 'Complete JavaScript course assignment', due: 'Tomorrow' },
    { id: 2, task: 'Submit application for Tech Internship', due: 'In 2 days' },
    { id: 3, task: 'Update resume with new project', due: 'This week' },
    { id: 4, task: 'Schedule career counseling session', due: 'Next week' }
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Quick Actions Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          <h4 className="mb-3">🚀 Quick Access</h4>
          <Row>
            {actions.map((action) => (
              <Col md={4} key={action.id} className="mb-3">
                <Card className="shadow-sm h-100 border-0">
                  <Card.Body className="text-center">
                    <div className={`bg-${action.color}-subtle p-3 rounded-circle d-inline-flex mb-3`}>
                      <i className={`bi ${action.icon} text-${action.color}`} style={{fontSize: '2rem'}}></i>
                    </div>
                    <Card.Title>{action.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      {action.description}
                    </Card.Text>
                    <div className="mt-3">
                      <Link to={action.link}>
                        <Button variant={action.color} className="w-100">
                          {action.urgent ? 'Update Now' : 'Go There'}
                        </Button>
                      </Link>
                      {action.count && (
                        <Badge bg="light" text="dark" className="mt-2">
                          {action.count} available
                        </Badge>
                      )}
                      {action.urgent && (
                        <Badge bg="danger" className="mt-2">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>📝 Pending Tasks</Card.Title>
              <div className="list-group list-group-flush">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id={`task-${task.id}`} />
                        <label className="form-check-label" htmlFor={`task-${task.id}`}>
                          {task.task}
                        </label>
                      </div>
                      <small className="text-muted">Due: {task.due}</small>
                    </div>
                    <Badge bg="warning" text="dark">Pending</Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h6>Recent Activity</h6>
                <div className="timeline">
                  <div className="timeline-item">
                    <small className="text-muted">2 hours ago</small>
                    <p className="mb-1">Applied for Software Developer position</p>
                  </div>
                  <div className="timeline-item">
                    <small className="text-muted">Yesterday</small>
                    <p className="mb-1">Completed React course module</p>
                  </div>
                  <div className="timeline-item">
                    <small className="text-muted">3 days ago</small>
                    <p className="mb-1">Updated profile information</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📊 Quick Stats</Card.Title>
              <Row className="text-center">
                <Col md={4}>
                  <div className="p-3">
                    <h3 className="text-primary">15</h3>
                    <p className="text-muted mb-0">Jobs Viewed</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3">
                    <h3 className="text-success">8</h3>
                    <p className="text-muted mb-0">Applications</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3">
                    <h3 className="text-warning">92%</h3>
                    <p className="text-muted mb-0">Profile Score</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>⚡ Quick Tips</Card.Title>
              <div className="alert alert-info">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Tip:</strong> Complete your profile to get better job matches
              </div>
              <div className="alert alert-success">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Tip:</strong> Apply within 24 hours for new job postings
              </div>
              <div className="alert alert-warning">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Tip:</strong> Upload all required documents before applying
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <div className="text-center mt-4">
        <Button variant="primary" size="lg" className="me-3">
          <i className="bi bi-lightning-charge me-2"></i>
          Quick Apply to Top Matches
        </Button>
        <Button variant="outline-secondary" size="lg">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default QuickActions;