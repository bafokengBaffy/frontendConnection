/* eslint-disable no-unused-vars */
// src/components/profile/AutoSaveIndicator.js
import React from 'react';
import { Badge, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { 
  FaSave, 
  FaCheck, 
  FaExclamationTriangle, 
  FaClock,
  FaCloud
} from 'react-icons/fa';

const AutoSaveIndicator = ({ 
  status, 
  lastSaved, 
  hasUnsavedChanges,
  saveCount,
  isSaving
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          variant: 'warning',
          icon: <Spinner animation="border" size="sm" className="me-1" />,
          text: 'Saving...',
          tooltip: 'Changes are being saved'
        };
      case 'success':
        return {
          variant: 'success',
          icon: <FaCheck className="me-1" />,
          text: 'Saved',
          tooltip: lastSaved ? `Last saved: ${formatTime(lastSaved)}` : 'Changes saved'
        };
      case 'error':
        return {
          variant: 'danger',
          icon: <FaExclamationTriangle className="me-1" />,
          text: 'Save failed',
          tooltip: 'Failed to save changes. Please try again.'
        };
      default:
        if (hasUnsavedChanges) {
          return {
            variant: 'info',
            icon: <FaClock className="me-1" />,
            text: 'Unsaved changes',
            tooltip: 'You have unsaved changes'
          };
        }
        return {
          variant: 'secondary',
          icon: <FaCloud className="me-1" />,
          text: 'All changes saved',
          tooltip: lastSaved ? `Last saved: ${formatTime(lastSaved)}` : 'Up to date'
        };
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const saved = new Date(date);
    const diffMs = now - saved;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return saved.toLocaleDateString();
  };

  const config = getStatusConfig();

  const indicator = (
    <Badge 
      bg={config.variant}
      className="d-inline-flex align-items-center px-3 py-2"
      style={{ 
        fontSize: '0.85rem',
        fontWeight: 500,
        borderRadius: '20px'
      }}
    >
      {config.icon}
      <span>{config.text}</span>
      {saveCount > 0 && status !== 'saving' && (
        <span className="ms-2 opacity-75">({saveCount})</span>
      )}
    </Badge>
  );

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip>{config.tooltip}</Tooltip>}
    >
      <div className="auto-save-indicator">
        {indicator}
        
        {/* Additional info for mobile */}
        <div className="d-block d-md-none mt-1 small text-muted">
          {lastSaved && (
            <span>Last save: {formatTime(lastSaved)}</span>
          )}
          {hasUnsavedChanges && (
            <span className="ms-2 text-warning">
              <FaExclamationTriangle size={12} className="me-1" />
              Unsaved
            </span>
          )}
        </div>
      </div>
    </OverlayTrigger>
  );
};

// Compact version for inline display
export const CompactAutoSaveIndicator = ({ status, hasUnsavedChanges }) => {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Spinner animation="border" size="sm" />;
      case 'success':
        return <FaCheck className="text-success" />;
      case 'error':
        return <FaExclamationTriangle className="text-danger" />;
      default:
        return hasUnsavedChanges 
          ? <FaClock className="text-warning" />
          : <FaCheck className="text-muted" />;
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'saving': return 'Saving...';
      case 'success': return 'Saved';
      case 'error': return 'Save failed';
      default: return hasUnsavedChanges ? 'Unsaved changes' : 'Saved';
    }
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{getTooltip()}</Tooltip>}
    >
      <span className="auto-save-compact">
        {getIcon()}
      </span>
    </OverlayTrigger>
  );
};

// Status bar for form sections
export const SectionSaveStatus = ({ 
  title, 
  isSaved, 
  isSaving, 
  hasChanges,
  onSave
}) => {
  return (
    <div className="section-save-status d-flex align-items-center justify-content-between p-2 border rounded mb-3">
      <div className="d-flex align-items-center">
        <h6 className="mb-0 me-3">{title}</h6>
        
        {isSaving ? (
          <span className="text-warning small">
            <Spinner animation="border" size="sm" className="me-1" />
            Saving...
          </span>
        ) : hasChanges ? (
          <span className="text-info small">
            <FaClock className="me-1" />
            Unsaved changes
          </span>
        ) : isSaved ? (
          <span className="text-success small">
            <FaCheck className="me-1" />
            Saved
          </span>
        ) : null}
      </div>

      {hasChanges && onSave && (
        <button
          className="btn btn-sm btn-primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="me-1" />
              Save
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AutoSaveIndicator;