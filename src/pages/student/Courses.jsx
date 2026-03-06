import React from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';

const Courses = () => {
  const allCourses = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      institution: 'Online Tech Academy',
      duration: '12 weeks',
      level: 'Beginner',
      price: '$299',
      rating: 4.8,
      enrolled: 1250,
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      institution: 'Coursera',
      duration: '8 weeks',
      level: 'Intermediate',
      price: '$199',
      rating: 4.5,
      enrolled: 890,
    },
    {
      id: 3,
      title: 'Mobile App Development',
      institution: 'Udemy',
      duration: '10 weeks',
      level: 'Intermediate',
      price: '$249',
      rating: 4.7,
      enrolled: 2100,
    },
    {
      id: 4,
      title: 'Digital Marketing',
      institution: 'Google Digital Garage',
      duration: '6 weeks',
      level: 'Beginner',
      price: 'Free',
      rating: 4.3,
      enrolled: 5000,
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Browse Courses</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Form>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search courses by title, institution, or skills..."
                  />
                  <Button variant="primary">
                    <i className="bi bi-search"></i> Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={4} className="text-end">
              <Form.Select className="d-inline-block w-auto me-2">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Rating</option>
                <option>Duration</option>
              </Form.Select>
              <Form.Select className="d-inline-block w-auto">
                <option>Filter by: All</option>
                <option>Free</option>
                <option>Beginner</option>
                <option>Certificate</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        {allCourses.map((course) => (
          <Col key={course.id} md={6} lg={3} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="position-relative">
                  <span className="badge bg-warning position-absolute top-0 end-0 m-2">
                    {course.level}
                  </span>
                </div>
                <Card.Title className="mb-2">{course.title}</Card.Title>
                <Card.Subtitle className="mb-3 text-muted">{course.institution}</Card.Subtitle>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-primary fw-bold">{course.price}</span>
                  <span className="text-muted">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {course.rating} ({course.enrolled})
                  </span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-3">
                  <span>
                    <i className="bi bi-clock me-1"></i>
                    {course.duration}
                  </span>
                  <span>Online</span>
                </div>
                <Button variant="outline-primary" className="w-100">
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-4">
        <Button variant="outline-primary" className="me-2">
          <i className="bi bi-arrow-left me-2"></i>
          Previous
        </Button>
        <Button variant="outline-primary" className="me-2">
          1
        </Button>
        <Button variant="outline-primary" className="me-2">
          2
        </Button>
        <Button variant="outline-primary" className="me-2">
          3
        </Button>
        <Button variant="outline-primary">
          Next
          <i className="bi bi-arrow-right ms-2"></i>
        </Button>
      </div>
    </Container>
  );
};

export default Courses;
