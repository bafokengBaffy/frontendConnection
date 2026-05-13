const isLocalHost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const isFirebaseHosted = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.endsWith('.web.app') || host.endsWith('.firebaseapp.com');
};

const resolveApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_APP_API_URL ||
    import.meta.env.VITE_BASE_URL_API ||
    '';

  // Safety fallback: when running locally, avoid broken remote DNS targets
  // unless explicitly forced.
  if (isLocalHost() && import.meta.env.VITE_FORCE_REMOTE_API !== 'true') {
    if (!envUrl || !/localhost|127\.0\.0\.1/i.test(envUrl)) {
      return 'http://localhost:5000';
    }
  }

  // On Firebase Hosting, prefer same-origin so /api rewrites can route traffic.
  if (isFirebaseHosted() && import.meta.env.VITE_FORCE_REMOTE_API !== 'true') {
    return window.location.origin;
  }

  return (envUrl || 'http://localhost:5000').replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

export default API_BASE_URL;
