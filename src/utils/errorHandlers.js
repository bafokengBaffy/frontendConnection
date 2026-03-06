/**
 * Error Handling Utilities
 */

import { ERROR_MESSAGES } from './constants';
import { logger } from './logger';

export const errorHandlers = {
  /**
   * Handle API error
   * @param {Error} error - Error object
   * @returns {Object} - Formatted error
   */
  handleApiError(error) {
    logger.error('API Error:', error);

    // Network error
    if (!error.response) {
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 503,
        type: 'network',
      };
    }

    // HTTP error
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          message: data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
          status,
          type: 'validation',
          errors: data?.errors,
        };

      case 401:
        return {
          message: ERROR_MESSAGES.UNAUTHORIZED,
          status,
          type: 'auth',
        };

      case 403:
        return {
          message: ERROR_MESSAGES.FORBIDDEN,
          status,
          type: 'auth',
        };

      case 404:
        return {
          message: ERROR_MESSAGES.NOT_FOUND,
          status,
          type: 'not_found',
        };

      case 429:
        return {
          message: ERROR_MESSAGES.RATE_LIMIT,
          status,
          type: 'rate_limit',
        };

      case 500:
      case 502:
      case 503:
        return {
          message: ERROR_MESSAGES.SERVER_ERROR,
          status,
          type: 'server',
        };

      default:
        return {
          message: data?.message || ERROR_MESSAGES.SERVER_ERROR,
          status,
          type: 'unknown',
        };
    }
  },

  /**
   * Handle form validation error
   * @param {Object} errors - Validation errors
   * @returns {Object} - Formatted errors
   */
  handleValidationError(errors) {
    const formatted = {};

    Object.keys(errors).forEach((key) => {
      formatted[key] = {
        message: errors[key].message,
        type: errors[key].type || 'validation',
      };
    });

    return formatted;
  },

  /**
   * Handle Firebase error
   * @param {Error} error - Firebase error
   * @returns {Object} - Formatted error
   */
  handleFirebaseError(error) {
    logger.error('Firebase Error:', error);

    const errorMap = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email is already in use',
      'auth/weak-password': 'Password is too weak',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/requires-recent-login': 'Please log in again to continue',
    };

    return {
      message: errorMap[error.code] || error.message || ERROR_MESSAGES.SERVER_ERROR,
      code: error.code,
      type: 'firebase',
    };
  },

  /**
   * Handle storage error
   * @param {Error} error - Storage error
   * @returns {Object} - Formatted error
   */
  handleStorageError(error) {
    logger.error('Storage Error:', error);

    return {
      message: 'Failed to access storage',
      type: 'storage',
      original: error,
    };
  },

  /**
   * Create error boundary fallback
   * @param {Error} error - Error object
   * @param {Object} errorInfo - Error info
   * @returns {Object} - Fallback props
   */
  createErrorFallback(error, errorInfo) {
    logger.error('Component Error:', error, errorInfo);

    return {
      message: 'Something went wrong',
      details: import.meta.env.VITE_DEBUG ? error.toString() : null,
      reset: () => window.location.reload(),
    };
  },

  /**
   * Handle async error with retry
   * @param {Function} fn - Async function
   * @param {number} retries - Number of retries
   * @returns {Promise} - Promise with result
   */
  async withRetry(fn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  },

  /**
   * Handle error and show user message
   * @param {Error} error - Error object
   * @param {Function} showToast - Toast function
   */
  showError(error, showToast) {
    const handled = this.handleApiError(error);
    showToast(handled.message, 'error');
  },
};
