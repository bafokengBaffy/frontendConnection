/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../../../config/firebase';
import { cloudinaryService } from '../../../services/cloudinaryService';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import FundingOpportunityCard from '../../../components/youth/FundingOpportunityCard'; // Fixed: default import
import LoadingSpinner from '../../../components/layout/LoadingSpinner'; // Fixed: default import
import ErrorBoundary from '../../../components/ErrorBoundary'; // Fixed: default import
import SearchBar from '../../../components/common/SearchBar'; // Fixed: default import
import { useFundingOpportunities } from '../../../hooks/useFundingOpportunities';
import { trackEvent } from '../../../utils/analytics';
import { logger } from '../../../utils/logger';

// FIXED: Correct import paths from components directory
import FilterPanel from '../../../components/youth/funding/FilterPanel';
import SaveOpportunityButton from '../../../components/youth/funding/SaveOpportunityButton';
import ShareOpportunityButton from '../../../components/youth/funding/ShareOpportunityButton';
import ApplyModal from '../../../components/youth/funding/ApplyModal';
import './FundingOpportunities.css';

/**
 * FundingOpportunities Component
 * Displays available funding opportunities with advanced filtering,
 * real-time updates, and Cloudinary-optimized images
 */
const FundingOpportunities = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    amountRange: 'all',
    deadline: 'all',
    category: 'all',
    eligibility: 'all',
  });
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const { getFilteredOpportunities, saveOpportunity, unsaveOpportunity } = useFundingOpportunities(
    user?.uid
  );

  // Fetch opportunities with filters
  const fetchOpportunities = useCallback(
    async (loadMore = false) => {
      try {
        setLoading(true);
        setError(null);

        // Build query constraints
        const constraints = [
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(12),
        ];

        // Apply filters
        if (filters.type !== 'all') {
          constraints.push(where('type', '==', filters.type));
        }

        if (filters.category !== 'all') {
          constraints.push(where('category', '==', filters.category));
        }

        if (filters.eligibility !== 'all') {
          constraints.push(where('eligibility.level', '==', filters.eligibility));
        }

        // Amount range filter
        if (filters.amountRange !== 'all') {
          const [min, max] = filters.amountRange.split('-').map(Number);
          if (max) {
            constraints.push(where('amount.min', '>=', min));
            constraints.push(where('amount.max', '<=', max));
          } else {
            constraints.push(where('amount.min', '>=', min));
          }
        }

        // Deadline filter
        if (filters.deadline !== 'all') {
          const now = Timestamp.now();
          switch (filters.deadline) {
            case 'week':
              const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              constraints.push(where('deadline', '<=', Timestamp.fromDate(weekLater)));
              break;
            case 'month':
              const monthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              constraints.push(where('deadline', '<=', Timestamp.fromDate(monthLater)));
              break;
            case 'quarter':
              const quarterLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
              constraints.push(where('deadline', '<=', Timestamp.fromDate(quarterLater)));
              break;
          }
        }

        // Search term filter
        if (searchTerm) {
          const searchTerms = searchTerm
            .toLowerCase()
            .split(' ')
            .filter((term) => term.length > 0);
          if (searchTerms.length > 0) {
            constraints.push(where('searchKeywords', 'array-contains-any', searchTerms));
          }
        }

        // Add pagination
        if (loadMore && lastVisible) {
          constraints.push(startAfter(lastVisible));
        }

        const q = query(collection(db, 'fundingOpportunities'), ...constraints);
        const querySnapshot = await getDocs(q);

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(querySnapshot.docs.length === 12);

        const fetchedOpportunities = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Process Cloudinary images with error handling
            logo: data.logo
              ? cloudinaryService.optimizeImage(data.logo, {
                  width: 200,
                  height: 200,
                  crop: 'fill',
                  quality: 'auto',
                  fetchFormat: 'auto',
                })
              : null,
            bannerImage: data.bannerImage
              ? cloudinaryService.optimizeImage(data.bannerImage, {
                  width: 800,
                  height: 400,
                  crop: 'fill',
                  quality: 'auto',
                  fetchFormat: 'auto',
                })
              : null,
            gallery: Array.isArray(data.gallery)
              ? data.gallery.map((img) =>
                  cloudinaryService.optimizeImage(img, {
                    width: 400,
                    height: 300,
                    crop: 'fill',
                    quality: 'auto',
                    fetchFormat: 'auto',
                  })
                )
              : [],
          };
        });

        setOpportunities((prev) =>
          loadMore ? [...prev, ...fetchedOpportunities] : fetchedOpportunities
        );

        // Track view event
        trackEvent('funding_opportunities_viewed', {
          userId: user?.uid,
          filters,
          count: fetchedOpportunities.length,
        });

        logger.info(`Fetched ${fetchedOpportunities.length} funding opportunities`);
      } catch (err) {
        logger.error('Error fetching opportunities:', err);
        setError('Failed to load funding opportunities. Please try again.');
        showNotification('error', 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    },
    [filters, searchTerm, lastVisible, user?.uid, showNotification]
  );

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Load saved opportunities for user
  useEffect(() => {
    const loadSavedOpportunities = async () => {
      if (!user?.uid) return;

      try {
        const savedQuery = query(collection(db, 'users', user.uid, 'savedOpportunities'));
        const savedSnapshot = await getDocs(savedQuery);
        const savedSet = new Set(savedSnapshot.docs.map((doc) => doc.id));
        setSavedOpportunities(savedSet);
      } catch (err) {
        logger.error('Error loading saved opportunities:', err);
      }
    };

    loadSavedOpportunities();
  }, [user?.uid]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setLastVisible(null);
    setOpportunities([]);
  }, []);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setLastVisible(null);
    setOpportunities([]);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchOpportunities(true);
    }
  }, [hasMore, loading, fetchOpportunities]);

  // Handle save/unsave
  const handleSaveToggle = useCallback(
    async (opportunityId) => {
      if (!user) {
        showNotification('info', 'Please login to save opportunities');
        return;
      }

      try {
        if (savedOpportunities.has(opportunityId)) {
          await unsaveOpportunity(opportunityId);
          setSavedOpportunities((prev) => {
            const newSet = new Set(prev);
            newSet.delete(opportunityId);
            return newSet;
          });
          showNotification('success', 'Opportunity removed from saved');
        } else {
          await saveOpportunity(opportunityId);
          setSavedOpportunities((prev) => new Set([...prev, opportunityId]));
          showNotification('success', 'Opportunity saved successfully');

          // Track save event
          trackEvent('funding_opportunity_saved', {
            userId: user.uid,
            opportunityId,
          });
        }
      } catch (err) {
        logger.error('Error toggling save:', err);
        showNotification('error', 'Failed to save opportunity');
      }
    },
    [user, savedOpportunities, saveOpportunity, unsaveOpportunity, showNotification]
  );

  // Handle apply
  const handleApply = useCallback(
    (opportunity) => {
      if (!user) {
        showNotification('info', 'Please login to apply');
        return;
      }
      setSelectedOpportunity(opportunity);
      setShowApplyModal(true);
    },
    [user, showNotification]
  );

  // Handle share
  const handleShare = useCallback(
    async (opportunity) => {
      try {
        const shareData = {
          title: opportunity.title,
          text: `Check out this funding opportunity: ${opportunity.title} from ${opportunity.provider}`,
          url: `${window.location.origin}/funding/${opportunity.id}`,
        };

        if (navigator.share && window.innerWidth <= 768) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          showNotification('success', 'Link copied to clipboard');
        }

        // Track share event
        trackEvent('funding_opportunity_shared', {
          userId: user?.uid,
          opportunityId: opportunity.id,
        });
      } catch (err) {
        logger.error('Error sharing:', err);
        showNotification('error', 'Failed to share opportunity');
      }
    },
    [user?.uid, showNotification]
  );

  // Increment view count
  const handleView = useCallback(async (opportunityId) => {
    try {
      const oppRef = doc(db, 'fundingOpportunities', opportunityId);
      await updateDoc(oppRef, {
        viewCount: increment(1),
        lastViewedAt: Timestamp.now(),
      });
    } catch (err) {
      logger.error('Error incrementing view count:', err);
    }
  }, []);

  // Filter opportunities by type
  const opportunityTypes = useMemo(() => {
    const types = new Set();
    opportunities.forEach((opp) => opp.type && types.add(opp.type));
    return ['all', ...types].filter(Boolean);
  }, [opportunities]);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set();
    opportunities.forEach((opp) => opp.category && cats.add(opp.category));
    return ['all', ...cats].filter(Boolean);
  }, [opportunities]);

  // Eligibility levels
  const eligibilityLevels = useMemo(() => {
    const levels = new Set();
    opportunities.forEach((opp) => opp.eligibility?.level && levels.add(opp.eligibility.level));
    return ['all', ...levels].filter(Boolean);
  }, [opportunities]);

  if (error) {
    return (
      <div className="funding-opportunities-error" role="alert">
        <h3>Error Loading Opportunities</h3>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchOpportunities();
          }}
          className="btn btn-primary"
          aria-label="Retry loading opportunities"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="funding-opportunities-container">
        {/* Header Section */}
        <header className="funding-header">
          <div className="header-content">
            <h1 className="funding-title">
              Funding Opportunities
              {opportunities.length > 0 && (
                <span className="opportunity-count" aria-label="Total opportunities">
                  ({opportunities.length})
                </span>
              )}
            </h1>
            <p className="funding-subtitle">
              Discover grants, loans, and investment opportunities for your business
            </p>
          </div>
        </header>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search opportunities by name, provider, or keywords..."
            debounceMs={500}
            className="funding-search"
            aria-label="Search funding opportunities"
            initialValue={searchTerm}
          />

          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            opportunityTypes={opportunityTypes}
            categories={categories}
            eligibilityLevels={eligibilityLevels}
            className="funding-filters"
          />

          <div className="view-toggle" role="tablist" aria-label="View options">
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-selected={viewMode === 'grid'}
              role="tab"
            >
              <span className="icon-grid" aria-hidden="true">
                📊
              </span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
              aria-selected={viewMode === 'list'}
              role="tab"
            >
              <span className="icon-list" aria-hidden="true">
                📋
              </span>
            </button>
          </div>
        </div>

        {/* Opportunities Grid/List */}
        {loading && opportunities.length === 0 ? (
          <div className="loading-container" aria-label="Loading opportunities">
            <LoadingSpinner size="large" />
            <p>Loading funding opportunities...</p>
          </div>
        ) : (
          <>
            <div
              className={`opportunities-${viewMode}`}
              role="region"
              aria-label="Funding opportunities"
            >
              {opportunities.length > 0 ? (
                opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`opportunity-wrapper ${viewMode}-item`}
                    onMouseEnter={() => handleView(opportunity.id)}
                  >
                    <FundingOpportunityCard
                      opportunity={opportunity}
                      isSaved={savedOpportunities.has(opportunity.id)}
                      onSave={() => handleSaveToggle(opportunity.id)}
                      onApply={() => handleApply(opportunity)}
                      onShare={() => handleShare(opportunity)}
                      viewMode={viewMode}
                    />
                  </div>
                ))
              ) : (
                <div className="no-results" role="status">
                  <h3>No opportunities found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                  <button
                    onClick={() => {
                      setFilters({
                        type: 'all',
                        amountRange: 'all',
                        deadline: 'all',
                        category: 'all',
                        eligibility: 'all',
                      });
                      setSearchTerm('');
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMore && opportunities.length > 0 && (
              <div className="load-more-container">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn btn-outline-primary load-more-btn"
                  aria-label="Load more opportunities"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Load More Opportunities'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedOpportunity && (
          <ApplyModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowApplyModal(false);
              setSelectedOpportunity(null);
            }}
            user={user}
            onSuccess={() => {
              showNotification('success', 'Application submitted successfully!');
              trackEvent('funding_application_submitted', {
                userId: user?.uid,
                opportunityId: selectedOpportunity.id,
              });
            }}
          />
        )}

        {/* Action Buttons (Floating for mobile) */}
        <div className="floating-actions">
          <SaveOpportunityButton
            savedOpportunities={savedOpportunities}
            className="mobile-save-btn"
          />
          <ShareOpportunityButton opportunities={opportunities} className="mobile-share-btn" />
        </div>
      </div>
    </ErrorBoundary>
  );
};

FundingOpportunities.propTypes = {
  // Add any props if needed
};

export default FundingOpportunities;
