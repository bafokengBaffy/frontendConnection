// frontend/src/hooks/useInstitute.js
import { useCallback, useEffect, useState } from 'react';

import { instituteService } from '../services/instituteService';

export const useInstitute = () => {
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
        instituteService.getOverview(),
        instituteService.getModels(),
        instituteService.getInsights(),
        instituteService.getHistory(),
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

  const predict = useCallback((model, payload) => instituteService.predict(model, payload), []);
  const train = useCallback((model, payload) => instituteService.train(model, payload), []);

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

export default useInstitute;
