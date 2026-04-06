/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  MessageCircle,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  User,
  Briefcase,
  DollarSign,
  Star,
} from 'lucide-react';

import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';
import './MentorStyles.css';

const MentorApplications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual service call
      const mockApplications = [
        {
          id: '1',
          studentName: 'John Doe',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Business Strategy Mentoring',
          description: 'Looking for guidance on scaling my startup...',
          status: 'pending',
          submittedAt: new Date('2026-03-01'),
          preferredDate: new Date('2026-03-15'),
          preferredTime: '10:00 AM',
          duration: '60 min',
          experience: '2 years in e-commerce',
          goals: ['Market expansion', 'Team building', 'Funding strategy'],
          budget: 150,
          attachments: ['resume.pdf', 'business_plan.pdf'],
        },
        {
          id: '2',
          studentName: 'Sarah Smith',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Tech Career Guidance',
          description: 'Need advice on transitioning into tech...',
          status: 'accepted',
          submittedAt: new Date('2026-02-28'),
          preferredDate: new Date('2026-03-10'),
          preferredTime: '2:00 PM',
          duration: '45 min',
          experience: '5 years in marketing',
          goals: ['Skill development', 'Job search strategy', 'Networking'],
          budget: 120,
        },
        {
          id: '3',
          studentName: 'Mike Johnson',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Investment Pitch Preparation',
          description: 'Preparing for investor meetings...',
          status: 'completed',
          submittedAt: new Date('2026-02-25'),
          preferredDate: new Date('2026-03-05'),
          preferredTime: '3:30 PM',
          duration: '90 min',
          experience: '3 years in fintech',
          goals: ['Pitch deck review', 'Investor communication', 'Valuation'],
          budget: 200,
        },
        {
          id: '4',
          studentName: 'Emily Brown',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Leadership Development',
          description: 'Becoming a better team leader...',
          status: 'rejected',
          submittedAt: new Date('2026-02-20'),
          preferredDate: new Date('2026-03-01'),
          preferredTime: '11:00 AM',
          duration: '60 min',
          experience: '4 years in management',
          goals: ['Leadership skills', 'Team motivation', 'Conflict resolution'],
          budget: 175,
        },
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-pending" />;
      case 'accepted':
        return <CheckCircle size={16} className="status-accepted" />;
      case 'rejected':
        return <XCircle size={16} className="status-rejected" />;
      case 'completed':
        return <CheckCircle size={16} className="status-completed" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      // Update application status
      setApplications(
        applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }

      // Show success message
      // await mentorService.updateApplicationStatus(applicationId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="mentor-applications">
      {/* Header */}
      <motion.div
        className="applications-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>Mentorship Applications</h1>
          <p>Manage and review student applications</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{applications.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {applications.filter((a) => a.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {applications.filter((a) => a.status === 'accepted').length}
            </span>
            <span className="stat-label">Accepted</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="filters-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </button>
          <button
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </motion.div>

      {/* Applications Grid */}
      <div className="applications-grid">
        {/* List View */}
        <motion.div
          className="applications-list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app.id}
              className={`application-card ${selectedApplication?.id === app.id ? 'selected' : ''}`}
              onClick={() => setSelectedApplication(app)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="card-header">
                <img src={app.studentPhoto} alt={app.studentName} className="student-photo" />
                <div className="student-info">
                  <h3>{app.studentName}</h3>
                  <p>{app.topic}</p>
                </div>
                <div className="status-badge">
                  {getStatusIcon(app.status)}
                  <span>{getStatusText(app.status)}</span>
                </div>
              </div>
              <div className="card-details">
                <div className="detail">
                  <Calendar size={14} />
                  <span>
                    {app.preferredDate.toLocaleDateString()} at {app.preferredTime}
                  </span>
                </div>
                <div className="detail">
                  <Clock size={14} />
                  <span>{app.duration}</span>
                </div>
                <div className="detail">
                  <DollarSign size={14} />
                  <span>${app.budget}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Details View */}
        {selectedApplication && (
          <motion.div
            className="application-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="details-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={() => setSelectedApplication(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="student-profile">
              <img src={selectedApplication.studentPhoto} alt={selectedApplication.studentName} />
              <div>
                <h3>{selectedApplication.studentName}</h3>
                <p>{selectedApplication.topic}</p>
              </div>
            </div>

            <div className="details-section">
              <h4>Application Status</h4>
              <div className="status-actions">
                <button
                  className={`status-btn ${selectedApplication.status === 'pending' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedApplication.id, 'pending')}
                >
                  <Clock size={16} />
                  Pending
                </button>
                <button
                  className={`status-btn ${selectedApplication.status === 'accepted' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                >
                  <CheckCircle size={16} />
                  Accept
                </button>
                <button
                  className={`status-btn ${selectedApplication.status === 'rejected' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  className={`status-btn ${selectedApplication.status === 'completed' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedApplication.id, 'completed')}
                >
                  <CheckCircle size={16} />
                  Complete
                </button>
              </div>
            </div>

            <div className="details-section">
              <h4>Application Details</h4>
              <div className="detail-item">
                <label>Submitted</label>
                <p>{selectedApplication.submittedAt.toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Preferred Date & Time</label>
                <p>
                  {selectedApplication.preferredDate.toLocaleDateString()} at{' '}
                  {selectedApplication.preferredTime}
                </p>
              </div>
              <div className="detail-item">
                <label>Duration</label>
                <p>{selectedApplication.duration}</p>
              </div>
              <div className="detail-item">
                <label>Budget</label>
                <p>${selectedApplication.budget}</p>
              </div>
            </div>

            <div className="details-section">
              <h4>Student Information</h4>
              <div className="detail-item">
                <label>Experience</label>
                <p>{selectedApplication.experience}</p>
              </div>
              <div className="detail-item">
                <label>Goals</label>
                <ul>
                  {selectedApplication.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="details-section">
              <h4>Description</h4>
              <p className="description">{selectedApplication.description}</p>
            </div>

            {selectedApplication.attachments && (
              <div className="details-section">
                <h4>Attachments</h4>
                <div className="attachments">
                  {selectedApplication.attachments.map((file, index) => (
                    <div key={index} className="attachment">
                      <FileText size={16} />
                      <span>{file}</span>
                      <Download size={14} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="message-btn">
                <MessageCircle size={16} />
                Message Student
              </button>
              <button className="schedule-btn">
                <Calendar size={16} />
                Schedule Session
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MentorApplications;
