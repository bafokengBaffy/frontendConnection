// src/utils/initializeFirestore.js
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../config/firebase';

export const initializeFirestore = async () => {
  try {
    console.log('Initializing Firestore collections...');

    // Create admin user document if it doesn't exist

    // Check if admin exists
    console.log('Firestore initialized successfully');

    // Create initial activity log
    const activitiesRef = collection(db, 'activities');

    await setDoc(doc(activitiesRef), {
      type: 'system_start',
      title: 'System Initialized',
      description: 'Career Connect Lesotho platform initialized',
      userEmail: 'system@careerconnect.ls',
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });

    console.log('Initial activity logged');

    return true;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return false;
  }
};
