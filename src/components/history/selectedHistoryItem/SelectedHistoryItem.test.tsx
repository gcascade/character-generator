import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Character } from '../../../types/character';
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

const mockOnDeleteClick = jest.fn();

describe('SelectedHistoryItem', () => {
  it('renders without crashing', () => {
    render(
      <SelectedHistoryItem
        character={character}
        onDeleteClick={mockOnDeleteClick}
      />,
    );
  });

  it('displays the character information correctly', () => {
    render(
      <SelectedHistoryItem
        character={character}
        onDeleteClick={mockOnDeleteClick}
      />,
    );

    expect(
      screen.getByText(
        `${character.firstName} ${character.lastName} (${character.age})`,
      ),
    ).toBeInTheDocument();
  });

  it('calls onDeleteClick when the delete button is clicked', () => {
    const onDeleteClick = jest.fn();
    const { getByLabelText } = render(
      <SelectedHistoryItem
        character={character}
        onDeleteClick={onDeleteClick}
      />,
    );

    fireEvent.click(getByLabelText('delete'));

    expect(onDeleteClick).toHaveBeenCalledWith(character);
  });

  it('displays the correct tooltips', async () => {
    const { getByTestId } = render(
      <SelectedHistoryItem
        character={character}
        onDeleteClick={mockOnDeleteClick}
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
