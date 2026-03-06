/**
 * Date Utilities
 */

import { DATE_FORMATS } from './constants';

export const dateUtils = {
  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string
   * @returns {string} - Formatted date
   */
  format(date, format = DATE_FORMATS.DEFAULT) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * Get start of day
   * @param {Date} date - Date
   * @returns {Date} - Start of day
   */
  startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  /**
   * Get end of day
   * @param {Date} date - Date
   * @returns {Date} - End of day
   */
  endOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get start of week
   * @param {Date} date - Date
   * @returns {Date} - Start of week
   */
  startOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  },

  /**
   * Get end of week
   * @param {Date} date - Date
   * @returns {Date} - End of week
   */
  endOfWeek(date = new Date()) {
    const d = this.startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  /**
   * Get start of month
   * @param {Date} date - Date
   * @returns {Date} - Start of month
   */
  startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  /**
   * Get end of month
   * @param {Date} date - Date
   * @returns {Date} - End of month
   */
  endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  },

  /**
   * Get start of year
   * @param {Date} date - Date
   * @returns {Date} - Start of year
   */
  startOfYear(date = new Date()) {
    return new Date(date.getFullYear(), 0, 1);
  },

  /**
   * Get end of year
   * @param {Date} date - Date
   * @returns {Date} - End of year
   */
  endOfYear(date = new Date()) {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  },

  /**
   * Add days to date
   * @param {Date} date - Date
   * @param {number} days - Days to add
   * @returns {Date} - New date
   */
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Add months to date
   * @param {Date} date - Date
   * @param {number} months - Months to add
   * @returns {Date} - New date
   */
  addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  },

  /**
   * Add years to date
   * @param {Date} date - Date
   * @param {number} years - Years to add
   * @returns {Date} - New date
   */
  addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  },

  /**
   * Get difference in days
   * @param {Date} date1 - First date
   * @param {Date} date2 - Second date
   * @returns {number} - Difference in days
   */
  diffInDays(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Check if date is today
   * @param {Date} date - Date to check
   * @returns {boolean} - True if today
   */
  isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  },

  /**
   * Check if date is in past
   * @param {Date} date - Date to check
   * @returns {boolean} - True if past
   */
  isPast(date) {
    const d = new Date(date);
    const now = new Date();
    return d < now;
  },

  /**
   * Check if date is in future
   * @param {Date} date - Date to check
   * @returns {boolean} - True if future
   */
  isFuture(date) {
    const d = new Date(date);
    const now = new Date();
    return d > now;
  },

  /**
   * Get age from birth date
   * @param {Date} birthDate - Birth date
   * @returns {number} - Age
   */
  getAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  },
};
