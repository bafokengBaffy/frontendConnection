/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  Users,
  TrendingUp,
  Video,
  MessageCircle,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  Award,
  BookOpen,
  Briefcase,
} from 'lucide-react';
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

import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';
import './MentorStyles.css';

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

const MentorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load profile
      const profileData = await mentorService.getMentorProfile(user.uid);
      if (profileData.success) {
        setProfile(profileData.data);
      }

      // Load analytics
      const analyticsData = await mentorService.getAnalytics(user.uid, selectedPeriod);
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

      // Load upcoming sessions
      const sessionsData = await mentorService.getMentorSessions(user.uid, {
        status: 'scheduled',
      });
      if (sessionsData.success) {
        const upcoming = sessionsData.data
          .filter((s) => new Date(s.scheduledAt.toDate()) > new Date())
          .sort((a, b) => a.scheduledAt.toDate() - b.scheduledAt.toDate())
          .slice(0, 5);
        setUpcomingSessions(upcoming);
      }

      // Mock recent activity (replace with real data)
      setRecentActivity([
        {
          id: 1,
          type: 'session',
          message: 'Completed session with John Doe',
          time: '2 hours ago',
          icon: Video,
        },
        {
          id: 2,
          type: 'review',
          message: 'Received 5-star review from Sarah Smith',
          time: '5 hours ago',
          icon: Star,
        },
        {
          id: 3,
          type: 'earning',
          message: 'Earned $150 from 3 sessions',
          time: '1 day ago',
          icon: DollarSign,
        },
      ]);

      // Mock notifications
      setNotifications([
        {
          id: 1,
          message: 'New session request from Mike Johnson',
          time: '30 minutes ago',
          type: 'request',
        },
        {
          id: 2,
          message: 'Session with Emma Wilson starts in 1 hour',
          time: '1 hour ago',
          type: 'reminder',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analytics?.charts?.sessionsByMonth ? Object.keys(analytics.charts.sessionsByMonth) : [],
    datasets: [
      {
        label: 'Sessions',
        data: analytics?.charts?.sessionsByMonth
          ? Object.values(analytics.charts.sessionsByMonth)
          : [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const earningsChartData = {
    labels: analytics?.charts?.earningsByMonth ? Object.keys(analytics.charts.earningsByMonth) : [],
    datasets: [
      {
        label: 'Earnings ($)',
        data: analytics?.charts?.earningsByMonth
          ? Object.values(analytics.charts.earningsByMonth)
          : [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed', 'Cancelled', 'No-Show'],
    datasets: [
      {
        data: [
          analytics?.summary?.completedSessions || 0,
          analytics?.summary?.cancelledSessions || 0,
          0,
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mentor-dashboard">
      {/* Welcome Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Welcome back, {profile?.fullName || 'Mentor'}!</h1>
          <p>Here's what's happening with your mentoring journey today</p>
        </div>
        <div className="header-actions">
          <button className="btn-notification">
            <Bell size={20} />
            {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
          </button>
          <button className="btn-settings">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
            <Users color="#4F46E5" />
          </div>
          <div className="stat-content">
            <h3>Total Students</h3>
            <p className="stat-value">{analytics?.summary?.uniqueStudents || 0}</p>
            <span className="stat-change positive">+12% this month</span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Calendar color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>Total Sessions</h3>
            <p className="stat-value">{analytics?.summary?.totalSessions || 0}</p>
            <span className="stat-change positive">+8% this month</span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <DollarSign color="#F59E0B" />
          </div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">${analytics?.summary?.totalEarnings || 0}</p>
            <span className="stat-change positive">+23% this month</span>
          </div>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <Star color="#EF4444" />
          </div>
          <div className="stat-content">
            <h3>Average Rating</h3>
            <p className="stat-value">{analytics?.summary?.averageRating || '5.0'}</p>
            <span className="stat-change">{analytics?.summary?.totalReviews || 0} reviews</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="chart-header">
            <h3>Sessions Overview</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <div className="chart-container">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: true,
                      color: 'rgba(0,0,0,0.05)',
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Session Completion Rate</h3>
          <div className="doughnut-container">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
          <div className="completion-rate">
            <span className="rate-value">{analytics?.summary?.completionRate || 0}%</span>
            <span className="rate-label">Completion Rate</span>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Sessions & Activity */}
      <div className="dashboard-grid">
        <motion.div
          className="sessions-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
            <a href="/mentor/sessions" className="view-all">
              View All <ChevronRight size={16} />
            </a>
          </div>
          <div className="sessions-list">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-time">
                    <Clock size={16} />
                    <span>
                      {session.scheduledAt.toDate().toLocaleDateString()} at{' '}
                      {session.scheduledAt
                        .toDate()
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="session-info">
                    <h4>{session.studentName || 'Student'}</h4>
                    <p>{session.topic}</p>
                  </div>
                  <button className="btn-join">Join</button>
                </div>
              ))
            ) : (
              <p className="no-data">No upcoming sessions</p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="activity-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <Icon size={16} />
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <Video size={20} />
            <span>Start Session</span>
          </button>
          <button className="action-btn">
            <MessageCircle size={20} />
            <span>Messages</span>
          </button>
          <button className="action-btn">
            <Calendar size={20} />
            <span>Schedule</span>
          </button>
          <button className="action-btn">
            <DollarSign size={20} />
            <span>Withdraw</span>
          </button>
          <button className="action-btn">
            <Briefcase size={20} />
            <span>Resources</span>
          </button>
          <button className="action-btn">
            <Award size={20} />
            <span>Achievements</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MentorDashboard;
