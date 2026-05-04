// frontend/src/context/AlumniContext.jsx
import { createContext, useContext } from 'react';

import { useAlumni } from '../hooks/useAlumni';

const AlumniContext = createContext(null);

export const AlumniProvider = ({ children }) => {
  const alumniData = useAlumni();

  return <AlumniContext.Provider value={alumniData}>{children}</AlumniContext.Provider>;
};

export const useAlumniContext = () => {
  const context = useContext(AlumniContext);
  if (!context) {
    throw new Error('useAlumniContext must be used within AlumniProvider');
  }
  return context;
};

export default AlumniContext;
