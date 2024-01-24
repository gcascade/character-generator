import React, { useState, createContext } from "react";

export const CharacterContext = createContext();

export const CharacterProvider = ({ children, initCharacter }) => {
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
