// frontend/src/context/GovernmentContext.jsx
import { createContext, useContext } from 'react';

import { useGovernment } from '../hooks/useGovernment';

const GovernmentContext = createContext();

export const GovernmentProvider = ({ children }) => {
  const value = useGovernment();
  return <GovernmentContext.Provider value={value}>{children}</GovernmentContext.Provider>;
};

export const useGovernmentContext = () => {
  const context = useContext(GovernmentContext);
  if (!context) {
    throw new Error('useGovernmentContext must be used within GovernmentProvider');
  }
  return context;
};
