/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import './FundingComponents.css';

/**
 * FilterPanel Component
 * Provides filtering options for funding opportunities
 */
const FilterPanel = ({
  filters,
  onFilterChange,
  opportunityTypes,
  categories,
  eligibilityLevels,
  className = '',
}) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const amountRanges = [
    { value: 'all', label: 'Any Amount' },
    { value: '0-10000', label: 'Under $10,000' },
    { value: '10000-50000', label: '$10,000 - $50,000' },
    { value: '50000-100000', label: '$50,000 - $100,000' },
    { value: '100000-250000', label: '$100,000 - $250,000' },
    { value: '250000-500000', label: '$250,000 - $500,000' },
    { value: '500000', label: '$500,000+' },
  ];

  const deadlineOptions = [
    { value: 'all', label: 'Any Deadline' },
    { value: 'week', label: 'Within 1 Week' },
    { value: 'month', label: 'Within 1 Month' },
    { value: 'quarter', label: 'Within 3 Months' },
  ];

  return (
    <div className={`filter-panel ${className}`}>
      <h3 className="filter-title">Filter Opportunities</h3>

      <div className="filter-section">
        <label htmlFor="type-filter" className="filter-label">
          Opportunity Type
        </label>
        <select
          id="type-filter"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="filter-select"
          aria-label="Filter by opportunity type"
        >
          {opportunityTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="category-filter" className="filter-label">
          Category
        </label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="amount-filter" className="filter-label">
          Amount Range
        </label>
        <select
          id="amount-filter"
          value={filters.amountRange}
          onChange={(e) => handleFilterChange('amountRange', e.target.value)}
          className="filter-select"
          aria-label="Filter by amount range"
        >
          {amountRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="deadline-filter" className="filter-label">
          Deadline
        </label>
        <select
          id="deadline-filter"
          value={filters.deadline}
          onChange={(e) => handleFilterChange('deadline', e.target.value)}
          className="filter-select"
          aria-label="Filter by deadline"
        >
          {deadlineOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="eligibility-filter" className="filter-label">
          Eligibility Level
        </label>
        <select
          id="eligibility-filter"
          value={filters.eligibility}
          onChange={(e) => handleFilterChange('eligibility', e.target.value)}
          className="filter-select"
          aria-label="Filter by eligibility level"
        >
          {eligibilityLevels.map((level) => (
            <option key={level} value={level}>
              {level === 'all' ? 'All Levels' : level}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() =>
          onFilterChange({
            type: 'all',
            amountRange: 'all',
            deadline: 'all',
            category: 'all',
            eligibility: 'all',
          })
        }
        className="clear-filters-btn"
        aria-label="Clear all filters"
      >
        Clear All Filters
      </button>
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    type: PropTypes.string,
    amountRange: PropTypes.string,
    deadline: PropTypes.string,
    category: PropTypes.string,
    eligibility: PropTypes.string,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  opportunityTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  eligibilityLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default FilterPanel;
