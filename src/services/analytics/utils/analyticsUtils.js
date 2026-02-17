/**
 * Analytics Utility Functions
 */

/**
 * Format date for display
 * @param {Date|Timestamp} date - Date to format
 * @param {string} format - Format type
 */
export const formatDate = (date, format = 'relative') => {
  if (!date) return 'N/A';
  
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleString();
    case 'relative':
      return getRelativeTime(dateObj);
    default:
      return dateObj.toISOString().split('T')[0];
  }
};

/**
 * Get relative time string
 * @param {Date} date - Date to compare
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 */
export const formatNumber = (num, decimals = 0) => {
  if (typeof num !== 'number') return '0';
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 */
export const calculatePercentage = (part, total, decimals = 1) => {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
};

/**
 * Generate random ID for analytics events
 */
export const generateAnalyticsId = () => {
  return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize analytics data
 * @param {Object} data - Data to sanitize
 */
export const sanitizeAnalyticsData = (data) => {
  const sanitized = { ...data };
  
  // Remove sensitive information
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.creditCard;
  delete sanitized.ssn;
  
  // Truncate long strings
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
      sanitized[key] = sanitized[key].substring(0, 1000) + '...';
    }
  });
  
  return sanitized;
};

/**
 * Calculate average
 * @param {Array} numbers - Array of numbers
 */
export const calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const sum = numbers.reduce((acc, num) => acc + (Number(num) || 0), 0);
  return sum / numbers.length;
};

/**
 * Calculate median
 * @param {Array} numbers - Array of numbers
 */
export const calculateMedian = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

/**
 * Calculate standard deviation
 * @param {Array} numbers - Array of numbers
 */
export const calculateStandardDeviation = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length < 2) return 0;
  
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key] || 'unknown';
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort object by value
 * @param {Object} obj - Object to sort
 * @param {string} order - Sort order (asc/desc)
 */
export const sortObjectByValue = (obj, order = 'desc') => {
  return Object.entries(obj)
    .sort(([, a], [, b]) => order === 'desc' ? b - a : a - b)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Calculate trend direction
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 */
export const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 'up' : 'neutral';
  
  const change = ((current - previous) / Math.abs(previous)) * 100;
  
  if (Math.abs(change) < 5) return 'neutral';
  return change > 0 ? 'up' : 'down';
};

/**
 * Generate color based on value
 * @param {number} value - Value to base color on
 * @param {number} max - Maximum value for scale
 */
export const getColorForValue = (value, max = 100) => {
  const percentage = (value / max) * 100;
  
  if (percentage >= 80) return '#10b981'; // Green
  if (percentage >= 60) return '#3b82f6'; // Blue
  if (percentage >= 40) return '#f59e0b'; // Yellow
  if (percentage >= 20) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};