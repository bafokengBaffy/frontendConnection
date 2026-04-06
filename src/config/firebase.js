/* eslint-disable no-unused-vars */
import { initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import {
  getFirestore,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!firebaseConfig[field]) {
      throw new Error(`Missing required Firebase config field: ${field}`);
    }
  }

  console.log('Firebase configuration validated');
};

const cspAllowsUrl = (directive, url) => {
  if (typeof document === 'undefined') {
    return true;
  }

  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const policy = cspMeta?.getAttribute('content');

  if (!policy) {
    return true;
  }

  const directiveEntry = policy
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${directive} `));

  if (!directiveEntry) {
    return true;
  }

  const allowedSources = directiveEntry.split(/\s+/).slice(1);
  if (allowedSources.includes('*')) {
    return true;
  }

  const parsedUrl = new URL(url);

  return allowedSources.some((source) => {
    if (source === "'self'") {
      return parsedUrl.origin === window.location.origin;
    }

    if (source.includes('://*.')) {
      const [scheme, domain] = source.split('://*.');
      return parsedUrl.protocol === `${scheme}:` && parsedUrl.hostname.endsWith(domain);
    }

    return parsedUrl.origin === source || url.startsWith(source);
  });
};

validateConfig();

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = firebaseAuth.initializeAuth(app, {
    persistence: [
      firebaseAuth.indexedDBLocalPersistence,
      firebaseAuth.browserLocalPersistence,
      firebaseAuth.browserSessionPersistence,
    ],
    popupRedirectResolver: firebaseAuth.browserPopupRedirectResolver,
  });
  console.log('Auth initialized with explicit persistence');
} catch (error) {
  console.warn('initializeAuth failed, falling back to getAuth:', error);
  try {
    auth = firebaseAuth.getAuth(app);
  } catch (fallbackError) {
    console.error('Firebase Auth initialization failed:', fallbackError);
    throw fallbackError;
  }
}

const googleProvider = new firebaseAuth.GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

console.log('Google Auth Provider configured');

const db = getFirestore(app);

if (typeof window !== 'undefined') {
  try {
    const settings = {
      cache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        tabManager: persistentMultipleTabManager(),
      }),
    };

    void settings;
    console.log('Firestore persistence configured with modern API');
  } catch (err) {
    console.warn('Firestore persistence configuration warning:', err);
  }
}

const storage = getStorage(app);

let analytics = null;
if (typeof window !== 'undefined') {
  try {
    if (cspAllowsUrl('script-src', 'https://www.googletagmanager.com/gtag/js')) {
      analytics = getAnalytics(app);
      console.log('Analytics initialized');
    } else {
      console.warn('Analytics skipped because CSP blocks Google Tag Manager');
    }
  } catch (err) {
    console.warn('Analytics initialization failed:', err);
  }
}

const adminConfig = {
  email: import.meta.env.VITE_ADMIN_EMAIL || 'baffkay20@gmail.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};

console.log('Firebase initialized successfully', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasAnalytics: !!analytics,
});

export { app, auth, db, storage, analytics, adminConfig, googleProvider };

export default app;
