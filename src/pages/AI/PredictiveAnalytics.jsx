import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function PredictiveAnalytics() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      // Sample insights data
      setInsights([
        {
          id: 1,
          title: 'Market Growth',
          value: '+24%',
          description: 'Projected market growth in your sector',
          trend: 'up',
        },
        {
          id: 2,
          title: 'Competition Level',
          value: 'Medium',
          description: 'Current competitive landscape',
          trend: 'stable',
        },
        {
          id: 3,
          title: 'Customer Demand',
          value: 'High',
          description: 'Current customer demand for your offerings',
          trend: 'up',
        },
        {
          id: 4,
          title: 'Risk Level',
          value: 'Low',
          description: 'Overall business risk assessment',
          trend: 'down',
        },
      ]);

      // Sample chart data
      setChartData([
        { month: 'Jan', revenue: 4000, customers: 2400 },
        { month: 'Feb', revenue: 3000, customers: 1398 },
        { month: 'Mar', revenue: 2000, customers: 9800 },
        { month: 'Apr', revenue: 2780, customers: 3908 },
        { month: 'May', revenue: 1890, customers: 4800 },
        { month: 'Jun', revenue: 2390, customers: 3800 },
        { month: 'Jul', revenue: 3490, customers: 4300 },
      ]);

      // Sample prediction data
      setPredictionData([
        { category: 'Success Probability', value: 78 },
        { category: 'Market Fit', value: 85 },
        { category: 'Financial Viability', value: 72 },
        { category: 'Growth Potential', value: 90 },
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading AI Predictive Analytics...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">Predictive Analytics</h1>
          <p className="text-muted mb-0">Predict market trends and business performance</p>
        </div>
        <Button variant="primary">Generate New Report</Button>
      </div>

      {/* AI Insights Cards */}
      <Row className="mb-4">
        {insights.map((insight) => (
          <Col md={3} key={insight.id}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title className="h6 text-muted">{insight.title}</Card.Title>
                    <h3 className="fw-bold mt-2">{insight.value}</h3>
                  </div>
                  <span
                    className={`badge ${insight.trend === 'up' ? 'bg-success' : insight.trend === 'down' ? 'bg-danger' : 'bg-warning'}`}
                  >
                    {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '↔'}
                  </span>
                </div>
                <Card.Text className="small mt-2">{insight.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Revenue & Customer Trends</Card.Title>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="customers" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Business Metrics</Card.Title>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={predictionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {predictionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* AI Recommendations */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>AI Recommendations</Card.Title>
          <Alert variant="info">
            <strong>💡 Insight:</strong> Based on market analysis, expanding into digital services
            could increase revenue by 35%.
          </Alert>
          <Alert variant="success">
            <strong>🎯 Opportunity:</strong> Your target market shows high demand for eco-friendly
            products.
          </Alert>
          <Alert variant="warning">
            <strong>⚠️ Warning:</strong> Monitor competitor pricing as 3 new competitors entered the
            market this quarter.
          </Alert>
          <div className="mt-3">
            <Button variant="outline-primary" className="me-2">
              View Detailed Analysis
            </Button>
            <Button variant="outline-success">Export Insights</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Data Table */}
      <Card>
        <Card.Body>
          <Card.Title>Detailed Analysis</Card.Title>
          <Table responsive>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current Value</th>
                <th>Previous Value</th>
                <th>Change</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Market Share</td>
                <td>15.2%</td>
                <td>12.8%</td>
                <td className="text-success">+2.4%</td>
                <td>📈 Growing</td>
              </tr>
              <tr>
                <td>Customer Satisfaction</td>
                <td>4.2/5</td>
                <td>4.1/5</td>
                <td className="text-success">+0.1</td>
                <td>📈 Improving</td>
              </tr>
              <tr>
                <td>Operating Costs</td>
                <td>$1,500</td>
                <td>$1,200</td>
                <td className="text-success">-$300</td>
                <td>📉 Decreasing</td>
              </tr>
              <tr>
                <td>Revenue Growth</td>
                <td>18.5%</td>
                <td>15.3%</td>
                <td className="text-success">+3.2%</td>
                <td>📈 Accelerating</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PredictiveAnalytics;
