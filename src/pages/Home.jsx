import { useMemo } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import {
  FaArrowRight,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaHandshake,
  FaRocket,
  FaSchool,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import './Home.css';

const audienceCards = [
  {
    title: 'Students',
    description: 'Find internships, graduate jobs, mentorship, and practical career guidance.',
    icon: FaGraduationCap,
    accent: 'var(--home-blue)',
    href: '/register?type=student',
  },
  {
    title: 'Companies',
    description: 'Reach qualified talent, post opportunities, and manage hiring in one place.',
    icon: FaBuilding,
    accent: 'var(--home-green)',
    href: '/register?type=company',
  },
  {
    title: 'Mentors',
    description: 'Support the next generation with coaching, advice, and industry insight.',
    icon: FaChalkboardTeacher,
    accent: 'var(--home-orange)',
    href: '/register?type=mentor',
  },
  {
    title: 'Entrepreneurs',
    description: 'Access funding visibility, mentorship, and startup support resources.',
    icon: FaRocket,
    accent: 'var(--home-red)',
    href: '/register?type=entrepreneur',
  },
  {
    title: 'Institutes',
    description: 'Track outcomes, strengthen employer partnerships, and support student success.',
    icon: FaSchool,
    accent: 'var(--home-gold)',
    href: '/register?type=institute',
  },
  {
    title: 'Administrators',
    description: 'Oversee platform quality, approvals, reporting, and community trust.',
    icon: FaShieldAlt,
    accent: 'var(--home-navy)',
    href: '/register?type=admin',
  },
];

const platformFeatures = [
  {
    title: 'Smarter Matching',
    description: 'Connect people and opportunities faster with structured profiles and routing.',
    icon: FaBriefcase,
  },
  {
    title: 'Local Ecosystem Focus',
    description: 'Built for Lesotho with the needs of learners, employers, and builders in mind.',
    icon: FaHandshake,
  },
  {
    title: 'Clear Progress',
    description: 'Track opportunities, applications, and outcomes with a cleaner experience.',
    icon: FaChartLine,
  },
  {
    title: 'Community Growth',
    description: 'Support collaboration across students, mentors, companies, and institutions.',
    icon: FaUsers,
  },
];

const statHighlights = [
  { label: 'Built For', value: 'Lesotho talent ecosystem' },
  { label: 'Supports', value: 'Jobs, mentorship, growth' },
  { label: 'Designed For', value: 'Desktop and mobile' },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  const dashboardPath = useMemo(() => {
    const userType = userProfile?.userType;

    switch (userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'mentor':
        return '/mentor/dashboard';
      case 'entrepreneur':
        return '/entrepreneur/dashboard';
      case 'institute':
        return '/institute/dashboard';
      case 'youth':
        return '/youth/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'alumni':
        return '/alumni/dashboard';
      default:
        return '/login';
    }
  }, [userProfile?.userType]);

  return (
    <main className="home-page">
      <section className="home-hero">
        <Container>
          <Row className="align-items-center home-hero-row">
            <Col lg={7}>
              <div className="home-copy">
                <Badge className="home-badge">Career Connect Lesotho</Badge>
                <h1 className="home-title">
                  A clearer, faster path from <span>learning to opportunity</span>.
                </h1>
                <p className="home-subtitle">
                  Career Connect brings students, employers, mentors, entrepreneurs, and
                  institutions together in one mobile-friendly platform built for real progress.
                </p>

                <div className="home-actions">
                  <Button
                    className="home-primary-button"
                    size="lg"
                    onClick={() => navigate(isAuthenticated ? dashboardPath : '/register')}
                  >
                    {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
                    <FaArrowRight className="ms-2" />
                  </Button>
                  <Button
                    variant="outline-dark"
                    size="lg"
                    className="home-secondary-button"
                    onClick={() => navigate(isAuthenticated ? dashboardPath : '/login')}
                  >
                    {isAuthenticated ? 'Continue' : 'Sign In'}
                  </Button>
                </div>

                <div className="home-stat-grid">
                  {statHighlights.map((item) => (
                    <div key={item.label} className="home-stat-card">
                      <span className="home-stat-label">{item.label}</span>
                      <strong className="home-stat-value">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="home-hero-panel">
                <div className="home-panel-shell">
                  <div className="home-panel-top">
                    <span className="home-dot home-dot-red" />
                    <span className="home-dot home-dot-yellow" />
                    <span className="home-dot home-dot-green" />
                  </div>

                  <div className="home-panel-content">
                    <div className="home-panel-kicker">Platform Focus</div>
                    <h2>Discover opportunities. Build credibility. Move forward.</h2>
                    <ul className="home-panel-list">
                      <li>Student and employer journeys</li>
                      <li>Mentorship and entrepreneurship support</li>
                      <li>Cleaner responsive experience across devices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="home-section">
        <Container>
          <div className="home-section-heading">
            <p className="home-eyebrow">Who It Serves</p>
            <h2>One platform, multiple pathways.</h2>
            <p>
              Each audience gets a clearer starting point without the homepage depending on fragile
              data loading.
            </p>
          </div>

          <Row className="g-4">
            {audienceCards.map(({ title, description, icon: Icon, accent, href }) => (
              <Col key={title} md={6} xl={4}>
                <Card className="home-card h-100">
                  <Card.Body>
                    <div className="home-card-icon" style={{ '--accent': accent }}>
                      <Icon />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <button type="button" className="home-card-link" onClick={() => navigate(href)}>
                      Explore {title}
                      <FaArrowRight className="ms-2" />
                    </button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="home-section home-section-muted">
        <Container>
          <div className="home-section-heading">
            <p className="home-eyebrow">Why It Works</p>
            <h2>Safer frontend, simpler experience.</h2>
            <p>
              The new homepage is intentionally lighter, more robust, and easier to maintain across
              desktop and mobile screens.
            </p>
          </div>

          <Row className="g-4">
            {platformFeatures.map(({ title, description, icon: Icon }) => (
              <Col key={title} sm={6} xl={3}>
                <div className="home-feature-card">
                  <Icon className="home-feature-icon" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="home-cta">
        <Container>
          <div className="home-cta-box">
            <div>
              <p className="home-eyebrow home-eyebrow-light">Start Here</p>
              <h2>Open the platform with confidence on any screen size.</h2>
              <p>
                We simplified the landing experience so the site loads reliably first, then users
                can move into their flows.
              </p>
            </div>
            <div className="home-cta-actions">
              <Button
                className="home-primary-button"
                size="lg"
                onClick={() => navigate(isAuthenticated ? dashboardPath : '/register')}
              >
                {isAuthenticated ? 'Go To Dashboard' : 'Create Account'}
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="light"
                  size="lg"
                  className="home-cta-secondary"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Home;
