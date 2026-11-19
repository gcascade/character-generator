import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import CharacterHeader from './CharacterHeader';

describe('CharacterHeader', () => {
  it('shows the name as a heading, the epithet and the badges', () => {
    render(<CharacterHeader character={korvusBlackiron} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Korvus Blackiron' }),
    ).toBeInTheDocument();
    expect(screen.getByText('The Unyielding')).toBeInTheDocument();
    expect(screen.getByText('Orc')).toBeInTheDocument();
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByText('Male · 48 years old')).toBeInTheDocument();
  });

  it('agrees badges with the gender in French', () => {
    render(
      <LocaleProvider initial="fr">
        <CharacterHeader
          character={{ ...korvusBlackiron, gender: 'Female' }}
          headingLevel="h3"
        />
      </LocaleProvider>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Orque')).toBeInTheDocument();
    expect(screen.getByText('Guerrière')).toBeInTheDocument();
    expect(screen.getByText('Féminin · 48 ans')).toBeInTheDocument();
  });
});
