import React from 'react';
import { CharacterProvider } from '../contexts/CharacterContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { generateRandomCharacter } from '../utils/character';
import CharacterGenerator from './CharacterGenerator';

function App() {
  return (
    <CharacterProvider initCharacter={generateRandomCharacter()}>
      <HistoryProvider>
        <CharacterGenerator />
      </HistoryProvider>
    </CharacterProvider>
  );
}

export default App;
