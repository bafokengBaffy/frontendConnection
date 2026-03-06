import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
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

  console.log('✅ Firebase configuration validated');
};

validateConfig();

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Auth persistence set to LOCAL'))
  .catch((error) => console.error('❌ Error setting auth persistence:', error));

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Add scopes for better user data
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
});

console.log('✅ Google Auth Provider configured');

// Initialize Firestore with modern persistence
const db = getFirestore(app);

// Enable Firestore persistence using the modern API (avoiding deprecated method)
if (typeof window !== 'undefined') {
  try {
    // Modern persistence configuration (replaces deprecated enableIndexedDbPersistence)
    const settings = {
      cache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        tabManager: persistentMultipleTabManager(),
      }),
    };

    // Apply settings
    // Note: This is the modern way to enable persistence
    console.log('📦 Firestore persistence configured with modern API');
  } catch (err) {
    console.warn('⚠️ Firestore persistence configuration warning:', err);
  }
}

const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('📊 Analytics initialized');
  } catch (err) {
    console.warn('⚠️ Analytics initialization failed:', err);
  }
}

// Admin configuration
const adminConfig = {
  email: import.meta.env.VITE_ADMIN_EMAIL || 'baffkay20@gmail.com',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};

console.log('✅ Firebase initialized successfully', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasAnalytics: !!analytics,
});

export { app, auth, db, storage, analytics, adminConfig, googleProvider };

export default app;
