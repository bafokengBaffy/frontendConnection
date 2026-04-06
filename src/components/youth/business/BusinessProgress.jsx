/* eslint-disable no-unused-vars */
// src/components/youth/business/BusinessProgress.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * BusinessProgress Component
 * Tracks business setup progress, milestones, and achievements
 */
const BusinessProgress = ({
  businessId,
  initialData = {},
  readOnly = false,
  onUpdate,
  sections = [], // List of business sections and their completion status
}) => {
  const [progress, setProgress] = useState({
    overall: initialData.overall || 0,
    sections: initialData.sections || [],
    milestones: initialData.milestones || [],
    achievements: initialData.achievements || [],
    nextSteps: initialData.nextSteps || [],
    completedTasks: initialData.completedTasks || 0,
    totalTasks: initialData.totalTasks || 0,
    lastActivity: initialData.lastActivity || null,
    streak: initialData.streak || 0,
  });

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // Calculate overall progress based on sections
  useEffect(() => {
    if (sections.length > 0) {
      const completed = sections.filter((s) => s.completed).length;
      const total = sections.length;
      const percentage = Math.round((completed / total) * 100);

      setProgress((prev) => ({
        ...prev,
        overall: percentage,
        completedTasks: completed,
        totalTasks: total,
      }));

      if (onUpdate) {
        onUpdate({
          overall: percentage,
          completedTasks: completed,
          totalTasks: total,
        });
      }
    }
  }, [onUpdate, sections]);

  const addMilestone = (milestone) => {
    const newMilestone = {
      id: Date.now().toString(),
      ...milestone,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...progress,
      milestones: [...progress.milestones, newMilestone],
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const updateMilestone = (id, updates) => {
    const updated = {
      ...progress,
      milestones: progress.milestones.map((m) => {
        if (m.id === id) {
          return { ...m, ...updates };
        }
        return m;
      }),
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const toggleMilestone = (id) => {
    const milestone = progress.milestones.find((m) => m.id === id);
    if (milestone) {
      updateMilestone(id, {
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date().toISOString() : null,
      });
    }
  };

  const deleteMilestone = (id) => {
    const updated = {
      ...progress,
      milestones: progress.milestones.filter((m) => m.id !== id),
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addAchievement = (achievement) => {
    const newAchievement = {
      id: Date.now().toString(),
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    const updated = {
      ...progress,
      achievements: [...progress.achievements, newAchievement],
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const addNextStep = (step) => {
    const newStep = {
      id: Date.now().toString(),
      description: step,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...progress,
      nextSteps: [...progress.nextSteps, newStep],
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const toggleNextStep = (id) => {
    const updated = {
      ...progress,
      nextSteps: progress.nextSteps.map((step) => {
        if (step.id === id) {
          return { ...step, completed: !step.completed };
        }
        return step;
      }),
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const deleteNextStep = (id) => {
    const updated = {
      ...progress,
      nextSteps: progress.nextSteps.filter((step) => step.id !== id),
    };
    setProgress(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ef4444';
    if (percentage < 60) return '#f59e0b';
    if (percentage < 80) return '#3b82f6';
    return '#10b981';
  };

  const getStreakMessage = () => {
    if (progress.streak === 0) return 'Start your journey today!';
    if (progress.streak === 1) return 'Great start! 1 day streak';
    if (progress.streak < 7) return `${progress.streak} day streak! Keep going!`;
    if (progress.streak < 30) return `${progress.streak} day streak! You're on fire!`;
    return `${progress.streak} day streak! Amazing dedication!`;
  };

  return (
    <div className="business-progress">
      <h3 className="progress-title">
        <span className="title-icon">📊</span>
        Business Progress
      </h3>

      {/* Overall Progress */}
      <div className="progress-overall">
        <div className="progress-header">
          <h4 className="progress-label">Overall Completion</h4>
          <span className="progress-percentage">{progress.overall}%</span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress.overall}%`,
              backgroundColor: getProgressColor(progress.overall),
            }}
          />
        </div>

        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value">{progress.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{progress.totalTasks - progress.completedTasks}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{progress.totalTasks}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Streak & Activity */}
      <div className="streak-section">
        <div className="streak-card">
          <span className="streak-icon">🔥</span>
          <div className="streak-info">
            <span className="streak-message">{getStreakMessage()}</span>
            {progress.lastActivity && (
              <span className="last-activity">
                Last activity: {new Date(progress.lastActivity).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section Progress */}
      {sections.length > 0 && (
        <div className="sections-progress">
          <h4 className="subsection-title">Section Progress</h4>
          <div className="sections-list">
            {sections.map((section, index) => (
              <div key={index} className="section-item">
                <div className="section-info">
                  <span className="section-name">{section.name}</span>
                  {section.completed ? (
                    <span className="completed-badge">✓ Completed</span>
                  ) : (
                    <span className="pending-badge">Pending</span>
                  )}
                </div>
                <div className="section-progress-bar">
                  <div
                    className="section-progress-fill"
                    style={{
                      width: `${section.progress || (section.completed ? 100 : 0)}%`,
                      backgroundColor: section.completed ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="milestones-section">
        <div className="section-header">
          <h4 className="subsection-title">Milestones</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setSelectedMilestone(null);
                setShowMilestoneModal(true);
              }}
            >
              + Add Milestone
            </button>
          )}
        </div>

        <div className="milestones-list">
          {progress.milestones.length > 0 ? (
            progress.milestones.map((milestone) => (
              <div key={milestone.id} className="milestone-item">
                <div className="milestone-check">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => toggleMilestone(milestone.id)}
                    disabled={readOnly}
                    className="milestone-checkbox"
                  />
                </div>
                <div className="milestone-content">
                  <div className="milestone-header">
                    <h5 className="milestone-title">{milestone.title}</h5>
                    <span className="milestone-date">
                      Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  {milestone.description && (
                    <p className="milestone-description">{milestone.description}</p>
                  )}
                  {milestone.completed && milestone.completedAt && (
                    <span className="completed-date">
                      Completed: {new Date(milestone.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {!readOnly && (
                  <button
                    className="btn-delete"
                    onClick={() => deleteMilestone(milestone.id)}
                    aria-label="Delete milestone"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="empty-message">No milestones set yet</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h4 className="subsection-title">Achievements</h4>
        <div className="achievements-grid">
          {progress.achievements.map((achievement) => (
            <div key={achievement.id} className="achievement-card">
              <div className="achievement-icon">{achievement.icon || '🏆'}</div>
              <div className="achievement-info">
                <h5 className="achievement-title">{achievement.title}</h5>
                <p className="achievement-description">{achievement.description}</p>
                <span className="achievement-date">
                  Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {progress.achievements.length === 0 && (
            <p className="empty-message">No achievements yet</p>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps-section">
        <div className="section-header">
          <h4 className="subsection-title">Next Steps</h4>
          {!readOnly && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const step = prompt('Enter next step:');
                if (step) addNextStep(step);
              }}
            >
              + Add Step
            </button>
          )}
        </div>

        <div className="next-steps-list">
          {progress.nextSteps.map((step) => (
            <div key={step.id} className="next-step-item">
              <div className="step-check">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => toggleNextStep(step.id)}
                  disabled={readOnly}
                  className="step-checkbox"
                />
              </div>
              <span className={`step-description ${step.completed ? 'completed' : ''}`}>
                {step.description}
              </span>
              {!readOnly && (
                <button
                  className="btn-delete"
                  onClick={() => deleteNextStep(step.id)}
                  aria-label="Delete step"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {progress.nextSteps.length === 0 && (
            <p className="empty-message">No next steps defined</p>
          )}
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && !readOnly && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4 className="modal-title">Add New Milestone</h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addMilestone({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  targetDate: formData.get('targetDate'),
                });
                setShowMilestoneModal(false);
              }}
            >
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  required
                  placeholder="e.g., Launch MVP"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  placeholder="Describe this milestone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Date *</label>
                <input type="date" name="targetDate" className="form-control" required />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .business-progress {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
        }

        .progress-title {
          margin: 0 0 24px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .progress-overall {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          color: #495057;
        }

        .progress-percentage {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .progress-bar-container {
          height: 12px;
          background: #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .progress-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          text-align: center;
        }

        .stat-item {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat-value {
          display: block;
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
        }

        .streak-section {
          margin-bottom: 24px;
        }

        .streak-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .streak-icon {
          font-size: 2rem;
        }

        .streak-info {
          flex: 1;
        }

        .streak-message {
          display: block;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .last-activity {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .subsection-title {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .sections-progress,
        .milestones-section,
        .achievements-section,
        .next-steps-section {
          margin-bottom: 30px;
        }

        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-item {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
        }

        .section-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .section-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .completed-badge {
          color: #10b981;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .pending-badge {
          color: #f59e0b;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .section-progress-bar {
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        }

        .section-progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .milestone-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          position: relative;
        }

        .milestone-check {
          padding-top: 2px;
        }

        .milestone-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .milestone-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .milestone-date {
          font-size: 0.85rem;
          color: #6c757d;
        }

        .milestone-description {
          margin: 4px 0 0 0;
          font-size: 0.95rem;
          color: #495057;
        }

        .completed-date {
          display: inline-block;
          margin-top: 8px;
          font-size: 0.85rem;
          color: #10b981;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .achievement-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .achievement-icon {
          font-size: 2rem;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-title {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .achievement-description {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #6c757d;
        }

        .achievement-date {
          font-size: 0.8rem;
          color: #10b981;
        }

        .next-steps-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .next-step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .step-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .step-description {
          flex: 1;
          font-size: 0.95rem;
          color: #2c3e50;
        }

        .step-description.completed {
          text-decoration: line-through;
          color: #6c757d;
        }

        .empty-message {
          color: #6c757d;
          font-style: italic;
          padding: 16px;
          text-align: center;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .btn-delete {
          background: none;
          border: none;
          color: #dc3545;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 4px;
        }

        .btn-delete:hover {
          color: #c82333;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-outline-primary {
          background: transparent;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .btn-outline-primary:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-sm {
          padding: 4px 12px;
          font-size: 0.85rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-title {
          margin: 0 0 20px 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #495057;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .milestone-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .modal-content {
            width: 95%;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

BusinessProgress.propTypes = {
  businessId: PropTypes.string,
  initialData: PropTypes.shape({
    overall: PropTypes.number,
    sections: PropTypes.array,
    milestones: PropTypes.array,
    achievements: PropTypes.array,
    nextSteps: PropTypes.array,
    completedTasks: PropTypes.number,
    totalTasks: PropTypes.number,
    lastActivity: PropTypes.string,
    streak: PropTypes.number,
  }),
  readOnly: PropTypes.bool,
  onUpdate: PropTypes.func,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      completed: PropTypes.bool,
      progress: PropTypes.number,
    })
  ),
};

export default BusinessProgress;
