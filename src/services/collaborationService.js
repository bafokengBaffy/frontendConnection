// frontend/src/services/collaborationService.js
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
      return {
        success: false,
        message: data?.message || 'Request failed',
        error: data?.error,
      };
    }
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error: ' + error.message,
    };
  }
};

export const collaborationService = {
  getOverview: () => request(`/api/collaboration/overview`),
  getModels: () => request(`/api/collaboration/models`),
  getInsights: () => request(`/api/collaboration/insights`),
  getHistory: () => request(`/api/collaboration/history`),
  predict: (model, payload) =>
    request(`/api/collaboration/predict/${model}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  train: (model, payload) =>
    request(`/api/collaboration/train/${model}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
};

export default collaborationService;
