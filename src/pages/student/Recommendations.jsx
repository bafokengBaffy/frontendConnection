import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';

const Recommendations = () => {
  const jobRecommendations = [
    {
      id: 1,
      title: 'Junior Software Developer',
      company: 'Tech Solutions Lesotho',
      match: 95,
      skills: ['JavaScript', 'React', 'Node.js'],
      location: 'Maseru',
      type: 'full-time',
      salary: 'M8,000 - M12,000',
    },
    {
      id: 2,
      title: 'Data Analyst Intern',
      company: 'Basotho Bank',
      match: 88,
      skills: ['Excel', 'SQL', 'Data Visualization'],
      location: 'Maseru',
      type: 'internship',
      salary: 'M5,000 - M7,000',
    },
    {
      id: 3,
      title: 'IT Support Specialist',
      company: 'Lesotho Telecommunications',
      match: 82,
      skills: ['Networking', 'Hardware', 'Troubleshooting'],
      location: 'Maseru',
      type: 'full-time',
      salary: 'M7,000 - M10,000',
    },
  ];

  const courseRecommendations = [
    {
      id: 1,
      title: 'Advanced JavaScript',
      institution: 'Online Tech Academy',
      duration: '6 weeks',
      level: 'Intermediate',
      match: 90,
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      institution: 'Coursera',
      duration: '8 weeks',
      level: 'Beginner',
      match: 85,
    },
    {
      id: 3,
      title: 'Project Management',
      institution: 'Lesotho College of Education',
      duration: '12 weeks',
      level: 'Intermediate',
      match: 78,
    },
  ];

  const skillRecommendations = [
    {
      skill: 'React Native',
      importance: 'High',
      reason: 'Required for 60% of mobile developer roles',
      resources: 5,
    },
    {
      skill: 'Python',
      importance: 'Medium',
      reason: 'Growing demand in data and automation roles',
      resources: 8,
    },
    {
      skill: 'Cloud Computing',
      importance: 'High',
      reason: 'Essential for modern IT infrastructure roles',
      resources: 6,
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Personalized Recommendations</h2>

      <div className="mb-4">
        <h4 className="mb-3">📊 Based on Your Profile & Activity</h4>
        <Card className="shadow-sm">
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center p-3">
                  <h3 className="text-primary">95%</h3>
                  <p className="text-muted mb-0">Profile Match Score</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3">
                  <h3 className="text-success">8</h3>
                  <p className="text-muted mb-0">Skills Matched</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3">
                  <h3 className="text-warning">15</h3>
                  <p className="text-muted mb-0">Opportunities Found</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>🎯 Top Job Recommendations</span>
                <Badge bg="primary">{jobRecommendations.length} jobs</Badge>
              </Card.Title>

              {jobRecommendations.map((job) => (
                <Card key={job.id} className="mb-3 border">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="mb-1">{job.title}</h5>
                        <p className="text-muted mb-2">
                          {job.company} • {job.location}
                        </p>
                        <div className="mb-2">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} bg="light" text="dark" className="me-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="mb-0">
                          <i className="bi bi-cash me-1"></i>
                          {job.salary} •<i className="bi bi-briefcase ms-2 me-1"></i>
                          {job.type}
                        </p>
                      </div>
                      <div className="text-end">
                        <div className="mb-2">
                          <Badge bg="success">{job.match}% Match</Badge>
                        </div>
                        <Button variant="primary" size="sm">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>📚 Course Recommendations</Card.Title>
              {courseRecommendations.map((course) => (
                <div key={course.id} className="mb-3 pb-3 border-bottom">
                  <h6 className="mb-1">{course.title}</h6>
                  <p className="text-muted small mb-2">{course.institution}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Badge bg="info" className="me-2">
                        {course.level}
                      </Badge>
                      <Badge bg="light" text="dark">
                        {course.duration}
                      </Badge>
                    </div>
                    <Badge bg="success">{course.match}%</Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline-primary" className="w-100 mt-2">
                View All Courses
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>🛠️ Skill Development Recommendations</Card.Title>
          <p className="text-muted">Skills to learn based on market demand</p>

          <Row>
            {skillRecommendations.map((skill, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 border">
                  <Card.Body>
                    <h5 className="mb-2">{skill.skill}</h5>
                    <Badge bg={skill.importance === 'High' ? 'danger' : 'warning'} className="mb-3">
                      {skill.importance} Priority
                    </Badge>
                    <p className="small mb-3">{skill.reason}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small">{skill.resources} learning resources</span>
                      <Button variant="outline-info" size="sm">
                        Explore
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <div className="mt-4 text-center">
        <Button variant="primary" size="lg" className="me-3">
          <i className="bi bi-arrow-repeat me-2"></i>
          Refresh Recommendations
        </Button>
        <Button variant="outline-secondary" size="lg">
          <i className="bi bi-gear me-2"></i>
          Adjust Preferences
        </Button>
      </div>
    </Container>
  );
};

export default Recommendations;
