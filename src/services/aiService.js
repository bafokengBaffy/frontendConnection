import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAnalyticsData } from './analyticsService';

// AI Dashboard Constants
export const AI_MODELS = {
  BUSINESS_PREDICTOR: 'business_predictor',
  FUNDING_RECOMMENDER: 'funding_recommender',
  MENTOR_MATCHER: 'mentor_matcher',
  SUCCESS_ANALYZER: 'success_analyzer',
  TREND_FORECASTER: 'trend_forecaster',
};

export const AI_TASK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// AI Configuration (removed unused config)

// Get AI Dashboard Overview
export const getAIDashboardOverview = async () => {
  try {
    // Get system analytics
    const systemAnalytics = await getAnalyticsData({
      metrics: ['users', 'businesses', 'applications', 'funding'],
    });

    // Get active AI predictions
    const activePredictions = await getActiveAIPredictions();

    // Get recent insights
    const recentInsights = await getRecentAIInsights(5);

    // Get model performance
    const modelPerformance = await getAIModelPerformance();

    return {
      systemAnalytics,
      activePredictions,
      recentInsights,
      modelPerformance,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting AI dashboard overview:', error);
    throw error;
  }
};

// Get Active AI Predictions
export const getActiveAIPredictions = async () => {
  try {
    const predictionsQuery = query(
      collection(db, 'ai_predictions'),
      where('status', 'in', [AI_TASK_STATUS.PROCESSING, AI_TASK_STATUS.PENDING]),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(predictionsQuery);
    const predictions = [];

    snapshot.forEach((doc) => {
      predictions.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return predictions;
  } catch (error) {
    console.error('Error fetching active AI predictions:', error);
    throw error;
  }
};

// Get Recent AI Insights
export const getRecentAIInsights = async (limitCount = 5) => {
  try {
    const insightsQuery = query(
      collection(db, 'ai_insights'),
      where('status', '==', AI_TASK_STATUS.COMPLETED),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(insightsQuery);
    const insights = [];

    snapshot.forEach((doc) => {
      insights.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return insights;
  } catch (error) {
    console.error('Error fetching recent AI insights:', error);
    throw error;
  }
};

// Get AI Model Performance
export const getAIModelPerformance = async () => {
  try {
    const performanceQuery = query(
      collection(db, 'ai_model_performance'),
      orderBy('lastTrained', 'desc')
    );

    const snapshot = await getDocs(performanceQuery);
    const models = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      models.push({
        id: doc.id,
        name: data.modelName,
        accuracy: data.accuracy || 0,
        precision: data.precision || 0,
        recall: data.recall || 0,
        f1Score: data.f1Score || 0,
        lastTrained: data.lastTrained?.toDate() || null,
        predictionsCount: data.predictionsCount || 0,
        trainingStatus: data.trainingStatus || 'idle',
      });
    });

    // If no models in database, return default models
    if (models.length === 0) {
      return [
        {
          id: 'business_predictor',
          name: 'Business Success Predictor',
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.87,
          f1Score: 0.84,
          lastTrained: new Date(),
          predictionsCount: 1250,
          trainingStatus: 'active',
        },
        {
          id: 'funding_recommender',
          name: 'Funding Recommender',
          accuracy: 0.78,
          precision: 0.75,
          recall: 0.8,
          f1Score: 0.77,
          lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          predictionsCount: 890,
          trainingStatus: 'active',
        },
        {
          id: 'mentor_matcher',
          name: 'Mentor Matching Engine',
          accuracy: 0.92,
          precision: 0.9,
          recall: 0.93,
          f1Score: 0.91,
          lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          predictionsCount: 1560,
          trainingStatus: 'active',
        },
      ];
    }

    return models;
  } catch (error) {
    console.error('Error fetching AI model performance:', error);
    throw error;
  }
};

// Run AI Prediction
export const runAIPrediction = async (modelId, inputData, userId) => {
  let predictionRef;
  try {
    // Create prediction record
    predictionRef = await addDoc(collection(db, 'ai_predictions'), {
      modelId,
      inputData,
      userId,
      status: AI_TASK_STATUS.PENDING,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Call AI API (in production, this would call your AI backend)
    const prediction = await callAIModelAPI(modelId, inputData);

    // Update prediction record with results
    await updateDoc(doc(db, 'ai_predictions', predictionRef.id), {
      status: AI_TASK_STATUS.COMPLETED,
      result: prediction,
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      id: predictionRef.id,
      ...prediction,
    };
  } catch (error) {
    console.error('Error running AI prediction:', error);

    // Update prediction as failed
    if (predictionRef) {
      await updateDoc(doc(db, 'ai_predictions', predictionRef.id), {
        status: AI_TASK_STATUS.FAILED,
        error: error.message,
        updatedAt: Timestamp.now(),
      });
    }

    throw error;
  }
};

// Call AI Model API (Mock implementation - replace with actual AI backend)
const callAIModelAPI = async (modelId, _inputData) => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock responses based on model type
  const mockResponses = {
    [AI_MODELS.BUSINESS_PREDICTOR]: {
      successProbability: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      riskFactors: ['Market Competition', 'Funding Gap', 'Team Experience'],
      recommendations: [
        'Focus on niche market',
        'Build MVP within 3 months',
        'Seek mentorship in your industry',
      ],
      confidence: 0.85,
    },
    [AI_MODELS.FUNDING_RECOMMENDER]: {
      recommendedFundingTypes: ['Grant', 'Angel Investment', 'Micro-loan'],
      estimatedAmount: 50000 + Math.random() * 100000,
      eligibilityScore: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
      recommendations: [
        'Apply for Youth Entrepreneurship Grant',
        'Prepare pitch deck with financial projections',
        'Network with angel investors in your sector',
      ],
    },
    [AI_MODELS.MENTOR_MATCHER]: {
      matchedMentors: [
        {
          id: 'mentor_001',
          name: 'Sarah Johnson',
          expertise: 'Tech Startups',
          matchScore: 0.92,
          availability: 'Part-time',
        },
        {
          id: 'mentor_002',
          name: 'Michael Chen',
          expertise: 'E-commerce',
          matchScore: 0.87,
          availability: 'Full-time',
        },
      ],
      recommendations: [
        'Schedule weekly check-ins',
        'Focus on business model refinement',
        'Set clear milestones for first 3 months',
      ],
    },
  };

  return (
    mockResponses[modelId] || {
      message: 'Model not found',
      confidence: 0,
    }
  );
};

// Get AI Insights by Category
export const getAIInsightsByCategory = async (category, timeRange = 'month') => {
  try {
    const insightsQuery = query(
      collection(db, 'ai_insights'),
      where('category', '==', category),
      where('createdAt', '>=', getTimeRangeStart(timeRange)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(insightsQuery);
    const insights = [];

    snapshot.forEach((doc) => {
      insights.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return insights;
  } catch (error) {
    console.error('Error fetching AI insights by category:', error);
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

// Get AI Usage Statistics
export const getAIUsageStatistics = async (timeRange = 'month') => {
  try {
    const startDate = getTimeRangeStart(timeRange);

    const usageQuery = query(
      collection(db, 'ai_predictions'),
      where('createdAt', '>=', startDate),
      where('status', '==', AI_TASK_STATUS.COMPLETED)
    );

    const snapshot = await getDocs(usageQuery);

    // Process usage statistics
    const usageStats = {
      totalPredictions: 0,
      byModel: {},
      byUserType: {},
      successRate: 0,
      averageProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let successfulPredictions = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      usageStats.totalPredictions++;

      // Count by model
      const modelId = data.modelId;
      usageStats.byModel[modelId] = (usageStats.byModel[modelId] || 0) + 1;

      // Count by user type
      const userType = data.userType || 'unknown';
      usageStats.byUserType[userType] = (usageStats.byUserType[userType] || 0) + 1;

      // Calculate processing time
      if (data.completedAt && data.createdAt) {
        const processingTime = data.completedAt.toDate() - data.createdAt.toDate();
        totalProcessingTime += processingTime;
        successfulPredictions++;
      }
    });

    // Calculate averages
    usageStats.successRate =
      usageStats.totalPredictions > 0
        ? (successfulPredictions / usageStats.totalPredictions) * 100
        : 0;
    usageStats.averageProcessingTime =
      successfulPredictions > 0 ? totalProcessingTime / successfulPredictions : 0;

    return usageStats;
  } catch (error) {
    console.error('Error fetching AI usage statistics:', error);
    throw error;
  }
};

// Get Real-time AI Activity
export const subscribeToAIActivity = (callback, limitCount = 20) => {
  try {
    const activityQuery = query(
      collection(db, 'ai_predictions'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(activityQuery, (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        });
      });
      callback(activities);
    });
  } catch (error) {
    console.error('Error subscribing to AI activity:', error);
    throw error;
  }
};

// Train AI Model
export const trainAIModel = async (modelId, trainingData) => {
  let trainingRef;
  try {
    // Create training record
    trainingRef = await addDoc(collection(db, 'ai_training'), {
      modelId,
      status: AI_TASK_STATUS.PROCESSING,
      startedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      trainingDataSize: trainingData?.length || 0,
    });

    // Simulate training process
    await simulateTrainingProcess(modelId, trainingData);

    // Update training record
    await updateDoc(doc(db, 'ai_training', trainingRef.id), {
      status: AI_TASK_STATUS.COMPLETED,
      completedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metrics: {
        accuracy: 0.85 + Math.random() * 0.1,
        loss: 0.1 + Math.random() * 0.1,
        epochs: 50,
      },
    });

    return { success: true, trainingId: trainingRef.id };
  } catch (error) {
    console.error('Error training AI model:', error);

    if (trainingRef) {
      await updateDoc(doc(db, 'ai_training', trainingRef.id), {
        status: AI_TASK_STATUS.FAILED,
        error: error.message,
        updatedAt: Timestamp.now(),
      });
    }

    throw error;
  }
};

// Simulate training process
const simulateTrainingProcess = async (modelId, trainingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Training ${modelId} with ${trainingData?.length || 0} samples`);
      resolve();
    }, 3000);
  });
};

// Get AI Model Training History
export const getAIModelTrainingHistory = async (modelId, limitCount = 10) => {
  try {
    const trainingQuery = query(
      collection(db, 'ai_training'),
      where('modelId', '==', modelId),
      orderBy('startedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(trainingQuery);
    const trainingHistory = [];

    snapshot.forEach((doc) => {
      trainingHistory.push({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate() || new Date(),
        completedAt: doc.data().completedAt?.toDate() || null,
      });
    });

    return trainingHistory;
  } catch (error) {
    console.error('Error fetching AI model training history:', error);
    throw error;
  }
};

// Export AI Model Results
export const exportAIResults = async (predictionIds, format = 'json') => {
  try {
    const results = [];

    // Fetch each prediction
    for (const predictionId of predictionIds) {
      const predictionRef = doc(db, 'ai_predictions', predictionId);
      const predictionSnap = await getDoc(predictionRef);

      if (predictionSnap.exists()) {
        results.push({
          id: predictionSnap.id,
          ...predictionSnap.data(),
        });
      }
    }

    // Format results based on requested format
    let formattedResults;
    switch (format) {
      case 'csv':
        formattedResults = convertToCSV(results);
        break;
      case 'excel':
        formattedResults = convertToExcel(results);
        break;
      case 'json':
      default:
        formattedResults = JSON.stringify(results, null, 2);
    }

    return {
      data: formattedResults,
      count: results.length,
      format,
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting AI results:', error);
    throw error;
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

// Helper function to convert to Excel (simplified)
const convertToExcel = (data) => {
  // In a real implementation, you would use a library like xlsx
  // For now, return as CSV with .xlsx extension suggestion
  return convertToCSV(data);
};
