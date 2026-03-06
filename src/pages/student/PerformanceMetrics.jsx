import React from 'react';
import { Container, Row, Col, Card, Table, ProgressBar } from 'react-bootstrap';

const PerformanceMetrics = () => {
  const metrics = {
    academic: {
      gpa: 3.8,
      coursesCompleted: 12,
      coursesInProgress: 3,
      averageScore: 88,
    },
    applications: {
      total: 25,
      pending: 8,
      accepted: 5,
      rejected: 12,
      successRate: 20,
    },
    skills: {
      technical: 85,
      communication: 75,
      problemSolving: 90,
      teamwork: 80,
    },
    engagement: {
      activityScore: 92,
      platformUsage: 'High',
      resourcesAccessed: 18,
      mentorSessions: 4,
    },
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Performance Metrics & Analytics</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-primary mb-2">{metrics.academic.gpa}</div>
              <Card.Title>GPA Score</Card.Title>
              <ProgressBar now={(metrics.academic.gpa / 4) * 100} label="GPA" className="mb-2" />
              <p className="text-muted small mb-0">
                {metrics.academic.coursesCompleted} courses completed
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-success mb-2">{metrics.applications.successRate}%</div>
              <Card.Title>Application Success Rate</Card.Title>
              <ProgressBar
                now={metrics.applications.successRate}
                variant="success"
                className="mb-2"
              />
              <p className="text-muted small mb-0">
                {metrics.applications.accepted} accepted out of {metrics.applications.total}
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-warning mb-2">{metrics.engagement.activityScore}%</div>
              <Card.Title>Engagement Score</Card.Title>
              <ProgressBar
                now={metrics.engagement.activityScore}
                variant="warning"
                className="mb-2"
              />
              <p className="text-muted small mb-0">
                {metrics.engagement.resourcesAccessed} resources accessed
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm text-center h-100">
            <Card.Body>
              <div className="display-4 text-info mb-2">{metrics.skills.technical}%</div>
              <Card.Title>Technical Skills</Card.Title>
              <ProgressBar now={metrics.skills.technical} variant="info" className="mb-2" />
              <p className="text-muted small mb-0">Overall skill proficiency</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Application Performance</Card.Title>
              <Table hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        Accepted
                      </span>
                    </td>
                    <td>{metrics.applications.accepted}</td>
                    <td>
                      {((metrics.applications.accepted / metrics.applications.total) * 100).toFixed(
                        1
                      )}
                      %
                    </td>
                    <td>
                      <i className="bi bi-arrow-up text-success"></i>
                      <span className="text-success ms-1">+2%</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="text-warning">
                        <i className="bi bi-clock me-2"></i>
                        Pending
                      </span>
                    </td>
                    <td>{metrics.applications.pending}</td>
                    <td>
                      {((metrics.applications.pending / metrics.applications.total) * 100).toFixed(
                        1
                      )}
                      %
                    </td>
                    <td>
                      <i className="bi bi-dash text-muted"></i>
                      <span className="text-muted ms-1">0%</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="text-danger">
                        <i className="bi bi-x-circle me-2"></i>
                        Rejected
                      </span>
                    </td>
                    <td>{metrics.applications.rejected}</td>
                    <td>
                      {((metrics.applications.rejected / metrics.applications.total) * 100).toFixed(
                        1
                      )}
                      %
                    </td>
                    <td>
                      <i className="bi bi-arrow-down text-danger"></i>
                      <span className="text-danger ms-1">-5%</span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>Skill Assessment</Card.Title>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Technical Skills</span>
                  <span>{metrics.skills.technical}%</span>
                </div>
                <ProgressBar now={metrics.skills.technical} variant="info" />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Communication</span>
                  <span>{metrics.skills.communication}%</span>
                </div>
                <ProgressBar now={metrics.skills.communication} variant="success" />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Problem Solving</span>
                  <span>{metrics.skills.problemSolving}%</span>
                </div>
                <ProgressBar now={metrics.skills.problemSolving} variant="warning" />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Teamwork</span>
                  <span>{metrics.skills.teamwork}%</span>
                </div>
                <ProgressBar now={metrics.skills.teamwork} variant="primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Performance Trends & Insights</Card.Title>
          <Row>
            <Col md={4}>
              <div className="text-center p-4">
                <div className="display-6 text-primary mb-2">↑ 15%</div>
                <p className="text-muted mb-0">Application success rate improvement</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-4">
                <div className="display-6 text-success mb-2">+8</div>
                <p className="text-muted mb-0">New skills acquired this quarter</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-4">
                <div className="display-6 text-warning mb-2">92%</div>
                <p className="text-muted mb-0">Profile completeness</p>
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <h6>Recommendations for Improvement:</h6>
            <ul className="list-group">
              <li className="list-group-item">
                <i className="bi bi-check-circle text-success me-2"></i>
                Focus on completing 2 more certifications to reach expert level
              </li>
              <li className="list-group-item">
                <i className="bi bi-check-circle text-success me-2"></i>
                Apply to 5 more companies in your preferred location
              </li>
              <li className="list-group-item">
                <i className="bi bi-check-circle text-success me-2"></i>
                Schedule 3 mentor sessions this month for career guidance
              </li>
            </ul>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PerformanceMetrics;
