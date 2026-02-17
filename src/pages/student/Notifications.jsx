import React from 'react';
import { Container, Card, ListGroup, Badge, Button, Tabs, Tab } from 'react-bootstrap';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: 'Application Status Update',
      message: 'Your application for Software Developer at Tech Solutions has moved to interview stage',
      time: '2 hours ago',
      type: 'application',
      read: false
    },
    {
      id: 2,
      title: 'Course Deadline Reminder',
      message: 'Assignment for Advanced JavaScript course is due in 2 days',
      time: '5 hours ago',
      type: 'academic',
      read: false
    },
    {
      id: 3,
      title: 'New Job Recommendation',
      message: 'Based on your profile, we found a perfect match: Data Analyst at Basotho Bank',
      time: '1 day ago',
      type: 'recommendation',
      read: true
    },
    {
      id: 4,
      title: 'Mentor Session Confirmed',
      message: 'Your session with Dr. Thabo Molefi is confirmed for January 18, 2:00 PM',
      time: '2 days ago',
      type: 'mentorship',
      read: true
    },
    {
      id: 5,
      title: 'Document Verification',
      message: 'Your resume has been verified and is now visible to employers',
      time: '3 days ago',
      type: 'system',
      read: true
    },
    {
      id: 6,
      title: 'Welcome to CareerConnect!',
      message: 'Complete your profile to get better job and course recommendations',
      time: '1 week ago',
      type: 'system',
      read: true
    }
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'application': return 'bi-briefcase text-primary';
      case 'academic': return 'bi-book text-success';
      case 'recommendation': return 'bi-star text-warning';
      case 'mentorship': return 'bi-people text-info';
      case 'system': return 'bi-gear text-secondary';
      default: return 'bi-bell text-muted';
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'application': return <Badge bg="primary">Application</Badge>;
      case 'academic': return <Badge bg="success">Academic</Badge>;
      case 'recommendation': return <Badge bg="warning" text="dark">Recommendation</Badge>;
      case 'mentorship': return <Badge bg="info">Mentorship</Badge>;
      case 'system': return <Badge bg="secondary">System</Badge>;
      default: return <Badge bg="secondary">Notification</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Notifications</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-0">All Notifications</h4>
              <p className="text-muted mb-0">
                {unreadCount} unread of {notifications.length} total
              </p>
            </div>
            <div>
              <Button variant="outline-primary" className="me-2">
                <i className="bi bi-check-all me-1"></i>
                Mark All as Read
              </Button>
              <Button variant="outline-danger">
                <i className="bi bi-trash me-1"></i>
                Clear All
              </Button>
            </div>
          </div>
          
          <Tabs defaultActiveKey="all" className="mb-4">
            <Tab eventKey="all" title="All">
              <ListGroup variant="flush">
                {notifications.map((notification) => (
                  <ListGroup.Item 
                    key={notification.id} 
                    className={`py-3 ${!notification.read ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <i className={`bi ${getNotificationIcon(notification.type)}`} style={{fontSize: '1.5rem'}}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">
                            {notification.title}
                            {!notification.read && (
                              <Badge bg="danger" className="ms-2">New</Badge>
                            )}
                          </h6>
                          <small className="text-muted">{notification.time}</small>
                        </div>
                        <p className="mb-2">{notification.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {getTypeBadge(notification.type)}
                          </div>
                          <div>
                            {!notification.read && (
                              <Button variant="outline-success" size="sm" className="me-2">
                                Mark as Read
                              </Button>
                            )}
                            <Button variant="outline-primary" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Tab>
            
            <Tab eventKey="unread" title="Unread">
              <ListGroup variant="flush">
                {notifications
                  .filter(n => !n.read)
                  .map((notification) => (
                    <ListGroup.Item key={notification.id} className="py-3 bg-light">
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          <i className={`bi ${getNotificationIcon(notification.type)}`} style={{fontSize: '1.5rem'}}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-2">{notification.message}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              {getTypeBadge(notification.type)}
                            </div>
                            <small className="text-muted">{notification.time}</small>
                          </div>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      <div className="row">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>🔔 Notification Settings</Card.Title>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                <label className="form-check-label" htmlFor="emailNotifications">
                  Email Notifications
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="pushNotifications" defaultChecked />
                <label className="form-check-label" htmlFor="pushNotifications">
                  Push Notifications
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="applicationUpdates" defaultChecked />
                <label className="form-check-label" htmlFor="applicationUpdates">
                  Application Updates
                </label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="courseReminders" defaultChecked />
                <label className="form-check-label" htmlFor="courseReminders">
                  Course Reminders
                </label>
              </div>
              <Button variant="primary" className="w-100">
                Save Settings
              </Button>
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>📊 Notification Stats</Card.Title>
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="p-3">
                    <h3 className="text-primary">{unreadCount}</h3>
                    <p className="text-muted mb-0">Unread</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <h3 className="text-success">{notifications.filter(n => n.type === 'application').length}</h3>
                    <p className="text-muted mb-0">Application</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3">
                    <h3 className="text-warning">{notifications.filter(n => n.type === 'academic').length}</h3>
                    <p className="text-muted mb-0">Academic</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Quick Actions</h6>
                <Button variant="outline-primary" className="w-100 mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  Email Digest Settings
                </Button>
                <Button variant="outline-success" className="w-100 mb-2">
                  <i className="bi bi-download me-2"></i>
                  Export Notifications
                </Button>
                <Button variant="outline-info" className="w-100">
                  <i className="bi bi-question-circle me-2"></i>
                  Help & Support
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Notifications;