// frontend/src/services/analyticsExtendedService.js
import { auth } from '../config/firebase';

import API_BASE_URL from './apiConfig';

const buildHeaders = async (options = {}) => {
  const token = await auth.currentUser?.getIdToken?.();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
};

const request = async (path, options = {}) => {
  try {
    const headers = await buildHeaders(options);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data?.message || 'Request failed', error: data?.error };
    }
    return data;
  } catch (error) {
    return { success: false, message: 'Network error: ' + error.message };
  }
};

export const analyticsExtendedService = {
  getSystemInsights: () => request('/api/analytics/extended/system'),
  getRoleInsights: (role) => request(`/api/analytics/extended/role/${role}`),
  getModelMetrics: (model) => request(`/api/analytics/extended/models/${model}`),
  getUsageTrends: (range = '30d') => request(`/api/analytics/extended/usage?range=${range}`),
};

export default analyticsExtendedService;
