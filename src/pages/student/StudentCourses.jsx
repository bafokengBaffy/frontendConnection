import React from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';

const StudentCourses = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: 'Advanced JavaScript',
      institution: 'Online Tech Academy',
      progress: 85,
      nextDeadline: '2024-01-20',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      institution: 'Coursera',
      progress: 100,
      completionDate: '2024-01-10',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Project Management',
      institution: 'Lesotho College of Education',
      progress: 30,
      nextDeadline: '2024-01-25',
      status: 'in-progress'
    }
  ];

  const recommendedCourses = [
    {
      id: 1,
      title: 'React Native Development',
      institution: 'Udemy',
      duration: '8 weeks',
      level: 'Intermediate',
      match: 92
    },
    {
      id: 2,
      title: 'Cloud Computing Basics',
      institution: 'AWS Academy',
      duration: '6 weeks',
      level: 'Beginner',
      match: 85
    },
    {
      id: 3,
      title: 'UI/UX Design Principles',
      institution: 'Coursera',
      duration: '5 weeks',
      level: 'Beginner',
      match: 78
    }
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Courses</h2>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Enrolled Courses</Card.Title>
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="mb-3 border">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <h5 className="mb-1">{course.title}</h5>
                        <p className="text-muted mb-2">{course.institution}</p>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <ProgressBar now={course.progress} variant={course.progress === 100 ? "success" : "primary"} />
                        </div>
                        {course.status === 'completed' ? (
                          <Badge bg="success" className="me-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Completed on {new Date(course.completionDate).toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge bg="warning" text="dark">
                            <i className="bi bi-clock me-1"></i>
                            Next deadline: {new Date(course.nextDeadline).toLocaleDateString()}
                          </Badge>
                        )}
                      </Col>
                      <Col md={4} className="text-end">
                        <Button variant={course.status === 'completed' ? "outline-success" : "primary"} className="mb-2">
                          {course.status === 'completed' ? 'View Certificate' : 'Continue Learning'}
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Recommended Courses</Card.Title>
              {recommendedCourses.map((course) => (
                <div key={course.id} className="mb-3 pb-3 border-bottom">
                  <h6 className="mb-1">{course.title}</h6>
                  <p className="text-muted small mb-2">{course.institution}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Badge bg="info" className="me-2">{course.level}</Badge>
                      <Badge bg="light" text="dark">{course.duration}</Badge>
                    </div>
                    <div>
                      <Badge bg="success" className="me-2">{course.match}%</Badge>
                      <Button variant="outline-primary" size="sm">
                        Enroll
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline-primary" className="w-100">
                Browse All Courses
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Learning Statistics</Card.Title>
          <Row>
            <Col md={3} className="text-center">
              <div className="p-3">
                <h3 className="text-primary">8</h3>
                <p className="text-muted mb-0">Courses Completed</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="p-3">
                <h3 className="text-success">42</h3>
                <p className="text-muted mb-0">Learning Hours</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="p-3">
                <h3 className="text-warning">3</h3>
                <p className="text-muted mb-0">Active Courses</p>
              </div>
            </Col>
            <Col md={3} className="text-center">
              <div className="p-3">
                <h3 className="text-info">92%</h3>
                <p className="text-muted mb-0">Average Score</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="text-center mt-4">
        <Button variant="primary" size="lg" className="me-3">
          <i className="bi bi-search me-2"></i>
          Find New Courses
        </Button>
        <Button variant="outline-secondary" size="lg">
          <i className="bi bi-download me-2"></i>
          Download Certificates
        </Button>
      </div>
    </Container>
  );
};

export default StudentCourses;  