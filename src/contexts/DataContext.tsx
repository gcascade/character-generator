import { Character } from '@Types/character';
import { parseStoredCharacters, withIds } from '../content/storedCharacter';
import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

type DataProviderProps = {
  children: ReactNode;
};

type DataContextType = {
  characters: Character[];
  /** Stores a copy with a new id and returns it. */
  saveCharacter: (character: Character) => Character;
  removeCharacter: (id: string) => void;
  /** Replaces the saved character with the same id. */
  updateCharacter: (character: Character) => void;
  findCharacter: (id: string) => Character | undefined;
};

export const DataContext = createContext<DataContextType | undefined>(
  undefined,
);

/** Saved characters ("My characters"), identified by id (spec 006). */
export const DataProvider: FC<DataProviderProps> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>(() =>
    withIds(parseStoredCharacters(localStorage.getItem('characters'))),
  );

  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters));
  }, [characters]);

  const saveCharacter = useCallback((character: Character) => {
    const saved = { ...character, id: crypto.randomUUID() };
    setCharacters((previous) => [...previous, saved]);
    return saved;
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setCharacters((previous) => previous.filter((c) => c.id !== id));
  }, []);

  const updateCharacter = useCallback((character: Character) => {
    setCharacters((previous) =>
      previous.map((c) => (c.id === character.id ? character : c)),
    );
  }, []);

  const value = useMemo(
    () => ({
      characters,
      saveCharacter,
      removeCharacter,
      updateCharacter,
      findCharacter: (id: string) => characters.find((c) => c.id === id),
    }),
    [characters, saveCharacter, removeCharacter, updateCharacter],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
