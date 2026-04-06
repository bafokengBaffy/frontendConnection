import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

import { storageService } from './storageService';

const COLLECTION = 'youth_business';

const emptyPayload = {
  profile: {},
  canvas: {},
  marketAnalysis: {},
  customerSegmentation: {},
  valueProposition: {},
  revenueModel: {},
  financialProjections: {},
  progress: {},
};

const getBusinessDocRef = (userId) => doc(db, COLLECTION, userId);

const ensureBusinessDoc = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  const docRef = getBusinessDocRef(userId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    const payload = {
      ...emptyPayload,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload);
    return { id: userId, ...payload };
  }

  return { id: snapshot.id, ...snapshot.data() };
};

const updateSection = async (userId, section, data) => {
  const docRef = getBusinessDocRef(userId);
  await updateDoc(docRef, {
    [section]: data,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() };
};

export const getBusinessWorkspace = async (userId) => {
  try {
    const data = await ensureBusinessDoc(userId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBusinessProfile = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.profile || {} };
};

export const saveBusinessProfile = async (userId, profile) => {
  try {
    const updated = await updateSection(userId, 'profile', profile);
    return { success: true, data: updated.profile || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadBusinessLogo = async (userId, file) => {
  try {
    if (!file) return { success: false, error: 'Logo file is required' };

    const uploadResult = await storageService.uploadFile(file, `youth_business/${userId}/logo`, {
      tags: ['business', 'logo', `user_${userId}`],
      context: { type: 'business_logo', userId },
    });

    if (!uploadResult.success) {
      return { success: false, error: uploadResult.error || 'Logo upload failed' };
    }

    const profileResult = await getBusinessProfile(userId);
    const profile = profileResult.success ? profileResult.data : {};
    const nextProfile = {
      ...profile,
      logoUrl: uploadResult.url,
      logoPath: uploadResult.path,
      logoStorage: uploadResult.storageType,
    };

    await saveBusinessProfile(userId, nextProfile);

    return { success: true, data: nextProfile };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBusinessCanvas = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.canvas || {} };
};

export const saveBusinessCanvas = async (userId, canvas) => {
  try {
    const updated = await updateSection(userId, 'canvas', canvas);
    return { success: true, data: updated.canvas || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMarketAnalysis = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.marketAnalysis || {} };
};

export const saveMarketAnalysis = async (userId, marketAnalysis) => {
  try {
    const updated = await updateSection(userId, 'marketAnalysis', marketAnalysis);
    return { success: true, data: updated.marketAnalysis || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCustomerSegmentation = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.customerSegmentation || {} };
};

export const saveCustomerSegmentation = async (userId, customerSegmentation) => {
  try {
    const updated = await updateSection(userId, 'customerSegmentation', customerSegmentation);
    return { success: true, data: updated.customerSegmentation || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getValueProposition = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.valueProposition || {} };
};

export const saveValueProposition = async (userId, valueProposition) => {
  try {
    const updated = await updateSection(userId, 'valueProposition', valueProposition);
    return { success: true, data: updated.valueProposition || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getRevenueModel = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.revenueModel || {} };
};

export const saveRevenueModel = async (userId, revenueModel) => {
  try {
    const updated = await updateSection(userId, 'revenueModel', revenueModel);
    return { success: true, data: updated.revenueModel || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getFinancialProjections = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.financialProjections || {} };
};

export const saveFinancialProjections = async (userId, financialProjections) => {
  try {
    const updated = await updateSection(userId, 'financialProjections', financialProjections);
    return { success: true, data: updated.financialProjections || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBusinessProgress = async (userId) => {
  const result = await getBusinessWorkspace(userId);
  if (!result.success) return result;
  return { success: true, data: result.data.progress || {} };
};

export const saveBusinessProgress = async (userId, progress) => {
  try {
    const updated = await updateSection(userId, 'progress', progress);
    return { success: true, data: updated.progress || {} };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getBusinessWorkspace,
  getBusinessProfile,
  saveBusinessProfile,
  uploadBusinessLogo,
  getBusinessCanvas,
  saveBusinessCanvas,
  getMarketAnalysis,
  saveMarketAnalysis,
  getCustomerSegmentation,
  saveCustomerSegmentation,
  getValueProposition,
  saveValueProposition,
  getRevenueModel,
  saveRevenueModel,
  getFinancialProjections,
  saveFinancialProjections,
  getBusinessProgress,
  saveBusinessProgress,
};
