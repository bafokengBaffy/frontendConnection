import { Container } from 'react-bootstrap';

import SocialDashboardSection from '../../components/social/SocialDashboardSection';

export const Dashboard = () => (
  <Container fluid className="py-4">
    <div className="mb-4 p-4 bg-white border rounded-4 shadow-sm">
      <p className="text-uppercase fw-bold small text-primary mb-2">Unified Dashboard</p>
      <h1 className="h2 fw-bold mb-2">Career Connect Community</h1>
      <p className="text-muted mb-0">
        A consistent social-first dashboard shell for every role across the platform.
      </p>
    </div>

    <SocialDashboardSection
      audience="dashboard"
      title="Unified Community Feed"
      subtitle="One mobile-friendly social layer that gives every dashboard the same conversation rhythm."
    />
  </Container>
);

export default Dashboard;
