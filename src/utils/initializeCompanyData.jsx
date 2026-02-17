// frontend/src/utils/initializeCompanyData.js
import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const initializeCompanyCollections = async (companyId) => {
  try {
    // Initialize company followers collection
    const followersRef = doc(db, 'company_settings', companyId);
    await setDoc(followersRef, {
      companyId,
      followersEnabled: true,
      notificationsEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Initialize AI matching settings
    const aiSettingsRef = doc(db, 'company_ai_settings', companyId);
    await setDoc(aiSettingsRef, {
      companyId,
      enabled: true,
      matchThreshold: 70,
      autoGenerate: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Initialize video interview settings
    const videoSettingsRef = doc(db, 'company_video_settings', companyId);
    await setDoc(videoSettingsRef, {
      companyId,
      enabled: true,
      recordingEnabled: false,
      autoRecording: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log('Company collections initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing company collections:', error);
    return false;
  }
};