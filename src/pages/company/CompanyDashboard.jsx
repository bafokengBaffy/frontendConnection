/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ProgressBar,
  Table,
  Dropdown,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Modal,
  Form,
  Nav,
  ListGroup,
  Toast,
  ToastContainer,
  InputGroup,
  FormControl,
  Image,
  Tabs,
  Tab,
  Placeholder,
} from 'react-bootstrap';

import {
  FaBuilding,
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaMoneyBillWave,
  FaEye,
  FaCalendarAlt,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaPlus,
  FaBell,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChartPie,
  FaHandshake,
  FaBolt,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaStar,
  FaSortAmountDown,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaUserTie,
  FaGraduationCap,
  FaLightbulb,
  FaRocket,
  FaChartBar,
  FaFileContract,
  FaCommentDots,
  FaCalendarCheck,
  FaHistory,
  FaUsersCog,
  FaTachometerAlt,
  FaUserCheck,
  FaCalendarDay,
  FaBell as FaBellSolid,
  FaArrowRight,
  FaMapMarkerAlt,
  FaGlobe,
  FaIndustry,
  FaUserPlus,
  FaNewspaper,
  FaVideo,
  FaBullhorn,
  FaUpload,
  FaCloudUploadAlt,
  FaSearch,
  FaChartArea,
  FaUserFriends,
  FaBook,
  FaRegClock,
  FaRegCalendar,
  FaRegComments,
  FaRegUserCircle,
  FaCog,
  FaFilePdf,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaRegEnvelope,
  FaPhone,
  FaMapMarker,
  FaLink,
  FaCamera,
  FaTimes,
  FaSpinner,
  FaRegEye,
  FaRegThumbsUp,
  FaRegCommentDots,
  FaRegShareSquare,
  FaRegBookmark,
  FaThermometerThreeQuarters,
  FaBatteryThreeQuarters,
  FaRegChartBar,
  FaRegCalendarPlus,
  FaRegCalendarMinus,
  FaRegCalendarTimes,
  FaRegCalendarCheck,
  FaTrophy,
  FaAward,
  FaMedal,
  FaCrown,
  FaGem,
  FaDollarSign,
  FaRegMoneyBillAlt,
  FaCreditCard,
  FaUniversity,
  FaGraduationCap as FaGraduationCapSolid,
  FaUserGraduate,
  FaUserSecret,
  FaUserNinja,
  FaUserAstronaut,
  FaUserMd,
  FaUserTie as FaUserTieSolid,
  FaUserEdit,
  FaUserCog,
  FaUserShield,
  FaUserLock,
  FaUserCheck as FaUserCheckSolid,
  FaUserTimes,
  FaUserMinus,
  FaUserPlus as FaUserPlusSolid,
  FaUserFriends as FaUserFriendsSolid,
  FaUserCircle as FaUserCircleSolid,
  FaUser as FaUserSolid,
  FaShieldAlt,
  FaChartLine as FaChartLineSolid,
  FaBriefcase as FaBriefcaseSolid,
  FaUsers as FaUsersSolid,
  FaRobot,
  FaPalette,
  FaClipboardCheck,
  FaUserPlus as FaUserPlusIcon,
  FaChartLine as FaChartLineIcon,
  FaBrain,
  FaStore,
  FaUsersCog as FaUsersCogIcon,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import {
  dashboardService,
  companyService,
  jobService,
  applicationService,
  cloudinaryService,
} from '../../services/companyServices';
import { newsService } from '../../services/externalAPIs';
import './CompanyDashboard.css';

// Custom ImageWithFallback component
const ImageWithFallback = ({ src, alt, fallback, className, style, ...props }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      fallback || (
        <div
          className={`${className} bg-light d-flex align-items-center justify-content-center`}
          style={style}
        >
          <FaBuilding size={24} className="text-muted" />
        </div>
      )
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
      {...props}
    />
  );
};

