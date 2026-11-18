import { Character } from '@Types/character';
import { parseStoredCharacters } from '../content/storedCharacter';
import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
} from 'react';

type DataProviderProps = {
  children: ReactNode;
};

type DataContextType = {
  characters: Character[];
  saveCharacter: (character: Character) => void;
  removeCharacter: (character: Character) => void;
};

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>(() =>
    parseStoredCharacters(localStorage.getItem('characters')),
  );

  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters));
  }, [characters]);

  const saveCharacter = (character: Character) => {
    setCharacters((prevCharacters) => [...prevCharacters, character]);
  };

  const removeCharacter = (character: Character) => {
    setCharacters((prevCharacters) =>
      prevCharacters.filter((c) => c !== character),
    );
  };

  return (
    <DataContext.Provider
      value={{
        characters,
        saveCharacter,
        removeCharacter,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
