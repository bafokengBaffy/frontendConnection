import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from '../config/firebase';

// AI Prediction Service
export const PREDICTION_TYPES = {
  BUSINESS_SUCCESS: 'business_success',
  FUNDING_RECOMMENDATION: 'funding_recommendation',
  MENTOR_MATCHING: 'mentor_matching',
  MARKET_TREND: 'market_trend',
  SKILL_GAP: 'skill_gap',
};

// Store prediction in database
export const storePrediction = async (predictionData) => {
  try {
    const predictionRef = await addDoc(collection(db, 'ai_predictions'), {
      ...predictionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'pending',
    });

    return {
      id: predictionRef.id,
      ...predictionData,
    };
  } catch (error) {
    console.error('Error storing prediction:', error);
    throw error;
  }
};

// Update prediction status
export const updatePredictionStatus = async (predictionId, status, result = null) => {
  try {
    const predictionRef = doc(db, 'ai_predictions', predictionId);

    await updateDoc(predictionRef, {
      status,
      result,
      updatedAt: Timestamp.now(),
      ...(status === 'completed' && { completedAt: Timestamp.now() }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating prediction status:', error);
    throw error;
  }
};

// Get user predictions
export const getUserPredictions = async (userId, limitCount = 20) => {
  try {
    const predictionsQuery = query(
      collection(db, 'ai_predictions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(predictionsQuery);
    const predictions = [];

    snapshot.forEach((doc) => {
      predictions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || null,
      });
    });

    return predictions;
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    throw error;
  }
};

// Get prediction statistics
export const getPredictionStatistics = async (timeRange = 'month') => {
  try {
    const startDate = getTimeRangeStart(timeRange);

    const predictionsQuery = query(
      collection(db, 'ai_predictions'),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(predictionsQuery);

    const stats = {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      byType: {},
      successRate: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;

      if (data.status === 'completed') stats.completed++;
      if (data.status === 'failed') stats.failed++;
      if (data.status === 'pending') stats.pending++;

      if (data.type) {
        stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      }
    });

    stats.successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching prediction statistics:', error);
    throw error;
  }
};

// Helper function for time ranges
const getTimeRangeStart = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'quarter':
      return new Date(now.setMonth(now.getMonth() - 3));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
};
