/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Badge,
  ProgressBar,
  Table,
  Container,
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

// Icons
import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaChartLine,
  FaUserCheck,
  FaUserClock,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    pendingApprovals: 0,
    newRegistrations: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[AdminDashboard] Fetching dashboard data...');

      const response = await adminService.getDashboardStats(currentUser, userProfile);

      if (response.success) {
        setStats(response.data);

        setQuickStats({
          totalUsers: response.data.userStats?.total || 0,
          activeJobs: response.data.summary?.activeJobs || 0,
          pendingApprovals: response.data.userStats?.pending || 0,
          newRegistrations: response.data.recentRegistrations || 0,
        });
      } else {
        setError(response.error || 'Failed to load dashboard stats');
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching data:', err);
      setError(err.message || 'An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser, userProfile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await adminService.users.approveUser(userId, currentUser, userProfile);
      if (response.success) {
        fetchDashboardData();
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error approving user:', err);
      setError(err.message);
    }
  };

  const handleViewAllPending = () => {
    navigate('/admin/pending-approvals');
  };

  const handleViewAllUsers = () => {
    navigate('/admin/users');
  };

  const handleViewAllCompanies = () => {
    navigate('/admin/companies');
  };

  const handleViewAllJobs = () => {
    navigate('/admin/jobs');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'suspended':
        return <Badge bg="danger">Suspended</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="admin-dashboard-loading">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="dashboard-title">
              <FaChartLine className="me-2" />
              Admin Dashboard
            </h1>
            <p className="dashboard-subtitle text-muted">
              Welcome back, {userProfile?.displayName || 'Administrator'}
            </p>
          </div>
          <Button variant="outline-primary" onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={refreshing ? 'fa-spin' : ''} />
            <span className="ms-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="stat-card users-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stat-label text-muted">Total Users</h6>
                  <h2 className="stat-value">{quickStats.totalUsers}</h2>
                  <div className="stat-change text-success">
                    <FaArrowUp className="me-1" />
                    <span>{quickStats.newRegistrations} new this week</span>
                  </div>
                </div>
                <div className="stat-icon">
                  <FaUsers />
                </div>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-3 w-100"
                onClick={handleViewAllUsers}
              >
                <FaEye className="me-1" />
                View All Users
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="stat-card companies-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stat-label text-muted">Companies</h6>
                  <h2 className="stat-value">{stats?.summary?.activeCompanies || 0}</h2>
                  <div className="stat-change text-info">
                    <span>{stats?.userStats?.byType?.company || 0} registered</span>
                  </div>
                </div>
                <div className="stat-icon">
                  <FaBuilding />
                </div>
              </div>
              <Button
                variant="outline-info"
                size="sm"
                className="mt-3 w-100"
                onClick={handleViewAllCompanies}
              >
                <FaEye className="me-1" />
                Manage Companies
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="stat-card jobs-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stat-label text-muted">Active Jobs</h6>
                  <h2 className="stat-value">{quickStats.activeJobs}</h2>
                  <div className="stat-change text-warning">
                    <span>Need approval: {stats?.collectionCounts?.jobs || 0}</span>
                  </div>
                </div>
                <div className="stat-icon">
                  <FaBriefcase />
                </div>
              </div>
              <Button
                variant="outline-warning"
                size="sm"
                className="mt-3 w-100"
                onClick={handleViewAllJobs}
              >
                <FaEye className="me-1" />
                Review Jobs
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12} className="mb-4">
          <Card className="stat-card pending-card h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="stat-label text-muted">Pending Approvals</h6>
                  <h2 className="stat-value">{quickStats.pendingApprovals}</h2>
                  <div className="stat-change text-danger">
                    <FaExclamationTriangle className="me-1" />
                    <span>Action Required</span>
                  </div>
                </div>
                <div className="stat-icon">
                  <FaUserClock />
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                className="mt-3 w-100"
                onClick={handleViewAllPending}
              >
                <FaEye className="me-1" />
                Review Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        {/* Left Column - Pending Approvals */}
        <Col lg={8} className="mb-4">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaUserClock className="me-2 text-warning" />
                Pending Approvals
              </h5>
              <Badge bg="warning" pill>
                {stats?.pendingApprovals?.length || 0}
              </Badge>
            </Card.Header>
            <Card.Body>
              {stats?.pendingApprovals?.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Type</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.pendingApprovals.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div>
                                <strong>{user.displayName || user.email}</strong>
                                <div className="text-muted small">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="info">{user.userType || 'N/A'}</Badge>
                          </td>
                          <td>
                            <span className="small">{formatDate(user.createdAt)}</span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleApproveUser(user.id)}
                              >
                                <FaCheckCircle className="me-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => navigate(`/admin/users/${user.id}`)}
                              >
                                <FaTimesCircle className="me-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="success" className="mb-0">
                  <FaUserCheck className="me-2" />
                  No pending approvals! All users are approved.
                </Alert>
              )}
              <div className="text-center mt-3">
                <Button variant="outline-primary" onClick={handleViewAllPending}>
                  View All Pending Approvals
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaChartLine className="me-2 text-info" />
                Recent System Activities
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.recentActivities?.length > 0 ? (
                <div className="activity-timeline">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <FaChartLine className="text-primary" />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.description || 'Activity'}</div>
                        <div className="activity-meta">
                          <span className="text-muted">{formatDate(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  No recent activities found.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - User Breakdown & Quick Actions */}
        <Col lg={4} className="mb-4">
          {/* User Breakdown */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUsers className="me-2 text-primary" />
                User Breakdown
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.userStats?.byType && Object.keys(stats.userStats.byType).length > 0 ? (
                <>
                  {Object.entries(stats.userStats.byType).map(([type, count]) => {
                    const percentage =
                      stats.userStats.total > 0 ? (count / stats.userStats.total) * 100 : 0;
                    return (
                      <div key={type} className="user-type-item mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-capitalize">{type}</span>
                          <span className="fw-bold">{count}</span>
                        </div>
                        <ProgressBar
                          now={percentage}
                          variant="primary"
                          className="user-progress"
                          label={`${Math.round(percentage)}%`}
                        />
                      </div>
                    );
                  })}
                  <div className="text-center mt-3">
                    <small className="text-muted">Total Users: {stats.userStats.total}</small>
                  </div>
                </>
              ) : (
                <Alert variant="info" className="mb-0">
                  No user data available.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaBriefcase className="me-2 text-success" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-actions-grid">
                <Button
                  variant="outline-primary"
                  className="action-btn"
                  onClick={() => navigate('/admin/users')}
                >
                  <FaUsers className="me-2" />
                  Manage Users
                </Button>

                <Button
                  variant="outline-info"
                  className="action-btn"
                  onClick={() => navigate('/admin/companies')}
                >
                  <FaBuilding className="me-2" />
                  Manage Companies
                </Button>

                <Button
                  variant="outline-warning"
                  className="action-btn"
                  onClick={() => navigate('/admin/jobs')}
                >
                  <FaBriefcase className="me-2" />
                  Review Jobs
                </Button>

                <Button
                  variant="outline-danger"
                  className="action-btn"
                  onClick={() => navigate('/admin/pending-approvals')}
                >
                  <FaUserClock className="me-2" />
                  Pending Approvals
                </Button>

                <Button
                  variant="outline-success"
                  className="action-btn"
                  onClick={() => navigate('/admin/settings')}
                >
                  <FaChartLine className="me-2" />
                  System Settings
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* System Status */}
          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaChartLine className="me-2 text-secondary" />
                System Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="system-status">
                <div className="status-item mb-2">
                  <span className="status-label">Database</span>
                  <Badge bg="success">Online</Badge>
                </div>
                <div className="status-item mb-2">
                  <span className="status-label">Last Updated</span>
                  <span className="status-value">
                    {stats?.timestamp ? formatDate(stats.timestamp) : 'N/A'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Uptime</span>
                  <Badge bg="info">99.9%</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
