import { useContext } from 'react';
import { LockContext } from '../contexts/LockContext';

/** Locked properties of the current character (spec 003). */
const useLocks = () => {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error('useLocks must be used within a LockProvider');
  }
  return context;
};

export default useLocks;
