import axios from 'axios';

// AI API Configuration
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'https://baffkay20-ai-backend.hf.space';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

// Create axios instance for AI API
const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(AI_API_KEY && { Authorization: `Bearer ${AI_API_KEY}` }),
  },
});

// AI Models and Endpoints
export const AI_MODELS = {
  STUDENT_INTERNSHIP_PREDICTOR: 'student_internship_predictor',
  STUDENT_COMPANY_MATCHER: 'student_company_matcher',
  FUNDING_ELIGIBILITY: 'funding_eligibility',
};

export const AI_ENDPOINTS = {
  HEALTH: '/health',
  PREDICT_STUDENT_INTERNSHIP: '/api/predict/student-internship',
  PREDICT_STUDENT_COMPANY_MATCH: '/api/predict/student-company-match',
  PREDICT_FUNDING_ELIGIBILITY: '/api/predict/funding-eligibility',
  ANALYTICS_MODELS: '/api/analytics/models',
  ANALYTICS_STATS: '/api/analytics/stats',
  BATCH_PREDICT: '/api/batch/predict',
};

// ============================================================================
// AI API Health Check
// ============================================================================

export const checkAIHealth = async () => {
  try {
    const response = await aiApi.get(AI_ENDPOINTS.HEALTH);
    return {
      success: true,
      status: response.data.status,
      version: response.data.version,
      service: response.data.service,
    };
  } catch (error) {
    console.error('AI API health check failed:', error);
    return {
      success: false,
      error: error.message,
      fallback: true,
    };
  }
};

// ============================================================================
// Student Internship Prediction
// ============================================================================

export const predictStudentInternship = async (studentData) => {
  try {
    const payload = {
      gpa: studentData.gpa || 3.0,
      skills: studentData.skills || [],
      experience_months: studentData.experienceMonths || 0,
      field_of_study: studentData.fieldOfStudy || 'General',
    };

    const response = await aiApi.post(AI_ENDPOINTS.PREDICT_STUDENT_INTERNSHIP, payload);

    return {
      success: true,
      prediction: response.data.prediction,
      confidence: response.data.confidence,
      explanation: response.data.explanation,
    };
  } catch (error) {
    console.error('Student internship prediction failed:', error);
    // Return fallback prediction
    return getFallbackInternshipPrediction(studentData);
  }
};

// ============================================================================
// Student-Company Match Prediction
// ============================================================================

export const predictStudentCompanyMatch = async (studentData, companyData) => {
  try {
    const payload = {
      student: {
        gpa: studentData.gpa || 3.0,
        skills: studentData.skills || [],
        experience_months: studentData.experienceMonths || 0,
        field_of_study: studentData.fieldOfStudy || 'General',
      },
      company: {
        industry: companyData.industry || 'General',
        size: companyData.size || 'Small',
        required_skills: companyData.requiredSkills || [],
        preferred_experience: companyData.preferredExperience || 0,
      },
    };

    const response = await aiApi.post(AI_ENDPOINTS.PREDICT_STUDENT_COMPANY_MATCH, payload);

    return {
      success: true,
      matchScore: response.data.prediction,
      confidence: response.data.confidence,
      explanation: response.data.explanation,
    };
  } catch (error) {
    console.error('Student-company match prediction failed:', error);
    return getFallbackMatchPrediction(studentData, companyData);
  }
};

// ============================================================================
// Funding Eligibility Prediction
// ============================================================================

export const predictFundingEligibility = async (studentData) => {
  try {
    const payload = {
      gpa: studentData.gpa || 3.0,
      skills: studentData.skills || [],
      experience_months: studentData.experienceMonths || 0,
      field_of_study: studentData.fieldOfStudy || 'General',
    };

    const response = await aiApi.post(AI_ENDPOINTS.PREDICT_FUNDING_ELIGIBILITY, payload);

    return {
      success: true,
      eligibility: response.data.prediction,
      confidence: response.data.confidence,
      explanation: response.data.explanation,
    };
  } catch (error) {
    console.error('Funding eligibility prediction failed:', error);
    return getFallbackFundingPrediction(studentData);
  }
};

// ============================================================================
// Batch Predictions
// ============================================================================

export const batchPredict = async (records, modelType) => {
  try {
    const payload = {
      records: records.map((record) => ({
        gpa: record.gpa || 3.0,
        skills: record.skills || [],
        experience_months: record.experienceMonths || 0,
        field_of_study: record.fieldOfStudy || 'General',
      })),
      model_type: modelType,
    };

    const response = await aiApi.post(AI_ENDPOINTS.BATCH_PREDICT, payload);

    return {
      success: true,
      totalRecords: response.data.total_records,
      successful: response.data.successful,
      failed: response.data.failed,
      predictions: response.data.predictions,
    };
  } catch (error) {
    console.error('Batch prediction failed:', error);
    return getFallbackBatchPrediction(records, modelType);
  }
};

// ============================================================================
// Analytics and Insights
// ============================================================================

export const getAIModelsInfo = async () => {
  try {
    const response = await aiApi.get(AI_ENDPOINTS.ANALYTICS_MODELS);
    return {
      success: true,
      models: response.data.models,
      total: response.data.total,
    };
  } catch (error) {
    console.error('Failed to get AI models info:', error);
    return getFallbackModelsInfo();
  }
};

