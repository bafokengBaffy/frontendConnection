import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
});

// Initialize Firestore with persistence configuration
const db = getFirestore(app);

// Enable Firestore persistence with proper error handling
const setupFirestorePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db, {
      forceOwnership: true
    });
    console.log('Firestore persistence enabled successfully');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.');
    } else {
      console.error('Error enabling Firestore persistence:', err);
    }
  }
};

// Call persistence setup
if (typeof window !== 'undefined') {
  setupFirestorePersistence();
}

const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Admin configuration - also use import.meta.env
const adminConfig = {
  email: import.meta.env.VITE_ADMIN_EMAIL || "baffkay20@gmail.com",
  password: import.meta.env.VITE_ADMIN_PASSWORD || ""
};

export { app, auth, db, storage, analytics, adminConfig };
export default app;