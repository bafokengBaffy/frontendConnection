import { Container, Row, Col, Card, Table, ProgressBar } from 'react-bootstrap';

const StudentAnalytics = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Student Analytics Dashboard</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Overall Progress</Card.Title>
              <ProgressBar now={75} label="75%" variant="success" className="mb-3" />
              <p className="text-muted mb-0">Academic & Career Progress</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Courses Completed</Card.Title>
              <h3 className="text-primary">8/12</h3>
              <p className="text-muted mb-0">67% Completion Rate</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Applications</Card.Title>
              <h3 className="text-info">15</h3>
              <p className="text-muted mb-0">Total Applications Submitted</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Success Rate</Card.Title>
              <h3 className="text-success">40%</h3>
              <p className="text-muted mb-0">Interview Invitations</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Performance Trends</Card.Title>
              <div className="text-center p-5 border rounded">
                <p className="text-muted">Performance chart visualization will appear here</p>
                <small>Line chart showing academic and application performance over time</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Skill Analysis</Card.Title>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Technical Skills</td>
                    <td>
                      <ProgressBar now={80} label="80%" variant="info" />
                    </td>
                  </tr>
                  <tr>
                    <td>Communication</td>
                    <td>
                      <ProgressBar now={70} label="70%" variant="success" />
                    </td>
                  </tr>
                  <tr>
                    <td>Problem Solving</td>
                    <td>
                      <ProgressBar now={85} label="85%" variant="warning" />
                    </td>
                  </tr>
                  <tr>
                    <td>Teamwork</td>
                    <td>
                      <ProgressBar now={75} label="75%" variant="primary" />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Recommendations</Card.Title>
              <ul className="list-group">
                <li className="list-group-item">
                  <i className="bi bi-lightbulb text-warning me-2"></i>
                  Improve your resume with more project experience
                </li>
                <li className="list-group-item">
                  <i className="bi bi-lightbulb text-warning me-2"></i>
                  Apply for 3 more jobs in your skill area this week
                </li>
                <li className="list-group-item">
                  <i className="bi bi-lightbulb text-warning me-2"></i>
                  Complete the &quot;Advanced JavaScript&quot; course to boost your profile
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentAnalytics;
