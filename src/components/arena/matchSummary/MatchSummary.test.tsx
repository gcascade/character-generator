import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { matchSetup, simulate, summarize } from '../../../content/arena';
import MatchSummary from './MatchSummary';

const match = simulate(arenaSetup);
const summary = summarize(arenaSetup, match);
const setup = matchSetup(arenaSetup, match);

describe('MatchSummary', () => {
  it('shows the winner, the notable moments and every contestant', () => {
    render(<MatchSummary setup={setup} summary={summary} />);
    const section = screen.getByRole('region', {
      name: 'The end of the match',
    });
    expect(
      within(section).getByText(/Winner|Winning team/),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('heading', { name: 'Notable moments' }),
    ).toBeInTheDocument();
    expect(within(section).getAllByRole('row')).toHaveLength(
      setup.contestants.length + 1,
    );
    expect(
      within(section).getAllByText('Still standing').length,
    ).toBeGreaterThan(0);
  });

  it('names the team when a team wins', () => {
    const teamWin = { ...summary, winners: ['aela', 'brom'] };
    render(<MatchSummary setup={arenaSetup} summary={teamWin} />);
    expect(screen.getByText('Winning team')).toBeInTheDocument();
    expect(screen.getByText('The Lanterns of Greywater')).toBeInTheDocument();
    expect(
      screen.getByText('Aela Brightwind, Brom Ironfoot'),
    ).toBeInTheDocument();
  });

  it('names a winning couple', () => {
    const couple = { ...summary, winners: ['korvus', 'sil'], couple: true };
    render(<MatchSummary setup={arenaSetup} summary={couple} />);
    expect(screen.getByText('Winning couple')).toBeInTheDocument();
    expect(
      screen.getByText('Korvus Blackiron & Sil Quickfingers'),
    ).toBeInTheDocument();
  });

  it('names everyone standing in a shared victory, by decree (spec 013)', () => {
    const shared = {
      ...summary,
      winners: ['aela', 'korvus'],
      shared: true,
      decree: 'survive' as const,
    };
    render(<MatchSummary setup={arenaSetup} summary={shared} />);
    expect(
      screen.getByText('By decree of the arena masters'),
    ).toBeInTheDocument();
    expect(screen.getByText('Shared victory')).toBeInTheDocument();
    expect(
      screen.getByText('Aela Brightwind, Korvus Blackiron'),
    ).toBeInTheDocument();
  });
});
