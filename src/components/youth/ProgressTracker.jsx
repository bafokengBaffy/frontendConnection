import { Card, ProgressBar, ListGroup } from 'react-bootstrap';

const milestones = [
  { id: 1, label: 'Register your venture', progress: 100 },
  { id: 2, label: 'Build your pitch deck', progress: 80 },
  { id: 3, label: 'Apply for funding', progress: 45 },
  { id: 4, label: 'Launch your marketplace profile', progress: 20 },
];

const ProgressTracker = () => {
  const overallProgress = Math.round(
    milestones.reduce((total, milestone) => total + milestone.progress, 0) / milestones.length
  );

  return (
    <div className="container py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1">Progress Tracker</h2>
              <p className="text-muted mb-0">Track the key startup milestones in one place.</p>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-4">{overallProgress}%</div>
              <div className="text-muted small">Overall completion</div>
            </div>
          </div>

          <ProgressBar now={overallProgress} className="mb-4" />

          <ListGroup variant="flush">
            {milestones.map((milestone) => (
              <ListGroup.Item className="px-0" key={milestone.id}>
                <div className="d-flex justify-content-between mb-2">
                  <span>{milestone.label}</span>
                  <span className="text-muted">{milestone.progress}%</span>
                </div>
                <ProgressBar now={milestone.progress} />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProgressTracker;
