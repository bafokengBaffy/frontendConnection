import { Col, Row, Card, Badge } from 'react-bootstrap';
import {
  FaBullseye,
  FaChartLine,
  FaHandHoldingUsd,
  FaRocket,
  FaUsers,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import SocialDashboardSection from '../../components/social/SocialDashboardSection';

const entrepreneurCards = [
  {
    title: 'Venture Progress',
    copy: 'Track milestones, traction, and the weekly momentum behind your business.',
    icon: FaRocket,
    accent: 'primary',
  },
  {
    title: 'Funding Pipeline',
    copy: 'Keep fundraising, grants, and support conversations visible and moving.',
    icon: FaHandHoldingUsd,
    accent: 'success',
  },
  {
    title: 'Growth Signals',
    copy: 'Watch traction, referrals, and engagement with a more social product rhythm.',
    icon: FaChartLine,
    accent: 'warning',
  },
  {
    title: 'Network Reach',
    copy: 'Build investor, mentor, and founder relationships in the same ecosystem.',
    icon: FaUsers,
    accent: 'info',
  },
];

const EntrepreneurDashboard = () => {
  const { userProfile } = useAuth();
  const firstName =
    userProfile?.firstName ||
    userProfile?.displayName ||
    userProfile?.fullName?.split(' ')[0] ||
    'Entrepreneur';

  return (
    <PageContainer
      title={`Welcome back, ${firstName}`}
      subtitle="A founder workspace with live social energy, venture tracking, and a sharper mobile-friendly frame."
      maxWidth="xl"
      breadcrumbs={[
        { label: 'Entrepreneur', path: '/entrepreneur' },
        { label: 'Dashboard', path: '/entrepreneur/dashboard' },
      ]}
    >
      <div className="mb-4 p-4 rounded-4 shadow-sm bg-white border">
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-start">
          <div>
            <p className="text-uppercase fw-bold small text-primary mb-2">Entrepreneur Dashboard</p>
            <h1 className="h2 fw-bold mb-2">Welcome back, {firstName}</h1>
            <p className="text-muted mb-0">
              Your founder workspace now has a live social layer so progress, asks, and wins can
              feel native to the product.
            </p>
          </div>
          <Badge bg="dark" className="px-3 py-2 rounded-pill">
            <FaBullseye className="me-2" />
            Founder Mode
          </Badge>
        </div>
      </div>

      <div className="mb-4">
        <SocialDashboardSection
          audience="entrepreneur"
          title="Founder Network Feed"
          subtitle="Post launches, product screenshots, funding asks, customer wins, and partnership requests in a social stream that feels like a real startup network."
        />
      </div>

      <Row className="g-3">
        {entrepreneurCards.map(({ title, copy, icon: Icon, accent }) => (
          <Col key={title} md={6} xl={3}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body>
                <div className={`d-inline-flex p-3 rounded-4 bg-${accent} bg-opacity-10 mb-3`}>
                  <Icon className={`text-${accent}`} />
                </div>
                <h2 className="h5 fw-bold">{title}</h2>
                <p className="text-muted mb-0">{copy}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
};

export default EntrepreneurDashboard;
