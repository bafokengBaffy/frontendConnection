import React, { createContext, useContext, useReducer } from 'react';

const AIContext = createContext();

const initialState = {
  predictions: {},
  recommendations: [],
  insights: {},
  trainingData: [],
  loading: false,
  error: null,
};

const aiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PREDICTIONS':
      return { ...state, predictions: action.payload };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const AIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  return <AIContext.Provider value={{ state, dispatch }}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};
