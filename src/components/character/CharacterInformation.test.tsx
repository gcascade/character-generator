import { render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import { Character } from '../../types/character';
import CharacterInformation from './CharacterInformation';

describe('CharacterInformation', () => {
  const character: Character = {
    firstName: 'John',
    lastName: 'Doe',
    epithet: 'The Brave',
    race: 'Elf',
    characterClass: 'Warrior',
    gender: 'Male',
    age: 100,
    alignment: 'Neutral Good',
    background: {
      title: 'Title',
      content: ['Content'],
    },
  };

  const setCharacter = jest.fn();

  test('renders CharacterInformation component without crashing', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterInformation />
      </CharacterContext.Provider>,
    );
  });

  test('displays the character information correctly', () => {
    render(
      <CharacterContext.Provider value={{ character, setCharacter }}>
        <CharacterInformation />
      </CharacterContext.Provider>,
    );

    expect(screen.getByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/The Brave/i)).toBeInTheDocument();
    expect(screen.getByText(/Elf/i)).toBeInTheDocument();
    expect(screen.getByText(/Warrior/i)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getByText(/Neutral Good/i)).toBeInTheDocument();
  });
});
