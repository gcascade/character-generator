import { arenaSetup } from '@Test/stubs/Arena.stubs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('opens the card of a contestant when hovering a highlighted name', async () => {
    render(<RoundView round={first} setup={arenaSetup} standing={4} />);
    const [event] = first.events;
    const name = arenaSetup.contestants.find((c) => c.id === event.actors[0])!
      .character.firstName;
    const [highlighted] = screen.getAllByText(name, { selector: 'span' });
    await userEvent.hover(highlighted);
    const tooltip = await screen.findByRole('tooltip');
    expect(
      within(tooltip).getByRole('group', { name: `Skills of ${name}` }),
    ).toBeInTheDocument();
  });

  it('shows the narrator apart, and who is out', () => {
    const round = {
      number: 9,
      phase: 'day' as const,
      after: first.after,
      events: [
        {
          eventId: 'announce-finale',
          outcome: 'only',
          actors: ['aela', 'korvus'],
          defeated: [],
        },
        {
          eventId: 'event-finale-duel',
          outcome: 'defeat',
          actors: ['aela', 'korvus'],
          defeated: ['korvus'],
        },
      ],
    };
    render(<RoundView round={round} setup={arenaSetup} standing={1} finale />);
    expect(screen.getByText(/the finale begins/)).toBeInTheDocument();
    expect(screen.getByText('Korvus is out')).toBeInTheDocument();
  });
});
