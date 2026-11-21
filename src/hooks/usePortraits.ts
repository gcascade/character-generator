import { useContext } from 'react';
import { PortraitContext } from '../contexts/PortraitContext';

/** Painted portraits (spec 011). */
const usePortraits = () => {
  const context = useContext(PortraitContext);
  if (!context) {
    throw new Error('usePortraits must be used within a PortraitProvider');
  }
  return context;
};

export default usePortraits;
