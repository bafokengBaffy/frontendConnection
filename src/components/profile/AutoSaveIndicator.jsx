/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { Badge, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaSave, FaCheck, FaExclamationTriangle, FaClock, FaCloud } from 'react-icons/fa';

/**
 * AutoSaveIndicator Component
 * Displays the current save status of auto-save functionality
 *
 * @param {Object} props
 * @param {string} props.status - 'saving', 'success', 'error', or null
 * @param {Date|string} props.lastSaved - Last save timestamp
 * @param {boolean} props.hasUnsavedChanges - Whether there are unsaved changes
 * @param {number} props.saveCount - Number of saves performed
 * @param {boolean} props.isSaving - Whether currently saving
 */
const AutoSaveIndicator = ({
  status,
  lastSaved,
  hasUnsavedChanges,
  saveCount = 0,
  isSaving = false,
}) => {
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

  const getStatusConfig = () => {
    // If isSaving is true, override any other status
    if (isSaving) {
      return {
        variant: 'warning',
        icon: <Spinner animation="border" size="sm" className="me-1" />,
        text: 'Saving...',
        tooltip: 'Changes are being saved',
      };
    }

    switch (status) {
      case 'saving':
        return {
          variant: 'warning',
          icon: <Spinner animation="border" size="sm" className="me-1" />,
          text: 'Saving...',
          tooltip: 'Changes are being saved',
        };
      case 'success':
        return {
          variant: 'success',
          icon: <FaCheck className="me-1" />,
          text: 'Saved',
          tooltip: lastSaved ? `Last saved: ${formatTime(lastSaved)}` : 'Changes saved',
        };
      case 'error':
        return {
          variant: 'danger',
          icon: <FaExclamationTriangle className="me-1" />,
          text: 'Save failed',
          tooltip: 'Failed to save changes. Please try again.',
        };
      default:
        if (hasUnsavedChanges) {
          return {
            variant: 'info',
            icon: <FaClock className="me-1" />,
            text: 'Unsaved changes',
            tooltip: 'You have unsaved changes',
          };
        }
        return {
          variant: 'secondary',
          icon: <FaCloud className="me-1" />,
          text: 'All changes saved',
          tooltip: lastSaved ? `Last saved: ${formatTime(lastSaved)}` : 'Up to date',
        };
    }
  };

  const config = getStatusConfig();

  const indicator = (
    <Badge
      bg={config.variant}
      className="d-inline-flex align-items-center px-3 py-2"
      style={{
        fontSize: '0.85rem',
        fontWeight: 500,
        borderRadius: '20px',
      }}
    >
      {config.icon}
      <span>{config.text}</span>
      {saveCount > 0 && status !== 'saving' && !isSaving && (
        <span className="ms-2 opacity-75">({saveCount})</span>
      )}
    </Badge>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={<Tooltip>{config.tooltip}</Tooltip>}>
      <div className="auto-save-indicator">
        {indicator}

        {/* Additional info for mobile */}
        <div className="d-block d-md-none mt-1 small text-muted">
          {lastSaved && <span>Last save: {formatTime(lastSaved)}</span>}
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

AutoSaveIndicator.propTypes = {
  status: PropTypes.oneOf(['saving', 'success', 'error', null]),
  lastSaved: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  hasUnsavedChanges: PropTypes.bool,
  saveCount: PropTypes.number,
  isSaving: PropTypes.bool,
};

export default AutoSaveIndicator;
