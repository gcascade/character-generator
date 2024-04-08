import { useContext, useEffect } from 'react';
import { HistoryContext } from '../contexts/HistoryContext';
import { Character } from '../types/character';

const useCharacterHistory = () => {
  const historyContext = useContext(HistoryContext);

  if (!historyContext) {
    throw new Error(
      'useCharacterHistory must be used within a HistoryProvider',
    );
  }

  const { history, addToHistory, removeFromHistory, clearHistory } =
    historyContext;

  useEffect(() => {
    const storedHistory = localStorage.getItem('characterHistory');
    if (storedHistory) {
      try {
        const historyData: Character[] = JSON.parse(storedHistory);
        addToHistory(historyData);
      } catch (error) {
        console.error('Failed to parse stored history:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('characterHistory', JSON.stringify(history));
  }, [history]);

  return { history, addToHistory, removeFromHistory, clearHistory };
};

export default useCharacterHistory;
