import { useContext, useEffect, useRef } from 'react';
import { HistoryContext } from '../contexts/HistoryContext';
import { Character } from '../types/character';

const useCharacterHistory = () => {
  const historyContext = useContext(HistoryContext);
  const isInitialLoad = useRef(true);

  if (!historyContext) {
    throw new Error(
      'useCharacterHistory must be used within a HistoryProvider',
    );
  }

  const { history, addToHistory, removeFromHistory, clearHistory } =
    historyContext;

  useEffect(() => {
    if (isInitialLoad.current && history.length === 0) {
      const storedHistory = localStorage.getItem('characterHistory');
      if (storedHistory) {
        try {
          const historyData: Character[] = JSON.parse(storedHistory);
          addToHistory(historyData);
        } catch (error) {
          console.error('Failed to parse stored history:', error);
        }
      }
      isInitialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('characterHistory', JSON.stringify(history));
  }, [history]);

  return { history, addToHistory, removeFromHistory, clearHistory };
};

export default useCharacterHistory;