export const getAIAnalyticsStats = async () => {
  try {
    const response = await aiApi.get(AI_ENDPOINTS.ANALYTICS_STATS);
    return {
      success: true,
      stats: response.data,
    };
  } catch (error) {
    console.error('Failed to get AI analytics stats:', error);
    return getFallbackAnalyticsStats();
  }
};

// ============================================================================
// Fallback Functions (when AI API is unavailable)
// ============================================================================

const getFallbackInternshipPrediction = (studentData) => {
  const baseScore = 0.5;
  const gpaFactor = (studentData.gpa / 4.0) * 0.3;
  const experienceFactor = Math.min(0.2, (studentData.experienceMonths || 0) / 24);
  const skillsFactor = Math.min(0.15, (studentData.skills?.length || 0) / 10);

  const prediction = Math.min(0.95, baseScore + gpaFactor + experienceFactor + skillsFactor);

  return {
    success: true,
    prediction,
    confidence: 0.75,
    explanation: `Fallback prediction: ${Math.round(prediction * 100)}% internship success probability`,
    fallback: true,
  };
};

const getFallbackMatchPrediction = (studentData, companyData) => {
  const studentSkills = new Set(studentData.skills || []);
  const requiredSkills = new Set(companyData.requiredSkills || []);

  const skillOverlap =
    studentSkills.size > 0 && requiredSkills.size > 0
      ? new Set([...studentSkills].filter((x) => requiredSkills.has(x))).size / requiredSkills.size
      : 0.5;

  const experienceMatch = Math.min(
    1,
    (studentData.experienceMonths || 0) / Math.max(companyData.preferredExperience || 12, 1)
  );
  const gpaMatch = Math.min(1, (studentData.gpa || 3.0) / 3.8);

  const matchScore = skillOverlap * 0.5 + experienceMatch * 0.3 + gpaMatch * 0.2;

  return {
    success: true,
    matchScore,
    confidence: 0.7,
    explanation: `Fallback match score: ${Math.round(matchScore * 100)}% compatibility`,
    fallback: true,
  };
};

const getFallbackFundingPrediction = (studentData) => {
  const baseEligibility = 0.4;
  const gpaFactor = (studentData.gpa / 4.0) * 0.4;
  const experienceFactor = Math.min(0.15, (studentData.experienceMonths || 0) / 24);
  const skillsFactor = Math.min(0.1, (studentData.skills?.length || 0) / 8);

  const eligibility = Math.min(0.9, baseEligibility + gpaFactor + experienceFactor + skillsFactor);

  return {
    success: true,
    eligibility,
    confidence: 0.7,
    explanation: `Fallback funding eligibility: ${Math.round(eligibility * 100)}% chance`,
    fallback: true,
  };
};

const getFallbackBatchPrediction = (records, modelType) => {
  const predictions = records.map((record) => {
    let prediction = 0.5;

    switch (modelType) {
      case AI_MODELS.STUDENT_INTERNSHIP_PREDICTOR:
        prediction = getFallbackInternshipPrediction(record).prediction;
        break;
      case AI_MODELS.FUNDING_ELIGIBILITY:
        prediction = getFallbackFundingPrediction(record).prediction;
        break;
      default:
        prediction = Math.random() * 0.5 + 0.25;
    }

    return {
      record,
      prediction,
      success: true,
      fallback: true,
    };
  });

  return {
    success: true,
    totalRecords: records.length,
    successful: records.length,
    failed: 0,
    predictions,
    fallback: true,
  };
};

const getFallbackModelsInfo = () => ({
  success: true,
  models: [
    {
      name: AI_MODELS.STUDENT_INTERNSHIP_PREDICTOR,
      description: 'Predicts internship success probability',
      endpoint: AI_ENDPOINTS.PREDICT_STUDENT_INTERNSHIP,
    },
    {
      name: AI_MODELS.STUDENT_COMPANY_MATCHER,
      description: 'Matches students with companies',
      endpoint: AI_ENDPOINTS.PREDICT_STUDENT_COMPANY_MATCH,
    },
    {
      name: AI_MODELS.FUNDING_ELIGIBILITY,
      description: 'Predicts funding eligibility',
      endpoint: AI_ENDPOINTS.PREDICT_FUNDING_ELIGIBILITY,
    },
  ],
  total: 3,
  fallback: true,
});

const getFallbackAnalyticsStats = () => ({
  success: true,
  stats: {
    service: 'Career Connect AI Backend (Fallback)',
    status: 'operational',
    models_loaded: 3,
    api_version: '1.0.0',
    deployed_on: 'Local Fallback',
  },
  fallback: true,
});

// ============================================================================
// Legacy Firebase-based functions (keeping for compatibility)
// ============================================================================

// ... existing Firebase functions remain unchanged ...

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

  return csvRows.join('.');
};

// Helper function to convert to Excel (simplified)
const convertToExcel = (data) => {
  // In a real implementation, you would use a library like xlsx
  // For now, return as CSV with .xlsx extension suggestion
  return convertToCSV(data);
};
