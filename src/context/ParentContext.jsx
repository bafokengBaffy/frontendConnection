// frontend/src/context/ParentContext.jsx
import { createContext, useContext } from 'react';

import { useParent } from '../hooks/useParent';

const ParentContext = createContext();

export const ParentProvider = ({ children }) => {
  const value = useParent();
  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>;
};

export const useParentContext = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParentContext must be used within ParentProvider');
  }
  return context;
};
