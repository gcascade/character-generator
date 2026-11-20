import { render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterRaces } from '../../../types/character';
import { slug } from '../../../content/slug';
import RaceEmblem from './RaceEmblem';

describe('RaceEmblem', () => {
  it('names the race and class for screen readers', () => {
    render(
      <RaceEmblem
        race="Dark elf"
        characterClass="Ranger"
        height={200}
        width={200}
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Emblem: Dark elf Ranger' }),
    ).toBeInTheDocument();
  });

  it.each(Object.values(CharacterRaces))('shows the %s symbol', (race) => {
    render(
      <RaceEmblem race={race} characterClass="Bard" height={200} width={200} />,
    );
    expect(screen.getByTestId(`${slug(race)}-icon`)).toBeInTheDocument();
  });
});
