import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LocaleProvider } from '../../../i18n';
import PropertyList from './PropertyList';

describe('PropertyList', () => {
  it('lists every property with its label', () => {
    render(<PropertyList character={korvusBlackiron} />);
    const terms = screen.getAllByRole('term').map((dt) => dt.textContent);
    const values = screen
      .getAllByRole('definition')
      .map((dd) => dd.textContent);
    for (const [term, value] of [
      ['First Name', 'Korvus'],
      ['Last Name', 'Blackiron'],
      ['Race', 'Orc'],
      ['Class', 'Warrior'],
      ['Age', '48'],
      ['Alignment', 'Lawful Good'],
    ]) {
      expect(values[terms.indexOf(term)]).toBe(value);
    }
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('agrees labels in French', () => {
    render(
      <LocaleProvider initial="fr">
        <PropertyList character={{ ...korvusBlackiron, gender: 'Female' }} />
      </LocaleProvider>,
    );
    expect(screen.getByText('Guerrière')).toBeInTheDocument();
  });
});
