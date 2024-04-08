import { render, screen } from '@testing-library/react';
import React from 'react';
import RaceIcon from './RaceIcon';

describe('ClassIcon', () => {
  it('renders the human icon when characterRace is "Human"', () => {
    render(<RaceIcon characterRace="Human" />);
    expect(screen.getByTestId('human-icon')).toBeInTheDocument();
  });

  it('renders the elf icon when characterRace is "Elf"', () => {
    render(<RaceIcon characterRace="Elf" />);
    expect(screen.getByTestId('elf-icon')).toBeInTheDocument();
  });

  it('renders the orc icon when characterRace is "Orc"', () => {
    render(<RaceIcon characterRace="Orc" />);
    expect(screen.getByTestId('orc-icon')).toBeInTheDocument();
  });

  it('renders the dwarf icon when characterRace is "Dwarf"', () => {
    render(<RaceIcon characterRace="Dwarf" />);
    expect(screen.getByTestId('dwarf-icon')).toBeInTheDocument();
  });
});
