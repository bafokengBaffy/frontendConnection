/**
 * Permission Management
 */

import { USER_ROLES, PERMISSIONS } from './constants';

const rolePermissions = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.REVIEW_APPLICATION,
  ],

  [USER_ROLES.COMPANY]: [
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.READ_JOB,
    PERMISSIONS.UPDATE_JOB,
    PERMISSIONS.DELETE_JOB,
    PERMISSIONS.READ_APPLICATION,
    PERMISSIONS.UPDATE_APPLICATION,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [USER_ROLES.STUDENT]: [
    PERMISSIONS.READ_JOB,
    PERMISSIONS.APPLY_JOB,
    PERMISSIONS.CREATE_APPLICATION,
    PERMISSIONS.READ_APPLICATION,
    PERMISSIONS.UPDATE_APPLICATION,
  ],

  [USER_ROLES.INSTITUTE]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.READ_APPLICATION,
    PERMISSIONS.REVIEW_APPLICATION,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [USER_ROLES.MENTOR]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.READ_CONTENT,
    PERMISSIONS.UPDATE_CONTENT,
  ],

  [USER_ROLES.YOUTH]: [
    PERMISSIONS.CREATE_FUNDING,
    PERMISSIONS.READ_FUNDING,
    PERMISSIONS.APPLY_FUNDING,
    PERMISSIONS.READ_JOB,
  ],

  [USER_ROLES.ENTREPRENEUR]: [
    PERMISSIONS.CREATE_FUNDING,
    PERMISSIONS.READ_FUNDING,
    PERMISSIONS.APPLY_FUNDING,
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.READ_JOB,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
};

export const permissions = {
  /**
   * Check if user has permission
   * @param {Object} user - User object
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if has permission
   */
  hasPermission(user, permission) {
    if (!user || !user.role) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  },

  /**
   * Check if user has any of the permissions
   * @param {Object} user - User object
   * @param {Array} permissions - Permissions to check
   * @returns {boolean} - True if has any permission
   */
  hasAnyPermission(user, permissions) {
    return permissions.some((permission) => this.hasPermission(user, permission));
  },

  /**
   * Check if user has all permissions
   * @param {Object} user - User object
   * @param {Array} permissions - Permissions to check
   * @returns {boolean} - True if has all permissions
   */
  hasAllPermissions(user, permissions) {
    return permissions.every((permission) => this.hasPermission(user, permission));
  },

  /**
   * Get user permissions
   * @param {Object} user - User object
   * @returns {Array} - Array of permissions
   */
  getUserPermissions(user) {
    if (!user || !user.role) return [];
    return rolePermissions[user.role] || [];
  },

  /**
   * Check if user is admin
   * @param {Object} user - User object
   * @returns {boolean} - True if admin
   */
  isAdmin(user) {
    return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN;
  },

  /**
   * Check if user is super admin
   * @param {Object} user - User object
   * @returns {boolean} - True if super admin
   */
  isSuperAdmin(user) {
    return user?.role === USER_ROLES.SUPER_ADMIN;
  },

  /**
   * Filter data by user permissions
   * @param {Array} data - Data to filter
   * @param {Object} user - User object
   * @param {string} permission - Required permission
   * @returns {Array} - Filtered data
   */
  filterByPermission(data, user, permission) {
    if (!user || !permission) return [];
    if (this.isSuperAdmin(user)) return data;

    return data.filter((item) => {
      // Add custom filtering logic based on data ownership
      return true;
    });
  },
};
