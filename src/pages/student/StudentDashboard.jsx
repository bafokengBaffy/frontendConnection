/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Dropdown,
  Tab,
  Nav,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
  Modal,
  Form,
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaUserGraduate,
  FaBriefcase,
  FaBook,
  FaFileAlt,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
  FaSearch,
  FaRocket,
  FaTasks,
  FaGraduationCap,
  FaUniversity,
  FaLaptopCode,
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChevronRight,
  FaStar,
  FaHeart,
  FaArrowRight,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaEdit,
  FaTrash,
  FaUpload,
  FaEye,
  FaShare,
  FaDownload,
  FaSync,
  FaFilter,
  FaSort,
  FaPlus,
  FaTimes,
  FaEllipsisV,
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, parseISO, differenceInDays, isBefore, addDays } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';

import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  getStudentApplications,
  getStudentDocuments,
  getDashboardStats,
  getRecommendedJobs,
  getStudentNotifications,
  getJobs,
  uploadDocument,
  uploadResume,
  deleteDocument as deleteDocumentService,
  getStudentProfile,
} from '../../services/studentServices';
import { storageService } from '../../services/storageService';
import './StudentDashboard.css';

// Chart.js configuration

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Safely use student context with error handling
  let studentContext;
  try {
    studentContext = useStudent();
  } catch (error) {
    console.error('StudentProvider not available:', error);
    // Return loading state if provider is not available
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading student dashboard...</p>
        </div>
      </Container>
    );
  }

  const { studentData, loading, updateStudent, refreshData } = studentContext;
  const { currentUser, logout, userData } = useAuth();
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotification();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('resume');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [performanceData, setPerformanceData] = useState(null);
  const [skillData, setSkillData] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!studentData?.id) return;

    setLoadingData(true);
    try {
      const [
        statsData,
        applicationsData,
        documentsData,
        jobsData,
        recommendedJobsData,
        notificationsData,
      ] = await Promise.all([
        getDashboardStats(studentData.id),
        getStudentApplications(studentData.id),
        getStudentDocuments(studentData.id),
        getJobs(studentData.id),
        getRecommendedJobs(studentData.id),
        getStudentNotifications(studentData.id),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (applicationsData.success) setApplications(applicationsData.data);
      if (documentsData.success) setDocuments(documentsData.data);
      if (jobsData.success) setJobs(jobsData.data);
      if (recommendedJobsData.success) setRecommendedJobs(recommendedJobsData.data);

      // Calculate deadlines from applications
      const upcomingDeadlines = (applicationsData.success ? applicationsData.data : [])
        .filter((app) => app.deadline)
        .map((app) => ({
          ...app,
          type: 'application',
          deadline: app.deadline,
          title: app.jobTitle || 'Application Deadline',
        }))
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

      setDeadlines(upcomingDeadlines);

      // Prepare chart data
      prepareChartData(applicationsData.success ? applicationsData.data : []);

      // Fetch notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  }, [studentData?.id, fetchNotifications]);

  // Prepare chart data
  const prepareChartData = (apps) => {
    // Performance chart data - based on application status
    const statusCounts = {
      pending: 0,
      under_review: 0,
      accepted: 0,
      rejected: 0,
      interview: 0,
    };

    apps.forEach((app) => {
      const status = app.status?.toLowerCase() || 'pending';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const performanceLabels = Object.keys(statusCounts);
    const performanceValues = Object.values(statusCounts);

    setPerformanceData({
      labels: performanceLabels,
      datasets: [
        {
          label: 'Applications by Status',
          data: performanceValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    });

    // Skills chart data - from student profile
    const studentSkills = studentData?.skills || [];
    const skillLevels = studentSkills.map((skill) => Math.floor(Math.random() * 30) + 70); // Random levels for demo

    setSkillData({
      labels: studentSkills.length > 0 ? studentSkills : ['Skills', 'Development', 'Progress'],
      datasets: [
        {
          data: skillLevels.length > 0 ? skillLevels : [85, 90, 75],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    });
  };

  useEffect(() => {
    if (studentData?.id) {
      loadDashboardData();
    }
  }, [studentData?.id, loadDashboardData]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      let result;
      if (uploadType === 'resume') {
        result = await uploadResume(uploadFile, studentData.id);
      } else {
        result = await uploadDocument(studentData.id, uploadFile, uploadType);
      }

      if (result.success) {
        toast.success('Document uploaded successfully');

        // Refresh documents list
        const documentsResult = await getStudentDocuments(studentData.id);
        if (documentsResult.success) {
          setDocuments(documentsResult.data);
        }

        // Refresh profile data
        await refreshData();

        setShowUploadModal(false);
        setUploadFile(null);
        setUploadType('resume');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId, storagePath) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const result = await deleteDocumentService(documentId, storagePath);
        if (result.success) {
          toast.success('Document deleted successfully');
          setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
        }
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  // Handle application status click
  const handleApplicationClick = (applicationId) => {
    navigate(`/student/applications/${applicationId}`);
  };

  // Handle job click
  const handleJobClick = (jobId) => {
    navigate(`/student/jobs/${jobId}`);
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Quick action handlers
  const quickActions = [
    {
      id: 1,
      title: 'Update Profile',
      description: 'Complete your profile to get better matches',
      icon: <FaUserGraduate />,
      action: () => navigate('/student/profile'),
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      title: 'Search Jobs',
      description: 'Find internships and job opportunities',
      icon: <FaBriefcase />,
      action: () => navigate('/student/search/jobs'),
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      title: 'My Applications',
      description: 'Track your job applications',
      icon: <FaFileAlt />,
      action: () => navigate('/student/applications'),
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 4,
      title: 'Upload Document',
      description: 'Upload resume or certificates',
      icon: <FaUpload />,
      action: () => setShowUploadModal(true),
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  // Stats cards configuration
  const statCards = [
    {
      id: 1,
      title: 'Profile Completion',
      value: `${stats?.profileCompletion || 0}%`,
      icon: <FaUserCircle />,
      color: '#667eea',
      progress: stats?.profileCompletion || 0,
      link: '/student/profile',
    },
    {
      id: 2,
      title: 'Applications',
      value: stats?.pendingApplications || 0,
      icon: <FaFileAlt />,
      color: '#f093fb',
      description: 'Pending applications',
      link: '/student/applications',
    },
    {
      id: 3,
      title: 'Accepted Jobs',
      value: stats?.acceptedApplications || 0,
      icon: <FaBriefcase />,
      color: '#4facfe',
      description: 'Accepted applications',
      link: '/student/applications',
    },
    {
      id: 4,
      title: 'Job Matches',
      value: stats?.jobMatches || 0,
      icon: <FaBullseye />,
      color: '#43e97b',
      description: 'Recommended jobs',
      link: '/student/jobs',
    },
  ];

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'approved':
      case 'hired':
        return 'success';
      case 'rejected':
      case 'declined':
        return 'danger';
      case 'interview':
      case 'under_review':
        return 'warning';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="student-dashboard-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="student-dashboard"
    >
      {/* Header Section */}
      <div className="dashboard-header mb-4">
        <Row className="align-items-center">
          <Col md={8}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="dashboard-title">
                {greeting},{' '}
                {studentData?.firstName ||
                  studentData?.fullName ||
                  studentData?.displayName ||
                  'Student'}
                ! 👋
              </h1>
              <p className="dashboard-subtitle text-muted">
                Welcome to your personalized career dashboard. Track your progress and
                opportunities.
              </p>
            </motion.div>
          </Col>
          <Col md={4} className="text-end">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={loadDashboardData}
                disabled={loadingData}
              >
                <FaSync /> Refresh
              </Button>
              <Link to="/student/notifications" className="position-relative me-3">
                <Button variant="light">
                  <FaBell />
                  {unreadCount > 0 && (
                    <Badge bg="danger" className="notification-badge">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4"
      >
        <Row className="g-3">
          {statCards.map((stat, index) => (
            <Col key={stat.id} xs={12} sm={6} lg={3}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="stat-card h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="stat-icon mb-2" style={{ color: stat.color }}>
                          {stat.icon}
                        </div>
                        <Card.Title className="mb-1">{stat.title}</Card.Title>
                        <h2 className="stat-value mb-0">{stat.value}</h2>
                        {stat.description && (
                          <p className="text-muted small mb-0">{stat.description}</p>
                        )}
                      </div>
                      {stat.progress && (
                        <div className="text-end">
                          <div
                            className="progress-circle"
                            style={{ '--progress': `${stat.progress}%` }}
                          >
                            <span>{stat.progress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {stat.link && <Link to={stat.link} className="stretched-link"></Link>}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Main Content */}
      <Row className="g-4">
        {/* Left Column - Charts and Quick Actions */}
        <Col lg={8}>
          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Quick Actions</h5>
                <Badge bg="light" text="dark" className="rounded-pill">
                  {quickActions.length} actions
                </Badge>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {quickActions.map((action, index) => (
                    <Col key={action.id} xs={12} sm={6}>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="light"
                          className="quick-action-btn w-100 h-100 text-start p-3"
                          onClick={action.action}
                          style={{
                            background: action.color,
                            color: 'white',
                            border: 'none',
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="action-icon me-3">{action.icon}</div>
                            <div>
                              <h6 className="mb-1">{action.title}</h6>
                              <p className="small mb-0 opacity-75">{action.description}</p>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </motion.div>

          {/* Applications and Documents Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0">
                  <Nav variant="tabs" className="border-0">
                    <Nav.Item>
                      <Nav.Link eventKey="overview">Overview</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="applications">
                        Applications ({applications.length})
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="documents">Documents ({documents.length})</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Header>

                <Card.Body>
                  <Tab.Content>
                    {/* Overview Tab */}
                    <Tab.Pane eventKey="overview">
                      <Row>
                        {/* Performance Chart */}
                        <Col md={6} className="mb-4">
                          <h6 className="mb-3">Applications by Status</h6>
                          {performanceData && (
                            <div className="chart-container">
                              <Line
                                data={performanceData}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: { display: false },
                                    tooltip: { mode: 'index', intersect: false },
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: { display: false },
                                    },
                                    x: { grid: { display: false } },
                                  },
                                }}
                              />
                            </div>
                          )}
                        </Col>

                        {/* Skills Chart */}
                        <Col md={6} className="mb-4">
                          <h6 className="mb-3">Skill Distribution</h6>
                          {skillData && (
                            <div className="chart-container">
                              <Doughnut
                                data={skillData}
                                options={{
                                  responsive: true,
                                  cutout: '70%',
                                  plugins: {
                                    legend: { position: 'right' },
                                  },
                                }}
                              />
                            </div>
                          )}
                        </Col>

                        {/* Upcoming Deadlines */}
                        <Col xs={12}>
                          <h6 className="mb-3">Upcoming Deadlines</h6>
                          <div className="deadlines-list">
                            {deadlines.length > 0 ? (
                              deadlines.map((deadline, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="deadline-item p-3 mb-2 rounded border"
                                >
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h6 className="mb-1">{deadline.title}</h6>
                                      <small className="text-muted">
                                        Application • Due {formatDate(deadline.deadline)}
                                      </small>
                                    </div>
                                    <Badge
                                      bg={
                                        differenceInDays(new Date(deadline.deadline), new Date()) <=
                                        3
                                          ? 'danger'
                                          : 'warning'
                                      }
                                    >
                                      {differenceInDays(new Date(deadline.deadline), new Date())}{' '}
                                      days
                                    </Badge>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <p className="text-muted text-center">No upcoming deadlines</p>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Tab.Pane>

                    {/* Applications Tab */}
                    <Tab.Pane eventKey="applications">
                      {applications.length > 0 ? (
                        <div className="applications-list">
                          {applications.slice(0, 5).map((app, index) => (
                            <motion.div
                              key={app.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                              className="application-item p-3 mb-3 rounded border"
                              onClick={() => handleApplicationClick(app.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{app.jobTitle || 'Application'}</h6>
                                  <p className="text-muted small mb-1">
                                    {app.companyName || 'Company'} • {app.location || 'Location'}
                                  </p>
                                  <small className="text-muted">
                                    Applied {app.appliedAt ? formatDate(app.appliedAt) : 'Recently'}
                                  </small>
                                </div>
                                <div className="text-end">
                                  <Badge bg={getStatusColor(app.status)} className="mb-2">
                                    {app.status || 'pending'}
                                  </Badge>
                                  <div>
                                    <small className="text-muted">
                                      <FaChevronRight />
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {applications.length > 5 && (
                            <div className="text-center mt-3">
                              <Link to="/student/applications" className="text-decoration-none">
                                View all applications <FaChevronRight size={12} />
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FaFileAlt size={48} className="text-muted mb-3" />
                          <h5>No applications yet</h5>
                          <p className="text-muted">Start applying for jobs to see them here</p>
                          <Button
                            variant="primary"
                            onClick={() => navigate('/student/search/jobs')}
                          >
                            <FaSearch className="me-2" /> Search Jobs
                          </Button>
                        </div>
                      )}
                    </Tab.Pane>

                    {/* Documents Tab */}
                    <Tab.Pane eventKey="documents">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Your Documents</h6>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => setShowUploadModal(true)}
                        >
                          <FaUpload className="me-1" /> Upload New
                        </Button>
                      </div>

                      {documents.length > 0 ? (
                        <div className="documents-list">
                          {documents.slice(0, 5).map((doc, index) => (
                            <motion.div
                              key={doc.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="document-item p-3 mb-2 rounded border"
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                  <div className="document-icon me-3">
                                    <FaFileAlt size={24} />
                                  </div>
                                  <div>
                                    <h6 className="mb-1">{doc.fileName}</h6>
                                    <small className="text-muted">
                                      {doc.documentType} •{' '}
                                      {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Unknown date'}
                                    </small>
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <OverlayTrigger placement="top" overlay={<Tooltip>View</Tooltip>}>
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => window.open(doc.fileUrl, '_blank')}
                                    >
                                      <FaEye />
                                    </Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Download</Tooltip>}
                                  >
                                    <Button
                                      variant="light"
                                      size="sm"
                                      className="me-2"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = doc.fileUrl;
                                        link.download = doc.fileName;
                                        link.click();
                                      }}
                                    >
                                      <FaDownload />
                                    </Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Delete</Tooltip>}
                                  >
                                    <Button
                                      variant="light"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(doc.id, doc.storagePath)}
                                    >
                                      <FaTrash className="text-danger" />
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {documents.length > 5 && (
                            <div className="text-center mt-3">
                              <Link to="/student/documents" className="text-decoration-none">
                                View all documents <FaChevronRight size={12} />
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <FaFileAlt size={48} className="text-muted mb-3" />
                          <h5>No documents uploaded</h5>
                          <p className="text-muted">
                            Upload your resume, certificates, and other documents
                          </p>
                          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                            <FaUpload className="me-2" /> Upload Document
                          </Button>
                        </div>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Card.Body>
              </Card>
            </Tab.Container>
          </motion.div>
        </Col>

        {/* Right Column - Notifications and Recommendations */}
        <Col lg={4}>
          {/* Notifications */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-4"
          >
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Notifications</h5>
                <Badge bg="primary" pill>
                  {unreadCount} new
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div
                  className="notifications-list"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`notification-item p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex">
                          <div className="notification-icon me-3">
                            {notification.type === 'application' && <FaFileAlt />}
                            {notification.type === 'job' && <FaBriefcase />}
                            {notification.type === 'message' && <FaBell />}
                            {notification.type === 'deadline' && <FaClock />}
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-1">{notification.message || notification.title}</p>
                            <small className="text-muted">
                              {notification.createdAt
                                ? formatDate(notification.createdAt)
                                : 'Recently'}
                            </small>
                          </div>
                          {!notification.read && (
                            <div className="unread-indicator">
                              <div className="unread-dot"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FaBell size={32} className="text-muted mb-2" />
                      <p className="text-muted mb-0">No notifications</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="text-center p-3 border-top">
                    <Link to="/student/notifications" className="text-decoration-none">
                      View all notifications <FaChevronRight size={12} />
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Job Recommendations */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-4"
          >
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Job Recommendations</h5>
              </Card.Header>
              <Card.Body>
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.slice(0, 3).map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="job-item p-3 mb-3 rounded border"
                      onClick={() => handleJobClick(job.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{job.title}</h6>
                          <p className="text-muted small mb-2">
                            {job.company} • {job.location}
                          </p>
                          <div className="d-flex flex-wrap gap-1">
                            {job.requirements?.skills?.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} bg="light" text="dark" className="rounded-pill">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Badge bg="success" className="match-badge">
                          85% match
                        </Badge>
                      </div>
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {job.jobType || 'Full-time'} •{' '}
                          {job.deadline ? `Deadline ${formatDate(job.deadline)}` : 'Open'}
                        </small>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student/jobs/${job.id}/apply`);
                          }}
                        >
                          Apply <FaArrowRight size={10} className="ms-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <FaBriefcase size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0">No job recommendations yet</p>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate('/student/search/jobs')}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Progress Summary */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0">
                <h5 className="mb-0">Progress Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="progress-summary">
                  <div className="progress-item mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Profile Strength</span>
                      <span>{stats?.profileCompletion || 0}%</span>
                    </div>
                    <ProgressBar
                      now={stats?.profileCompletion || 0}
                      variant="primary"
                      className="rounded-pill"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div className="progress-item mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Applications</span>
                      <span>{applications.length || 0}</span>
                    </div>
                    <ProgressBar
                      now={Math.min((applications.length / 10) * 100, 100)}
                      variant="success"
                      className="rounded-pill"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div className="progress-item mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Documents</span>
                      <span>{documents.length || 0}</span>
                    </div>
                    <ProgressBar
                      now={Math.min((documents.length / 5) * 100, 100)}
                      variant="info"
                      className="rounded-pill"
                      style={{ height: '8px' }}
                    />
                  </div>
                  <div className="progress-item">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Skills Development</span>
                      <span>{studentData?.skills?.length || 0}</span>
                    </div>
                    <ProgressBar
                      now={Math.min(((studentData?.skills?.length || 0) / 10) * 100, 100)}
                      variant="warning"
                      className="rounded-pill"
                      style={{ height: '8px' }}
                    />
                  </div>
                </div>
                <div className="text-center mt-3">
                  <Link to="/student/profile" className="text-decoration-none">
                    Complete your profile <FaChevronRight size={12} />
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Upload Document Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
                <option value="resume">Resume/CV</option>
                <option value="transcript">Academic Transcript</option>
                <option value="certificate">Certificate</option>
                <option value="portfolio">Portfolio</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Select File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFileUpload} disabled={!uploadFile || uploading}>
            {uploading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default StudentDashboard;
