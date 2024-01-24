import React from "react";
import CharacterGenerator from "./CharacterGenerator";
import { CharacterProvider } from "../contexts/CharacterContext";
import { generateRandomCharacter } from "../utils/character";

function App() {
  return (
    <CharacterProvider initCharacter={generateRandomCharacter()}>
      <CharacterGenerator />
    </CharacterProvider>
  );
}

export default App;
