import { render, screen } from '@testing-library/react';
import React from 'react';
import { Character } from '../../types/character';
import SelectedHistoryItem from './SelectedHistoryItem';

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
    title: 'Test Title',
    content: [
      'Test content 1',
      'Test content 2',
      'Test content 3',
      'Test content 4',
      'Test content 5',
    ],
  },
};

describe('SelectedHistoryItem', () => {
  it('renders without crashing', () => {
    render(<SelectedHistoryItem character={character} />);
  });

  it('displays the character information correctly', () => {
    render(<SelectedHistoryItem character={character} />);

    expect(
      screen.getByText(
        `${character.firstName} ${character.lastName} (${character.age})`,
      ),
    ).toBeInTheDocument();
  });
});
