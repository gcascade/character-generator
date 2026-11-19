import { useContext } from 'react';
import { PartyContext } from '../contexts/PartyContext';

/** The party being built and the saved parties (spec 004). */
const useParty = () => {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error('useParty must be used within a PartyProvider');
  }
  return context;
};

export default useParty;
