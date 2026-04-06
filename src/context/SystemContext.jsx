// frontend/src/context/SystemContext.jsx
import { createContext, useContext } from 'react';

import { useSystem } from '../hooks/useSystem';

const SystemContext = createContext();

export const SystemProvider = ({ children }) => {
  const value = useSystem();
  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};

export const useSystemContext = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystemContext must be used within SystemProvider');
  }
  return context;
};
