import { useContext } from 'react';
import { HistoryContext, HistoryContextType } from '../contexts/HistoryContext';

const useCharacterHistory = (): HistoryContextType => {
  const historyContext = useContext(HistoryContext);

  if (!historyContext) {
    throw new Error(
      'useCharacterHistory must be used within a HistoryProvider',
    );
  }

  return historyContext;
};

export default useCharacterHistory;
