/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Dropdown,
  Form,
  Spinner,
  Alert,
  Table,
  Badge,
  ProgressBar,
  Tabs,
  Tab,
  ListGroup,
} from 'react-bootstrap';
import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaBriefcase,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaMoneyBillWave,
  FaPercentage,
  FaCalendar,
  FaRegChartBar,
  FaUserCheck,
  FaHistory,
  FaDollarSign,
  FaRegClock,
  FaIndustry,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { companyFirebaseService } from '../../services/companyServices';

// Simple custom chart components to avoid Recharts issues
const SimpleLineChart = ({ data, height = 300 }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scales
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find max value
    const maxValue = Math.max(
      ...data.map((d) => Math.max(d.applications || 0, d.interviews || 0, d.hires || 0))
    );

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStep = chartWidth / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * xStep;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw lines
    const drawLine = (dataKey, color) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      data.forEach((point, i) => {
        const x = padding + i * xStep;
        const y = padding + chartHeight - ((point[dataKey] || 0) / maxValue) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    drawLine('applications', '#3498db');
    drawLine('interviews', '#f39c12');
    drawLine('hires', '#27ae60');

    // Draw points
    data.forEach((point, i) => {
      const x = padding + i * xStep;

      ['applications', 'interviews', 'hires'].forEach((dataKey, idx) => {
        const colors = ['#3498db', '#f39c12', '#27ae60'];
        const y = padding + chartHeight - ((point[dataKey] || 0) / maxValue) * chartHeight;

        ctx.beginPath();
        ctx.fillStyle = colors[idx];
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    data.forEach((point, i) => {
      const x = padding + i * xStep;
      ctx.fillText(point.name || `Week ${i + 1}`, x, canvas.height - 10);
    });

    // Draw Y axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= gridLines; i++) {
      const value = Math.round((maxValue / gridLines) * i);
      const y = padding + chartHeight - (chartHeight / gridLines) * i;
      ctx.fillText(value.toString(), padding - 5, y + 4);
    }
  }, [data, dimensions]);

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '3px', backgroundColor: '#3498db' }}></div>
          <span style={{ fontSize: '12px' }}>Applications</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '3px', backgroundColor: '#f39c12' }}></div>
          <span style={{ fontSize: '12px' }}>Interviews</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '3px', backgroundColor: '#27ae60' }}></div>
          <span style={{ fontSize: '12px' }}>Hires</span>
        </div>
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, height = 250 }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Calculate total
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);

    // Draw pie chart
    let startAngle = 0;

    data.forEach((item, i) => {
      const sliceAngle = 2 * Math.PI * (item.value / total);

      ctx.beginPath();
      ctx.fillStyle = item.color || `hsl(${i * 60}, 70%, 60%)`;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const angle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY);

      startAngle += sliceAngle;
    });

    // Draw legend
    const legendX = 20;
    let legendY = 20;

    data.forEach((item, i) => {
      ctx.fillStyle = item.color || `hsl(${i * 60}, 70%, 60%)`;
      ctx.fillRect(legendX, legendY, 15, 15);

      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${item.name}: ${item.value}`, legendX + 20, legendY);

      legendY += 20;
    });
  }, [data, dimensions]);

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const SimpleBarChart = ({ data, height = 300 }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!canvasRef.current || !dimensions.width || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const barWidth = (chartWidth / data.length) * 0.6;

    // Find max value
    const maxValue = Math.max(...data.map((d) => Math.max(d.applications || 0, d.hires || 0)));

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw bars
    data.forEach((item, i) => {
      const x = padding.left + (chartWidth / data.length) * i + (chartWidth / data.length) * 0.2;

      // Applications bar
      const appHeight = ((item.applications || 0) / maxValue) * chartHeight;
      ctx.fillStyle = '#3498db';
      ctx.fillRect(x, padding.top + chartHeight - appHeight, barWidth / 2, appHeight);

      // Hires bar
      const hireHeight = ((item.hires || 0) / maxValue) * chartHeight;
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(
        x + barWidth / 2,
        padding.top + chartHeight - hireHeight,
        barWidth / 2,
        hireHeight
      );

      // Draw label
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.source, x + barWidth / 2, canvas.height - padding.bottom + 20);
    });

    // Draw Y axis labels
    ctx.textAlign = 'right';
    ctx.fillStyle = '#333';
    for (let i = 0; i <= gridLines; i++) {
      const value = Math.round((maxValue / gridLines) * i);
      const y = padding.top + chartHeight - (chartHeight / gridLines) * i;
      ctx.fillText(value.toString(), padding.left - 5, y + 4);
    }

    // Draw legend
    ctx.fillStyle = '#3498db';
    ctx.fillRect(padding.left, 10, 15, 15);
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText('Applications', padding.left + 20, 10);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(padding.left + 100, 10, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Hires', padding.left + 120, 10);
  }, [data, dimensions]);

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const ViewAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const STATUS_COLORS = {
    applied: '#3498db',
    reviewed: '#f39c12',
    interview: '#9b59b6',
    hired: '#27ae60',
    rejected: '#e74c3c',
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await companyFirebaseService.getCompanyAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      setExportLoading(true);
      // In a real app, this would generate and download the file
      console.log(`Exporting data in ${format} format...`);

      // Simulate export
      setTimeout(() => {
        setExportLoading(false);
        // Create a success alert
        const successAlert = document.createElement('div');
        successAlert.className =
          'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        successAlert.style.zIndex = '9999';
        successAlert.innerHTML = `
          <strong>Success!</strong> Data exported successfully as ${format.toUpperCase()} file.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successAlert);

        // Auto remove after 3 seconds
        setTimeout(() => {
          successAlert.remove();
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusDistributionData = () => {
    if (!analyticsData?.stats?.applicationStatus) {
      // Return sample data
      return [
        { name: 'Applied', value: 45, color: '#3498db' },
        { name: 'Reviewed', value: 30, color: '#f39c12' },
        { name: 'Interview', value: 15, color: '#9b59b6' },
        { name: 'Hired', value: 10, color: '#27ae60' },
      ];
    }

    const { applicationStatus } = analyticsData.stats;
    return Object.entries(applicationStatus).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status],
    }));
  };

  const getConversionFunnelData = () => {
    if (!analyticsData?.stats?.applicationStatus) {
      return [
        { stage: 'Applied', count: 100, color: '#3498db' },
        { stage: 'Reviewed', count: 60, color: '#f39c12' },
        { stage: 'Interview', count: 25, color: '#9b59b6' },
        { stage: 'Hired', count: 10, color: '#27ae60' },
      ];
    }

    const { applicationStatus } = analyticsData.stats;
    return [
      { stage: 'Applied', count: applicationStatus.applied || 0, color: '#3498db' },
      { stage: 'Reviewed', count: applicationStatus.reviewed || 0, color: '#f39c12' },
      { stage: 'Interview', count: applicationStatus.interview || 0, color: '#9b59b6' },
      { stage: 'Hired', count: applicationStatus.hired || 0, color: '#27ae60' },
    ];
  };

  const getTopJobsData = () => {
    if (!analyticsData?.jobs) {
      return [
        { name: 'Senior Software Engineer', applications: 45, views: 320, conversion: 14 },
        { name: 'Product Manager', applications: 32, views: 280, conversion: 11 },
        { name: 'UX Designer', applications: 28, views: 210, conversion: 13 },
        { name: 'Marketing Intern', applications: 25, views: 180, conversion: 14 },
        { name: 'DevOps Engineer', applications: 18, views: 150, conversion: 12 },
      ];
    }

    return analyticsData.jobs
      .sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0))
      .slice(0, 5)
      .map((job) => ({
        name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
        applications: job.applicantsCount || 0,
        views: job.views || 0,
        conversion:
          job.applicantsCount > 0
            ? Math.round(((job.applicantsCount || 0) / (job.views || 1)) * 100)
            : 0,
      }));
  };

  // Sample data for charts
  const getSampleLineData = () => {
    return [
      { name: 'Week 1', applications: 45, interviews: 12, hires: 3 },
      { name: 'Week 2', applications: 52, interviews: 15, hires: 4 },
      { name: 'Week 3', applications: 38, interviews: 10, hires: 2 },
      { name: 'Week 4', applications: 61, interviews: 18, hires: 5 },
    ];
  };

  const getSampleBarData = () => {
    return [
      { source: 'CareerConnect', applications: 45, hires: 8 },
      { source: 'LinkedIn', applications: 32, hires: 5 },
      { source: 'Company Website', applications: 28, hires: 4 },
      { source: 'Referrals', applications: 18, hires: 6 },
      { source: 'Other', applications: 12, hires: 1 },
    ];
  };

  if (loading && !analyticsData) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-2">
                <FaChartBar className="me-2 text-primary" />
                Company Analytics
              </h1>
              <p className="text-muted mb-0">
                Insights and performance metrics for your recruitment activities
              </p>
            </div>
            <div className="d-flex gap-2">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  className="d-flex align-items-center gap-2"
                >
                  <FaCalendar className="me-1" />
                  {timeRange === 'week'
                    ? 'Last 7 Days'
                    : timeRange === 'month'
                      ? 'Last 30 Days'
                      : timeRange === 'quarter'
                        ? 'Last 90 Days'
                        : 'Last 365 Days'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setTimeRange('week')}>Last 7 Days</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange('month')}>Last 30 Days</Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange('quarter')}>
                    Last 90 Days
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setTimeRange('year')}>Last 365 Days</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle
                  variant="primary"
                  className="d-flex align-items-center gap-2"
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FaDownload className="me-1" /> Export
                    </>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleExportData('csv')}>
                    Export as CSV
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleExportData('pdf')}>
                    Export as PDF
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleExportData('excel')}>
                    Export as Excel
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">Total Applications</h6>
                  <h2 className="mb-0">
                    {formatNumber(analyticsData?.stats?.totalApplications || 120)}
                  </h2>
                  <div className="d-flex align-items-center mt-2">
                    <FaArrowUp className="text-success me-1" />
                    <span className="text-success small">12% increase</span>
                  </div>
                </div>
                <div className="bg-primary-light rounded-circle p-3">
                  <FaUsers className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">Active Jobs</h6>
                  <h2 className="mb-0">{formatNumber(analyticsData?.stats?.activeJobs || 8)}</h2>
                  <div className="d-flex align-items-center mt-2">
                    <FaArrowUp className="text-success me-1" />
                    <span className="text-success small">5% increase</span>
                  </div>
                </div>
                <div className="bg-success-light rounded-circle p-3">
                  <FaBriefcase className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">Hire Rate</h6>
                  <h2 className="mb-0">
                    {analyticsData?.stats?.conversionRates?.overallConversion || 15}%
                  </h2>
                  <div className="d-flex align-items-center mt-2">
                    <FaArrowUp className="text-success me-1" />
                    <span className="text-success small">8% increase</span>
                  </div>
                </div>
                <div className="bg-warning-light rounded-circle p-3">
                  <FaPercentage className="text-warning" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} sm={12} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-2">Avg. Time to Hire</h6>
                  <h2 className="mb-0">{analyticsData?.stats?.timeMetrics?.avgTimeToHire || 28}</h2>
                  <div className="d-flex align-items-center mt-2">
                    <FaArrowDown className="text-success me-1" />
                    <span className="text-success small">2 days less</span>
                  </div>
                </div>
                <div className="bg-info-light rounded-circle p-3">
                  <FaClock className="text-info" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different analytics views */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          <Row className="mt-3">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">
                    <FaChartLine className="me-2" />
                    Application Trends
                  </h5>
                </Card.Header>
                <Card.Body>
                  <SimpleLineChart
                    data={analyticsData?.timeSeriesData?.datasets?.[0]?.data || getSampleLineData()}
                    height={300}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">
                    <FaChartPie className="me-2" />
                    Application Status Distribution
                  </h5>
                </Card.Header>
                <Card.Body>
                  <SimplePieChart data={getStatusDistributionData()} height={250} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">
                    <FaRegChartBar className="me-2" />
                    Conversion Funnel
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="conversion-funnel">
                    {getConversionFunnelData().map((stage, index) => {
                      const total = getConversionFunnelData()[0]?.count || 100;
                      return (
                        <div key={stage.stage} className="funnel-stage mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-medium">{stage.stage}</span>
                            <span className="fw-bold">{stage.count}</span>
                          </div>
                          <ProgressBar
                            now={(stage.count / total) * 100}
                            variant={
                              stage.stage === 'Applied'
                                ? 'primary'
                                : stage.stage === 'Reviewed'
                                  ? 'info'
                                  : stage.stage === 'Interview'
                                    ? 'warning'
                                    : 'success'
                            }
                            style={{ height: '20px' }}
                          />
                          {index < getConversionFunnelData().length - 1 && (
                            <div className="text-end small text-muted mt-1">
                              {getConversionFunnelData()[index].count > 0
                                ? Math.round(
                                    (getConversionFunnelData()[index + 1].count /
                                      getConversionFunnelData()[index].count) *
                                      100
                                  )
                                : 0}
                              % conversion to {getConversionFunnelData()[index + 1].stage}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">
                    <FaChartLine className="me-2" />
                    Top Performing Jobs
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Applications</th>
                          <th>Views</th>
                          <th>Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getTopJobsData().map((job, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  <span className="badge bg-primary">{index + 1}</span>
                                </div>
                                <span>{job.name}</span>
                              </div>
                            </td>
                            <td>
                              <Badge bg="info" className="px-3 py-1">
                                {job.applications}
                              </Badge>
                            </td>
                            <td>{formatNumber(job.views)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-2">{job.conversion}%</span>
                                <ProgressBar
                                  now={job.conversion}
                                  variant={
                                    job.conversion > 50
                                      ? 'success'
                                      : job.conversion > 30
                                        ? 'warning'
                                        : 'danger'
                                  }
                                  style={{ width: '60px', height: '6px' }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="performance" title="Performance">
          <Row className="mt-3">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">Recruitment Metrics</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 py-3">
                      <div>
                        <FaUserCheck className="text-primary me-2" />
                        <span>Interview to Hire Rate</span>
                      </div>
                      <Badge bg="primary" className="px-3 py-2 fs-6">
                        {analyticsData?.stats?.conversionRates?.interviewToHire || 25}%
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 py-3">
                      <div>
                        <FaRegClock className="text-warning me-2" />
                        <span>Average Response Time</span>
                      </div>
                      <Badge bg="warning" className="px-3 py-2 fs-6">
                        {analyticsData?.stats?.timeMetrics?.avgResponseTime || 2.5} days
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 py-3">
                      <div>
                        <FaCheckCircle className="text-success me-2" />
                        <span>Quality of Hire</span>
                      </div>
                      <Badge bg="success" className="px-3 py-2 fs-6">
                        4.5/5.0
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center border-0 py-3">
                      <div>
                        <FaDollarSign className="text-info me-2" />
                        <span>Cost per Hire</span>
                      </div>
                      <Badge bg="info" className="px-3 py-2 fs-6">
                        M1,250
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">Source Performance</h5>
                </Card.Header>
                <Card.Body>
                  <SimpleBarChart data={getSampleBarData()} height={300} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="candidates" title="Candidates">
          <Row className="mt-3">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">Candidate Demographics</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col lg={4}>
                      <Card className="border h-100">
                        <Card.Body className="text-center">
                          <FaMapMarkerAlt className="text-primary mb-3" size={32} />
                          <h4>Location Distribution</h4>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between border-0">
                              <span>Maseru</span>
                              <Badge bg="primary">42%</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between border-0">
                              <span>Leribe</span>
                              <Badge bg="primary">18%</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between border-0">
                              <span>Berea</span>
                              <Badge bg="primary">15%</Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between border-0">
                              <span>Other</span>
                              <Badge bg="primary">25%</Badge>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4}>
                      <Card className="border h-100">
                        <Card.Body className="text-center">
                          <FaIndustry className="text-success mb-3" size={32} />
                          <h4>Education Level</h4>
                          <SimplePieChart
                            data={[
                              { name: 'Bachelors', value: 45, color: '#0088FE' },
                              { name: 'Masters', value: 25, color: '#00C49F' },
                              { name: 'Diploma', value: 20, color: '#FFBB28' },
                              { name: 'Other', value: 10, color: '#FF8042' },
                            ]}
                            height={200}
                          />
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4}>
                      <Card className="border h-100">
                        <Card.Body className="text-center">
                          <FaHistory className="text-warning mb-3" size={32} />
                          <h4>Experience Level</h4>
                          <div className="experience-bars mt-4">
                            {[
                              { level: 'Entry Level', percentage: 35 },
                              { level: 'Junior', percentage: 40 },
                              { level: 'Mid Level', percentage: 18 },
                              { level: 'Senior', percentage: 7 },
                            ].map((item) => (
                              <div key={item.level} className="mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                  <span>{item.level}</span>
                                  <span>{item.percentage}%</span>
                                </div>
                                <ProgressBar
                                  now={item.percentage}
                                  variant={
                                    item.percentage > 30
                                      ? 'success'
                                      : item.percentage > 20
                                        ? 'info'
                                        : item.percentage > 10
                                          ? 'warning'
                                          : 'danger'
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Recommendations */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0 d-flex align-items-center">
                <FaChartBar className="me-2 text-primary" />
                AI-Powered Recommendations
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Alert variant="info" className="h-100">
                    <h6>
                      <FaArrowUp className="me-2" />
                      Improve Response Time
                    </h6>
                    <p className="mb-0 small">
                      Average response time is 2.5 days. Aim for 1 day to improve candidate
                      experience.
                    </p>
                  </Alert>
                </Col>
                <Col md={4}>
                  <Alert variant="success" className="h-100">
                    <h6>
                      <FaMoneyBillWave className="me-2" />
                      Reduce Cost per Hire
                    </h6>
                    <p className="mb-0 small">
                      Consider focusing on CareerConnect platform which has higher conversion rates.
                    </p>
                  </Alert>
                </Col>
                <Col md={4}>
                  <Alert variant="warning" className="h-100">
                    <h6>
                      <FaCalendarAlt className="me-2" />
                      Optimize Interview Process
                    </h6>
                    <p className="mb-0 small">
                      Interview to hire rate is 25%. Consider improving interview assessment
                      methods.
                    </p>
                  </Alert>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewAnalytics;
