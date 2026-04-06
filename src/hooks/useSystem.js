// frontend/src/hooks/useSystem.js
import { useCallback, useEffect, useState } from 'react';

import { systemService } from '../services/systemService';

export const useSystem = () => {
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
        systemService.getOverview(),
        systemService.getModels(),
        systemService.getInsights(),
        systemService.getHistory(),
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

  const predict = useCallback((model, payload) => systemService.predict(model, payload), []);
  const train = useCallback((model, payload) => systemService.train(model, payload), []);

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

export default useSystem;
