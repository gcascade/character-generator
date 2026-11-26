import { useContext } from 'react';
import { ArenaContext } from '../contexts/ArenaContext';

/** The arena roster, choices and match progress (spec 012). */
const useArena = () => {
  const context = useContext(ArenaContext);
  if (!context) {
    throw new Error('useArena must be used within an ArenaProvider');
  }
  return context;
};

export default useArena;
