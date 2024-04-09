import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Character } from '../../types/character';
import HistoryItem from './HistoryItem';

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

const onCharacterClick = jest.fn();

describe('HistoryItem', () => {
  it('renders without crashing', () => {
    render(
      <HistoryItem character={character} onCharacterClick={onCharacterClick} />,
    );
  });

  it('displays the correct character information', () => {
    render(
      <HistoryItem character={character} onCharacterClick={onCharacterClick} />,
    );
    expect(screen.getByText('John Doe (100)')).toBeInTheDocument();
  });

  it('calls onCharacterClick when clicked', () => {
    render(
      <HistoryItem character={character} onCharacterClick={onCharacterClick} />,
    );
    fireEvent.click(screen.getByText('John Doe (100)'));
    expect(onCharacterClick).toHaveBeenCalledWith(character);
  });
});
