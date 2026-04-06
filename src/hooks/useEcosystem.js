// frontend/src/hooks/useEcosystem.js
import { useCollaboration } from './useCollaboration';

export const useEcosystem = () => {
  const collaboration = useCollaboration();
  return {
    ...collaboration,
    focus: 'ecosystem',
  };
};

export default useEcosystem;
