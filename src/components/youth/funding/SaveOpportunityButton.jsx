/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import './FundingComponents.css';

/**
 * SaveOpportunityButton Component
 * Allows users to save/unsave funding opportunities
 */
const SaveOpportunityButton = ({
  isSaved,
  onToggle,
  className = '',
  size = 'medium',
  showLabel = false,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const sizeClasses = {
    small: 'btn-save-small',
    medium: 'btn-save-medium',
    large: 'btn-save-large',
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-save ${sizeClasses[size]} ${isSaved ? 'saved' : ''} ${className}`}
      aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
      aria-pressed={isSaved}
    >
      <span className="save-icon" aria-hidden="true">
        {isSaved ? '❤️' : '🤍'}
      </span>
      {showLabel && <span className="save-label">{isSaved ? 'Saved' : 'Save'}</span>}
    </button>
  );
};

SaveOpportunityButton.propTypes = {
  isSaved: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
};

export default SaveOpportunityButton;
