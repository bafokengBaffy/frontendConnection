// frontend/src/context/AlumniContext.jsx
import { createContext, useContext } from 'react';

import { useAlumni } from '../hooks/useAlumni';

const AlumniContext = createContext();

export const AlumniProvider = ({ children }) => {
  const value = useAlumni();
  return <AlumniContext.Provider value={value}>{children}</AlumniContext.Provider>;
};

export const useAlumniContext = () => {
  const context = useContext(AlumniContext);
  if (!context) {
    throw new Error('useAlumniContext must be used within AlumniProvider');
  }
  return context;
};
