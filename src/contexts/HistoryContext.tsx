import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
} from 'react';
import { parseStoredCharacters } from '../content/storedCharacter';
import { Character } from '../types/character';

type HistoryProviderProps = {
  children: ReactNode;
};

export type HistoryContextType = {
  history: Character[];
  addToHistory: (characters: Character[]) => void;
  removeFromHistory: (character: Character) => void;
  clearHistory: VoidFunction;
};

const STORAGE_KEY = 'characterHistory';

const loadHistory = (): Character[] =>
  parseStoredCharacters(localStorage.getItem(STORAGE_KEY));

export const HistoryContext = createContext<HistoryContextType | undefined>(
  undefined,
);

export const HistoryProvider: FC<HistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<Character[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (characters: Character[]) => {
    setHistory((prevHistory) => [...prevHistory, ...characters]);
  };

  const removeFromHistory = (character: Character) => {
    setHistory((prevHistory) => prevHistory.filter((c) => c !== character));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider
      value={{ history, addToHistory, removeFromHistory, clearHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};
