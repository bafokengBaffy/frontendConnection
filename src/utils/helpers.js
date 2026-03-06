/**
 * General Helper Functions
 */

import { APP_CONFIG } from './constants';

export const helpers = {
  /**
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object} - Cloned object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} - True if empty
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} - Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in ms
   * @returns {Function} - Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Truncate text
   * @param {string} text - Text to truncate
   * @param {number} length - Max length
   * @returns {string} - Truncated text
   */
  truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substr(0, length).trim() + '...';
  },

  /**
   * Get environment variable
   * @param {string} key - Variable key
   * @param {*} defaultValue - Default value
   * @returns {*} - Variable value
   */
  getEnv(key, defaultValue = null) {
    return import.meta.env[`VITE_${key}`] || defaultValue;
  },

  /**
   * Check if in development mode
   * @returns {boolean} - True if development
   */
  isDevelopment() {
    return APP_CONFIG.environment === 'development';
  },

  /**
   * Check if in production mode
   * @returns {boolean} - True if production
   */
  isProduction() {
    return APP_CONFIG.environment === 'production';
  },

  /**
   * Sleep for specified time
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after sleep
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retries
   * @returns {Promise} - Promise with result
   */
  async retry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(Math.pow(2, i) * 1000);
      }
    }
  },
};
