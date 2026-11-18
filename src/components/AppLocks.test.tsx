import { render, screen } from '@testing-library/react';
import React from 'react';
import { firstNamesFor } from '../content/template';
import App from './App';

// The full app, Home included, to check that saved locks come back (spec 003 US4).
describe('App with saved locks', () => {
  afterEach(() => localStorage.clear());

  it('restores the locks and shows a character that respects them', () => {
    const firstName = firstNamesFor('Elf', 'Female')[0];
    localStorage.setItem(
      'locks',
      JSON.stringify({ version: 1, template: { race: 'Elf', firstName } }),
    );
    render(<App />);

    expect(
      screen.getByRole('button', { name: 'Unlock the race' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Unlock the first name' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Lock the class' }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByText(firstName).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Elf').length).toBeGreaterThan(0);
  });

  it('works with no lock when the saved locks are damaged', () => {
    localStorage.setItem('locks', '{broken');
    render(<App />);
    expect(screen.queryByRole('button', { name: /^Unlock the/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unlock all' })).toBeNull();
  });
});
