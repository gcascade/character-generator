import React from 'react';
import { CharacterProvider } from '../contexts/CharacterContext';
import { HistoryProvider } from '../contexts/HistoryContext';
import { RequestProvider } from '../contexts/RequestContext';
import { generateRandomCharacter } from '../utils/character';
import CharacterGenerator from './CharacterGenerator';

function App() {
  return (
    <CharacterProvider initCharacter={generateRandomCharacter({})}>
      <HistoryProvider>
        <RequestProvider>
          <CharacterGenerator />
        </RequestProvider>
      </HistoryProvider>
    </CharacterProvider>
  );
}

export default App;
