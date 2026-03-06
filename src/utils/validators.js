/**
 * Validation Utilities
 */

export const validators = {
  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  /**
   * Validate phone number
   * @param {string} phone - Phone to validate
   * @returns {boolean} - True if valid
   */
  phone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone));
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result
   */
  password(password) {
    const result = {
      isValid: false,
      strength: 0,
      errors: [],
    };

    if (!password) {
      result.errors.push('Password is required');
      return result;
    }

    // Length check
    if (password.length < 8) {
      result.errors.push('Password must be at least 8 characters');
    } else {
      result.strength += 25;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      result.errors.push('Password must contain at least one uppercase letter');
    } else {
      result.strength += 25;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      result.errors.push('Password must contain at least one lowercase letter');
    } else {
      result.strength += 25;
    }

    // Number check
    if (!/\d/.test(password)) {
      result.errors.push('Password must contain at least one number');
    } else {
      result.strength += 15;
    }

    // Special character check
    if (!/[!@#$%^&*]/.test(password)) {
      result.errors.push('Password must contain at least one special character');
    } else {
      result.strength += 10;
    }

    result.isValid = result.errors.length === 0;
    return result;
  },

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid
   */
  url(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate required field
   * @param {*} value - Value to validate
   * @returns {boolean} - True if valid
   */
  required(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  },

  /**
   * Validate min length
   * @param {string} value - Value to validate
   * @param {number} min - Minimum length
   * @returns {boolean} - True if valid
   */
  minLength(value, min) {
    return String(value).length >= min;
  },

  /**
   * Validate max length
   * @param {string} value - Value to validate
   * @param {number} max - Maximum length
   * @returns {boolean} - True if valid
   */
  maxLength(value, max) {
    return String(value).length <= max;
  },

  /**
   * Validate min value
   * @param {number} value - Value to validate
   * @param {number} min - Minimum value
   * @returns {boolean} - True if valid
   */
  min(value, min) {
    return Number(value) >= min;
  },

  /**
   * Validate max value
   * @param {number} value - Value to validate
   * @param {number} max - Maximum value
   * @returns {boolean} - True if valid
   */
  max(value, max) {
    return Number(value) <= max;
  },

  /**
   * Validate pattern
   * @param {string} value - Value to validate
   * @param {RegExp} pattern - Regex pattern
   * @returns {boolean} - True if valid
   */
  pattern(value, pattern) {
    return pattern.test(String(value));
  },

  /**
   * Validate date
   * @param {string|Date} date - Date to validate
   * @returns {boolean} - True if valid
   */
  date(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  },

  /**
   * Validate file type
   * @param {File} file - File to validate
   * @param {Array} allowedTypes - Allowed MIME types
   * @returns {boolean} - True if valid
   */
  fileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   * @param {File} file - File to validate
   * @param {number} maxSize - Maximum size in bytes
   * @returns {boolean} - True if valid
   */
  fileSize(file, maxSize) {
    return file.size <= maxSize;
  },
};
