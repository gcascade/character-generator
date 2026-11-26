import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { simulate } from '../../../content/arena';
import { LocaleProvider } from '../../../i18n';
import RoundView from './RoundView';

const match = simulate(arenaSetup);
const [first] = match.rounds;

describe('RoundView', () => {
  it('shows the round title, who is standing and one line per event', () => {
    render(<RoundView round={first} setup={arenaSetup} standing={4} />);
    const section = screen.getByRole('region', { name: 'Day 1' });
    expect(within(section).getByText('4 still standing')).toBeInTheDocument();
    expect(within(section).getAllByRole('listitem')).toHaveLength(
      first.events.length,
    );
  });

  it('tells the same round in French', () => {
    render(
      <LocaleProvider initial="fr">
        <RoundView round={first} setup={arenaSetup} standing={4} />
      </LocaleProvider>,
    );
    expect(screen.getByRole('region', { name: 'Jour 1' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(first.events.length);
  });

  it('titles the finale', () => {
    render(<RoundView round={first} setup={arenaSetup} standing={1} finale />);
    expect(
      screen.getByRole('heading', { name: 'The finale' }),
    ).toBeInTheDocument();
  });
});
