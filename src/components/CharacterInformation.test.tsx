import { render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import { Character } from '../types/character';
import { expectElementWithTextToBeInTheDocument } from '../utils/tests';
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

    expectElementWithTextToBeInTheDocument('First Name: John');
    expectElementWithTextToBeInTheDocument('Last Name: Doe');
    expectElementWithTextToBeInTheDocument('Epithet: The Brave');
    expect(screen.getByText(/Elf/i)).toBeInTheDocument();
    expectElementWithTextToBeInTheDocument('Class: Warrior');
    expectElementWithTextToBeInTheDocument('Gender: Male');
    expectElementWithTextToBeInTheDocument('Age: 100');
    expectElementWithTextToBeInTheDocument('Alignment: Neutral Good');
  });
});
