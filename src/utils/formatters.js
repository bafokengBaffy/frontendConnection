/**
 * Data Formatting Utilities
 */

import { DATE_FORMATS } from './constants';

export const formatters = {
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} - Formatted currency
   */
  currency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format
   * @param {number} decimals - Decimal places
   * @returns {string} - Formatted percentage
   */
  percentage(value, decimals = 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  },

  /**
   * Format number with commas
   * @param {number} number - Number to format
   * @returns {string} - Formatted number
   */
  number(number) {
    return new Intl.NumberFormat('en-US').format(number);
  },

  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {string} format - Date format
   * @returns {string} - Formatted date
   */
  date(date, format = DATE_FORMATS.DISPLAY) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (format.includes('HH:mm')) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return d.toLocaleDateString('en-US', options);
  },

  /**
   * Format phone number
   * @param {string} phone - Phone number
   * @returns {string} - Formatted phone number
   */
  phone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/./g, '');
    const match = cleaned.match(/^(.{3})(.{3})(.{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  },

  /**
   * Format file name
   * @param {string} fileName - File name
   * @param {number} maxLength - Max length
   * @returns {string} - Formatted file name
   */
  fileName(fileName, maxLength = 30) {
    if (!fileName) return '';
    if (fileName.length <= maxLength) return fileName;

    const ext = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncated = name.substring(0, maxLength - ext.length - 4);
    return truncated + '...' + ext;
  },

  /**
   * Format duration
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  duration(seconds) {
    if (!seconds) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Format address
   * @param {Object} address - Address object
   * @returns {string} - Formatted address
   */
  address(address) {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    return parts.join(', ');
  },

  /**
   * Format full name
   * @param {Object} name - Name object
   * @returns {string} - Formatted name
   */
  fullName(name) {
    if (!name) return '';
    if (typeof name === 'string') return name;

    const parts = [];
    if (name.firstName) parts.push(name.firstName);
    if (name.middleName) parts.push(name.middleName);
    if (name.lastName) parts.push(name.lastName);
    return parts.join(' ');
  },

  /**
   * Format relative time
   * @param {Date|string} date - Date to format
   * @returns {string} - Relative time
   */
  timeAgo(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }

    return 'just now';
  },
};
