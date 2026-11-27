import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { simulate, summarize } from '../../../content/arena';
import MatchSummary from './MatchSummary';

const summary = summarize(arenaSetup, simulate(arenaSetup));

describe('MatchSummary', () => {
  it('shows the winner, the notable moments and every contestant', () => {
    render(<MatchSummary setup={arenaSetup} summary={summary} />);
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
      arenaSetup.contestants.length + 1,
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
});
