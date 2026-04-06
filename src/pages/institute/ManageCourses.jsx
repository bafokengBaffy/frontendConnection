import { useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';

function ManageCourses() {
  const [loading] = useState(false);

  return (
    <Container className="mt-4">
      <h1 className="h2 mb-4">Manage Courses</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Course Management System</Card.Title>
          <Card.Text>
            This page allows institute administrators to manage courses, including:
          </Card.Text>
          <ul>
            <li>Creating new courses</li>
            <li>Updating existing courses</li>
            <li>Managing course content and materials</li>
            <li>Setting course schedules and fees</li>
            <li>Tracking student enrollment</li>
          </ul>

          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <div className="d-flex gap-2">
              <Button variant="primary">Add New Course</Button>
              <Button variant="outline-secondary">View All Courses</Button>
              <Button variant="outline-info">Export Course List</Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Quick Stats</Card.Title>
          <div className="row text-center">
            <div className="col-md-3">
              <h3>12</h3>
              <p className="text-muted mb-0">Active Courses</p>
            </div>
            <div className="col-md-3">
              <h3>156</h3>
              <p className="text-muted mb-0">Enrolled Students</p>
            </div>
            <div className="col-md-3">
              <h3>8</h3>
              <p className="text-muted mb-0">Instructors</p>
            </div>
            <div className="col-md-3">
              <h3>4</h3>
              <p className="text-muted mb-0">New This Month</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ManageCourses;
