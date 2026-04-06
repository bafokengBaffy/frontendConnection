// components/FundingOpportunityCard.jsx
import { memo } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

import { formatCurrency } from '../../utils/formatters';
import './FundingOpportunityCard.css';

export const FundingOpportunityCard = memo(
  ({ opportunity, isSaved, onSave, onApply, onShare, viewMode }) => {
    const {
      id,
      title,
      provider,
      type,
      amount,
      deadline,
      eligibility,
      category,
      logo,
      bannerImage,
      description,
      matchScore,
      applicationCount,
    } = opportunity;

    const isExpiringSoon =
      deadline && new Date(deadline.seconds * 1000) - new Date() < 7 * 24 * 60 * 60 * 1000;

    const deadlineDate = deadline ? new Date(deadline.seconds * 1000) : null;

    return (
      <article
        className={`funding-card ${viewMode} ${isExpiringSoon ? 'expiring-soon' : ''}`}
        data-testid="funding-card"
        aria-labelledby={`title-${id}`}
      >
        {bannerImage && (
          <div className="card-banner">
            <img src={bannerImage} alt="" loading="lazy" className="banner-image" />
            {matchScore > 70 && (
              <span className="match-badge" aria-label="High match score">
                🔥 {matchScore}% Match
              </span>
            )}
          </div>
        )}

        <div className="card-header">
          {logo && (
            <div className="provider-logo">
              <img src={logo} alt={`${provider} logo`} loading="lazy" />
            </div>
          )}
          <div className="header-content">
            <h3 id={`title-${id}`} className="card-title">
              {title}
            </h3>
            <p className="provider-name">{provider}</p>
          </div>
          <button
            onClick={onSave}
            className={`save-btn ${isSaved ? 'saved' : ''}`}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-pressed={isSaved}
          >
            <span className="save-icon" aria-hidden="true">
              {isSaved ? '❤️' : '🤍'}
            </span>
          </button>
        </div>

        <div className="card-content">
          <p className="description">
            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
          </p>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Type</span>
              <span className="detail-value type-badge">{type}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value amount">
                {formatCurrency(amount.min)} - {formatCurrency(amount.max)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Deadline</span>
              <span className={`detail-value deadline ${isExpiringSoon ? 'urgent' : ''}`}>
                {deadlineDate
                  ? formatDistanceToNow(deadlineDate, { addSuffix: true })
                  : 'No deadline'}
                {isExpiringSoon && <span className="urgent-badge">Soon!</span>}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{category}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Eligibility</span>
              <span className="detail-value">{eligibility?.level || 'All'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Applicants</span>
              <span className="detail-value">{applicationCount || 0}</span>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button onClick={onApply} className="apply-btn" aria-label={`Apply for ${title}`}>
            Apply Now
          </button>
          <button onClick={onShare} className="share-btn" aria-label="Share opportunity">
            <span aria-hidden="true">📤</span>
          </button>
        </div>
      </article>
    );
  }
);

FundingOpportunityCard.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    amount: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }).isRequired,
    deadline: PropTypes.object,
    eligibility: PropTypes.object,
    category: PropTypes.string.isRequired,
    logo: PropTypes.string,
    bannerImage: PropTypes.string,
    description: PropTypes.string.isRequired,
    matchScore: PropTypes.number,
    applicationCount: PropTypes.number,
  }).isRequired,
  isSaved: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']).isRequired,
};

FundingOpportunityCard.displayName = 'FundingOpportunityCard';
