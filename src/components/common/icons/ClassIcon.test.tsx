import { render, screen } from '@testing-library/react';
import React from 'react';
import { CharacterClass } from '../../../types/character';
import ClassIcon from './ClassIcon';

describe('ClassIcon', () => {
  it('should render the correct icon for each character class', () => {
    const classes: CharacterClass[] = ['Warrior', 'Mage', 'Rogue', 'Cleric'];

    classes.forEach((characterClass) => {
      render(<ClassIcon characterClass={characterClass} />);

      switch (characterClass) {
        case 'Warrior':
          expect(screen.getByTestId('warrior-icon')).toBeInTheDocument();
          break;
        case 'Mage':
          expect(screen.getByTestId('mage-icon')).toBeInTheDocument();
          break;
        case 'Rogue':
          expect(screen.getByTestId('rogue-icon')).toBeInTheDocument();
          break;
        case 'Cleric':
          expect(screen.getByTestId('cleric-icon')).toBeInTheDocument();
          break;
      }
    });
  });
});
