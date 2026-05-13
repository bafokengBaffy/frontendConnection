const resolveApiBaseUrl = () => {
  const raw =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_API_URL ||
    import.meta.env.VITE_BASE_URL_API ||
    'http://localhost:5000';

  return raw.replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

export default API_BASE_URL;
