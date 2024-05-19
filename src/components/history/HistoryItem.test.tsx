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
const onDeleteClick = jest.fn();

describe('HistoryItem', () => {
  it('renders without crashing', () => {
    render(
      <HistoryItem
        character={character}
        onCharacterClick={onCharacterClick}
        onDeleteClick={onDeleteClick}
      />,
    );
  });

  it('displays the correct character information', () => {
    render(
      <HistoryItem
        character={character}
        onCharacterClick={onCharacterClick}
        onDeleteClick={onDeleteClick}
      />,
    );
    expect(screen.getByText('John Doe (100)')).toBeInTheDocument();
  });

  it('calls onCharacterClick when clicked', () => {
    render(
      <HistoryItem
        character={character}
        onCharacterClick={onCharacterClick}
        onDeleteClick={onDeleteClick}
      />,
    );
    fireEvent.click(screen.getByText('John Doe (100)'));
    expect(onCharacterClick).toHaveBeenCalledWith(character);
  });

  it('calls onDeleteClick when the delete button is clicked', () => {
    const { getByLabelText } = render(
      <HistoryItem
        character={character}
        onCharacterClick={onCharacterClick}
        onDeleteClick={onDeleteClick}
      />,
    );

    fireEvent.click(getByLabelText('delete'));

    expect(onDeleteClick).toHaveBeenCalledWith(character);
  });

  it('displays the correct tooltips', async () => {
    const { getByTestId } = render(
      <HistoryItem
        character={character}
        onCharacterClick={onCharacterClick}
        onDeleteClick={onDeleteClick}
      />,
    );

    fireEvent.mouseOver(getByTestId('elf-icon'));
    expect(await screen.findByText(character.race)).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId('warrior-icon'));
    expect(
      await screen.findByText(character.characterClass),
    ).toBeInTheDocument();
  });
});
