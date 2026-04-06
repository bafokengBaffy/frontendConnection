/* eslint-disable no-unused-vars */
/**
 * Validation Utilities
 * Provides reusable validation functions for forms and data
 */

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^.@]+@[^.@]+.[^.@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-..]?[(]?[0-9]{1,4}[)]?[-..]?[0-9]{1,4}[-..]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and requirements
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      },
    };
  }

  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = score >= 4; // At least 4 out of 5 requirements met

  return { isValid, score, requirements };
};

/**
 * Validate South African ID number (Lesotho uses similar format)
 * @param {string} idNumber - ID number to validate
 * @returns {boolean} - True if valid ID
 */
export const isValidSouthAfricanID = (idNumber) => {
  if (!idNumber || typeof idNumber !== 'string') return false;

  // Basic format: YYMMDDSSSSCAZ
  // 13 digits
  const idRegex = /^.{13}$/;
  if (!idRegex.test(idNumber)) return false;

  // Validate date (first 6 digits)
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Luhn algorithm check (simplified)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(idNumber[i]);
    if (i % 2 === 0) {
      digit *= 2;
      sum += digit > 9 ? digit - 9 : digit;
    } else {
      sum += digit;
    }
  }

  const checkDigit = parseInt(idNumber[12]);
  return (sum + checkDigit) % 10 === 0;
};

/**
 * Validate date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {boolean} - True if end date is after start date
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return end > start;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - True if file type is allowed
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes || !Array.isArray(allowedTypes)) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} - True if file size is within limit
 */
export const isValidFileSize = (file, maxSize) => {
  if (!file || typeof maxSize !== 'number') return false;
  return file.size <= maxSize;
};

/**
 * Validate business registration number
 * @param {string} regNumber - Registration number
 * @returns {boolean} - True if valid registration number
 */
export const isValidBusinessRegNumber = (regNumber) => {
  if (!regNumber || typeof regNumber !== 'string') return false;
  // Format: YYYY/123456/07 or similar
  const regRegex = /^.{4}..{6}..{2}$/;
  return regRegex.test(regNumber);
};

/**
 * Validate VAT number
 * @param {string} vatNumber - VAT number
 * @returns {boolean} - True if valid VAT number
 */
export const isValidVATNumber = (vatNumber) => {
  if (!vatNumber || typeof vatNumber !== 'string') return false;
  // Basic VAT validation (format varies by country)
  const vatRegex = /^.{10}$/;
  return vatRegex.test(vatNumber);
};

/**
 * Validate numeric range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {boolean} - True if within range
 */
export const isInRange = (value, min, max) => {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    return false;
  }
  return value >= min && value <= max;
};

/**
 * Validate South African postal code
 * @param {string} postalCode - Postal code
 * @returns {boolean} - True if valid postal code
 */
export const isValidPostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  const postalRegex = /^.{4}$/;
  return postalRegex.test(postalCode);
};

/**
 * Validate credit card number (Luhn algorithm)
 * @param {string} cardNumber - Credit card number
 * @returns {boolean} - True if valid card number
 */
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[.-]/g, '');

  // Check if it's all digits and reasonable length
  if (!/^.{13,19}$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  let alternate = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
};

/**
 * Validate form data against schema
 * @param {object} data - Form data
 * @param {object} schema - Validation schema
 * @returns {object} - Validation errors
 */
export const validateForm = (data, schema) => {
  const errors = {};

  if (!data || !schema) return errors;

  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    const value = data[field];

    // Required check
    if (rules.required && isEmpty(value)) {
      errors[field] = rules.message || `${field} is required`;
      return;
    }

    // Skip further validation if empty and not required
    if (isEmpty(value) && !rules.required) return;

    // Type validation
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors[field] = rules.message || 'Invalid email format';
          }
          break;
        case 'phone':
          if (!isValidPhone(value)) {
            errors[field] = rules.message || 'Invalid phone format';
          }
          break;
        case 'url':
          if (!isValidUrl(value)) {
            errors[field] = rules.message || 'Invalid URL format';
          }
          break;
        case 'number':
          if (isNaN(parseFloat(value)) || !isFinite(value)) {
            errors[field] = rules.message || 'Must be a number';
          }
          break;
        default:
          break;
      }
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = rules.message || `Minimum length is ${rules.minLength}`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = rules.message || `Maximum length is ${rules.maxLength}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || 'Invalid format';
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const result = rules.validate(value, data);
      if (result !== true) {
        errors[field] = result || rules.message || 'Validation failed';
      }
    }
  });

  return errors;
};

export default {
  isEmpty,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePassword,
  isValidSouthAfricanID,
  isValidDateRange,
  isValidFileType,
  isValidFileSize,
  isValidBusinessRegNumber,
  isValidVATNumber,
  isInRange,
  isValidPostalCode,
  isValidCreditCard,
  validateForm,
};
