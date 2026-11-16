import { fireEvent, render, screen } from '@testing-library/react';
import { CharacterClass, CharacterRace } from '@Types/character';
import React from 'react';
import HistoryCharacterSummary from './HistoryCharacterSummary';

const characterInfoProps: {
  race: CharacterRace;
  characterClass: CharacterClass;
  firstName: string;
  lastName: string;
  age: number;
} = {
  race: 'Elf',
  characterClass: 'Warrior',
  firstName: 'John',
  lastName: 'Doe',
  age: 100,
};

describe('HistoryCharacterSummary', () => {
  it('renders without crashing', () => {
    render(<HistoryCharacterSummary {...characterInfoProps} />);
  });

  it('displays the character information correctly', () => {
    render(<HistoryCharacterSummary {...characterInfoProps} />);

    expect(
      screen.getByText(
        `${characterInfoProps.firstName} ${characterInfoProps.lastName} (${characterInfoProps.age})`,
      ),
    ).toBeInTheDocument();
  });

  it('displays the correct tooltips', async () => {
    const { getByTestId } = render(
      <HistoryCharacterSummary {...characterInfoProps} />,
    );

    fireEvent.mouseOver(getByTestId('elf-icon'));
    expect(
      await screen.findByText(characterInfoProps.race),
    ).toBeInTheDocument();

    fireEvent.mouseOver(getByTestId('warrior-icon'));
    expect(
      await screen.findByText(characterInfoProps.characterClass),
    ).toBeInTheDocument();
  });

  it('applies the textStyle correctly', () => {
    const textStyle = { color: 'rgb(255, 0, 0)' };

    const { getByText } = render(
      <HistoryCharacterSummary {...characterInfoProps} textStyle={textStyle} />,
    );
    const textElement = getByText(
      `${characterInfoProps.firstName} ${characterInfoProps.lastName} (${characterInfoProps.age})`,
    );

    expect(textElement).toHaveStyle(textStyle);
  });
});
