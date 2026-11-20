import { render, screen } from '@testing-library/react';
import React from 'react';
import { Occupations } from '../../../types/npc';
import OccupationIcon from './OccupationIcon';

describe('OccupationIcon', () => {
  it.each(Object.values(Occupations))('shows an icon for %s', (occupation) => {
    render(<OccupationIcon occupation={occupation} />);
    expect(
      screen.getByTestId(`${occupation.toLowerCase()}-icon`),
    ).toBeInTheDocument();
  });
});
