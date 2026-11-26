import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ContestantPeek, { PeekCard } from './ContestantPeek';

const state = {
  hp: 9,
  maxHp: 30,
  items: ['item-sword'],
  standing: true,
  sideId: 'korvus',
  defeats: 0,
};

describe('ContestantPeek', () => {
  it('shows the portrait, skills, perks, and hit points and gear at that moment', () => {
    render(<PeekCard setup={arenaSetup} id="aela" state={state} />);
    expect(screen.getByText('Aela Brightwind')).toBeInTheDocument();
    expect(screen.getByText('HP 9/30')).toBeInTheDocument();
    expect(screen.getByText('a sword')).toBeInTheDocument();
    expect(screen.getByText('Sharpshooter')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Skills of Aela' }),
    ).toBeInTheDocument();
  });

  it('says when the contestant is out', () => {
    render(
      <PeekCard
        setup={arenaSetup}
        id="aela"
        state={{ ...state, standing: false, hp: 0 }}
      />,
    );
    expect(screen.getByText('Out')).toBeInTheDocument();
  });

  it('opens over a name on hover', async () => {
    render(
      <ContestantPeek setup={arenaSetup} id="korvus">
        <span tabIndex={0}>Korvus</span>
      </ContestantPeek>,
    );
    await userEvent.hover(screen.getByText('Korvus'));
    const tooltip = await screen.findByRole('tooltip');
    expect(
      within(tooltip).getByRole('group', { name: 'Skills of Korvus' }),
    ).toBeInTheDocument();
  });

  it('stays open after a tap or click, until clicked again', async () => {
    render(
      <ContestantPeek setup={arenaSetup} id="korvus">
        <span tabIndex={0}>Korvus</span>
      </ContestantPeek>,
    );
    const name = screen.getByText('Korvus');
    await userEvent.click(name);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await userEvent.unhover(name);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.click(name);
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });
});
