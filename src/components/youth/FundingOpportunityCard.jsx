// @ts-nocheck
import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

/**
 * FundingOpportunityCard Component
 * Displays a funding opportunity card with details, save/share functionality,
 * and responsive design for both grid and list views
 */
const FundingOpportunityCard = ({
  opportunity,
  isSaved = false,
  onSave,
  onApply,
  onShare,
  viewMode = 'grid',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    title,
    provider,
    type,
    amount,
    deadline,
    eligibility,
    description,
    logo,
    bannerImage,
    matchScore,
    applicationCount,
    viewCount,
    tags = [],
  } = opportunity;

  // Format amount range
  const formatAmount = (amountData) => {
    if (!amountData) return 'Amount not specified';
    const { min, max, currency = 'USD' } = amountData;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return 'Amount not specified';
  };

  // Format deadline
  const formatDeadline = (deadlineTimestamp) => {
    if (!deadlineTimestamp) return 'No deadline';

    try {
      const deadline = deadlineTimestamp.toDate
        ? deadlineTimestamp.toDate()
        : new Date(deadlineTimestamp);

      const now = new Date();
      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) return 'Deadline passed';
      if (daysUntil === 0) return 'Due today';
      if (daysUntil === 1) return 'Due tomorrow';
      if (daysUntil <= 7) return `${daysUntil} days left`;

      return formatDistanceToNow(deadline, { addSuffix: true });
    } catch (error) {
      return 'Invalid deadline';
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      grant: 'success',
      loan: 'primary',
      equity: 'warning',
      scholarship: 'info',
      fellowship: 'secondary',
      contest: 'danger',
    };
    return colors[type?.toLowerCase()] || 'secondary';
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Default logo based on provider type
  const getDefaultLogo = () => {
    const initials = provider
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials || 'FO';
  };

  // Grid view card
  const renderGridView = () => (
    <div
      className={`card h-100 funding-card ${isHovered ? 'shadow-lg' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="funding-card-grid"
    >
      {/* Banner Image or Gradient Background */}
      <div
        className="card-img-top position-relative"
        style={{
          height: '140px',
          background:
            bannerImage && !imageError
              ? `url(${bannerImage}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Logo Overlay */}
        <div className="position-absolute bottom-0 start-0 translate-middle-y ms-3">
          <div
            className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: '60px', height: '60px' }}
          >
            {logo && !imageError ? (
              <img
                src={logo}
                alt={`${provider} logo`}
                className="rounded-circle w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                <span className="fw-bold fs-5">{getDefaultLogo()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Type Badge */}
        <span className={`position-absolute top-0 end-0 badge bg-${getTypeBadgeColor(type)} m-2`}>
          {type || 'Opportunity'}
        </span>

        {/* Match Score */}
        {matchScore && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-success">{matchScore}% Match</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <h5 className="card-title h6 mb-1">{title}</h5>
        <p className="text-muted small mb-2">{provider}</p>

        {/* Amount */}
        <div className="mb-2">
          <span className="fw-bold text-primary">{formatAmount(amount)}</span>
        </div>

        {/* Deadline */}
        <div className="mb-2">
          <small className="text-muted">
            <i className="bi bi-calendar me-1"></i>
            Deadline: {formatDeadline(deadline)}
          </small>
        </div>

        {/* Eligibility Level */}
        {eligibility?.level && (
          <div className="mb-2">
            <span className="badge bg-light text-dark">{eligibility.level}</span>
          </div>
        )}

        {/* Description Preview */}
        <p className="card-text small text-muted mb-3">
          {description?.length > 100 ? `${description.substring(0, 100)}...` : description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge bg-light text-dark me-1">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="d-flex justify-content-between text-muted small mb-3">
          <span>
            <i className="bi bi-people me-1"></i>
            {applicationCount || 0} applied
          </span>
          <span>
            <i className="bi bi-eye me-1"></i>
            {viewCount || 0} views
          </span>
        </div>
      </div>

      <div className="card-footer bg-white border-0 pt-0">
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary flex-grow-1"
            onClick={() => onApply?.(opportunity)}
            aria-label={`Apply for ${title}`}
          >
            Apply Now
          </button>
          <button
            className={`btn ${isSaved ? 'btn-danger' : 'btn-outline-primary'}`}
            onClick={() => onSave?.(id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
          >
            <i className={`bi bi-heart${isSaved ? '-fill' : ''}`}></i>
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => onShare?.(opportunity)}
            aria-label="Share opportunity"
          >
            <i className="bi bi-share"></i>
          </button>
        </div>
      </div>
    </div>
  );

  // List view card
  const renderListView = () => (
    <div
      className="card mb-3 funding-card-list"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="funding-card-list"
    >
      <div className="row g-0">
        {/* Logo Column */}
        <div className="col-md-2 d-flex align-items-center justify-content-center p-3">
          <div
            className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: '80px', height: '80px' }}
          >
            {logo && !imageError ? (
              <img
                src={logo}
                alt={`${provider} logo`}
                className="rounded-circle w-100 h-100"
                style={{ objectFit: 'cover' }}
                onError={handleImageError}
                loading="lazy"
              />
            ) : (
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                <span className="fw-bold fs-4">{getDefaultLogo()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className="col-md-7">
          <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-2">
              <h5 className="card-title mb-0">{title}</h5>
              <span className={`badge bg-${getTypeBadgeColor(type)}`}>{type || 'Opportunity'}</span>
              {matchScore && <span className="badge bg-success">{matchScore}% Match</span>}
            </div>

            <p className="text-muted mb-2">{provider}</p>

            <p className="card-text mb-2">
              {description?.length > 200 ? `${description.substring(0, 200)}...` : description}
            </p>

            <div className="d-flex flex-wrap gap-3 mb-2">
              <div>
                <small className="text-muted">
                  <i className="bi bi-cash-stack me-1"></i>
                  {formatAmount(amount)}
                </small>
              </div>
              <div>
                <small className="text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  Deadline: {formatDeadline(deadline)}
                </small>
              </div>
              {eligibility?.level && (
                <div>
                  <span className="badge bg-light text-dark">{eligibility.level}</span>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                {tags.map((tag, index) => (
                  <span key={index} className="badge bg-light text-dark me-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Column */}
        <div className="col-md-3 d-flex flex-column justify-content-center p-3">
          <div className="d-flex gap-2 mb-2">
            <button
              className="btn btn-primary flex-grow-1"
              onClick={() => onApply?.(opportunity)}
              aria-label={`Apply for ${title}`}
            >
              Apply Now
            </button>
          </div>

          <div className="d-flex gap-2">
            <button
              className={`btn flex-grow-1 ${isSaved ? 'btn-danger' : 'btn-outline-primary'}`}
              onClick={() => onSave?.(id)}
              aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            >
              <i className={`bi bi-heart${isSaved ? '-fill' : ''} me-1`}></i>
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              className="btn btn-outline-secondary flex-grow-1"
              onClick={() => onShare?.(opportunity)}
              aria-label="Share opportunity"
            >
              <i className="bi bi-share me-1"></i>
              Share
            </button>
          </div>

          <div className="d-flex justify-content-between text-muted small mt-3">
            <span>
              <i className="bi bi-people me-1"></i>
              {applicationCount || 0}
            </span>
            <span>
              <i className="bi bi-eye me-1"></i>
              {viewCount || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return viewMode === 'grid' ? renderGridView() : renderListView();
};

FundingOpportunityCard.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    provider: PropTypes.string.isRequired,
    type: PropTypes.string,
    category: PropTypes.string,
    amount: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
      currency: PropTypes.string,
    }),
    deadline: PropTypes.oneOfType([
      PropTypes.object, // Firestore Timestamp
      PropTypes.string,
      PropTypes.number,
    ]),
    eligibility: PropTypes.shape({
      level: PropTypes.string,
      criteria: PropTypes.array,
    }),
    description: PropTypes.string,
    logo: PropTypes.string,
    bannerImage: PropTypes.string,
    matchScore: PropTypes.number,
    applicationCount: PropTypes.number,
    viewCount: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  isSaved: PropTypes.bool,
  onSave: PropTypes.func,
  onApply: PropTypes.func,
  onShare: PropTypes.func,
  viewMode: PropTypes.oneOf(['grid', 'list']),
};

export default FundingOpportunityCard;
