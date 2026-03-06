/**
 * Cache Service
 * Manages application caching with localStorage and IndexedDB
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.storage = localStorage;
    this.prefix = 'cc_';
    this.defaultTTL = 300000; // 5 minutes
  }

  /**
   * Set cache item
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in ms
   */
  set(key, value, ttl = this.defaultTTL) {
    const cacheKey = this.prefix + key;
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      this.cache.set(cacheKey, item);
      this.storage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Get cache item
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null
   */
  get(key) {
    const cacheKey = this.prefix + key;

    // Check memory cache
    if (this.cache.has(cacheKey)) {
      const item = this.cache.get(cacheKey);
      if (!this.isExpired(item)) {
        return item.value;
      }
      this.cache.delete(cacheKey);
    }

    // Check storage cache
    try {
      const stored = this.storage.getItem(cacheKey);
      if (stored) {
        const item = JSON.parse(stored);
        if (!this.isExpired(item)) {
          this.cache.set(cacheKey, item);
          return item.value;
        }
        this.storage.removeItem(cacheKey);
      }
    } catch (error) {
      console.warn('Cache get failed:', error);
    }

    return null;
  }

  /**
   * Remove cache item
   * @param {string} key - Cache key
   */
  remove(key) {
    const cacheKey = this.prefix + key;
    this.cache.delete(cacheKey);
    this.storage.removeItem(cacheKey);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    Object.keys(this.storage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }

  /**
   * Check if cache item is expired
   * @param {Object} item - Cache item
   * @returns {boolean} - True if expired
   */
  isExpired(item) {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Get cache size
   * @returns {number} - Number of cache items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get all cache keys
   * @returns {Array} - Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}

export const cacheService = new CacheService();
