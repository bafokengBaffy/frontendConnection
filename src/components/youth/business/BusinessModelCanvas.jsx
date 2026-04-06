/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/youth/business/BusinessModelCanvas.jsx
import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import businessService from '../../../services/businessService'; // Changed to default import
import { trackEvent } from '../../../utils/analytics';
import { logger } from '../../../utils/logger';
import './BusinessModelCanvas.css';

/**
 * BusinessModelCanvas Component
 * Interactive canvas for creating and editing business models
 * Based on the Business Model Canvas framework by Alexander Osterwalder
 */
const BusinessModelCanvas = ({
  initialData = {},
  readOnly = false,
  onSave,
  onUpdate,
  businessId,
  className = '',
  showControls = true,
  autoSave = true,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [sections, setSections] = useState({
    valueProposition: {
      title: 'Value Proposition',
      content: initialData.valueProposition || '',
      placeholder: 'What value do you deliver to customers?',
      color: '#FF6B6B',
      icon: '💡',
      key: 'valueProposition',
    },
    customerSegments: {
      title: 'Customer Segments',
      content: initialData.customerSegments || '',
      placeholder: 'Who are your target customers?',
      color: '#4ECDC4',
      icon: '👥',
      key: 'customerSegments',
    },
    channels: {
      title: 'Channels',
      content: initialData.channels || '',
      placeholder: 'How do you reach your customers?',
      color: '#45B7D1',
      icon: '📢',
      key: 'channels',
    },
    customerRelationships: {
      title: 'Customer Relationships',
      content: initialData.customerRelationships || '',
      placeholder: 'How do you interact with customers?',
      color: '#96CEB4',
      icon: '🤝',
      key: 'customerRelationships',
    },
    revenueStreams: {
      title: 'Revenue Streams',
      content: initialData.revenueStreams || '',
      placeholder: 'How does your business generate revenue?',
      color: '#FFE066',
      icon: '💰',
      key: 'revenueStreams',
    },
    keyResources: {
      title: 'Key Resources',
      content: initialData.keyResources || '',
      placeholder: 'What resources do you need?',
      color: '#FF9F1C',
      icon: '🔑',
      key: 'keyResources',
    },
    keyActivities: {
      title: 'Key Activities',
      content: initialData.keyActivities || '',
      placeholder: 'What activities are essential?',
      color: '#F25F5C',
      icon: '⚡',
      key: 'keyActivities',
    },
    keyPartnerships: {
      title: 'Key Partnerships',
      content: initialData.keyPartnerships || '',
      placeholder: 'Who are your key partners?',
      color: '#B388EB',
      icon: '🤝',
      key: 'keyPartnerships',
    },
    costStructure: {
      title: 'Cost Structure',
      content: initialData.costStructure || '',
      placeholder: 'What are your major costs?',
      color: '#8093F1',
      icon: '📊',
      key: 'costStructure',
    },
  });

  const [activeSection, setActiveSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Handle section content change
  const handleSectionChange = useCallback(
    (sectionKey, value) => {
      setSections((prev) => ({
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          content: value,
        },
      }));

      // Mark field as touched
      if (!touchedFields[sectionKey]) {
        setTouchedFields((prev) => ({ ...prev, [sectionKey]: true }));
      }

      // Validate on change
      validateSection(sectionKey, value);

      // Trigger auto-save
      if (autoSave && businessId) {
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        const timer = setTimeout(() => {
          handleAutoSave();
        }, 2000);
        setAutoSaveTimer(timer);
      }

      // Notify parent of updates
      if (onUpdate) {
        onUpdate({ section: sectionKey, value });
      }
    },
    [touchedFields, validateSection, autoSave, businessId, onUpdate, autoSaveTimer, handleAutoSave]
  );

  // Validate a section
  const validateSection = (sectionKey, value) => {
    const errors = { ...validationErrors };

    if (!value || value.trim() === '') {
      errors[sectionKey] = `${sections[sectionKey].title} cannot be empty`;
    } else if (value.length < 10) {
      errors[sectionKey] =
        `${sections[sectionKey].title} should be more detailed (min. 10 characters)`;
    } else if (value.length > 1000) {
      errors[sectionKey] = `${sections[sectionKey].title} is too long (max. 1000 characters)`;
    } else {
      delete errors[sectionKey];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate all sections
  const validateAll = () => {
    const errors = {};
    Object.entries(sections).forEach(([key, section]) => {
      if (!section.content || section.content.trim() === '') {
        errors[key] = `${section.title} cannot be empty`;
      } else if (section.content.length < 10) {
        errors[key] = `${section.title} should be more detailed`;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle auto-save
  const handleAutoSave = async () => {
    if (!businessId || !user) return;

    const isValid = validateAll();
    if (!isValid) return;

    setSaving(true);
    try {
      const canvasData = Object.entries(sections).reduce((acc, [key, section]) => {
        acc[key] = section.content;
        return acc;
      }, {});

      await businessService.updateBusinessCanvas(businessId, canvasData);
      setLastSaved(new Date());

      logger.info('Business canvas auto-saved', { businessId });

      trackEvent('business_canvas_auto_saved', {
        userId: user.uid,
        businessId,
      });
    } catch (error) {
      logger.error('Error auto-saving business canvas:', error);
      showNotification('error', 'Failed to auto-save canvas');
    } finally {
      setSaving(false);
    }
  };

  // Handle manual save
  const handleSave = async () => {
    if (!businessId || !user) {
      showNotification('error', 'Please login to save your canvas');
      return;
    }

    const isValid = validateAll();
    if (!isValid) {
      showNotification('error', 'Please fill in all sections with detailed information');

      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`section-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setSaving(true);
    try {
      const canvasData = Object.entries(sections).reduce((acc, [key, section]) => {
        acc[key] = section.content;
        return acc;
      }, {});

      await businessService.updateBusinessCanvas(businessId, canvasData);
      setLastSaved(new Date());

      if (onSave) {
        onSave(canvasData);
      }

      showNotification('success', 'Business canvas saved successfully!');

      trackEvent('business_canvas_saved', {
        userId: user.uid,
        businessId,
        sectionsCompleted: Object.values(sections).filter((s) => s.content?.length > 0).length,
      });
    } catch (error) {
      logger.error('Error saving business canvas:', error);
      showNotification('error', 'Failed to save business canvas');
    } finally {
      setSaving(false);
    }
  };

  // Handle export as PDF
  const handleExportPDF = useCallback(() => {
    try {
      // This would integrate with a PDF generation library
      showNotification('info', 'PDF export feature coming soon!');

      trackEvent('business_canvas_export_pdf', {
        userId: user?.uid,
        businessId,
      });
    } catch (error) {
      logger.error('Error exporting PDF:', error);
      showNotification('error', 'Failed to export PDF');
    }
  }, [user?.uid, businessId, showNotification]);

  // Handle export as JSON
  const handleExportJSON = useCallback(() => {
    try {
      const canvasData = Object.entries(sections).reduce((acc, [key, section]) => {
        acc[key] = {
          title: section.title,
          content: section.content,
          icon: section.icon,
        };
        return acc;
      }, {});

      const dataStr = JSON.stringify(canvasData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `business-canvas-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      trackEvent('business_canvas_export_json', {
        userId: user?.uid,
        businessId,
      });
    } catch (error) {
      logger.error('Error exporting JSON:', error);
      showNotification('error', 'Failed to export JSON');
    }
  }, [sections, user?.uid, businessId, showNotification]);

  // Clear auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Calculate completion percentage
  const completionPercentage = useCallback(() => {
    const totalSections = Object.keys(sections).length;
    const completedSections = Object.values(sections).filter(
      (section) => section.content && section.content.trim().length > 10
    ).length;
    return Math.round((completedSections / totalSections) * 100);
  }, [sections]);

  return (
    <div className={`business-model-canvas ${className}`}>
      {/* Header */}
      <div className="canvas-header">
        <div className="header-left">
          <h2 className="canvas-title">
            <span className="title-icon">🎯</span>
            Business Model Canvas
          </h2>
          {lastSaved && (
            <span className="last-saved">Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        {showControls && (
          <div className="canvas-controls">
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPercentage()}%` }} />
              </div>
              <span className="progress-text">{completionPercentage()}% Complete</span>
            </div>

            <button
              className="btn btn-outline-secondary"
              onClick={handleExportPDF}
              disabled={saving}
              aria-label="Export as PDF"
            >
              <span className="btn-icon">📄</span>
              PDF
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={handleExportJSON}
              disabled={saving}
              aria-label="Export as JSON"
            >
              <span className="btn-icon">📊</span>
              JSON
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || Object.keys(validationErrors).length > 0}
              aria-label="Save canvas"
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="btn-icon">💾</span>
                  Save Canvas
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Canvas Grid */}
      <div className="canvas-grid">
        {/* Left side - Infrastructure */}
        <div className="canvas-column infrastructure">
          <div className="column-label">Infrastructure</div>

          {/* Key Partnerships */}
          <div
            id="section-keyPartnerships"
            className={`canvas-card ${activeSection === 'keyPartnerships' ? 'active' : ''} ${validationErrors.keyPartnerships ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('keyPartnerships')}
          >
            <div
              className="card-header"
              style={{ backgroundColor: sections.keyPartnerships.color }}
            >
              <span className="card-icon">{sections.keyPartnerships.icon}</span>
              <h3 className="card-title">{sections.keyPartnerships.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.keyPartnerships.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.keyPartnerships.content}
                  onChange={(e) => handleSectionChange('keyPartnerships', e.target.value)}
                  placeholder={sections.keyPartnerships.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.keyPartnerships.title}
                  disabled={readOnly}
                />
                {validationErrors.keyPartnerships && (
                  <span className="error-message">{validationErrors.keyPartnerships}</span>
                )}
                <span className="character-count">
                  {sections.keyPartnerships.content.length}/1000
                </span>
              </>
            )}
          </div>

          {/* Key Activities */}
          <div
            id="section-keyActivities"
            className={`canvas-card ${activeSection === 'keyActivities' ? 'active' : ''} ${validationErrors.keyActivities ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('keyActivities')}
          >
            <div className="card-header" style={{ backgroundColor: sections.keyActivities.color }}>
              <span className="card-icon">{sections.keyActivities.icon}</span>
              <h3 className="card-title">{sections.keyActivities.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.keyActivities.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.keyActivities.content}
                  onChange={(e) => handleSectionChange('keyActivities', e.target.value)}
                  placeholder={sections.keyActivities.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.keyActivities.title}
                  disabled={readOnly}
                />
                {validationErrors.keyActivities && (
                  <span className="error-message">{validationErrors.keyActivities}</span>
                )}
                <span className="character-count">
                  {sections.keyActivities.content.length}/1000
                </span>
              </>
            )}
          </div>

          {/* Key Resources */}
          <div
            id="section-keyResources"
            className={`canvas-card ${activeSection === 'keyResources' ? 'active' : ''} ${validationErrors.keyResources ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('keyResources')}
          >
            <div className="card-header" style={{ backgroundColor: sections.keyResources.color }}>
              <span className="card-icon">{sections.keyResources.icon}</span>
              <h3 className="card-title">{sections.keyResources.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.keyResources.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.keyResources.content}
                  onChange={(e) => handleSectionChange('keyResources', e.target.value)}
                  placeholder={sections.keyResources.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.keyResources.title}
                  disabled={readOnly}
                />
                {validationErrors.keyResources && (
                  <span className="error-message">{validationErrors.keyResources}</span>
                )}
                <span className="character-count">{sections.keyResources.content.length}/1000</span>
              </>
            )}
          </div>
        </div>

        {/* Middle - Value */}
        <div className="canvas-column value">
          <div className="column-label">Value</div>

          {/* Value Proposition */}
          <div
            id="section-valueProposition"
            className={`canvas-card large ${activeSection === 'valueProposition' ? 'active' : ''} ${validationErrors.valueProposition ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('valueProposition')}
          >
            <div
              className="card-header"
              style={{ backgroundColor: sections.valueProposition.color }}
            >
              <span className="card-icon">{sections.valueProposition.icon}</span>
              <h3 className="card-title">{sections.valueProposition.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.valueProposition.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.valueProposition.content}
                  onChange={(e) => handleSectionChange('valueProposition', e.target.value)}
                  placeholder={sections.valueProposition.placeholder}
                  rows={6}
                  maxLength={1000}
                  aria-label={sections.valueProposition.title}
                  disabled={readOnly}
                />
                {validationErrors.valueProposition && (
                  <span className="error-message">{validationErrors.valueProposition}</span>
                )}
                <span className="character-count">
                  {sections.valueProposition.content.length}/1000
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side - Customers */}
        <div className="canvas-column customers">
          <div className="column-label">Customers</div>

          {/* Customer Relationships */}
          <div
            id="section-customerRelationships"
            className={`canvas-card ${activeSection === 'customerRelationships' ? 'active' : ''} ${validationErrors.customerRelationships ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('customerRelationships')}
          >
            <div
              className="card-header"
              style={{ backgroundColor: sections.customerRelationships.color }}
            >
              <span className="card-icon">{sections.customerRelationships.icon}</span>
              <h3 className="card-title">{sections.customerRelationships.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">
                {sections.customerRelationships.content || 'Not specified'}
              </p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.customerRelationships.content}
                  onChange={(e) => handleSectionChange('customerRelationships', e.target.value)}
                  placeholder={sections.customerRelationships.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.customerRelationships.title}
                  disabled={readOnly}
                />
                {validationErrors.customerRelationships && (
                  <span className="error-message">{validationErrors.customerRelationships}</span>
                )}
                <span className="character-count">
                  {sections.customerRelationships.content.length}/1000
                </span>
              </>
            )}
          </div>

          {/* Channels */}
          <div
            id="section-channels"
            className={`canvas-card ${activeSection === 'channels' ? 'active' : ''} ${validationErrors.channels ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('channels')}
          >
            <div className="card-header" style={{ backgroundColor: sections.channels.color }}>
              <span className="card-icon">{sections.channels.icon}</span>
              <h3 className="card-title">{sections.channels.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.channels.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.channels.content}
                  onChange={(e) => handleSectionChange('channels', e.target.value)}
                  placeholder={sections.channels.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.channels.title}
                  disabled={readOnly}
                />
                {validationErrors.channels && (
                  <span className="error-message">{validationErrors.channels}</span>
                )}
                <span className="character-count">{sections.channels.content.length}/1000</span>
              </>
            )}
          </div>

          {/* Customer Segments */}
          <div
            id="section-customerSegments"
            className={`canvas-card ${activeSection === 'customerSegments' ? 'active' : ''} ${validationErrors.customerSegments ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('customerSegments')}
          >
            <div
              className="card-header"
              style={{ backgroundColor: sections.customerSegments.color }}
            >
              <span className="card-icon">{sections.customerSegments.icon}</span>
              <h3 className="card-title">{sections.customerSegments.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.customerSegments.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.customerSegments.content}
                  onChange={(e) => handleSectionChange('customerSegments', e.target.value)}
                  placeholder={sections.customerSegments.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.customerSegments.title}
                  disabled={readOnly}
                />
                {validationErrors.customerSegments && (
                  <span className="error-message">{validationErrors.customerSegments}</span>
                )}
                <span className="character-count">
                  {sections.customerSegments.content.length}/1000
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bottom - Finance */}
        <div className="canvas-row finance">
          {/* Cost Structure */}
          <div
            id="section-costStructure"
            className={`canvas-card ${activeSection === 'costStructure' ? 'active' : ''} ${validationErrors.costStructure ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('costStructure')}
          >
            <div className="card-header" style={{ backgroundColor: sections.costStructure.color }}>
              <span className="card-icon">{sections.costStructure.icon}</span>
              <h3 className="card-title">{sections.costStructure.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.costStructure.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.costStructure.content}
                  onChange={(e) => handleSectionChange('costStructure', e.target.value)}
                  placeholder={sections.costStructure.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.costStructure.title}
                  disabled={readOnly}
                />
                {validationErrors.costStructure && (
                  <span className="error-message">{validationErrors.costStructure}</span>
                )}
                <span className="character-count">
                  {sections.costStructure.content.length}/1000
                </span>
              </>
            )}
          </div>

          {/* Revenue Streams */}
          <div
            id="section-revenueStreams"
            className={`canvas-card ${activeSection === 'revenueStreams' ? 'active' : ''} ${validationErrors.revenueStreams ? 'error' : ''}`}
            onClick={() => !readOnly && setActiveSection('revenueStreams')}
          >
            <div className="card-header" style={{ backgroundColor: sections.revenueStreams.color }}>
              <span className="card-icon">{sections.revenueStreams.icon}</span>
              <h3 className="card-title">{sections.revenueStreams.title}</h3>
            </div>
            {readOnly ? (
              <p className="card-content">{sections.revenueStreams.content || 'Not specified'}</p>
            ) : (
              <>
                <textarea
                  className="card-textarea"
                  value={sections.revenueStreams.content}
                  onChange={(e) => handleSectionChange('revenueStreams', e.target.value)}
                  placeholder={sections.revenueStreams.placeholder}
                  rows={4}
                  maxLength={1000}
                  aria-label={sections.revenueStreams.title}
                  disabled={readOnly}
                />
                {validationErrors.revenueStreams && (
                  <span className="error-message">{validationErrors.revenueStreams}</span>
                )}
                <span className="character-count">
                  {sections.revenueStreams.content.length}/1000
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="canvas-tips">
        <h4 className="tips-title">
          <span className="tips-icon">💡</span>
          Tips for filling your Business Model Canvas
        </h4>
        <ul className="tips-list">
          <li>Be specific and concise - use bullet points where possible</li>
          <li>Focus on your unique value proposition</li>
          <li>Consider all customer segments you serve</li>
          <li>Identify both direct and indirect competitors</li>
          <li>Estimate realistic costs and revenue streams</li>
        </ul>
      </div>
    </div>
  );
};

BusinessModelCanvas.propTypes = {
  initialData: PropTypes.shape({
    valueProposition: PropTypes.string,
    customerSegments: PropTypes.string,
    channels: PropTypes.string,
    customerRelationships: PropTypes.string,
    revenueStreams: PropTypes.string,
    keyResources: PropTypes.string,
    keyActivities: PropTypes.string,
    keyPartnerships: PropTypes.string,
    costStructure: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onSave: PropTypes.func,
  onUpdate: PropTypes.func,
  businessId: PropTypes.string,
  className: PropTypes.string,
  showControls: PropTypes.bool,
  autoSave: PropTypes.bool,
};

export default BusinessModelCanvas;
