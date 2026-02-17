import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

function StudentApplications() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  useAuth();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setData([
        { id: 1, name: 'Sample Item 1', status: 'Active', date: '2024-01-15' },
        { id: 2, name: 'Sample Item 2', status: 'Pending', date: '2024-01-16' },
        { id: 3, name: 'Sample Item 3', status: 'Completed', date: '2024-01-17' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading My Applications...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">My Applications</h1>
        <Button variant="primary">Add New</Button>
      </div>
      
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <Badge bg={item.status === 'Active' ? 'success' : item.status === 'Pending' ? 'warning' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2">View</Button>
                    <Button size="sm" variant="outline-secondary">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      <div className="mt-4">
        <Card>
          <Card.Body>
            <h5 className="card-title">Quick Stats</h5>
            <Row>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded">
                  <h3>{data.length}</h3>
                  <p className="mb-0">Total Items</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded">
                  <h3>{data.filter(d => d.status === 'Active').length}</h3>
                  <p className="mb-0">Active</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded">
                  <h3>{data.filter(d => d.status === 'Pending').length}</h3>
                  <p className="mb-0">Pending</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center p-3 bg-light rounded">
                  <h3>{data.filter(d => d.status === 'Completed').length}</h3>
                  <p className="mb-0">Completed</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default StudentApplications;
