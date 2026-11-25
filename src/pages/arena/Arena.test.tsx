import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { ArenaProvider } from '../../contexts/ArenaContext';
import { CharacterProvider } from '../../contexts/CharacterContext';
import { DataProvider } from '../../contexts/DataContext';
import { PartyProvider } from '../../contexts/PartyContext';
import { LocaleProvider, useLocale } from '../../i18n';
import Arena from './Arena';

const SwitchToFrench = () => {
  const { setLocale } = useLocale();
  return <button onClick={() => setLocale('fr')}>fr</button>;
};

const renderArena = () =>
  render(
    <MemoryRouter>
      <LocaleProvider initial="en">
        <CharacterProvider initCharacter={korvusBlackiron}>
          <DataProvider>
            <PartyProvider>
              <ArenaProvider>
                <SwitchToFrench />
                <Arena />
              </ArenaProvider>
            </PartyProvider>
          </DataProvider>
        </CharacterProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );

const cards = () => screen.queryAllByRole('article');

describe('Arena page — roster (spec 012 US1)', () => {
  afterEach(() => localStorage.clear());

  it('starts empty and needs two sides', async () => {
    renderArena();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Arena' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No contestants yet/)).toBeInTheDocument();
    const start = screen.getByRole('button', { name: 'Start the match' });
    expect(start).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current character' }),
    );
    expect(
      screen.getByText(/At least two sides are needed/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 4 random characters' }),
    );
    expect(cards()).toHaveLength(5);
    expect(start).toBeEnabled();
  });

  it('shows the skills of each contestant and keeps them after a reload', async () => {
    const { unmount } = renderArena();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current character' }),
    );
    const grid = screen.getByRole('group', {
      name: 'Skills of Korvus Blackiron',
    });
    const before = grid.textContent;
    expect(within(grid).getByText('Intimidation')).toBeInTheDocument();
    unmount();
    renderArena();
    expect(
      screen.getByRole('group', { name: 'Skills of Korvus Blackiron' })
        .textContent,
    ).toBe(before);
  });

  it('removes a contestant', async () => {
    renderArena();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current character' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Korvus Blackiron' }),
    );
    expect(cards()).toHaveLength(0);
  });
});

describe('Arena page — match (spec 012 US2)', () => {
  afterEach(() => localStorage.clear());

  const start = async () => {
    renderArena();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 4 random characters' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Start the match' }),
    );
  };

  it('tells the match round by round, then the summary', async () => {
    await start();
    expect(screen.getByRole('region', { name: 'Day 1' })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Night 1' }),
    ).not.toBeInTheDocument();
    const next = screen.queryByRole('button', { name: 'Next round' });
    if (next) await userEvent.click(next);
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip to the end' }),
    );
    expect(
      screen.getByRole('region', { name: 'The end of the match' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next round' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the same events when the language changes', async () => {
    await start();
    const lines = screen.getAllByRole('listitem').length;
    await userEvent.click(screen.getByRole('button', { name: 'fr' }));
    expect(screen.getByRole('region', { name: 'Jour 1' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(lines);
  });

  it('replays the same story, plays again with a new one, and goes back to the roster', async () => {
    await start();
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip to the end' }),
    );
    const story = screen.getAllByRole('listitem').map((li) => li.textContent);
    await userEvent.click(screen.getByRole('button', { name: 'Replay' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip to the end' }),
    );
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      story,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.getByRole('region', { name: 'Day 1' })).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to the roster' }),
    );
    expect(
      screen.getByRole('button', { name: 'Start the match' }),
    ).toBeInTheDocument();
  });
});
