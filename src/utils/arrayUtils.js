/**
 * Array Utilities
 */

export const arrayUtils = {
  /**
   * Group array by key
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} - Grouped object
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  /**
   * Sort array by key
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {string} order - Sort order (asc/desc)
   * @returns {Array} - Sorted array
   */
  sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  /**
   * Filter unique values
   * @param {Array} array - Array to filter
   * @param {string} key - Key to check uniqueness
   * @returns {Array} - Unique array
   */
  uniqueBy(array, key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  /**
   * Chunk array into smaller arrays
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} - Chunked array
   */
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Remove duplicates
   * @param {Array} array - Array to process
   * @returns {Array} - Array without duplicates
   */
  unique(array) {
    return [...new Set(array)];
  },

  /**
   * Intersection of arrays
   * @param {...Array} arrays - Arrays to intersect
   * @returns {Array} - Intersection
   */
  intersect(...arrays) {
    if (arrays.length === 0) return [];
    return arrays.reduce((acc, arr) => acc.filter((item) => arr.includes(item)));
  },

  /**
   * Difference of arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Array} - Difference
   */
  difference(arr1, arr2) {
    return arr1.filter((item) => !arr2.includes(item));
  },

  /**
   * Flatten nested array
   * @param {Array} array - Nested array
   * @returns {Array} - Flattened array
   */
  flatten(array) {
    return array.reduce(
      (acc, val) => (Array.isArray(val) ? acc.concat(this.flatten(val)) : acc.concat(val)),
      []
    );
  },

  /**
   * Shuffle array
   * @param {Array} array - Array to shuffle
   * @returns {Array} - Shuffled array
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Get random item from array
   * @param {Array} array - Array to pick from
   * @returns {*} - Random item
   */
  randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Move item within array
   * @param {Array} array - Array
   * @param {number} from - From index
   * @param {number} to - To index
   * @returns {Array} - Modified array
   */
  moveItem(array, from, to) {
    const result = [...array];
    const item = result.splice(from, 1)[0];
    result.splice(to, 0, item);
    return result;
  },

  /**
   * Split array into two based on condition
   * @param {Array} array - Array to split
   * @param {Function} predicate - Split condition
   * @returns {Array} - [matching, nonMatching]
   */
  partition(array, predicate) {
    return array.reduce(
      (result, item) => {
        result[predicate(item) ? 0 : 1].push(item);
        return result;
      },
      [[], []]
    );
  },

  /**
   * Get intersection by key
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @param {string} key - Key to compare
   * @returns {Array} - Intersection
   */
  intersectBy(arr1, arr2, key) {
    const values = new Set(arr2.map((item) => item[key]));
    return arr1.filter((item) => values.has(item[key]));
  },
};
