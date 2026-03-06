/**
 * Dynamic Import Service
 * Handles lazy loading of modules and components
 */

export const importService = {
  /**
   * Dynamically import a module
   * @param {string} path - Module path
   * @returns {Promise} - Imported module
   */
  async importModule(path) {
    try {
      return await import(/* @vite-ignore */ path);
    } catch (error) {
      console.error(`Failed to import module: ${path}`, error);
      throw new Error(`Module import failed: ${path}`);
    }
  },

  /**
   * Lazy load component with retry logic
   * @param {Function} importFn - Import function
   * @param {number} retries - Number of retries
   * @returns {Promise} - Imported component
   */
  async lazyLoad(importFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  },

  /**
   * Preload critical modules
   * @param {Array} modules - Array of module paths
   */
  preloadModules(modules) {
    modules.forEach((path) => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = path;
      document.head.appendChild(link);
    });
  },

  /**
   * Get chunk name from path
   * @param {string} path - Module path
   * @returns {string} - Chunk name
   */
  getChunkName(path) {
    return path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '');
  },
};
