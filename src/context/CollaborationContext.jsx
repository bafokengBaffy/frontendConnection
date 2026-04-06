// frontend/src/context/CollaborationContext.jsx
import { createContext, useContext } from 'react';

import { useCollaboration } from '../hooks/useCollaboration';

const CollaborationContext = createContext();

export const CollaborationProvider = ({ children }) => {
  const value = useCollaboration();
  return <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>;
};

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaborationContext must be used within CollaborationProvider');
  }
  return context;
};
