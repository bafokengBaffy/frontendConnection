/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable no-unused-vars */
// src/pages/youth/YouthDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, ProgressBar, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  FaLightbulb,
  FaHandshake,
  FaChartLine,
  FaUsers,
  FaBriefcase,
  FaGraduationCap,
  FaTrophy,
  FaCalendarCheck,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { useYouth } from '../../context/YouthContext';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const YouthDashboard = () => {
  // Safely use youth context with error handling
  let youthContext;
  try {
    youthContext = useYouth();
  } catch (error) {
    console.error('YouthProvider not available:', error);
    // Return loading state if provider is not available
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading youth dashboard...</p>
        </div>
      </div>
    );
  }

  const {
    youthProfile,
    loading,
    error,
    refreshYouthProfile,
    getBusinessIdeas,
    getFundingApplications,
    getMentorshipConnections,
    getCompletedTrainings,
    getAchievements,
    getRecentActivities,
    getDashboardStats,
  } = youthContext;

  const { userProfile } = useAuth();

  const [stats, setStats] = useState({
    businessIdeas: 0,
    mentors: 0,
    fundingApplied: 0,
    fundingAmount: 0,
    network: 0,
    completedTrainings: 0,
    achievements: 0,
    profileViews: 0,
    applicationSuccess: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [chartData, setChartData] = useState({
    progressData: [],
    fundingData: [],
  });

  // Load all dashboard data from Firebase
  const loadDashboardData = useCallback(async () => {
    if (!youthProfile?.uid) return;

    setLoadingStats(true);
    try {
      // Fetch all data in parallel
      const [ideas, applications, mentors, trainings, achievements, activities, dashboardStats] =
        await Promise.all([
          getBusinessIdeas(),
          getFundingApplications(),
          getMentorshipConnections(),
          getCompletedTrainings(),
          getAchievements(),
          getRecentActivities(10), // Last 10 activities
          getDashboardStats(),
        ]);

      // Calculate total funding amount from applications
      const totalFunding = applications?.reduce((sum, app) => sum + (app.amount || 0), 0) || 0;

      // Calculate application success rate
      const approvedApps =
        applications?.filter((app) => app.status === 'approved' || app.status === 'funded')
          .length || 0;
      const successRate =
        applications?.length > 0 ? Math.round((approvedApps / applications.length) * 100) : 0;

      setStats({
        businessIdeas: ideas?.length || 0,
        mentors: mentors?.length || 0,
        fundingApplied: applications?.length || 0,
        fundingAmount: totalFunding,
        network: youthProfile.networkConnections?.length || 0,
        completedTrainings: trainings?.length || 0,
        achievements: achievements?.length || 0,
        profileViews: dashboardStats?.profileViews || 0,
        applicationSuccess: successRate,
      });

      setRecentActivities(activities || []);

      // Prepare chart data
      setChartData({
        progressData: dashboardStats?.monthlyProgress || [],
        fundingData: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [
            {
              data: [
                approvedApps,
                applications?.filter((app) => app.status === 'pending').length || 0,
                applications?.filter((app) => app.status === 'rejected').length || 0,
              ],
              backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
            },
          ],
        },
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [
    youthProfile,
    getBusinessIdeas,
    getFundingApplications,
    getMentorshipConnections,
    getCompletedTrainings,
    getAchievements,
    getRecentActivities,
    getDashboardStats,
  ]);

  // Initial data load
  useEffect(() => {
    if (userProfile?.userType === 'youth' && !youthProfile) {
      refreshYouthProfile();
    }
  }, [userProfile, youthProfile, refreshYouthProfile]);

  // Load dashboard data when profile is available
  useEffect(() => {
    if (youthProfile) {
      loadDashboardData();
    }
  }, [youthProfile, loadDashboardData]);

  if (loading) {
    return (
      <Container className="youth-dashboard text-center py-5">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3 text-muted">Loading your entrepreneurial dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="youth-dashboard py-5">
        <Alert variant="danger">
          <Alert.Heading className="d-flex align-items-center">
            <FaExclamationCircle className="me-2" /> Error Loading Dashboard
          </Alert.Heading>
          <p>{error}</p>
          <button className="btn btn-outline-danger mt-2" onClick={refreshYouthProfile}>
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  if (!youthProfile) {
    return (
      <Container className="youth-dashboard py-5">
        <Alert variant="info">
          <Alert.Heading className="d-flex align-items-center">
            <FaBriefcase className="me-2" /> Welcome to Youth Entrepreneurship!
          </Alert.Heading>
          <p>Complete your profile to start your entrepreneurial journey.</p>
          <a href="/youth/profile" className="btn btn-primary mt-2">
            Complete Profile
          </a>
        </Alert>
      </Container>
    );
  }

  // Calculate profile completion percentage from Firebase data
  const calculateProfileCompletion = () => {
    const fields = [
      youthProfile.businessName,
      youthProfile.businessIndustry,
      youthProfile.businessDescription,
      youthProfile.skills?.length > 0,
      youthProfile.profilePhoto,
      youthProfile.businessStage,
      youthProfile.lookingForMentor !== undefined,
      youthProfile.lookingForFunding !== undefined,
      youthProfile.lookingForPartners !== undefined,
      youthProfile.interests?.length > 0,
      youthProfile.phone,
      youthProfile.address?.city,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = calculateProfileCompletion();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Container fluid className="youth-dashboard py-4">
      {/* Welcome Header with Profile Stats */}
      <div className="welcome-header mb-4 p-4 bg-gradient-primary text-white rounded">
        <Row className="align-items-center">
          <Col>
            <h1 className="mb-2">
              Welcome back,{' '}
              {youthProfile.firstName || youthProfile.fullName?.split(' ')[0] || 'Entrepreneur'}!
            </h1>
            <p className="mb-0 opacity-75">
              {youthProfile.businessName
                ? `Building ${youthProfile.businessName}`
                : 'Start your entrepreneurial journey today'}
            </p>
          </Col>
          <Col xs="auto">
            <div className="text-end">
              <Badge bg="light" text="dark" className="p-2">
                <FaClock className="me-1" />
                Last active:{' '}
                {youthProfile.lastLogin?.toDate?.()
                  ? new Date(youthProfile.lastLogin.toDate()).toLocaleDateString()
                  : 'Today'}
              </Badge>
            </div>
          </Col>
        </Row>
      </div>

      {/* Key Metrics Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Business Ideas</p>
                  <h2 className="mb-0">
                    {loadingStats ? <Spinner size="sm" /> : stats.businessIdeas}
                  </h2>
                </div>
                <div className="stat-icon bg-warning bg-opacity-10 p-3 rounded">
                  <FaLightbulb className="text-warning fs-3" />
                </div>
              </div>
              <a href="/youth/business/ideas" className="stretched-link"></a>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Mentors Connected</p>
                  <h2 className="mb-0">{loadingStats ? <Spinner size="sm" /> : stats.mentors}</h2>
                </div>
                <div className="stat-icon bg-success bg-opacity-10 p-3 rounded">
                  <FaHandshake className="text-success fs-3" />
                </div>
              </div>
              <a href="/youth/mentors" className="stretched-link"></a>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Funding Applied</p>
                  <h2 className="mb-0">
                    {loadingStats ? <Spinner size="sm" /> : stats.fundingApplied}
                  </h2>
                  <small className="text-success">{formatCurrency(stats.fundingAmount)}</small>
                </div>
                <div className="stat-icon bg-primary bg-opacity-10 p-3 rounded">
                  <FaChartLine className="text-primary fs-3" />
                </div>
              </div>
              <a href="/youth/funding" className="stretched-link"></a>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Network</p>
                  <h2 className="mb-0">{loadingStats ? <Spinner size="sm" /> : stats.network}</h2>
                </div>
                <div className="stat-icon bg-info bg-opacity-10 p-3 rounded">
                  <FaUsers className="text-info fs-3" />
                </div>
              </div>
              <a href="/youth/network" className="stretched-link"></a>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats Row */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaGraduationCap className="text-secondary fs-2 me-3" />
              <div>
                <h6 className="mb-0">Trainings Completed</h6>
                <h4 className="mb-0">{stats.completedTrainings}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaTrophy className="text-warning fs-2 me-3" />
              <div>
                <h6 className="mb-0">Achievements</h6>
                <h4 className="mb-0">{stats.achievements}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaUsers className="text-info fs-2 me-3" />
              <div>
                <h6 className="mb-0">Profile Views</h6>
                <h4 className="mb-0">{stats.profileViews}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <FaCheckCircle className="text-success fs-2 me-3" />
              <div>
                <h6 className="mb-0">Success Rate</h6>
                <h4 className="mb-0">{stats.applicationSuccess}%</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Main Content - Business Progress */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Business Progress</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="business-info mb-4">
                    <h4>{youthProfile.businessName || 'No business name set'}</h4>
                    <div className="mb-2">
                      <Badge bg="primary" className="me-2">
                        {youthProfile.businessStage || 'Idea Stage'}
                      </Badge>
                      {youthProfile.businessIndustry && (
                        <Badge bg="secondary">{youthProfile.businessIndustry}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="progress-section mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Profile Completion</span>
                      <span className="fw-bold">{completionPercentage}%</span>
                    </div>
                    <ProgressBar
                      now={completionPercentage}
                      variant={
                        completionPercentage > 80
                          ? 'success'
                          : completionPercentage > 50
                            ? 'info'
                            : 'warning'
                      }
                      className="mb-3"
                      style={{ height: '10px' }}
                    />
                  </div>

                  <div className="progress-section mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Business Plan</span>
                      <span className="fw-bold">{youthProfile.businessPlanProgress || 0}%</span>
                    </div>
                    <ProgressBar
                      now={youthProfile.businessPlanProgress || 0}
                      variant="primary"
                      style={{ height: '8px' }}
                    />
                  </div>

                  <div className="progress-section mb-4">
                    <div className="d-flex justify-between mb-2">
                      <span>Market Research</span>
                      <span className="fw-bold">{youthProfile.marketResearchProgress || 0}%</span>
                    </div>
                    <ProgressBar
                      now={youthProfile.marketResearchProgress || 0}
                      variant="info"
                      style={{ height: '8px' }}
                    />
                  </div>
                </Col>

                <Col md={6}>
                  <h6 className="mb-3">Funding Application Status</h6>
                  {chartData.fundingData?.datasets?.[0]?.data ? (
                    <div style={{ height: '200px' }}>
                      <Doughnut
                        data={chartData.fundingData}
                        options={{
                          cutout: '70%',
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-muted">No funding applications yet</p>
                  )}
                </Col>
              </Row>

              {youthProfile.businessDescription && (
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="mb-0">
                    <strong>Business Description:</strong>
                  </p>
                  <p className="text-muted mb-0">{youthProfile.businessDescription}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="activity-item d-flex align-items-center mb-3 pb-2 border-bottom"
                  >
                    <div
                      className={`activity-icon me-3 p-2 rounded bg-${activity.type === 'success' ? 'success' : 'info'} bg-opacity-10`}
                    >
                      {activity.type === 'success' ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaCalendarCheck className="text-info" />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0">{activity.description}</p>
                      <small className="text-muted">
                        {activity.timestamp?.toDate
                          ? new Date(activity.timestamp.toDate()).toLocaleString()
                          : new Date().toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FaClock className="text-muted fs-1 mb-3" />
                  <p className="text-muted mb-0">No recent activities</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <a href="/youth/business/ideas/new" className="btn btn-outline-primary text-start">
                  <FaLightbulb className="me-2" /> New Business Idea
                </a>
                <a
                  href="/youth/funding/opportunities"
                  className="btn btn-outline-success text-start"
                >
                  <FaChartLine className="me-2" /> Find Funding Opportunities
                </a>
                <a href="/youth/mentors/search" className="btn btn-outline-info text-start">
                  <FaHandshake className="me-2" /> Find a Mentor
                </a>
                <a href="/youth/training/courses" className="btn btn-outline-warning text-start">
                  <FaGraduationCap className="me-2" /> Browse Training
                </a>
              </div>
            </Card.Body>
          </Card>

          {/* Looking For Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">I'm Looking For</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className={`me-3 p-2 rounded ${youthProfile.lookingForMentor ? 'bg-success bg-opacity-10' : 'bg-light'}`}
                  >
                    <FaHandshake
                      className={youthProfile.lookingForMentor ? 'text-success' : 'text-muted'}
                    />
                  </div>
                  <div>
                    <p className="mb-0 fw-bold">Mentorship</p>
                    <small
                      className={youthProfile.lookingForMentor ? 'text-success' : 'text-muted'}
                    >
                      {youthProfile.lookingForMentor ? 'Actively looking' : 'Not looking'}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className={`me-3 p-2 rounded ${youthProfile.lookingForFunding ? 'bg-success bg-opacity-10' : 'bg-light'}`}
                  >
                    <FaChartLine
                      className={youthProfile.lookingForFunding ? 'text-success' : 'text-muted'}
                    />
                  </div>
                  <div>
                    <p className="mb-0 fw-bold">Funding</p>
                    <small
                      className={youthProfile.lookingForFunding ? 'text-success' : 'text-muted'}
                    >
                      {youthProfile.lookingForFunding ? 'Seeking investment' : 'Not seeking'}
                    </small>
                  </div>
                </li>
                <li className="mb-3 d-flex align-items-center">
                  <div
                    className={`me-3 p-2 rounded ${youthProfile.lookingForPartners ? 'bg-success bg-opacity-10' : 'bg-light'}`}
                  >
                    <FaUsers
                      className={youthProfile.lookingForPartners ? 'text-success' : 'text-muted'}
                    />
                  </div>
                  <div>
                    <p className="mb-0 fw-bold">Business Partners</p>
                    <small
                      className={youthProfile.lookingForPartners ? 'text-success' : 'text-muted'}
                    >
                      {youthProfile.lookingForPartners ? 'Open to partnership' : 'Not looking'}
                    </small>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* Skills Overview */}
          {youthProfile.skills?.length > 0 && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4">
                <h5 className="mb-0">Skills & Expertise</h5>
              </Card.Header>
              <Card.Body>
                <div className="skills-cloud">
                  {youthProfile.skills.map((skill, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* CSS Styles */}
      <style>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .stat-card {
          transition: transform 0.2s;
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .stat-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .activity-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default YouthDashboard;
