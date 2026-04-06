/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import {
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaFileAlt,
  FaCalendar,
  FaDownload,
  FaFilter,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const SystemReports = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('month');

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getDashboardStats(currentUser, userProfile);

      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // In a real app, you would fetch data for the selected range
    loadReports();
  };

  const handleExport = (format) => {
    alert(`Exporting reports in ${format} format...`);
    // In a real app, implement export functionality
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="system-reports">
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">
            <FaChartLine className="me-2" />
            System Reports & Analytics
          </h4>
          <p className="text-muted mb-0">Comprehensive platform analytics and reporting</p>
        </Card.Header>
        <Card.Body>
          {/* Date Range Selector */}
          <div className="d-flex justify-content-between mb-4">
            <div className="btn-group">
              <Button
                variant={dateRange === 'day' ? 'primary' : 'outline-primary'}
                onClick={() => handleDateRangeChange('day')}
              >
                Today
              </Button>
              <Button
                variant={dateRange === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => handleDateRangeChange('week')}
              >
                This Week
              </Button>
              <Button
                variant={dateRange === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => handleDateRangeChange('month')}
              >
                This Month
              </Button>
              <Button
                variant={dateRange === 'year' ? 'primary' : 'outline-primary'}
                onClick={() => handleDateRangeChange('year')}
              >
                This Year
              </Button>
            </div>

            <div className="btn-group">
              <Button variant="outline-success" onClick={() => handleExport('pdf')}>
                <FaDownload className="me-2" />
                Export PDF
              </Button>
              <Button variant="outline-info" onClick={() => handleExport('excel')}>
                <FaDownload className="me-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : stats ? (
            <>
              {/* Key Metrics */}
              <Row className="mb-4">
                <Col md={3} sm={6} className="mb-3">
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaUsers className="display-6 text-primary mb-2" />
                      <h3>{formatNumber(stats.userStats?.total)}</h3>
                      <p className="text-muted mb-0">Total Users</p>
                      <Badge bg="success" className="mt-2">
                        +{stats.recentRegistrations} new
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaBuilding className="display-6 text-info mb-2" />
                      <h3>{formatNumber(stats.summary?.activeCompanies)}</h3>
                      <p className="text-muted mb-0">Companies</p>
                      <Badge bg="info" className="mt-2">
                        {formatNumber(stats.userStats?.byType?.company || 0)} registered
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaBriefcase className="display-6 text-warning mb-2" />
                      <h3>{formatNumber(stats.summary?.activeJobs)}</h3>
                      <p className="text-muted mb-0">Active Jobs</p>
                      <Badge bg="warning" className="mt-2">
                        {formatNumber(stats.collectionCounts?.jobs)} total
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} sm={6} className="mb-3">
                  <Card className="text-center h-100">
                    <Card.Body>
                      <FaFileAlt className="display-6 text-success mb-2" />
                      <h3>{formatNumber(stats.collectionCounts?.applications)}</h3>
                      <p className="text-muted mb-0">Applications</p>
                      <Badge bg="success" className="mt-2">
                        Active
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* User Breakdown */}
              <Card className="mb-4">
                <Card.Header>
                  <h6 className="mb-0">
                    <FaUsers className="me-2" />
                    User Distribution
                  </h6>
                </Card.Header>
                <Card.Body>
                  <Table hover>
                    <thead>
                      <tr>
                        <th>User Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.userStats?.byType &&
                        Object.entries(stats.userStats.byType).map(([type, count]) => {
                          const percentage =
                            stats.userStats.total > 0
                              ? ((count / stats.userStats.total) * 100).toFixed(1)
                              : '0.0';

                          return (
                            <tr key={type}>
                              <td>
                                <Badge bg="info" className="text-capitalize">
                                  {type}
                                </Badge>
                              </td>
                              <td className="fw-bold">{count}</td>
                              <td>{percentage}%</td>
                              <td>
                                <Badge bg="success">Active</Badge>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* Platform Statistics */}
              <Row>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">
                        <FaCalendar className="me-2" />
                        Platform Statistics
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="platform-stats">
                        <div className="stat-item d-flex justify-content-between mb-3">
                          <span>Total Users</span>
                          <span className="fw-bold">{formatNumber(stats.userStats?.total)}</span>
                        </div>
                        <div className="stat-item d-flex justify-content-between mb-3">
                          <span>Pending Approvals</span>
                          <span className="fw-bold text-warning">
                            {formatNumber(stats.userStats?.pending)}
                          </span>
                        </div>
                        <div className="stat-item d-flex justify-content-between mb-3">
                          <span>Active Companies</span>
                          <span className="fw-bold">
                            {formatNumber(stats.summary?.activeCompanies)}
                          </span>
                        </div>
                        <div className="stat-item d-flex justify-content-between mb-3">
                          <span>Active Jobs</span>
                          <span className="fw-bold">{formatNumber(stats.summary?.activeJobs)}</span>
                        </div>
                        <div className="stat-item d-flex justify-content-between mb-3">
                          <span>New Registrations (7 days)</span>
                          <span className="fw-bold text-success">
                            {formatNumber(stats.recentRegistrations)}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">
                        <FaChartLine className="me-2" />
                        Recent Activities
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      {stats.recentActivities?.length > 0 ? (
                        <div className="activity-list">
                          {stats.recentActivities.slice(0, 5).map((activity, index) => (
                            <div key={index} className="activity-item mb-3">
                              <div className="small text-muted">
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                              <div className="small">
                                {activity.description || 'System activity'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <p className="text-muted">No recent activities</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info" className="text-center">
              No report data available
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SystemReports;