// Error Boundary Component
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger" className="my-2">
          <h5 className="mb-2 fs-6">Something went wrong</h5>
          <p className="mb-2 fs-7">This section failed to load. Please try refreshing.</p>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="p-3">
      <Placeholder as={Card.Title} animation="wave">
        <Placeholder xs={6} />
      </Placeholder>
      <Placeholder as={Card.Text} animation="wave">
        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} /> <Placeholder xs={6} />{' '}
        <Placeholder xs={8} />
      </Placeholder>
    </Card.Body>
  </Card>
);

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Loading your dashboard...');
  const [toasts, setToasts] = useState([]);
  const [news, setNews] = useState({ business: [], career: [], lesotho: [] });
  const [newsLoading, setNewsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    profileViews: 0,
    interviewRate: 0,
    hireRate: 0,
    avgTimeToHire: 0,
    avgResponseTime: 2.3,
    conversionRate: 0,
    pendingReviews: 0,
    pipelineStats: {
      new: 0,
      reviewed: 0,
      interview: 0,
      hired: 0,
    },
    totalFollowers: 0,
    newFollowers: 0,
  });

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showUploadLogoModal, setShowUploadLogoModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [realtimeListeners, setRealtimeListeners] = useState([]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Professional navigation actions
  const primaryActions = [
    {
      id: 1,
      title: 'Post New Job',
      icon: <FaRocket className="action-icon" />,
      variant: 'primary',
      onClick: () => navigate('/company/jobs/create'),
      description: 'Create and publish new job posting',
    },
    {
      id: 2,
      title: 'Review Apps',
      icon: <FaUserCheck className="action-icon" />,
      variant: 'success',
      onClick: () => navigate('/company/applications'),
      badge: () => stats.pendingReviews,
      description: 'Review pending applications',
    },
    {
      id: 3,
      title: 'Schedule',
      icon: <FaCalendarCheck className="action-icon" />,
      variant: 'warning',
      onClick: () => navigate('/company/schedule-interview'),
      description: 'Schedule interviews',
    },
    {
      id: 4,
      title: 'Analytics',
      icon: <FaChartBar className="action-icon" />,
      variant: 'info',
      onClick: () => navigate('/company/analytics'),
      description: 'Performance analytics',
    },
  ];

  const secondaryActions = [
    {
      id: 5,
      title: 'Manage Team',
      icon: <FaUsersCog className="action-icon" />,
      onClick: () => navigate('/company/teams'),
    },
    {
      id: 6,
      title: 'Profile',
      icon: <FaBuilding className="action-icon" />,
      onClick: () => navigate('/company/profile'),
    },
    {
      id: 7,
      title: 'Documents',
      icon: <FaFileContract className="action-icon" />,
      onClick: () => navigate('/company/documents'),
    },
    {
      id: 8,
      title: 'Chat',
      icon: <FaCommentDots className="action-icon" />,
      onClick: () => navigate('/company/chat'),
    },
  ];

  // Show toast notification
  const showToast = useCallback((title, message, variant = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  // Check authentication
  useEffect(() => {
    let isMounted = true;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile?.userType !== 'company') {
      showToast('Access Denied', 'This dashboard is for companies only', 'danger');
      navigate('/');
      return;
    }

    const fetchData = async () => {
      if (!isMounted) return;
      await fetchDashboardData();
      await fetchNews();
    };

    fetchData();

    const interval = setInterval(() => {
      if (isMounted && isOnline) {
        fetchDashboardData();
      }
    }, 300000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser, userProfile, navigate, showToast, isOnline]);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser || !isOnline) {
      showToast('Offline', 'You are currently offline. Data may be outdated.', 'warning');
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Loading dashboard data...');

      const data = await dashboardService.getDashboardData();

      if (data) {
        setDashboardData(data);
        updateStats(data);

        const newCount = data.applicationStats?.new || 0;
        document.title =
          newCount > 0
            ? `(${newCount}) ${data.company?.name || 'Company'} Dashboard`
            : `${data.company?.name || 'Company'} Dashboard`;

        if (!loading) {
          showToast('Dashboard Updated', 'Latest data loaded successfully', 'success');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error', 'Failed to load dashboard data', 'warning');

      setDashboardData({
        company: {
          name: userProfile?.companyName || 'Your Company',
          logo: null,
          industry: 'Not specified',
          location: 'Not specified',
          website: '',
          description: 'Complete your company profile to get started',
          followersCount: 0,
        },
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          applications: 0,
          profileViews: 0,
          totalApplicants: 0,
        },
        recentApplications: [],
        jobListings: [],
        pipelineStats: { new: 0, reviewed: 0, interview: 0, hired: 0 },
        topCandidates: [],
        applicationStats: {
          total: 0,
          new: 0,
          reviewed: 0,
          interview: 0,
          rejected: 0,
          hired: 0,
          withdrawn: 0,
        },
      });
    } finally {
      setLoading(false);
      setLoadingText('Loading your dashboard...');
    }
  }, [currentUser, userProfile, showToast, loading, isOnline]);

  const fetchNews = useCallback(async () => {
    if (!isOnline) {
      showToast('Offline', 'Cannot fetch news while offline', 'warning');
      return;
    }

    try {
      setNewsLoading(true);
      const newsData = await newsService.getDashboardNews();
      if (newsData) {
        setNews(newsData);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showToast('News Update', 'Could not load latest news', 'warning');
    } finally {
      setNewsLoading(false);
    }
  }, [showToast, isOnline]);

  const updateStats = useCallback((data) => {
    if (!data) return;

    const newStats = {
      totalJobs: data.stats?.totalJobs || 0,
      activeJobs: data.stats?.activeJobs || 0,
      totalApplicants: data.stats?.totalApplicants || 0,
      profileViews: data.stats?.profileViews || 0,
      interviewRate: calculateInterviewRate(data.applicationStats),
      hireRate: calculateHireRate(data.applicationStats),
      avgTimeToHire: calculateAvgTimeToHire(data.recentApplications || []),
      avgResponseTime: calculateAvgResponseTime(data.recentApplications || []),
      conversionRate: calculateConversionRate(data.applicationStats),
      pendingReviews: data.applicationStats?.new || 0,
      totalFollowers: data.company?.followersCount || 0,
      newFollowers: calculateNewFollowers(data.company?.followersData || []),
      pipelineStats: data.pipelineStats || { new: 0, reviewed: 0, interview: 0, hired: 0 },
    };

    setStats(newStats);
  }, []);

  const calculateInterviewRate = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.interview / stats.total) * 100);
  };

  const calculateHireRate = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.hired / stats.total) * 100);
  };

  const calculateConversionRate = (stats) => {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.hired / stats.total) * 100);
  };

  const calculateAvgTimeToHire = (applications) => {
    const hiredApps = applications.filter(
      (app) => app.status === 'hired' && app.appliedAt && app.hiredAt
    );
    if (hiredApps.length === 0) return 14;

    const totalDays = hiredApps.reduce((sum, app) => {
      const appliedDate = new Date(app.appliedAt);
      const hiredDate = new Date(app.hiredAt);
      const diffTime = Math.abs(hiredDate - appliedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / hiredApps.length);
  };

  const calculateAvgResponseTime = (applications) => {
    const reviewedApps = applications.filter(
      (app) =>
        ['reviewed', 'interview', 'hired', 'rejected'].includes(app.status) &&
        app.appliedAt &&
        app.reviewedAt
    );
    if (reviewedApps.length === 0) return 2.3;

    const totalDays = reviewedApps.reduce((sum, app) => {
      const appliedDate = new Date(app.appliedAt);
      const reviewedDate = new Date(app.reviewedAt || app.updatedAt);
      const diffTime = Math.abs(reviewedDate - appliedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round((totalDays / reviewedApps.length) * 10) / 10;
  };

  const calculateNewFollowers = (followers) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return followers.filter((f) => new Date(f.followedAt) > lastWeek).length;
  };

  const getStatusBadge = useCallback((status) => {
    const variants = {
      applied: { bg: 'light', text: 'dark', icon: <FaClock /> },
      pending: { bg: 'warning', text: 'dark', icon: <FaClock /> },
      reviewed: { bg: 'info', text: 'white', icon: <FaEye /> },
      interview: { bg: 'primary', text: 'white', icon: <FaCalendarAlt /> },
      hired: { bg: 'success', text: 'white', icon: <FaCheckCircle /> },
      rejected: { bg: 'danger', text: 'white', icon: <FaTimesCircle /> },
      withdrawn: { bg: 'secondary', text: 'white', icon: null },
      active: { bg: 'success', text: 'white', icon: <FaCheckCircle /> },
      paused: { bg: 'warning', text: 'dark', icon: null },
      closed: { bg: 'secondary', text: 'white', icon: null },
    };

    const variant = variants[status] || { bg: 'secondary', text: 'white', icon: null };

    return (
      <Badge
        bg={variant.bg}
        text={variant.text}
        className="status-badge d-flex align-items-center gap-1"
      >
        {variant.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }, []);

  const handleLogoUpload = async () => {
    if (!logoFile || !currentUser) return;

    try {
      setUploadingLogo(true);

      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

      const response = await cloudinaryService.uploadImage(logoFile);
      const logoUrl = response.secure_url;

      await companyService.updateCompanyProfile({
        logo: logoUrl,
        updatedAt: new Date().toISOString(),
      });

      setDashboardData((prev) => ({
        ...prev,
        company: { ...prev.company, logo: logoUrl },
      }));

      setShowUploadLogoModal(false);
      setLogoFile(null);
      setLogoPreview(null);

      showToast('Success', 'Company logo updated successfully!', 'success');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showToast('Error', 'Failed to upload logo. Please try again.', 'danger');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      showToast('Status Updated', `Application status updated to ${newStatus}`, 'success');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating application status:', error);
      showToast('Error', 'Failed to update application status', 'danger');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const getFilteredApplications = useCallback(() => {
    if (!dashboardData?.recentApplications) return [];

    let filtered = [...dashboardData.recentApplications];

    if (filter !== 'all') {
      filtered = filtered.filter((app) => app.status === filter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.appliedAt) - new Date(a.appliedAt);
        case 'oldest':
          return new Date(a.appliedAt) - new Date(b.appliedAt);
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [dashboardData, filter, sortBy]);

  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Just now';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  }, []);

  const handleViewApplication = (applicationId) => {
    navigate(`/company/applications/${applicationId}`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/company/jobs/${jobId}`);
  };

  const handleViewCandidate = (candidateId) => {
    navigate(`/company/candidates/${candidateId}`);
  };

  const handleQuickAction = (action) => {
    if (action.onClick) action.onClick();
  };

  const handleViewNewsArticle = (article) => {
    setSelectedNews(article);
    setShowNewsModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };

    if (!validTypes[file.type]) {
      showToast('Invalid File', 'Only image files are allowed', 'danger');
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File Too Large', 'Maximum file size is 10MB', 'danger');
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderApplicationRow = useCallback(
    (app) => (
      <ListGroup.Item key={app.id} className="application-item border-0 px-3 py-2 hover-highlight">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="mb-0 fw-semibold fs-6">{app.job?.title || 'Position'}</h6>
              {app.matchScore > 80 && (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <FaStar size={10} /> Top
                </Badge>
              )}
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2 gap-md-3 mb-2 fs-7">
              <span className="d-flex align-items-center gap-1 text-muted">
                <FaUserTie size={12} /> {app.candidate?.fullName || 'Candidate'}
              </span>
              <span className="d-flex align-items-center gap-1 text-muted">
                <FaCalendarAlt size={12} /> {getTimeAgo(app.appliedAt)}
              </span>
              <span className="d-flex align-items-center gap-1 text-muted">
                <FaChartLine size={12} /> {app.matchScore || 0}%
              </span>
            </div>
            {app.candidate?.skills && app.candidate.skills.length > 0 && (
              <div className="d-flex flex-wrap gap-1">
                {app.candidate.skills.slice(0, 2).map((skill) => (
                  <Badge key={skill} bg="light" text="dark" className="fw-normal">
                    {skill}
                  </Badge>
                ))}
                {app.candidate.skills.length > 2 && (
                  <Badge bg="light" text="dark" className="fw-normal">
                    +{app.candidate.skills.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="d-flex flex-column align-items-end gap-2 min-w-100">
            {getStatusBadge(app.status)}
            <div className="d-flex gap-1">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleViewApplication(app.id)}
              >
                View
              </Button>
              {app.status === 'applied' && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => handleUpdateApplicationStatus(app.id, 'reviewed')}
                >
                  Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </ListGroup.Item>
    ),
    [getStatusBadge, getTimeAgo]
  );

  const renderJobRow = useCallback(
    (job) => (
      <tr key={job.id} className="align-middle">
        <td>
          <div>
            <strong className="fs-7">{job.title}</strong>
            <div className="fs-8 text-muted">{job.location}</div>
          </div>
        </td>
        <td>
          <div className="d-flex align-items-center gap-1">
            <FaUsers className="text-muted" size={14} />
            <span className="fs-7">{job.applicantsCount || 0}</span>
          </div>
        </td>
        <td>
          <div className="d-flex flex-column gap-1">
            {getStatusBadge(job.status)}
            {job.urgency === 'high' && (
              <Badge bg="danger" className="fs-8">
                Urgent
              </Badge>
            )}
          </div>
        </td>
        <td className="text-muted fs-8">{job.createdAt ? getTimeAgo(job.createdAt) : 'N/A'}</td>
        <td>
          <Dropdown>
            <Dropdown.Toggle variant="link" className="text-decoration-none p-0">
              <FaEllipsisV />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleViewJob(job.id)}>
                <FaEye className="me-2" /> View
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate(`/company/jobs/${job.id}/edit`)}>
                <FaEdit className="me-2" /> Edit
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate(`/company/jobs/${job.id}/applicants`)}>
                <FaUsers className="me-2" /> Applicants
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ),
    [getStatusBadge, getTimeAgo, navigate]
  );

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading d-flex flex-column align-items-center justify-content-center min-vh-50">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 fs-5">{loadingText}</p>
      </div>
    );
  }

  const companyName = dashboardData?.company?.name || userProfile?.companyName || '';
  const welcomeName = companyName || 'Company';
  const displayName = userProfile?.displayName || userProfile?.email?.split('@')[0] || '';

  return (
    <Container
      fluid
      className={`company-dashboard-container ${isMobile ? 'mobile-view' : ''} px-0 px-md-3 py-2`}
    >
      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.variant}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            delay={5000}
            autohide
            className="shadow-sm"
          >
            <Toast.Header className={`bg-${toast.variant} text-white`}>
              <strong className="me-auto fs-7">{toast.title}</strong>
              <small>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </Toast.Header>
            <Toast.Body className="text-white fs-7">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      {/* Offline Alert */}
      {!isOnline && (
        <Alert variant="warning" className="mb-3 mx-2 mx-md-0 fs-7">
          <FaBellSolid className="me-2" />
          You are currently offline. Some features may be limited.
        </Alert>
      )}

      {/* Welcome Header - Compact */}
      <Row className="mb-3 mx-2 mx-md-0">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative">
                    <ImageWithFallback
                      src={dashboardData?.company?.logo}
                      alt={welcomeName}
                      className="company-logo rounded-circle border"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      onClick={() => setShowUploadLogoModal(true)}
                      title="Click to change logo"
                      fallback={
                        <div
                          className="company-logo-placeholder rounded-circle border d-flex align-items-center justify-content-center bg-primary text-white"
                          style={{ width: '60px', height: '60px' }}
                          onClick={() => setShowUploadLogoModal(true)}
                        >
                          <FaBuilding size={24} />
                        </div>
                      }
                    />
                  </div>
                  <div>
                    <h1 className="h4 mb-1 fw-bold">Welcome back, {displayName}!</h1>
                    <p className="text-muted fs-7 mb-0">
                      Managing <strong>{welcomeName}</strong> dashboard
                    </p>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Badge bg="info" className="fs-8">
                        <FaShieldAlt className="me-1" />
                        {dashboardData?.company?.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Badge bg="light" text="dark" className="fs-8">
                        <FaRegEye className="me-1" /> {stats.profileViews}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 align-self-stretch">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center gap-2"
                    onClick={fetchDashboardData}
                    disabled={loading || !isOnline}
                    size="sm"
                  >
                    <FaSync className={loading ? 'fa-spin' : ''} />
                    {!isMobile && 'Refresh'}
                  </Button>
                  <Button
                    variant="primary"
                    className="d-flex align-items-center gap-2"
                    onClick={() => navigate('/company/jobs/create')}
                    size="sm"
                  >
                    <FaPlus /> {!isMobile && 'Post Job'}
                  </Button>
                  <Button
                    variant="light"
                    className="position-relative"
                    onClick={() => navigate('/company/notifications')}
                    size="sm"
                  >
                    <FaBellSolid />
                    {stats.pendingReviews > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {stats.pendingReviews}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards - Responsive Grid */}
      <Row className="g-2 mb-3 mx-2 mx-md-0">
        <Col xl={3} lg={6} md={6} sm={6} xs={12}>
          <DashboardErrorBoundary>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="stat-icon-circle bg-primary-light">
                    <FaBriefcase className="text-primary" size={20} />
                  </div>
                  <span className="text-success fw-bold fs-8">
                    <FaArrowUp className="me-1" /> 12%
                  </span>
                </div>
                <h3 className="stat-value mb-1 fs-4">{stats.totalJobs}</h3>
                <p className="stat-label text-muted mb-2 fs-8">Total Jobs</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted fs-8">Active: {stats.activeJobs}</span>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 fs-8"
                    onClick={() => navigate('/company/jobs')}
                  >
                    View <FaExternalLinkAlt className="ms-1" size={10} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>

        <Col xl={3} lg={6} md={6} sm={6} xs={12}>
          <DashboardErrorBoundary>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="stat-icon-circle bg-success-light">
                    <FaUsersSolid className="text-success" size={20} />
                  </div>
                  <span className="text-success fw-bold fs-8">
                    <FaArrowUp className="me-1" /> 8%
                  </span>
                </div>
                <h3 className="stat-value mb-1 fs-4">{stats.totalApplicants}</h3>
                <p className="stat-label text-muted mb-2 fs-8">Applicants</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted fs-8">{stats.pendingReviews} pending</span>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 fs-8"
                    onClick={() => navigate('/company/applications')}
                  >
                    Review <FaExternalLinkAlt className="ms-1" size={10} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>

        <Col xl={3} lg={6} md={6} sm={6} xs={12}>
          <DashboardErrorBoundary>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="stat-icon-circle bg-info-light">
                    <FaChartLineSolid className="text-info" size={20} />
                  </div>
                  <span
                    className={
                      stats.interviewRate > 20
                        ? 'text-success fw-bold fs-8'
                        : 'text-danger fw-bold fs-8'
                    }
                  >
                    {stats.interviewRate > 20 ? (
                      <FaArrowUp className="me-1" />
                    ) : (
                      <FaArrowDown className="me-1" />
                    )}
                    {stats.interviewRate > 20 ? '5%' : '2%'}
                  </span>
                </div>
                <h3 className="stat-value mb-1 fs-4">{stats.interviewRate}%</h3>
                <p className="stat-label text-muted mb-2 fs-8">Interview Rate</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted fs-8">Hire: {stats.hireRate}%</span>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 fs-8"
                    onClick={() => navigate('/company/analytics')}
                  >
                    Stats <FaExternalLinkAlt className="ms-1" size={10} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>

        <Col xl={3} lg={6} md={6} sm={6} xs={12}>
          <DashboardErrorBoundary>
            <Card className="stat-card border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="stat-icon-circle bg-warning-light">
                    <FaClock className="text-warning" size={20} />
                  </div>
                  <span
                    className={
                      stats.avgTimeToHire < 30
                        ? 'text-success fw-bold fs-8'
                        : 'text-danger fw-bold fs-8'
                    }
                  >
                    {stats.avgTimeToHire < 30 ? (
                      <FaArrowDown className="me-1" />
                    ) : (
                      <FaArrowUp className="me-1" />
                    )}
                    {stats.avgTimeToHire < 30 ? '5d' : '3d'}
                  </span>
                </div>
                <h3 className="stat-value mb-1 fs-4">{stats.avgTimeToHire}</h3>
                <p className="stat-label text-muted mb-2 fs-8">Avg. Hire Time</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted fs-8">Response: {stats.avgResponseTime}d</span>
                  <Button
                    variant="link"
                    className="text-decoration-none p-0 fs-8"
                    onClick={() => navigate('/company/analytics/performance')}
                  >
                    Details <FaExternalLinkAlt className="ms-1" size={10} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>
      </Row>

      {/* Pipeline Stats - Compact */}
      <Row className="mb-3 mx-2 mx-md-0">
        <Col>
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-2">
                <h5 className="mb-0 d-flex align-items-center fs-6">
                  <FaChartArea className="me-2 text-primary" />
                  Recruitment Pipeline
                  <Badge bg="primary" className="ms-2 fs-8">
                    AI Powered
                  </Badge>
                </h5>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  {Object.entries(stats.pipelineStats).map(([stage, count], index) => {
                    const colors = [
                      { bg: 'primary', text: 'white', icon: <FaUserPlusSolid /> },
                      { bg: 'info', text: 'white', icon: <FaEye /> },
                      { bg: 'warning', text: 'dark', icon: <FaCalendarCheck /> },
                      { bg: 'success', text: 'white', icon: <FaUserCheckSolid /> },
                    ];
                    const color = colors[index] || { bg: 'secondary', text: 'white' };
                    const stageNames = {
                      new: 'New',
                      reviewed: 'Reviewed',
                      interview: 'Interview',
                      hired: 'Hired',
                    };

                    return (
                      <Col key={stage} xl={3} lg={3} md={6} sm={6} xs={12}>
                        <div className={`border-0 bg-${color.bg}-subtle rounded p-2 h-100`}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className={`rounded-circle p-1 bg-${color.bg} text-${color.text}`}
                              >
                                {React.cloneElement(color.icon, { size: 16 })}
                              </div>
                              <div>
                                <h6 className="mb-0 fs-7">{stageNames[stage]}</h6>
                                <h4 className="mb-0 mt-1">{count}</h4>
                              </div>
                            </div>
                            {index < 3 && <FaArrowRight className="text-muted" />}
                          </div>
                          {count > 0 && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="w-100 mt-2 fs-8"
                              onClick={() => navigate(`/company/applications?filter=${stage}`)}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-3 mx-2 mx-md-0">
        <Col>
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-2">
                <h5 className="mb-0 d-flex align-items-center fs-6">
                  <FaBolt className="me-2 text-warning" />
                  Quick Actions
                </h5>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  {primaryActions.map((action) => (
                    <Col key={action.id} xl={3} lg={3} md={6} sm={6} xs={12}>
                      <Button
                        variant={action.variant || 'outline-primary'}
                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2 border-0 shadow-sm"
                        onClick={() => handleQuickAction(action)}
                        size="sm"
                      >
                        <div className="mb-1" style={{ fontSize: '1.2rem' }}>
                          {action.icon}
                        </div>
                        <span className="fw-medium fs-7">{action.title}</span>
                        {action.badge &&
                          typeof action.badge === 'function' &&
                          action.badge() > 0 && (
                            <Badge bg="danger" className="position-absolute top-0 end-0 mt-1 me-1">
                              {action.badge()}
                            </Badge>
                          )}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-3 mx-2 mx-md-0">
        {/* Left Column - Applications & Jobs */}
        <Col xl={8} xs={12}>
          {/* Recent Applications */}
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-0 py-2">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <div>
                    <h5 className="mb-0 d-flex align-items-center fs-6">
                      <FaFileAlt className="me-2 text-primary" />
                      Recent Applications
                      {stats.pendingReviews > 0 && (
                        <Badge bg="danger" className="ms-2 fs-8">
                          {stats.pendingReviews} new
                        </Badge>
                      )}
                    </h5>
                  </div>
                  <div className="d-flex gap-1">
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center gap-1 fs-8"
                      >
                        <FaFilter /> Filter
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleFilterChange('all')}>All</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange('applied')}>
                          New
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleFilterChange('interview')}>
                          Interview
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center gap-1 fs-8"
                      >
                        <FaSortAmountDown /> Sort
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleSortChange('newest')}>
                          Newest
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('oldest')}>
                          Oldest
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleSortChange('match')}>
                          Best Match
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {dashboardData?.recentApplications?.length > 0 ? (
                  <ListGroup variant="flush">
                    {getFilteredApplications().slice(0, 5).map(renderApplicationRow)}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4">
                    <FaFileAlt className="text-muted mb-2" size={32} />
                    <h5 className="fs-6">No applications</h5>
                    <p className="text-muted mb-3 fs-7">
                      Post jobs to start receiving applications
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/company/jobs/create')}
                    >
                      <FaPlus className="me-2" /> Post a Job
                    </Button>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="bg-white border-0 py-2">
                <Button
                  variant="link"
                  className="text-decoration-none p-0 fs-7"
                  onClick={() => navigate('/company/applications')}
                >
                  View All Applications <FaExternalLinkAlt className="ms-2" />
                </Button>
              </Card.Footer>
            </Card>
          </DashboardErrorBoundary>

          {/* Active Jobs */}
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm mt-3">
              <Card.Header className="bg-white border-0 py-2">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                  <h5 className="mb-0 d-flex align-items-center fs-6">
                    <FaBriefcase className="me-2 text-primary" />
                    Active Jobs
                  </h5>
                  <div className="d-flex align-items-center gap-1">
                    <Badge bg="light" text="dark" className="fs-8">
                      {dashboardData?.jobListings?.length || 0} jobs
                    </Badge>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => navigate('/company/jobs/create')}
                    >
                      <FaPlus /> New
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {dashboardData?.jobListings?.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="fs-8">Position</th>
                          <th className="fs-8">Apps</th>
                          <th className="fs-8">Status</th>
                          <th className="fs-8">Posted</th>
                          <th className="fs-8"></th>
                        </tr>
                      </thead>
                      <tbody>{dashboardData.jobListings.slice(0, 5).map(renderJobRow)}</tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaBriefcase className="text-muted mb-2" size={32} />
                    <h5 className="fs-6">No active jobs</h5>
                    <p className="text-muted mb-3 fs-7">Create your first job posting</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/company/jobs/create')}
                    >
                      <FaPlus className="me-2" /> Create Job
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>

        {/* Right Column - Sidebar */}
        <Col xl={4} xs={12}>
          {/* Followers */}
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header className="bg-white border-0 py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center fs-6">
                    <FaUserFriends className="me-2 text-success" />
                    Followers
                  </h5>
                  <Badge bg="success" className="fs-8">
                    {stats.totalFollowers}
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {stats.totalFollowers > 0 ? (
                  <div>
                    <div className="text-center mb-3">
                      <div className="display-6">{stats.totalFollowers}</div>
                      <p className="text-muted fs-8">Students following</p>
                    </div>
                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-success"
                        onClick={() => navigate('/company/followers')}
                        size="sm"
                      >
                        <FaUserFriends className="me-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <FaUserFriends className="text-muted mb-2" size={32} />
                    <h5 className="fs-6">No followers</h5>
                    <p className="text-muted mb-3 fs-7">Improve your company profile</p>
                    <Button
                      variant="outline-success"
                      onClick={() => navigate('/company/profile')}
                      size="sm"
                    >
                      Complete Profile
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>

          {/* Quick Links */}
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header className="bg-white border-0 py-2">
                <h5 className="mb-0 d-flex align-items-center fs-6">
                  <FaCog className="me-2 text-info" />
                  Quick Links
                </h5>
              </Card.Header>
              <Card.Body className="p-2">
                <Row className="g-2">
                  {secondaryActions.map((action) => (
                    <Col key={action.id} lg={6} md={6} sm={6} xs={6}>
                      <Button
                        variant="light"
                        className="w-100 d-flex flex-column align-items-center justify-content-center p-2 text-center"
                        onClick={() => handleQuickAction(action)}
                        size="sm"
                      >
                        <div className="mb-1">{React.cloneElement(action.icon, { size: 20 })}</div>
                        <span className="fs-8">{action.title}</span>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>

          {/* News */}
          <DashboardErrorBoundary>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 d-flex align-items-center fs-6">
                    <FaNewspaper className="me-2 text-info" />
                    News
                  </h5>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={fetchNews}
                    disabled={newsLoading || !isOnline}
                    className="p-0"
                  >
                    <FaSync className={newsLoading ? 'fa-spin' : ''} size={12} />
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {newsLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 mb-0 fs-8">Loading news...</p>
                  </div>
                ) : news.business.length > 0 ? (
                  <div>
                    {news.business.slice(0, 3).map((article, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 border-bottom hover-lift cursor-pointer"
                        onClick={() => window.open(article.url, '_blank')}
                      >
                        <h6 className="mb-1 fs-7 line-clamp-2">{article.title}</h6>
                        <div className="d-flex align-items-center text-muted fs-8">
                          <FaRegClock className="me-1" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <FaNewspaper className="text-muted mb-2" size={24} />
                    <p className="mb-0 text-muted fs-8">No news available</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </DashboardErrorBoundary>
        </Col>
      </Row>

      {/* Welcome Alert */}
      {(!dashboardData?.company?.name || dashboardData.company.name === '') && (
        <Alert variant="info" className="mt-3 mx-2 mx-md-0 border-0 shadow-sm"></Alert>
      )}

      {/* Upload Logo Modal */}
      <Modal show={showUploadLogoModal} onHide={() => setShowUploadLogoModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center gap-2 fs-6">
            <FaCamera className="text-primary" />
            Upload Logo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <div
              className="logo-upload-area border rounded p-3 mb-2 cursor-pointer"
              onClick={() => document.getElementById('logo-upload').click()}
              style={{
                borderStyle: 'dashed',
                minHeight: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {logoPreview ? (
                <div>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '120px' }}
                  />
                  <p className="mt-2 mb-0 text-muted fs-8">Click to change</p>
                </div>
              ) : (
                <div>
                  <FaCloudUploadAlt className="text-muted mb-2" size={32} />
                  <p className="mb-1 fs-7">Click to upload</p>
                  <p className="text-muted fs-8 mb-0">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="d-none"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowUploadLogoModal(false)} size="sm">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleLogoUpload}
            disabled={!logoFile || uploadingLogo || !isOnline}
            className="d-flex align-items-center gap-2"
            size="sm"
          >
            {uploadingLogo ? (
              <>
                <Spinner animation="border" size="sm" /> Uploading...
              </>
            ) : (
              <>
                <FaUpload /> Upload
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyDashboard;
