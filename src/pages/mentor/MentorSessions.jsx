import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Users,
  MessageCircle,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share2,
  MoreVertical,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Phone,
  Mail,
} from 'lucide-react';
import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';
import './MentorStyles.css';

const MentorSessions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('upcoming'); // upcoming, past, all
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, view]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual service call
      const mockSessions = [
        {
          id: '1',
          studentName: 'John Doe',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Business Strategy Review',
          date: new Date('2026-03-15T10:00:00'),
          duration: 60,
          status: 'scheduled',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: 'Prepare slides on market analysis',
          recording: null,
          feedback: null,
        },
        {
          id: '2',
          studentName: 'Sarah Smith',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Tech Career Guidance',
          date: new Date('2026-03-10T14:00:00'),
          duration: 45,
          status: 'completed',
          meetingLink: 'https://meet.google.com/klm-nopq-rst',
          notes: 'Discussed career transition strategies',
          recording: 'recording.mp4',
          feedback: {
            rating: 5,
            comment: 'Excellent guidance! Very helpful.',
            submittedAt: new Date('2026-03-10T15:00:00'),
          },
        },
        {
          id: '3',
          studentName: 'Mike Johnson',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Investment Pitch Preparation',
          date: new Date('2026-03-05T15:30:00'),
          duration: 90,
          status: 'cancelled',
          meetingLink: null,
          notes: 'Student cancelled due to emergency',
          recording: null,
          feedback: null,
        },
        {
          id: '4',
          studentName: 'Emily Brown',
          studentPhoto: 'https://via.placeholder.com/50',
          topic: 'Leadership Development',
          date: new Date('2026-03-20T11:00:00'),
          duration: 60,
          status: 'scheduled',
          meetingLink: 'https://meet.google.com/uvw-xyz-123',
          notes: 'Focus on team motivation techniques',
          recording: null,
          feedback: null,
        },
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { icon: Clock, color: '#F59E0B', text: 'Scheduled' },
      ongoing: { icon: Play, color: '#3B82F6', text: 'Ongoing' },
      completed: { icon: CheckCircle, color: '#10B981', text: 'Completed' },
      cancelled: { icon: XCircle, color: '#EF4444', text: 'Cancelled' },
      'no-show': { icon: AlertCircle, color: '#6B7280', text: 'No Show' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <span
        className="status-badge"
        style={{ color: config.color, background: `${config.color}10` }}
      >
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleStartSession = (session) => {
    // Start session logic
    console.log('Starting session:', session.id);
  };

  const handleEndSession = (session) => {
    // End session logic
    console.log('Ending session:', session.id);
  };

  const handleReschedule = (session) => {
    // Reschedule logic
    console.log('Rescheduling session:', session.id);
  };

  const handleCancel = (session) => {
    // Cancel logic
    console.log('Cancelling session:', session.id);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesView =
      view === 'all' ||
      (view === 'upcoming' && session.status === 'scheduled' && session.date > new Date()) ||
      (view === 'past' && (session.status === 'completed' || session.date < new Date()));

    const matchesSearch =
      session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.topic.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesView && matchesSearch;
  });

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="mentor-sessions">
      {/* Header */}
      <motion.div
        className="sessions-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <h1>My Sessions</h1>
          <p>Manage and track your mentoring sessions</p>
        </div>
        <button className="schedule-btn">
          <Calendar size={16} />
          Schedule New Session
        </button>
      </motion.div>

      {/* Calendar & Filters */}
      <motion.div
        className="sessions-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="view-tabs">
          <button
            className={`view-tab ${view === 'upcoming' ? 'active' : ''}`}
            onClick={() => setView('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`view-tab ${view === 'past' ? 'active' : ''}`}
            onClick={() => setView('past')}
          >
            Past
          </button>
          <button
            className={`view-tab ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            All Sessions
          </button>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Sessions List */}
      <div className="sessions-list">
        {filteredSessions.map((session, index) => (
          <motion.div
            key={session.id}
            className="session-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedSession(session)}
          >
            <div className="session-time">
              <div className="date">
                <span className="day">{session.date.getDate()}</span>
                <span className="month">
                  {session.date.toLocaleString('default', { month: 'short' })}
                </span>
              </div>
              <div className="time">
                <Clock size={14} />
                <span>
                  {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="duration">{session.duration} min</div>
            </div>

            <div className="session-info">
              <div className="student">
                <img src={session.studentPhoto} alt={session.studentName} />
                <div>
                  <h3>{session.studentName}</h3>
                  <p>{session.topic}</p>
                </div>
              </div>
              {getStatusBadge(session.status)}
            </div>

            <div className="session-actions">
              {session.status === 'scheduled' && session.date <= new Date() && (
                <button
                  className="action-btn start"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartSession(session);
                  }}
                >
                  <Play size={16} />
                  Start
                </button>
              )}
              {session.meetingLink && session.status === 'scheduled' && (
                <button
                  className="action-btn join"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinSession(session);
                  }}
                >
                  <Video size={16} />
                  Join
                </button>
              )}
              {session.status === 'scheduled' && session.date > new Date() && (
                <button
                  className="action-btn reschedule"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReschedule(session);
                  }}
                >
                  <Calendar size={16} />
                  Reschedule
                </button>
              )}
              {session.status === 'completed' && session.recording && (
                <button
                  className="action-btn recording"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(session.recording, '_blank');
                  }}
                >
                  <Download size={16} />
                  Recording
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <motion.div
          className="session-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedSession(null)}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Session Details</h2>
              <button className="close-btn" onClick={() => setSelectedSession(null)}>
                <XCircle size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="session-summary">
                <div className="student-profile">
                  <img src={selectedSession.studentPhoto} alt={selectedSession.studentName} />
                  <div>
                    <h3>{selectedSession.studentName}</h3>
                    <p>{selectedSession.topic}</p>
                  </div>
                </div>
                {getStatusBadge(selectedSession.status)}
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <label>Date & Time</label>
                    <p>
                      {selectedSession.date.toLocaleDateString()} at{' '}
                      {selectedSession.date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock size={16} />
                  <div>
                    <label>Duration</label>
                    <p>{selectedSession.duration} minutes</p>
                  </div>
                </div>

                {selectedSession.meetingLink && (
                  <div className="detail-item">
                    <Video size={16} />
                    <div>
                      <label>Meeting Link</label>
                      <a
                        href={selectedSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selectedSession.meetingLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div className="notes-section">
                  <h4>Notes</h4>
                  <p>{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.feedback && (
                <div className="feedback-section">
                  <h4>Student Feedback</h4>
                  <div className="feedback">
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= selectedSession.feedback.rating ? '#F59E0B' : 'none'}
                          color={star <= selectedSession.feedback.rating ? '#F59E0B' : '#D1D5DB'}
                        />
                      ))}
                    </div>
                    <p className="comment">{selectedSession.feedback.comment}</p>
                    <p className="date">
                      Submitted on {selectedSession.feedback.submittedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                {selectedSession.status === 'scheduled' && (
                  <>
                    <button
                      className="primary-btn"
                      onClick={() => handleJoinSession(selectedSession)}
                    >
                      <Video size={16} />
                      Join Session
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleReschedule(selectedSession)}
                    >
                      <Calendar size={16} />
                      Reschedule
                    </button>
                    <button className="danger-btn" onClick={() => handleCancel(selectedSession)}>
                      <XCircle size={16} />
                      Cancel Session
                    </button>
                  </>
                )}
                {selectedSession.status === 'completed' && selectedSession.recording && (
                  <button
                    className="primary-btn"
                    onClick={() => window.open(selectedSession.recording, '_blank')}
                  >
                    <Download size={16} />
                    Download Recording
                  </button>
                )}
                <button className="secondary-btn">
                  <MessageCircle size={16} />
                  Message Student
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MentorSessions;
