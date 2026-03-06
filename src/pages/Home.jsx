/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  FaGraduationCap,
  FaBuilding,
  FaChartLine,
  FaArrowRight,
  FaUniversity,
  FaBriefcase,
  FaBookOpen,
  FaUsers,
  FaHandshake,
  FaRocket,
  FaStar,
  FaQuoteLeft,
  FaCheckCircle,
  FaLightbulb,
  FaBrain,
  FaRobot,
  FaShieldAlt,
  FaTrophy,
  FaAward,
  FaChartBar,
  FaUserCheck,
  FaSearch,
  FaNetworkWired,
  FaMedal,
  FaGlobeAmericas,
  FaClock,
  FaSync,
  FaBolt,
  FaFire,
  FaBullhorn,
  FaHeart,
  FaRegHeart,
  FaHandSparkles,
  FaMagic,
  FaCrown,
  FaArrowUp,
  FaChartPie,
} from 'react-icons/fa';
import {
  GiNetworkBars,
  GiStairsGoal,
  GiTargetArrows,
  GiAchievement,
  GiSparkles,
  GiDiamondRing,
} from 'react-icons/gi';
import {
  MdWork,
  MdSchool,
  MdBusinessCenter,
  MdTrendingUp,
  MdAnalytics,
  MdVerified,
  MdAutoAwesome,
  MdSpeed,
  MdGroups,
  MdEventAvailable,
  MdRocketLaunch,
  MdCelebration,
} from 'react-icons/md';
import { IoRocket, IoStatsChart, IoPeople } from 'react-icons/io5';
import { db } from '../config/firebase';
import {
  collection,
  getCountFromServer,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';
import './Home.css';

// Enhanced Animation wrapper component with Framer Motion
const FadeInSection = ({ children, delay = 0, direction = 'up', duration = 0.8 }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: duration,
        delay: delay / 1000,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated Particle Background
const ParticleBackground = () => {
  return (
    <div className="particle-background">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{
            x: Math.random() * 100 + 'vw',
            y: Math.random() * 100 + 'vh',
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
            y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh', Math.random() * 100 + 'vh'],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Real-time Stats Component with CountUp
const LiveStatCard = ({
  icon,
  title,
  collectionName,
  filterField,
  filterValue,
  color,
  suffix = '+',
}) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        let countQuery;
        if (filterField && filterValue) {
          countQuery = query(collection(db, collectionName), where(filterField, '==', filterValue));
        } else {
          countQuery = query(collection(db, collectionName));
        }

        const snapshot = await getCountFromServer(countQuery);
        setCount(snapshot.data().count);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${collectionName} count:`, error);
        setLoading(false);
      }
    };

    fetchCount();

    const unsubscribe = onSnapshot(query(collection(db, collectionName)), () => {
      fetchCount();
    });

    return () => unsubscribe();
  }, [collectionName, filterField, filterValue]);

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
      whileHover={{ scale: 1.05, y: -10 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <motion.div
        className="stat-icon-wrapper"
        style={{ backgroundColor: `${color}15` }}
        animate={{ rotate: hover ? 360 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="stat-icon"
          style={{ color: color }}
          animate={{ scale: hover ? 1.2 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
      </motion.div>

      <div className="stat-content">
        <h3 className="stat-value">
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <CountUp end={count} duration={2.5} separator="," useEasing={true} />
          )}
          <span className="stat-suffix">{suffix}</span>
        </h3>
        <p className="stat-label">{title}</p>
      </div>

      {hover && (
        <motion.div
          className="stat-hover-effect"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        />
      )}
    </motion.div>
  );
};

// Enhanced Feature Card Component
const FeatureCard = ({ icon, title, description, color, stats, onClick, delay, index }) => {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      className="feature-card interactive-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      whileHover={{
        scale: 1.05,
        y: -10,
        boxShadow: `0 20px 40px ${color}40`,
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <motion.div
        className="feature-icon-wrapper"
        style={{ borderColor: color }}
        animate={{
          rotateY: hover ? 180 : 0,
          scale: hover ? 1.1 : 1,
        }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="feature-icon"
          style={{ color: color }}
          animate={{ rotate: hover ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {icon}
        </motion.div>
      </motion.div>

      <div className="feature-content">
        <motion.h4
          className="feature-title"
          animate={{ color: hover ? color : '#000814' }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h4>
        <p className="feature-description">{description}</p>

        {stats && (
          <motion.div
            className="feature-stats"
            animate={{ scale: hover ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="feature-stat">
              <FaHandSparkles className="me-1" style={{ color: color }} />
              {stats}
            </span>
          </motion.div>
        )}
      </div>

      <motion.div
        className="feature-arrow"
        animate={{
          x: hover ? 10 : 0,
          backgroundColor: hover ? color : `${color}15`,
        }}
        transition={{ duration: 0.3 }}
      >
        <FaArrowRight style={{ color: hover ? 'white' : color }} />
      </motion.div>

      <AnimatePresence>
        {hover && (
          <motion.div
            className="feature-hover-glow"
            style={{
              background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Live Opportunity Component
const LiveOpportunityCard = ({ opportunity, onClick, index }) => {
  const [applicationsCount, setApplicationsCount] = useState(opportunity.applicationsCount || 0);
  const [hover, setHover] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('opportunityId', '==', opportunity.id),
      where('status', 'in', ['pending', 'reviewed', 'shortlisted'])
    );

    const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
      setApplicationsCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [opportunity.id]);

  return (
    <motion.div
      ref={cardRef}
      className="opportunity-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.03,
        y: -5,
        boxShadow: '0 25px 50px rgba(67, 97, 238, 0.3)',
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <div className="opportunity-header">
        <motion.div animate={{ rotate: hover ? 360 : 0 }} transition={{ duration: 0.6 }}>
          <MdBusinessCenter className="opportunity-icon" />
        </motion.div>
        <span className="opportunity-type">{opportunity.type || 'Opportunity'}</span>
        <motion.div animate={{ scale: hover ? 1.2 : 1 }} transition={{ duration: 0.3 }}>
          <Badge bg="success" className="ms-2 live-badge">
            <FaFire className="me-1" />
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Live
            </motion.span>
          </Badge>
        </motion.div>
      </div>

      <div className="opportunity-content">
        <motion.h4
          className="opportunity-title"
          animate={{ color: hover ? '#4361ee' : '#000814' }}
          transition={{ duration: 0.3 }}
        >
          {opportunity.title}
        </motion.h4>
        <p className="opportunity-company">{opportunity.companyName}</p>
        <p className="opportunity-location">{opportunity.location}</p>

        <div className="opportunity-tags">
          {opportunity.tags?.slice(0, 3).map((tag, idx) => (
            <motion.span
              key={idx}
              className="opportunity-tag"
              whileHover={{ scale: 1.1, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="opportunity-footer">
        <div className="applications-count">
          <FaUsers className="me-2" />
          <CountUp end={applicationsCount} duration={1.5} />
          <span className="ms-1">applications</span>
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="primary"
            size="sm"
            className="opportunity-button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Apply Now <FaArrowRight className="ms-2" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {hover && (
          <motion.div
            className="opportunity-hover-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Live Testimonial Component
const LiveTestimonialCard = ({ testimonial, isActive, onClick, index }) => {
  const [authorData, setAuthorData] = useState(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (testimonial.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', testimonial.userId));
          if (userDoc.exists()) {
            setAuthorData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching author:', error);
        }
      }
    };

    fetchAuthor();
  }, [testimonial.userId]);

  return (
    <motion.div
      className={`testimonial-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isActive ? 1.05 : 1,
        y: isActive ? -10 : 0,
      }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <motion.div
        className="testimonial-content"
        animate={{
          backgroundColor: hover ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <motion.div
          className="quote-icon"
          animate={{ rotate: hover ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <FaQuoteLeft />
        </motion.div>

        <motion.p
          className="testimonial-text"
          animate={{ color: hover ? '#000814' : '#001d3d' }}
          transition={{ duration: 0.3 }}
        >
          "{testimonial.content}"
        </motion.p>

        <div className="testimonial-author">
          <motion.div
            className="author-avatar"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            {authorData?.firstName?.charAt(0) || testimonial.name?.charAt(0) || 'U'}
          </motion.div>
          <div className="author-info">
            <motion.h5
              className="author-name"
              animate={{ color: hover ? '#4361ee' : '#000814' }}
              transition={{ duration: 0.3 }}
            >
              {authorData ? `${authorData.firstName} ${authorData.lastName}` : testimonial.name}
            </motion.h5>
            <p className="author-role">{authorData?.position || testimonial.role || 'User'}</p>
            <motion.span className="author-type" whileHover={{ scale: 1.05, y: -2 }}>
              {authorData?.userType || testimonial.userType}
            </motion.span>
          </div>
        </div>

        <div className="testimonial-rating">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <FaStar className={i < (testimonial.rating || 5) ? 'star-filled' : 'star-empty'} />
            </motion.div>
          ))}
        </div>

        <div className="testimonial-time">
          <FaClock className="me-1" />
          {new Date(testimonial.createdAt?.toDate()).toLocaleDateString()}
        </div>
      </motion.div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="testimonial-active-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// New Component: Animated Counter
const AnimatedCounter = ({ end, duration = 2.5, suffix = '', className = '' }) => {
  const [inView, setInView] = useState(false);

  return (
    <motion.div
      className={className}
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
    >
      {inView && <CountUp end={end} duration={duration} separator="," useEasing={true} />}
      {suffix}
    </motion.div>
  );
};

const Home = () => {
  const { isAuthenticated, currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [trendingOpportunities, setTrendingOpportunities] = useState([]);
  const [liveTestimonials, setLiveTestimonials] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    matchesMade: 0,
    successRate: 0,
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100,
    });
  }, []);

  // Fetch real-time data
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const opportunitiesQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const unsubscribeOpportunities = onSnapshot(opportunitiesQuery, (snapshot) => {
          const opportunities = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTrendingOpportunities(opportunities);
        });

        const testimonialsQuery = query(
          collection(db, 'testimonials'),
          where('approved', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const unsubscribeTestimonials = onSnapshot(testimonialsQuery, (snapshot) => {
          const testimonials = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLiveTestimonials(testimonials);
        });

        const calculateStats = async () => {
          try {
            const usersSnapshot = await getCountFromServer(collection(db, 'users'));
            const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'active'));
            const jobsSnapshot = await getCountFromServer(jobsQuery);
            const matchesQuery = query(
              collection(db, 'applications'),
              where('status', 'in', ['accepted', 'hired', 'completed'])
            );
            const matchesSnapshot = await getCountFromServer(matchesQuery);
            const totalAppsQuery = query(collection(db, 'applications'));
            const totalAppsSnapshot = await getCountFromServer(totalAppsQuery);

            const successRate =
              totalAppsSnapshot.data().count > 0
                ? Math.round((matchesSnapshot.data().count / totalAppsSnapshot.data().count) * 100)
                : 0;

            setSystemStats({
              totalUsers: usersSnapshot.data().count,
              activeJobs: jobsSnapshot.data().count,
              matchesMade: matchesSnapshot.data().count,
              successRate: successRate,
            });
          } catch (error) {
            console.error('Error calculating stats:', error);
          }
        };

        await calculateStats();
        setLoading(false);

        const testimonialInterval = setInterval(() => {
          if (liveTestimonials.length > 0) {
            setActiveTestimonial((prev) => (prev + 1) % liveTestimonials.length);
          }
        }, 5000);

        return () => {
          unsubscribeOpportunities();
          unsubscribeTestimonials();
          clearInterval(testimonialInterval);
        };
      } catch (error) {
        console.error('Error setting up real-time data:', error);
        setLoading(false);
      }
    };

    fetchRealTimeData();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="loading-spinner mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.h3
            className="text-primary"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading Career Connect...
          </motion.h3>
          <p className="text-muted mt-2">Preparing your AI-powered career journey</p>
        </motion.div>
      </Container>
    );
  }

  const userTypes = [
    {
      icon: <FaGraduationCap />,
      title: 'Students',
      description:
        'Discover courses, internships, and launch your career journey with AI-powered recommendations',
      color: '#4361ee',
      features: ['AI Job Matching', 'Career Guidance', 'Skill Development', 'Internship Portal'],
      link: '/register?type=student',
    },
    {
      icon: <FaBuilding />,
      title: 'Companies',
      description:
        'Find talented graduates and post opportunities with intelligent candidate matching',
      color: '#06d6a0',
      features: [
        'AI Candidate Search',
        'Smart Job Posting',
        'Brand Analytics',
        'Automated Screening',
      ],
      link: '/register?type=company',
    },
    {
      icon: <FaBrain />,
      title: 'AI Career Coach',
      description:
        'Personalized career development with predictive analytics and skill gap analysis',
      color: '#f72585',
      features: ['Career Predictions', 'Skill Analytics', 'Learning Paths', 'Progress Tracking'],
      link: '/ai/dashboard',
      premium: true,
    },
    {
      icon: <IoStatsChart />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and performance metrics for career growth',
      color: '#4cc9f0',
      features: ['Real-time Analytics', 'Performance Metrics', 'Market Trends', 'Custom Reports'],
      link: '/company/analytics',
    },
  ];

  const features = [
    {
      icon: <FaMagic />,
      title: 'AI Career Predictions',
      description:
        'Get personalized career path recommendations using advanced machine learning algorithms',
      color: '#4361ee',
      delay: 0,
      onClick: () => navigate('/ai/dashboard'),
      stats: '94% Accuracy Rate',
    },
    {
      icon: <FaUserCheck />,
      title: 'Smart Matching',
      description: 'Intelligent candidate-opportunity matching powered by AI algorithms',
      color: '#06d6a0',
      delay: 100,
      onClick: () => navigate('/company/browse-candidates'),
      stats: '3x Faster Hiring',
    },
    {
      icon: <MdAnalytics />,
      title: 'Live Analytics',
      description: 'Real-time dashboards with comprehensive performance insights',
      color: '#4cc9f0',
      delay: 200,
      onClick: () => navigate('/company/analytics'),
      stats: 'Real-time Updates',
    },
    {
      icon: <FaNetworkWired />,
      title: 'Smart Connections',
      description: 'AI-powered networking and collaboration tools for career growth',
      color: '#f72585',
      delay: 300,
      onClick: () => navigate('/company/communication'),
      stats: '500+ Daily Connections',
    },
  ];

  const achievements = [
    {
      icon: <FaTrophy />,
      title: 'Platform Excellence',
      stat: systemStats.successRate,
      description: 'Success Rate',
      color: '#4361ee',
      suffix: '%',
    },
    {
      icon: <IoPeople />,
      title: 'Active Community',
      stat: systemStats.totalUsers,
      description: 'Total Users',
      color: '#06d6a0',
      suffix: '+',
    },
    {
      icon: <MdEventAvailable />,
      title: 'Live Opportunities',
      stat: systemStats.activeJobs,
      description: 'Active Jobs',
      color: '#4cc9f0',
      suffix: '+',
    },
    {
      icon: <FaHandshake />,
      title: 'Successful Matches',
      stat: systemStats.matchesMade,
      description: 'Career Matches',
      color: '#f72585',
      suffix: '+',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="home-page">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shapes">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`floating-shape shape-${i % 6}`}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        <Container>
          <Row className="align-items-center min-vh-100 py-5">
            <Col lg={6} className="hero-content">
              <FadeInSection delay={200} direction="left">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <Badge
                    bg="white"
                    className="mb-4 px-4 py-2 fw-normal border-0 shadow-sm hero-badge"
                  >
                    <FaSync className="me-2" style={{ color: '#4361ee' }} />
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Live Platform • Real-time Updates
                    </motion.span>
                  </Badge>
                </motion.div>

                <motion.h1
                  className="hero-title mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Connect. <span className="hero-highlight">Learn.</span>{' '}
                  <motion.span
                    className="gradient-text"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    Succeed.
                  </motion.span>
                </motion.h1>

                <FadeInSection delay={400} direction="left">
                  <p className="hero-subtitle mb-5">
                    Lesotho's premier <span className="text-primary fw-bold">AI-powered</span>{' '}
                    career platform. Real-time connections between students and companies with live
                    data updates.
                  </p>
                </FadeInSection>

                <FadeInSection delay={600} direction="left">
                  <motion.div
                    className="hero-buttons d-flex flex-wrap gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants}>
                      <Button
                        variant="primary"
                        size="lg"
                        className="btn-primary-custom px-4 py-3 fw-semibold"
                        onClick={() => navigate('/register')}
                        whileHover="hover"
                      >
                        <motion.span
                          variants={{
                            hover: { x: 5 },
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          Get Started Free <FaArrowRight className="ms-2" />
                        </motion.span>
                      </Button>
                    </motion.div>

                    {!isAuthenticated ? (
                      <motion.div variants={itemVariants}>
                        <Button
                          variant="outline-primary"
                          size="lg"
                          className="btn-outline-custom px-4 py-3 fw-semibold"
                          onClick={() => navigate('/login')}
                        >
                          Sign In
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div variants={itemVariants}>
                        <Button
                          variant="outline-primary"
                          size="lg"
                          className="btn-outline-custom px-4 py-3 fw-semibold"
                          onClick={() => {
                            if (userProfile?.userType === 'student') {
                              navigate('/student/dashboard');
                            } else if (userProfile?.userType === 'company') {
                              navigate('/company/dashboard');
                            }
                          }}
                        >
                          Go to Dashboard <FaArrowRight className="ms-2" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </FadeInSection>
              </FadeInSection>
            </Col>

            <Col lg={6}>
              <FadeInSection delay={400} direction="right">
                <motion.div
                  className="stats-grid"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Row className="g-4">
                    <Col xs={6}>
                      <LiveStatCard
                        icon={<FaGraduationCap />}
                        title="Active Students"
                        collectionName="users"
                        filterField="userType"
                        filterValue="student"
                        color="#4361ee"
                        suffix="+"
                      />
                    </Col>
                    <Col xs={6}>
                      <LiveStatCard
                        icon={<FaBuilding />}
                        title="Companies"
                        collectionName="users"
                        filterField="userType"
                        filterValue="company"
                        color="#06d6a0"
                        suffix="+"
                      />
                    </Col>
                    <Col xs={6}>
                      <LiveStatCard
                        icon={<MdWork />}
                        title="Active Jobs"
                        collectionName="jobs"
                        filterField="status"
                        filterValue="active"
                        color="#4cc9f0"
                        suffix="+"
                      />
                    </Col>
                    <Col xs={6}>
                      <LiveStatCard
                        icon={<FaHandshake />}
                        title="Matches Made"
                        collectionName="applications"
                        filterField="status"
                        filterValue="accepted"
                        color="#f72585"
                        suffix="+"
                      />
                    </Col>
                  </Row>
                </motion.div>
              </FadeInSection>
            </Col>
          </Row>
        </Container>
      </section>

      {/* User Types Section */}
      <section className="section-padding user-types-section">
        <Container>
          <FadeInSection direction="up">
            <Row className="mb-5">
              <Col lg={8} className="mx-auto text-center">
                <motion.h2
                  className="section-title mb-3"
                  whileInView={{ scale: [0.9, 1] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Who Uses <span className="text-primary">Career Connect?</span>
                </motion.h2>
                <p className="section-subtitle">
                  Specialized tools for students and companies with AI-powered features
                </p>
              </Col>
            </Row>
          </FadeInSection>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <Row className="g-4">
              {userTypes.map((type, index) => (
                <Col lg={3} md={6} key={index}>
                  <motion.div variants={itemVariants}>
                    <motion.div
                      className="user-type-card"
                      whileHover={{ scale: 1.05, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="type-icon-wrapper"
                        style={{
                          background: `linear-gradient(135deg, ${type.color}20, white)`,
                          borderColor: type.color,
                        }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <motion.div
                          className="type-icon"
                          style={{ color: type.color }}
                          whileHover={{ scale: 1.2 }}
                        >
                          {type.icon}
                        </motion.div>
                        {type.premium && (
                          <motion.div
                            className="premium-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <FaCrown />
                          </motion.div>
                        )}
                      </motion.div>

                      <div className="type-content">
                        <h3 className="type-title">{type.title}</h3>
                        <p className="type-description">{type.description}</p>

                        <div className="type-features">
                          {type.features.map((feature, idx) => (
                            <motion.span
                              key={idx}
                              className="type-feature"
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FaCheckCircle className="me-2" style={{ color: type.color }} />
                              {feature}
                            </motion.span>
                          ))}
                        </div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="light"
                            className="type-button"
                            style={{
                              background: `linear-gradient(45deg, ${type.color}10, ${type.color}05)`,
                              borderColor: type.color,
                              color: type.color,
                            }}
                            onClick={() => navigate(type.link)}
                          >
                            Explore {type.title} <FaArrowRight className="ms-2" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Platform Achievements */}
      <section className="section-padding achievements-section">
        <Container>
          <FadeInSection direction="up">
            <Row className="mb-5">
              <Col lg={8} className="mx-auto text-center">
                <h2 className="section-title mb-3">Platform Achievements</h2>
                <p className="section-subtitle">
                  Real-time metrics showing our impact on Lesotho's career ecosystem
                </p>
              </Col>
            </Row>
          </FadeInSection>

          <Row className="g-4">
            {achievements.map((achievement, index) => (
              <Col lg={3} md={6} key={index}>
                <FadeInSection delay={index * 100} direction="up">
                  <motion.div
                    className="achievement-card"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="achievement-icon"
                      style={{ color: achievement.color }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {achievement.icon}
                    </motion.div>
                    <div className="achievement-content">
                      <h3 className="achievement-stat">
                        <AnimatedCounter
                          end={achievement.stat}
                          suffix={achievement.suffix}
                          className="counter-value"
                        />
                      </h3>
                      <p className="achievement-title">{achievement.title}</p>
                      <small className="achievement-description">{achievement.description}</small>
                    </div>
                  </motion.div>
                </FadeInSection>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section-padding features-section">
        <Container>
          <FadeInSection direction="up">
            <Row className="mb-5">
              <Col lg={8} className="mx-auto text-center">
                <h2 className="section-title mb-3">Powerful Features</h2>
                <p className="section-subtitle">
                  Advanced tools for career development and business growth
                </p>
              </Col>
            </Row>
          </FadeInSection>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={3} md={6} key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                  delay={feature.delay}
                  stats={feature.stats}
                  onClick={feature.onClick}
                  index={index}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Live Opportunities Section */}
      <section className="section-padding opportunities-section">
        <Container>
          <FadeInSection direction="up">
            <Row className="mb-5">
              <Col lg={8} className="mx-auto text-center">
                <motion.div
                  className="d-flex align-items-center justify-content-center mb-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaFire className="me-2" style={{ color: '#f72585' }} />
                  <h2 className="section-title mb-0">Live Opportunities</h2>
                </motion.div>
                <p className="section-subtitle">
                  Real-time job postings with live application counts
                </p>
              </Col>
            </Row>
          </FadeInSection>

          {trendingOpportunities.length > 0 ? (
            <Row className="g-4">
              {trendingOpportunities.slice(0, 3).map((opportunity, index) => (
                <Col lg={4} md={6} key={opportunity.id}>
                  <LiveOpportunityCard
                    opportunity={opportunity}
                    onClick={() => navigate(`/student/jobs/${opportunity.id}`)}
                    index={index}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <motion.div
              className="text-center py-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MdWork className="display-4 text-muted mb-3" />
              <p className="text-muted">No active opportunities at the moment</p>
              <Button variant="outline-primary" onClick={() => navigate('/company/jobs/create')}>
                Post First Opportunity
              </Button>
            </motion.div>
          )}

          <motion.div className="text-center mt-5" whileHover={{ scale: 1.05 }}>
            <Button
              variant="primary"
              className="view-all-button"
              onClick={() => navigate('/student/jobs')}
            >
              View All Opportunities <FaArrowRight className="ms-2" />
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Live Testimonials Section */}
      {liveTestimonials.length > 0 && (
        <section className="section-padding testimonials-section">
          <Container>
            <FadeInSection direction="up">
              <Row className="mb-5">
                <Col lg={8} className="mx-auto text-center">
                  <h2 className="section-title mb-3">What Our Users Say</h2>
                  <p className="section-subtitle">Real testimonials from our active community</p>
                </Col>
              </Row>
            </FadeInSection>

            <div className="testimonials-wrapper">
              <FadeInSection delay={200} direction="up">
                <div className="testimonials-container">
                  {liveTestimonials.map((testimonial, index) => (
                    <LiveTestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      isActive={index === activeTestimonial}
                      onClick={() => setActiveTestimonial(index)}
                      index={index}
                    />
                  ))}
                </div>

                <div className="testimonial-dots">
                  {liveTestimonials.map((_, index) => (
                    <motion.button
                      key={index}
                      className={`testimonial-dot ${index === activeTestimonial ? 'active' : ''}`}
                      onClick={() => setActiveTestimonial(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: index === activeTestimonial ? 1.3 : 1,
                        backgroundColor:
                          index === activeTestimonial ? '#4361ee' : 'rgba(67, 97, 238, 0.3)',
                      }}
                    />
                  ))}
                </div>
              </FadeInSection>
            </div>
          </Container>
        </section>
      )}

      {/* AI-Powered CTA Section */}
      <section className="cta-section ai-cta">
        <Container>
          <FadeInSection direction="up">
            <motion.div
              className="cta-container"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="cta-content">
                <motion.div
                  className="d-flex align-items-center mb-3"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FaRobot className="display-4 me-3 cta-icon" />
                  <div>
                    <h2 className="cta-title">AI-Powered Career Platform</h2>
                    <p className="cta-subtitle">
                      Experience the future of career development with real-time AI insights and
                      smart matching algorithms. Start your free trial today.
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="cta-buttons"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={itemVariants}>
                  <Button
                    variant="light"
                    size="lg"
                    className="cta-button me-3"
                    onClick={() => navigate('/register')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaBrain className="me-2" />
                    Start Free Trial
                  </Button>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="cta-button"
                    onClick={() => navigate('/login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In to Dashboard <FaArrowRight className="ms-2" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </FadeInSection>
        </Container>
      </section>
    </div>
  );
};

export default Home;
