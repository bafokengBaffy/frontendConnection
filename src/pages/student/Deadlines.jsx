import React from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';

const Deadlines = () => {
  const deadlines = [
    {
      id: 1,
      title: 'Software Engineer Application',
      institution: 'Tech Solutions Lesotho',
      type: 'job',
      deadline: '2024-01-15',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Computer Science Admission',
      institution: 'National University of Lesotho',
      type: 'course',
      deadline: '2024-01-20',
      priority: 'high',
      status: 'draft'
    },
    {
      id: 3,
      title: 'Data Analyst Internship',
      institution: 'Basotho Bank',
      type: 'internship',
      deadline: '2024-01-25',
      priority: 'medium',
      status: 'applied'
    },
    {
      id: 4,
      title: 'Business Management Certificate',
      institution: 'Lesotho College of Education',
      type: 'course',
      deadline: '2024-02-01',
      priority: 'medium',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Marketing Coordinator',
      institution: 'Maseru City Council',
      type: 'job',
      deadline: '2024-02-10',
      priority: 'low',
      status: 'not_started'
    }
  ];

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <Badge bg="danger">High</Badge>;
      case 'medium': return <Badge bg="warning" text="dark">Medium</Badge>;
      case 'low': return <Badge bg="secondary">Low</Badge>;
      default: return <Badge bg="secondary">Low</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'applied': return <Badge bg="success">Applied</Badge>;
      case 'pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'draft': return <Badge bg="info">Draft</Badge>;
      case 'not_started': return <Badge bg="secondary">Not Started</Badge>;
      default: return <Badge bg="secondary">Not Started</Badge>;
    }
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Deadlines & Important Dates</h2>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Upcoming Deadlines</h5>
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-plus-circle me-1"></i>
              Add Deadline
            </Button>
          </div>
          
          <Table hover responsive>
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Institution/Company</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Days Left</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((item) => {
                const daysLeft = getDaysRemaining(item.deadline);
                return (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.institution}</td>
                    <td>
                      <Badge bg={item.type === 'job' ? 'primary' : 'success'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td>{new Date(item.deadline).toLocaleDateString()}</td>
                    <td>
                      <span className={daysLeft <= 3 ? 'text-danger fw-bold' : daysLeft <= 7 ? 'text-warning' : ''}>
                        {daysLeft} days
                      </span>
                    </td>
                    <td>{getPriorityBadge(item.priority)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <Button variant="outline-primary" size="sm">
                        {item.status === 'not_started' ? 'Start' : 'View'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <div className="row">
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Urgent Deadlines (≤ 3 days)</h5>
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>2 urgent deadlines</strong> require immediate attention
              </div>
              <ul className="list-group">
                {deadlines
                  .filter(item => getDaysRemaining(item.deadline) <= 3)
                  .map(item => (
                    <li key={item.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.title}</strong>
                          <br />
                          <small className="text-muted">{item.institution}</small>
                        </div>
                        <Badge bg="danger">
                          {getDaysRemaining(item.deadline)} days
                        </Badge>
                      </div>
                    </li>
                  ))}
              </ul>
            </Card.Body>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Completion Progress</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Applications</span>
                  <span>60%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-success" style={{width: '60%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Course Registrations</span>
                  <span>80%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-info" style={{width: '80%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Document Uploads</span>
                  <span>40%</span>
                </div>
                <div className="progress" style={{height: '8px'}}>
                  <div className="progress-bar bg-warning" style={{width: '40%'}}></div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Button variant="primary">
                  <i className="bi bi-calendar-check me-2"></i>
                  View Calendar
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default Deadlines;
