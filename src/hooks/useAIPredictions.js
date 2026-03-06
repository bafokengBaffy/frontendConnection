import { useState, useEffect, useCallback } from 'react';
import {
  storePrediction,
  updatePredictionStatus,
  getUserPredictions,
  PREDICTION_TYPES,
} from '../services/predictionService';
import { useAuth } from '../context/AuthContext';

export const useAIPredictions = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);

  // Load user predictions
  const loadPredictions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const userPredictions = await getUserPredictions(currentUser.uid);
      setPredictions(userPredictions);
    } catch (err) {
      setError(err.message);
      console.error('Error loading predictions:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Submit new prediction
  const submitPrediction = useCallback(
    async (type, inputData) => {
      if (!currentUser) {
        throw new Error('User must be logged in');
      }

      try {
        setLoading(true);
        setError(null);

        const predictionData = {
          type,
          userId: currentUser.uid,
          userType: currentUser.userType,
          inputData,
          status: 'pending',
        };

        const prediction = await storePrediction(predictionData);

        // Simulate AI processing
        setTimeout(async () => {
          const result = await simulateAIProcessing(type, inputData);
          await updatePredictionStatus(prediction.id, 'completed', result);

          // Refresh predictions
          await loadPredictions();
        }, 2000);

        await loadPredictions();

        return prediction;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, loadPredictions]
  );

  // Simulate AI processing
  const simulateAIProcessing = async (type) => {
    // This is a mock implementation
    // In production, this would call your actual AI backend

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResults = {
      [PREDICTION_TYPES.BUSINESS_SUCCESS]: {
        successProbability: 0.75 + Math.random() * 0.2,
        riskFactors: ['Market Competition', 'Funding Gap'],
        recommendations: ['Focus on niche market', 'Develop MVP within 3 months'],
        confidence: 0.85,
      },
      [PREDICTION_TYPES.FUNDING_RECOMMENDATION]: {
        recommendedAmount: 50000 + Math.random() * 100000,
        fundingTypes: ['Grant', 'Angel Investment'],
        eligibilityScore: 0.7 + Math.random() * 0.25,
        recommendations: [
          'Apply for youth entrepreneurship grant',
          'Prepare detailed financial projections',
        ],
      },
      [PREDICTION_TYPES.MENTOR_MATCHING]: {
        matchedMentors: [
          {
            id: 'mentor_1',
            name: 'Sarah Johnson',
            expertise: 'Tech Startups',
            matchScore: 0.92,
          },
        ],
        recommendations: [
          'Schedule weekly mentoring sessions',
          'Focus on business model refinement',
        ],
      },
    };

    return (
      mockResults[type] || {
        message: 'Prediction completed',
        confidence: 0.5,
      }
    );
  };

  useEffect(() => {
    if (currentUser) {
      loadPredictions();
    }
  }, [currentUser, loadPredictions]);

  return {
    predictions,
    loading,
    error,
    submitPrediction,
    refreshPredictions: loadPredictions,
    PREDICTION_TYPES,
  };
};
