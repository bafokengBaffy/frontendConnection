/* eslint-disable no-unused-vars */
/**
 * Logging Utility
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

export const logger = {
  /**
   * Debug log
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Info log
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warn log
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error log
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);

      // Send to error tracking service in production
      if (import.meta.env.VITE_APP_ENVIRONMENT === 'production') {
        this.sendToErrorTracking(args);
      }
    }
  },

  /**
   * Group log
   * @param {string} label - Group label
   * @param {Function} fn - Function to execute
   */
  group(label, fn) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Time log
   * @param {string} label - Time label
   * @param {Function} fn - Function to time
   * @returns {*} - Function result
   */
  time(label, fn) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.time(label);
      const result = fn();
      console.timeEnd(label);
      return result;
    }
    return fn();
  },

  /**
   * Table log
   * @param {Array} data - Data to log
   */
  table(data) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.table(data);
    }
  },

  /**
   * Send error to tracking service
   * @param {Array} error - Error data
   */
  sendToErrorTracking(error) {
    // Implement error tracking service integration
    // e.g., Sentry, LogRocket, etc.
  },

  /**
   * Create child logger with context
   * @param {string} context - Logger context
   * @returns {Object} - Child logger
   */
  child(context) {
    return {
      debug: (...args) => this.debug(`[${context}]`, ...args),
      info: (...args) => this.info(`[${context}]`, ...args),
      warn: (...args) => this.warn(`[${context}]`, ...args),
      error: (...args) => this.error(`[${context}]`, ...args),
    };
  },
};
