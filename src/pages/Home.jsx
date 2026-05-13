import { useMemo } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { FaArrowRight, FaBolt, FaChartLine, FaGlobeAfrica, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import './Home.css';

const pillars = [
  {
    title: 'Career Intelligence',
    text: 'Live opportunities, role-fit signals, and cleaner pathways from learning to income.',
    icon: FaChartLine,
  },
  {
    title: 'Community Graph',
    text: 'Students, mentors, employers, institutions, and alumni connected in one ecosystem.',
    icon: FaUsers,
  },
  {
    title: 'Trust & Governance',
    text: 'Admin controls, approvals, and role-based operations built for real platform scale.',
    icon: FaShieldAlt,
  },
];

const metrics = [
  { value: '9', label: 'User Segments' },
  { value: '1', label: 'Unified Platform' },
  { value: '24/7', label: 'Digital Access' },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();

  const dashboardPath = useMemo(() => {
    const userType = userProfile?.userType;
    const map = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      company: '/company/dashboard',
      mentor: '/mentor/dashboard',
      entrepreneur: '/entrepreneur/dashboard',
      institute: '/institute/dashboard',
      youth: '/youth/dashboard',
      parent: '/parent/dashboard',
      alumni: '/alumni/dashboard',
    };
    return map[userType] || '/login';
  }, [userProfile?.userType]);

  return (
    <main className="landing">
      <div className="landing-noise" />
      <Container className="landing-shell">
        <section className="hero">
          <Row className="justify-content-center g-4">
            <Col lg={10} className="text-center">
              <Badge className="hero-kicker">
                <FaGlobeAfrica className="me-2" />
                Career Connect Lesotho Ecosystem
              </Badge>
              <h1 className="hero-title">A Professional Digital Economy Layer For Talent, Work, and Growth.</h1>
              <p className="hero-copy">
                Career Connect is the operating surface for a large employment ecosystem: discovery,
                mentorship, approvals, analytics, and multi-role collaboration designed to scale.
              </p>
              <div className="hero-actions">
                <Button
                  className="btn-primary-landing"
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? dashboardPath : '/register')}
                >
                  {isAuthenticated ? 'Open Dashboard' : 'Join Platform'}
                  <FaArrowRight className="ms-2" />
                </Button>
                <Button
                  variant="outline-dark"
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? dashboardPath : '/login')}
                >
                  {isAuthenticated ? 'Continue Session' : 'Sign In'}
                </Button>
              </div>
              <div className="hero-metrics">
                {metrics.map((item) => (
                  <div key={item.label} className="metric">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <aside className="hero-panel mt-4 mx-auto text-start">
                <div className="pulse" />
                <h2>
                  <FaBolt className="me-2" />
                  Built For Admin-Grade Operations
                </h2>
                <p>
                  Today we focus on admin excellence: dynamic insights, super-admin ownership, and
                  secure management of administrator accounts.
                </p>
                <ul>
                  <li>Dynamic dashboard signals</li>
                  <li>Super-admin + admin lifecycle control</li>
                  <li>Role-aware user governance workflows</li>
                </ul>
              </aside>
            </Col>
          </Row>
        </section>

        <section className="pillars">
          <Row className="g-4">
            {pillars.map(({ title, text, icon: Icon }) => (
              <Col md={6} xl={4} key={title}>
                <article className="pillar-card">
                  <Icon className="pillar-icon" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </main>
  );
};

export default Home;
