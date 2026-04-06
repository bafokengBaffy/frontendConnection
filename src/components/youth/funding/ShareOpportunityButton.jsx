/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './FundingComponents.css';

/**
 * ShareOpportunityButton Component
 * Provides sharing options for funding opportunities
 */
const ShareOpportunityButton = ({ opportunity, onShare, className = '', size = 'medium' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async (method) => {
    try {
      let success = false;

      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(opportunity.shareUrl || window.location.href);
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2000);
          success = true;
          break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(opportunity.title)}&body=${encodeURIComponent(opportunity.description || 'Check out this funding opportunity!')}%0A%0A${encodeURIComponent(opportunity.shareUrl || window.location.href)}`;
          success = true;
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunity.shareUrl || window.location.href)}`,
            '_blank'
          );
          success = true;
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(opportunity.title)}&url=${encodeURIComponent(opportunity.shareUrl || window.location.href)}`,
            '_blank'
          );
          success = true;
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunity.shareUrl || window.location.href)}`,
            '_blank'
          );
          success = true;
          break;
        default:
          if (navigator.share) {
            await navigator.share({
              title: opportunity.title,
              text: opportunity.description,
              url: opportunity.shareUrl || window.location.href,
            });
            success = true;
          }
      }

      if (success && onShare) {
        onShare(method);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const sizeClasses = {
    small: 'btn-share-small',
    medium: 'btn-share-medium',
    large: 'btn-share-large',
  };

  return (
    <div className="share-button-container">
      <button
        onClick={() => handleShare('native')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`btn-share ${sizeClasses[size]} ${className}`}
        aria-label="Share opportunity"
        aria-haspopup="true"
      >
        <span className="share-icon" aria-hidden="true">
          📤
        </span>
      </button>

      {showTooltip && (
        <div className="share-tooltip" role="tooltip">
          <button
            onClick={() => handleShare('copy')}
            className="share-option"
            aria-label="Copy link"
          >
            {shareSuccess ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <button
            onClick={() => handleShare('email')}
            className="share-option"
            aria-label="Share via email"
          >
            ✉️ Email
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="share-option"
            aria-label="Share on LinkedIn"
          >
            🔗 LinkedIn
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="share-option"
            aria-label="Share on Twitter"
          >
            🐦 Twitter
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="share-option"
            aria-label="Share on Facebook"
          >
            📘 Facebook
          </button>
        </div>
      )}
    </div>
  );
};

ShareOpportunityButton.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    shareUrl: PropTypes.string,
  }).isRequired,
  onShare: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default ShareOpportunityButton;
