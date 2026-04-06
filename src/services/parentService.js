// frontend/src/services/parentService.js
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export const parentService = {
  getOverview: () => request(`/api/parent/overview`),
  getModels: () => request(`/api/parent/models`),
  getInsights: () => request(`/api/parent/insights`),
  getHistory: () => request(`/api/parent/history`),
  predict: (model, payload) =>
    request(`/api/parent/predict/${model}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  train: (model, payload) =>
    request(`/api/parent/train/${model}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
};

export default parentService;
