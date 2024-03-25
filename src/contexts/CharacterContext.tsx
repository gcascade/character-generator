import React, { FC, ReactNode, createContext, useState } from 'react';
import { Character } from '../types/character';

type CharacterProviderProps = {
  children: ReactNode;
  initCharacter: Character;
};

type CharacterContextType = {
  character: Character;
  setCharacter: (character: Character) => void;
};

export const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined,
);

export const CharacterProvider: FC<CharacterProviderProps> = ({
  children,
  initCharacter,
}) => {
  const [character, setCharacter] = useState(initCharacter);

  const characterContext = {
    character,
    setCharacter,
  };

  return (
    <CharacterContext.Provider value={characterContext}>
      {children}
    </CharacterContext.Provider>
  );
};
