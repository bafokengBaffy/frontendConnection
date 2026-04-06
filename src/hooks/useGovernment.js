// frontend/src/hooks/useGovernment.js
import { useCallback, useEffect, useState } from 'react';

import { governmentService } from '../services/governmentService';

export const useGovernment = () => {
  const [overview, setOverview] = useState(null);
  const [models, setModels] = useState([]);
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, modelsRes, insightsRes, historyRes] = await Promise.all([
        governmentService.getOverview(),
        governmentService.getModels(),
        governmentService.getInsights(),
        governmentService.getHistory(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (modelsRes.success) setModels(modelsRes.data || []);
      if (insightsRes.success) setInsights(insightsRes.data || []);
      if (historyRes.success) setHistory(historyRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const predict = useCallback((model, payload) => governmentService.predict(model, payload), []);
  const train = useCallback((model, payload) => governmentService.train(model, payload), []);

  return {
    overview,
    models,
    insights,
    history,
    loading,
    error,
    refresh,
    predict,
    train,
  };
};

export default useGovernment;
