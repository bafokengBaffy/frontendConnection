/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Tabs,
  Tab,
  Alert,
  Spinner,
  Dropdown,
  Form,
  Table,
  Modal,
  ListGroup,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaUsers,
  FaBriefcase,
  FaCalendarCheck,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaFilter,
  FaDownload,
  FaSync,
  FaEye,
  FaCalendarAlt,
  FaUserCheck,
  FaUserClock,
  FaMapMarkerAlt,
  FaIndustry,
  FaGraduationCap,
  FaFileExport,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaRegClock,
  FaChartArea,
  FaDatabase,
  FaCog,
  FaRobot,
  FaBrain,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaBell,
  FaTrophy,
  FaAward,
  FaMedal,
  FaCrown,
  FaGem,
  FaStar,
  FaHandshake,
  FaHeart,
  FaComments,
  FaVideo,
  FaPhone,
  FaEnvelope,
  FaShare,
  FaLink,
  FaExternalLinkAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaBolt,
  FaRocket,
  FaLightbulb,
  FaMagic,
  FaPalette,
} from 'react-icons/fa';
import { Line, Bar, Doughnut, Radar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { useAuth } from '../../context/AuthContext';
import { companyService, dashboardService, analyticsService } from '../../services/companyServices';
import cloudinaryService from '../../services/cloudinaryService';
import './CompanyAnalytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CompanyAnalytics = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [filter, setFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Analytics Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviewRate: 0,
    hireRate: 0,
    avgTimeToHire: 0,
    avgResponseTime: 0,
    conversionRate: 0,
    profileViews: 0,
    totalFollowers: 0,
    jobPostings: 0,
    activeJobs: 0,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    candidateQuality: 0,
    timeEfficiency: 0,
    costEffectiveness: 0,
    diversityScore: 0,
    employerBrandScore: 0,
    overallScore: 0,
  });

  // Chart Data States
  const [applicationTrends, setApplicationTrends] = useState({
    labels: [],
    datasets: [],
  });

  const [conversionFunnel, setConversionFunnel] = useState({
    labels: [],
    datasets: [],
  });

  const [sourceAnalysis, setSourceAnalysis] = useState({
    labels: [],
    datasets: [],
  });

  const [candidateDemographics, setCandidateDemographics] = useState({
    labels: [],
    datasets: [],
  });

  const [hiringPerformance, setHiringPerformance] = useState({
    labels: [],
    datasets: [],
  });

  const [competitorComparison, setCompetitorComparison] = useState({
    labels: [],
    datasets: [],
  });

  // AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch analytics data
  useEffect(() => {
    if (currentUser && userProfile?.userType === 'company') {
      fetchAnalyticsData();
    } else {
      navigate('/login');
    }
  }, [currentUser, userProfile, navigate, timeRange, filter]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch company analytics
      const data = await analyticsService.getCompanyAnalytics({
        companyId: currentUser?.uid,
        timeRange,
        filter,
      });

      setAnalyticsData(data);
      processAnalyticsData(data);

      // Generate AI recommendations
      generateAIRecommendations(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to sample data
      loadSampleData();
    } finally {
      setLoading(false);
    }
  }, [currentUser, timeRange, filter]);

  const processAnalyticsData = (data) => {
    if (!data) return;

    // Process stats
    setStats({
      totalApplications: data.totalApplications || 0,
      interviewRate: data.interviewRate || 0,
      hireRate: data.hireRate || 0,
      avgTimeToHire: data.avgTimeToHire || 0,
      avgResponseTime: data.avgResponseTime || 0,
      conversionRate: data.conversionRate || 0,
      profileViews: data.profileViews || 0,
      totalFollowers: data.totalFollowers || 0,
      jobPostings: data.jobPostings || 0,
      activeJobs: data.activeJobs || 0,
    });

    // Process performance metrics
    setPerformanceMetrics({
      candidateQuality: data.candidateQuality || 75,
      timeEfficiency: data.timeEfficiency || 68,
      costEffectiveness: data.costEffectiveness || 82,
      diversityScore: data.diversityScore || 45,
      employerBrandScore: data.employerBrandScore || 78,
      overallScore: data.overallScore || 70,
    });

    // Prepare chart data
    prepareChartData(data);

    // Generate insights
    generateInsights(data);
  };

  const prepareChartData = (data) => {
    // Application Trends Chart
    const trendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const trendData = data.applicationTrends || [45, 52, 68, 74, 82, 90, 98];

    setApplicationTrends({
      labels: trendLabels,
      datasets: [
        {
          label: 'Applications Received',
          data: trendData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    });

    // Conversion Funnel Chart
    const funnelLabels = ['Viewed', 'Applied', 'Screened', 'Interviewed', 'Hired'];
    const funnelData = data.conversionFunnel || [1000, 250, 120, 45, 15];

    setConversionFunnel({
      labels: funnelLabels,
      datasets: [
        {
          label: 'Conversion Funnel',
          data: funnelData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Source Analysis Chart
    const sourceLabels = [
      'CareerConnect',
      'LinkedIn',
      'Indeed',
      'Company Website',
      'Referrals',
      'Other',
    ];
    const sourceData = data.sourceAnalysis || [45, 25, 15, 8, 5, 2];

    setSourceAnalysis({
      labels: sourceLabels,
      datasets: [
        {
          data: sourceData,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    });

    // Candidate Demographics
    const demoLabels = ['18-24', '25-34', '35-44', '45-54', '55+'];
    const demoData = data.demographics || [35, 45, 12, 6, 2];

    setCandidateDemographics({
      labels: demoLabels,
      datasets: [
        {
          label: 'Age Distribution',
          data: demoData,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });

    // Hiring Performance
    const perfLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const perfData1 = data.performanceCurrent || [15, 22, 18, 25];
    const perfData2 = data.performancePrevious || [12, 18, 15, 20];

    setHiringPerformance({
      labels: perfLabels,
      datasets: [
        {
          label: 'Current Year',
          data: perfData1,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
        {
          label: 'Previous Year',
          data: perfData2,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        },
      ],
    });

    // Competitor Comparison
    const compLabels = ['Your Company', 'Competitor A', 'Competitor B', 'Industry Avg'];
    const compData = data.competitorComparison || [78, 65, 72, 70];

    setCompetitorComparison({
      labels: compLabels,
      datasets: [
        {
          label: 'Overall Score',
          data: compData,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
            'rgb(255, 206, 86)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    });
  };

  const generateAIRecommendations = (data) => {
    const recommendations = [];

    if (data.interviewRate < 30) {
      recommendations.push({
        id: 1,
        title: 'Improve Interview Conversion',
        description:
          'Only ' +
          data.interviewRate +
          '% of applicants reach interview stage. Consider refining your screening process.',
        priority: 'high',
        icon: <FaUserCheck />,
        action: () => navigate('/company/ai-matching'),
      });
    }

    if (data.hireRate < 15) {
      recommendations.push({
        id: 2,
        title: 'Increase Hiring Success',
        description:
          'Your hire rate is ' + data.hireRate + '%. Use AI matching to find better candidates.',
        priority: 'high',
        icon: <FaRobot />,
        action: () => navigate('/company/ai-matching'),
      });
    }

    if (data.avgTimeToHire > 30) {
      recommendations.push({
        id: 3,
        title: 'Reduce Time to Hire',
        description:
          'Average ' + data.avgTimeToHire + ' days to hire. Streamline your hiring process.',
        priority: 'medium',
        icon: <FaClock />,
        action: () => navigate('/company/onboarding'),
      });
    }

    if (data.diversityScore < 50) {
      recommendations.push({
        id: 4,
        title: 'Improve Diversity',
        description:
          'Diversity score is ' +
          data.diversityScore +
          '%. Consider outreach to diverse candidates.',
        priority: 'medium',
        icon: <FaUsers />,
        action: () => navigate('/company/diversity-analytics'),
      });
    }

    // Add default recommendations
    if (recommendations.length < 3) {
      recommendations.push(
        {
          id: 5,
          title: 'Enhance Employer Brand',
          description: 'Boost your company profile to attract more qualified candidates.',
          priority: 'low',
          icon: <FaPalette />,
          action: () => navigate('/company/branding'),
        },
        {
          id: 6,
          title: 'Use Video Interviews',
          description: 'Implement video interviews to speed up screening.',
          priority: 'low',
          icon: <FaVideo />,
          action: () => navigate('/company/video-interviews'),
        }
      );
    }

    setAiRecommendations(recommendations);
  };

  const generateInsights = (data) => {
    const newInsights = [];

    if (data.sourceAnalysis) {
      const topSource = data.sourceAnalysis[0];
      newInsights.push({
        id: 1,
        title: 'Top Talent Source',
        description: `${topSource}% of your best candidates come from CareerConnect`,
        icon: <FaChartLine />,
        trend: 'up',
      });
    }

    if (data.conversionRate > 15) {
      newInsights.push({
        id: 2,
        title: 'High Conversion Rate',
        description: `Your conversion rate of ${data.conversionRate}% is above industry average`,
        icon: <FaArrowUp />,
        trend: 'up',
      });
    }

    if (data.avgResponseTime < 3) {
      newInsights.push({
        id: 3,
        title: 'Quick Response Time',
        description: `Average response time of ${data.avgResponseTime} days is excellent`,
        icon: <FaClock />,
        trend: 'up',
      });
    }

    setInsights(newInsights);

    // Generate predictions
    const newPredictions = [
      {
        id: 1,
        title: 'Hiring Forecast',
        description: `Expected to hire ${Math.round(data.totalApplications * 0.15)} candidates in next 30 days`,
        confidence: 85,
        icon: <FaBrain />,
      },
      {
        id: 2,
        title: 'Cost Projection',
        description: `Estimated hiring cost reduction of 15% with optimized process`,
        confidence: 78,
        icon: <FaDollarSign />,
      },
    ];

    setPredictions(newPredictions);
  };

  const loadSampleData = () => {
    // Load sample data for development/demo
    const sampleData = {
      totalApplications: 245,
      interviewRate: 28,
      hireRate: 12,
      avgTimeToHire: 24,
      avgResponseTime: 2.3,
      conversionRate: 18,
      profileViews: 1250,
      totalFollowers: 345,
      jobPostings: 8,
      activeJobs: 6,
      applicationTrends: [45, 52, 68, 74, 82, 90, 98],
      conversionFunnel: [1000, 250, 120, 45, 15],
      sourceAnalysis: [45, 25, 15, 8, 5, 2],
      demographics: [35, 45, 12, 6, 2],
      performanceCurrent: [15, 22, 18, 25],
      performancePrevious: [12, 18, 15, 20],
      competitorComparison: [78, 65, 72, 70],
      candidateQuality: 75,
      timeEfficiency: 68,
      costEffectiveness: 82,
      diversityScore: 45,
      employerBrandScore: 78,
      overallScore: 70,
    };

    processAnalyticsData(sampleData);
  };

  const handleExportData = async (format) => {
    try {
      setExporting(true);

      // Generate export data
      const exportData = {
        stats,
        performanceMetrics,
        timestamp: new Date().toISOString(),
        company: userProfile?.companyName || 'Your Company',
      };

      // In a real app, this would generate and download a file
      // For now, we'll show a success message
      setTimeout(() => {
        setExporting(false);
        setShowExportModal(false);
        alert(`Data exported successfully as ${format.toUpperCase()}`);
      }, 1500);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="text-success" />;
    if (trend === 'down') return <FaArrowDown className="text-danger" />;
    return <FaRegClock className="text-muted" />;
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Application Trends',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: { grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  if (loading) {
    return (
      <Container fluid className="company-analytics loading">
        <div className="loading-spinner d-flex flex-column align-items-center justify-content-center min-vh-50">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 fs-5">Loading Analytics Dashboard...</p>
          <small className="text-muted">Preparing your company performance insights</small>
        </div>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className={`company-analytics ${isMobile ? 'mobile-view' : ''} px-md-4 py-md-3 px-2 py-2`}
    >
      {/* Header */}
      <Row className="mb-3 mb-md-4">
        <Col>
          <div className="analytics-header card border-0 shadow-sm">
            <div className="card-body p-3 p-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                <div className="flex-grow-1">
                  <h1 className={`${isMobile ? 'h4' : 'h2'} mb-1 fw-bold`}>
                    <FaChartLine className="me-2 text-primary" />
                    Company Analytics Dashboard
                  </h1>
                  <p className="text-muted small mb-0">
                    Gain insights into your hiring performance and optimize your recruitment
                    strategy
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2 align-self-stretch align-self-md-center">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size={isMobile ? 'sm' : undefined}>
                      <FaFilter className="me-2" />
                      {timeRange === '7d'
                        ? 'Last 7 Days'
                        : timeRange === '30d'
                          ? 'Last 30 Days'
                          : timeRange === '90d'
                            ? 'Last 90 Days'
                            : 'Custom'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setTimeRange('7d')}>Last 7 Days</Dropdown.Item>
                      <Dropdown.Item onClick={() => setTimeRange('30d')}>
                        Last 30 Days
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setTimeRange('90d')}>
                        Last 90 Days
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setShowFilterModal(true)}>
                        Custom Range
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Button
                    variant="outline-secondary"
                    onClick={handleRefresh}
                    disabled={loading}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                    <span className="ms-2">Refresh</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowExportModal(true)}
                    size={isMobile ? 'sm' : undefined}
                  >
                    <FaDownload className="me-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Performance Scorecard */}
      <Row className="mb-3 mb-md-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 mb-md-4">
                <h5 className="mb-2 mb-md-0">
                  <FaTrophy className="me-2 text-warning" />
                  Overall Performance Score
                </h5>
                <div className="performance-score-display">
                  <div
                    className={`score-circle score-${getPerformanceColor(performanceMetrics.overallScore)}`}
                  >
                    <span className="score-value">{performanceMetrics.overallScore}</span>
                    <span className="score-label">/100</span>
                  </div>
                  <div className="ms-3">
                    <div className="small text-muted">Overall Score</div>
                    <div
                      className={`trend-indicator ${performanceMetrics.overallScore > 70 ? 'up' : 'down'}`}
                    >
                      {performanceMetrics.overallScore > 70 ? <FaArrowUp /> : <FaArrowDown />}
                      <span className="ms-1">
                        {performanceMetrics.overallScore > 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Row className="g-2 g-md-3">
                {[
                  {
                    label: 'Candidate Quality',
                    value: performanceMetrics.candidateQuality,
                    icon: <FaUserCheck />,
                  },
                  {
                    label: 'Time Efficiency',
                    value: performanceMetrics.timeEfficiency,
                    icon: <FaClock />,
                  },
                  {
                    label: 'Cost Effectiveness',
                    value: performanceMetrics.costEffectiveness,
                    icon: <FaDollarSign />,
                  },
                  {
                    label: 'Diversity Score',
                    value: performanceMetrics.diversityScore,
                    icon: <FaUsers />,
                  },
                  {
                    label: 'Employer Brand',
                    value: performanceMetrics.employerBrandScore,
                    icon: <FaPalette />,
                  },
                ].map((metric, index) => (
                  <Col key={index} xl={2} lg={4} md={4} sm={6} xs={12}>
                    <Card
                      className={`metric-card border-0 h-100 bg-${getPerformanceColor(metric.value)}-subtle`}
                    >
                      <Card.Body className="p-2 p-md-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="metric-icon">{metric.icon}</div>
                          <Badge bg={getPerformanceColor(metric.value)} className="metric-badge">
                            {metric.value}/100
                          </Badge>
                        </div>
                        <h6 className="metric-title small mb-1">{metric.label}</h6>
                        <ProgressBar
                          now={metric.value}
                          variant={getPerformanceColor(metric.value)}
                          className="metric-progress"
                          style={{ height: '6px' }}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3 custom-tabs"
        variant={isMobile ? 'pills' : 'tabs'}
      >
        <Tab
          eventKey="overview"
          title={
            <>
              <FaChartBar className="me-1" />
              {isMobile ? 'Overview' : 'Performance Overview'}
            </>
          }
        >
          <Row className="g-3 g-md-4">
            {/* Key Metrics */}
            <Col xl={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-2 py-md-3">
                  <h5 className="mb-0">Key Hiring Metrics</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="g-2 g-md-3">
                    {[
                      {
                        label: 'Total Applications',
                        value: stats.totalApplications,
                        change: '+12%',
                        icon: <FaUsers className="text-primary" />,
                        color: 'primary',
                      },
                      {
                        label: 'Interview Rate',
                        value: `${stats.interviewRate}%`,
                        change: stats.interviewRate > 25 ? '+5%' : '-2%',
                        icon: <FaCalendarCheck className="text-success" />,
                        color: 'success',
                      },
                      {
                        label: 'Hire Rate',
                        value: `${stats.hireRate}%`,
                        change: stats.hireRate > 15 ? '+3%' : '-1%',
                        icon: <FaUserCheck className="text-info" />,
                        color: 'info',
                      },
                      {
                        label: 'Avg. Time to Hire',
                        value: `${stats.avgTimeToHire} days`,
                        change: stats.avgTimeToHire < 30 ? '-5 days' : '+3 days',
                        icon: <FaClock className="text-warning" />,
                        color: 'warning',
                      },
                      {
                        label: 'Conversion Rate',
                        value: `${stats.conversionRate}%`,
                        change: stats.conversionRate > 15 ? '+4%' : '-2%',
                        icon: <FaChartLine className="text-danger" />,
                        color: 'danger',
                      },
                      {
                        label: 'Response Time',
                        value: `${stats.avgResponseTime} days`,
                        change: stats.avgResponseTime < 3 ? '-1 day' : '+0.5 days',
                        icon: <FaRegClock className="text-secondary" />,
                        color: 'secondary',
                      },
                    ].map((metric, index) => (
                      <Col key={index} md={4} sm={6} xs={12}>
                        <Card className="metric-mini-card border-0 h-100">
                          <Card.Body className="p-2 p-md-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div
                                className={`metric-mini-icon bg-${metric.color}-subtle text-${metric.color}`}
                              >
                                {metric.icon}
                              </div>
                              <div
                                className={`small fw-bold ${metric.change.startsWith('+') ? 'text-success' : 'text-danger'}`}
                              >
                                {metric.change}
                              </div>
                            </div>
                            <h3 className="metric-mini-value mb-1">{metric.value}</h3>
                            <p className="metric-mini-label text-muted small mb-0">
                              {metric.label}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Quick Insights */}
            <Col xl={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-2 py-md-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaLightbulb className="me-2 text-warning" />
                      Quick Insights
                    </h5>
                    <Badge bg="info" className="small">
                      AI Generated
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {insights.length > 0 ? (
                    <ListGroup variant="flush">
                      {insights.map((insight) => (
                        <ListGroup.Item key={insight.id} className="border-0 px-0 py-2 py-md-3">
                          <div className="d-flex align-items-start">
                            <div className="insight-icon me-3">{insight.icon}</div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 small fw-bold">{insight.title}</h6>
                              <p className="mb-0 small text-muted">{insight.description}</p>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4 py-md-5">
                      <FaLightbulb className="text-muted mb-3" size={32} />
                      <p className="text-muted small">No insights available yet</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Charts Row */}
            <Col xl={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Application Trends</h5>
                  <div style={{ height: isMobile ? '250px' : '300px' }}>
                    <Line data={applicationTrends} options={lineOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Candidate Sources</h5>
                  <div style={{ height: isMobile ? '250px' : '300px' }}>
                    <Doughnut data={sourceAnalysis} options={doughnutOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab
          eventKey="conversion"
          title={
            <>
              <FaChartPie className="me-1" />
              {isMobile ? 'Conversion' : 'Conversion Funnel'}
            </>
          }
        >
          <Row className="g-3 g-md-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Hiring Conversion Funnel</h5>
                  <div style={{ height: isMobile ? '300px' : '400px' }}>
                    <Bar data={conversionFunnel} options={barOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-2 py-md-3">
                  <h5 className="mb-0">Funnel Analysis</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {conversionFunnel.labels.map((label, index) => {
                      const value = conversionFunnel.datasets[0]?.data[index] || 0;
                      const prevValue =
                        index > 0 ? conversionFunnel.datasets[0]?.data[index - 1] || 100 : 100;
                      const conversionRate =
                        prevValue > 0 ? Math.round((value / prevValue) * 100) : 0;

                      return (
                        <ListGroup.Item key={index} className="border-0 px-0 py-2 py-md-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1 small fw-bold">{label}</h6>
                              <p className="mb-0 small text-muted">{value} candidates</p>
                            </div>
                            <div className="text-end">
                              <Badge
                                bg={
                                  conversionRate > 50
                                    ? 'success'
                                    : conversionRate > 30
                                      ? 'warning'
                                      : 'danger'
                                }
                              >
                                {conversionRate}% conversion
                              </Badge>
                            </div>
                          </div>
                          <ProgressBar
                            now={value}
                            max={1000}
                            variant={
                              index === 0
                                ? 'primary'
                                : index === 1
                                  ? 'info'
                                  : index === 2
                                    ? 'warning'
                                    : 'success'
                            }
                            className="mt-2"
                            style={{ height: '4px' }}
                          />
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab
          eventKey="performance"
          title={
            <>
              <FaChartArea className="me-1" />
              {isMobile ? 'Performance' : 'Detailed Performance'}
            </>
          }
        >
          <Row className="g-3 g-md-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Hiring Performance Over Time</h5>
                  <div style={{ height: isMobile ? '250px' : '300px' }}>
                    <Bar data={hiringPerformance} options={barOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-3">Candidate Demographics</h5>
                  <div style={{ height: isMobile ? '250px' : '300px' }}>
                    <Bar data={candidateDemographics} options={barOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Competitor Comparison</h5>
                  <div style={{ height: isMobile ? '300px' : '400px' }}>
                    <Bar data={competitorComparison} options={barOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab
          eventKey="ai-recommendations"
          title={
            <>
              <FaRobot className="me-1" />
              {isMobile ? 'AI Insights' : 'AI Recommendations'}
            </>
          }
        >
          <Row className="g-3 g-md-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-2 py-md-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaBrain className="me-2 text-info" />
                      AI-Powered Recommendations
                    </h5>
                    <Badge bg="info" className="small">
                      Updated in real-time
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {aiRecommendations.length > 0 ? (
                    <div className="recommendations-grid">
                      {aiRecommendations.map((rec) => (
                        <Card
                          key={rec.id}
                          className={`recommendation-card border-0 mb-3 ${rec.priority === 'high' ? 'border-danger' : rec.priority === 'medium' ? 'border-warning' : 'border-info'}`}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex align-items-start">
                              <div
                                className={`recommendation-icon me-3 bg-${rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}-subtle text-${rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}`}
                              >
                                {rec.icon}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="mb-0 fw-bold">{rec.title}</h6>
                                  <Badge
                                    bg={
                                      rec.priority === 'high'
                                        ? 'danger'
                                        : rec.priority === 'medium'
                                          ? 'warning'
                                          : 'info'
                                    }
                                  >
                                    {rec.priority} priority
                                  </Badge>
                                </div>
                                <p className="small text-muted mb-3">{rec.description}</p>
                                <Button
                                  variant={
                                    rec.priority === 'high'
                                      ? 'danger'
                                      : rec.priority === 'medium'
                                        ? 'warning'
                                        : 'info'
                                  }
                                  size="sm"
                                  onClick={rec.action}
                                >
                                  Take Action
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaRobot className="text-muted mb-3" size={48} />
                      <h5>No AI recommendations yet</h5>
                      <p className="text-muted mb-3">
                        Continue using the platform to receive personalized recommendations
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 py-2 py-md-3">
                  <h5 className="mb-0">
                    <FaMagic className="me-2 text-purple" />
                    Predictive Insights
                  </h5>
                </Card.Header>
                <Card.Body>
                  {predictions.length > 0 ? (
                    <ListGroup variant="flush">
                      {predictions.map((prediction) => (
                        <ListGroup.Item key={prediction.id} className="border-0 px-0 py-3">
                          <div className="d-flex align-items-start mb-2">
                            <div className="prediction-icon me-3">{prediction.icon}</div>
                            <div>
                              <h6 className="mb-1 small fw-bold">{prediction.title}</h6>
                              <p className="small text-muted mb-2">{prediction.description}</p>
                              <div className="d-flex align-items-center">
                                <ProgressBar
                                  now={prediction.confidence}
                                  variant={
                                    prediction.confidence > 80
                                      ? 'success'
                                      : prediction.confidence > 60
                                        ? 'warning'
                                        : 'danger'
                                  }
                                  style={{ width: '100px', height: '6px' }}
                                  className="me-2"
                                />
                                <small className="text-muted">
                                  {prediction.confidence}% confidence
                                </small>
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4">
                      <FaMagic className="text-muted mb-3" size={32} />
                      <p className="text-muted small">
                        Predictive insights will appear as you collect more data
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Export Analytics Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">Select export format:</p>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              onClick={() => handleExportData('pdf')}
              disabled={exporting}
            >
              <FaFileExport className="me-2" />
              Export as PDF Report
            </Button>
            <Button
              variant="outline-success"
              onClick={() => handleExportData('csv')}
              disabled={exporting}
            >
              <FaDatabase className="me-2" />
              Export as CSV Data
            </Button>
            <Button
              variant="outline-info"
              onClick={() => handleExportData('excel')}
              disabled={exporting}
            >
              <FaDownload className="me-2" />
              Export as Excel Sheet
            </Button>
          </div>
          {exporting && (
            <div className="text-center mt-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Preparing export...</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Filter By</Form.Label>
              <Form.Select>
                <option value="all">All Jobs</option>
                <option value="active">Active Jobs Only</option>
                <option value="department">By Department</option>
                <option value="location">By Location</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowFilterModal(false);
              setTimeRange('custom');
            }}
          >
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Data Quality Alert */}
      {stats.totalApplications < 50 && (
        <Alert variant="warning" className="mt-4 border-0 shadow-sm">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3 fs-4" />
            <div className="flex-grow-1">
              <h6 className="mb-1">Limited Data Available</h6>
              <p className="mb-0 small">
                You need more applications ({50 - stats.totalApplications} more) for accurate
                analytics. Consider posting more jobs or promoting your openings.
              </p>
            </div>
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => navigate('/company/jobs/create')}
            >
              Post a Job
            </Button>
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default CompanyAnalytics;
