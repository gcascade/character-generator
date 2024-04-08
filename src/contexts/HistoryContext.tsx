import React, { FC, ReactNode, createContext, useState } from 'react';
import { Character } from '../types/character';

type HistoryProviderProps = {
  children: ReactNode;
};

type HistoryContextType = {
  history: Character[];
  addToHistory: (characters: Character[]) => void;
  removeFromHistory: (character: Character) => void;
  clearHistory: VoidFunction;
};

export const HistoryContext = createContext<HistoryContextType | undefined>(
  undefined,
);

export const HistoryProvider: FC<HistoryProviderProps> = ({ children }) => {
  const [history, setHistory] = useState<Character[]>([]);

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
