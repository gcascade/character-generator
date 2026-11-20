import { useContext } from 'react';
import { NpcContext } from '../contexts/NpcContext';

/** The side character being built, the batch and the saved side characters (spec 010). */
const useNpcs = () => {
  const context = useContext(NpcContext);
  if (!context) {
    throw new Error('useNpcs must be used within an NpcProvider');
  }
  return context;
};

export default useNpcs;
