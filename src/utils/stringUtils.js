/**
 * String Utilities
 */

export const stringUtils = {
  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Capitalize each word
   * @param {string} str - String to capitalize
   * @returns {string} - Capitalized string
   */
  capitalizeWords(str) {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => this.capitalize(word))
      .join(' ');
  },

  /**
   * Convert to camelCase
   * @param {string} str - String to convert
   * @returns {string} - Camel case string
   */
  toCamelCase(str) {
    return str
      .replace(/(?:^.|[A-Z]|..)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/.+/g, '');
  },

  /**
   * Convert to snake_case
   * @param {string} str - String to convert
   * @returns {string} - Snake case string
   */
  toSnakeCase(str) {
    return str
      .replace(/.+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  },

  /**
   * Convert to kebab-case
   * @param {string} str - String to convert
   * @returns {string} - Kebab case string
   */
  toKebabCase(str) {
    return str
      .replace(/.+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  },

  /**
   * Truncate string
   * @param {string} str - String to truncate
   * @param {number} length - Max length
   * @param {string} suffix - Suffix to add
   * @returns {string} - Truncated string
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },

  /**
   * Remove HTML tags
   * @param {string} html - HTML string
   * @returns {string} - Plain text
   */
  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  },

  /**
   * Escape HTML
   * @param {string} html - HTML string
   * @returns {string} - Escaped HTML
   */
  escapeHtml(html) {
    if (!html) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return html.replace(/[&<>"']/g, (m) => map[m]);
  },

  /**
   * Generate slug from string
   * @param {string} str - String to slugify
   * @returns {string} - Slug
   */
  slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/.+/g, '-')
      .replace(/[^..]+/g, '')
      .replace(/..+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  },

  /**
   * Extract initials from name
   * @param {string} name - Full name
   * @returns {string} - Initials
   */
  getInitials(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  /**
   * Mask email
   * @param {string} email - Email to mask
   * @returns {string} - Masked email
   */
  maskEmail(email) {
    if (!email) return '';
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
    return maskedLocal + '@' + domain;
  },

  /**
   * Mask phone
   * @param {string} phone - Phone to mask
   * @returns {string} - Masked phone
   */
  maskPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/./g, '');
    if (cleaned.length < 4) return phone;
    const last4 = cleaned.slice(-4);
    return '***-***-' + last4;
  },

  /**
   * Generate random string
   * @param {number} length - String length
   * @returns {string} - Random string
   */
  random(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Check if string contains only letters and numbers
   * @param {string} str - String to check
   * @returns {boolean} - True if alphanumeric
   */
  isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
  },

  /**
   * Extract numbers from string
   * @param {string} str - String to extract from
   * @returns {string} - Numbers only
   */
  extractNumbers(str) {
    return str.replace(/./g, '');
  },
};
