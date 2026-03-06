/**
 * Object Utilities
 */

export const objectUtils = {
  /**
   * Pick specific keys from object
   * @param {Object} obj - Source object
   * @param {Array} keys - Keys to pick
   * @returns {Object} - New object with picked keys
   */
  pick(obj, keys) {
    return keys.reduce((result, key) => {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  /**
   * Omit specific keys from object
   * @param {Object} obj - Source object
   * @param {Array} keys - Keys to omit
   * @returns {Object} - New object without omitted keys
   */
  omit(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },

  /**
   * Check if object has all keys
   * @param {Object} obj - Object to check
   * @param {Array} keys - Keys to check
   * @returns {boolean} - True if has all keys
   */
  hasKeys(obj, keys) {
    return keys.every((key) => obj && Object.prototype.hasOwnProperty.call(obj, key));
  },

  /**
   * Deep merge objects
   * @param {...Object} objects - Objects to merge
   * @returns {Object} - Merged object
   */
  deepMerge(...objects) {
    const result = {};

    objects.forEach((obj) => {
      if (!obj) return;

      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = this.deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      });
    });

    return result;
  },

  /**
   * Deep freeze object
   * @param {Object} obj - Object to freeze
   * @returns {Object} - Frozen object
   */
  deepFreeze(obj) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.deepFreeze(obj[key]);
      }
    });
    return Object.freeze(obj);
  },

  /**
   * Get nested value by path
   * @param {Object} obj - Object to query
   * @param {string} path - Path string (e.g., 'user.address.city')
   * @param {*} defaultValue - Default value
   * @returns {*} - Value at path
   */
  get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && Object.prototype.hasOwnProperty.call(result, key)) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result !== undefined ? result : defaultValue;
  },

  /**
   * Set nested value by path
   * @param {Object} obj - Object to modify
   * @param {string} path - Path string
   * @param {*} value - Value to set
   * @returns {Object} - Modified object
   */
  set(obj, path, value) {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  },

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} - True if empty
   */
  isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
  },

  /**
   * Get object size
   * @param {Object} obj - Object to check
   * @returns {number} - Number of keys
   */
  size(obj) {
    return obj ? Object.keys(obj).length : 0;
  },

  /**
   * Invert object keys and values
   * @param {Object} obj - Object to invert
   * @returns {Object} - Inverted object
   */
  invert(obj) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      result[value] = key;
      return result;
    }, {});
  },

  /**
   * Compare two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {boolean} - True if equal
   */
  isEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;

      const val1 = obj1[key];
      const val2 = obj2[key];

      if (val1 && val2 && typeof val1 === 'object' && typeof val2 === 'object') {
        return this.isEqual(val1, val2);
      }

      return val1 === val2;
    });
  },

  /**
   * Map object values
   * @param {Object} obj - Object to map
   * @param {Function} fn - Mapping function
   * @returns {Object} - Mapped object
   */
  mapValues(obj, fn) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      result[key] = fn(value, key);
      return result;
    }, {});
  },

  /**
   * Filter object by predicate
   * @param {Object} obj - Object to filter
   * @param {Function} predicate - Filter function
   * @returns {Object} - Filtered object
   */
  filter(obj, predicate) {
    return Object.entries(obj).reduce((result, [key, value]) => {
      if (predicate(value, key)) {
        result[key] = value;
      }
      return result;
    }, {});
  },

  /**
   * Convert object to query string
   * @param {Object} obj - Object to convert
   * @returns {string} - Query string
   */
  toQueryString(obj) {
    return Object.entries(obj)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  },

  /**
   * Parse query string to object
   * @param {string} query - Query string
   * @returns {Object} - Parsed object
   */
  fromQueryString(query) {
    const params = new URLSearchParams(query);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },
};
