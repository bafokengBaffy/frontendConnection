// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// CSRF token cache
let cachedCsrfToken = null;
let csrfTokenFetchPromise = null;

// Helper function to get CSRF token from cookies
const getCsrfTokenFromCookie = () => {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }
  return '';
};

// Fetch CSRF token from server
const fetchCsrfTokenFromServer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      cachedCsrfToken = data.csrfToken;
      return data.csrfToken;
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token from server:', error);
  }
  
  return null;
};

// Get CSRF token with caching and server fetch fallback
export const getCsrfToken = async () => {
  // Return cached token if available
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }
  
  // Check cookie first
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    cachedCsrfToken = cookieToken;
    return cookieToken;
  }
  
  // Fetch from server with deduplication
  if (!csrfTokenFetchPromise) {
    csrfTokenFetchPromise = fetchCsrfTokenFromServer();
  }
  
  const token = await csrfTokenFetchPromise;
  csrfTokenFetchPromise = null;
  
  return token || '';
};

// Test server connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return {
      success: response.ok,
      message: data.status || 'Server is connected',
      url: API_BASE_URL,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Cannot connect to server: ' + error.message,
      url: API_BASE_URL,
    };
  }
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  login: async (credentials) => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  getProfile: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },
};

// Institutions API
export const institutionsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/institutions`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  getByInstitution: async (institutionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/institution/${institutionId}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },
};

// Companies API
export const companiesAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies/${id}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error: ' + error.message,
      };
    }
  },
};

export default {
  testConnection,
  authAPI,
  institutionsAPI,
  coursesAPI,
  companiesAPI,
};
