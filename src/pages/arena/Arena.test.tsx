import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import { ArenaProvider } from '../../contexts/ArenaContext';
import { addRandom, emptySetup } from '../../content/arena';
import { encodeArena } from '../../content/share';
import { CharacterProvider } from '../../contexts/CharacterContext';
import { DataProvider } from '../../contexts/DataContext';
import { PartyProvider } from '../../contexts/PartyContext';
import { LocaleProvider, useLocale } from '../../i18n';
import Arena from './Arena';

const SwitchToFrench = () => {
  const { setLocale } = useLocale();
  return <button onClick={() => setLocale('fr')}>fr</button>;
};

const renderArena = (entry = '/arena') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LocaleProvider initial="en">
        <CharacterProvider initCharacter={korvusBlackiron}>
          <DataProvider>
            <PartyProvider>
              <AlertManagerProvider>
                <ArenaProvider>
                  <SwitchToFrench />
                  <Arena />
                </ArenaProvider>
              </AlertManagerProvider>
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

describe('Arena page — perks and items (spec 012 US4)', () => {
  afterEach(() => localStorage.clear());

  it('gives everyone random perks and items', async () => {
    renderArena();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add the current character' }),
    );
    const loadout = screen.getByRole('group', {
      name: 'Perks and items of Korvus',
    });
    // A perk, a flaw, and the first item.
    expect(within(loadout).getAllByRole('combobox')).toHaveLength(3);
    await userEvent.click(
      screen.getByRole('button', { name: 'Random perks and items' }),
    );
    expect(
      within(loadout).getAllByRole('combobox').length,
    ).toBeGreaterThanOrEqual(4);
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

  it('shows the dice and the state of the contestants', async () => {
    await start();
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip to the end' }),
    );
    expect(screen.getAllByText(/%\s→\s\d+/).length).toBeGreaterThan(0);
    await userEvent.click(
      screen.getByRole('switch', { name: 'Show the dice' }),
    );
    expect(screen.queryAllByText(/%\s→\s\d+/)).toHaveLength(0);
    await userEvent.click(
      screen.getByRole('button', { name: 'State of the contestants' }),
    );
    expect(
      screen.getByRole('region', { name: 'State of the contestants' }),
    ).toBeInTheDocument();
  });

  it('plays the match by itself, event after event, and pauses', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await start();
    const before = screen.getAllByRole('listitem').length;
    await userEvent.click(screen.getByRole('button', { name: 'Play' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600 * 3);
    });
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(before);
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    const paused = screen.getAllByRole('listitem').length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600 * 3);
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(paused);
    vi.useRealTimers();
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

describe('Arena page — sharing (spec 012 US5)', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('copies a link to the match', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    renderArena();
    await userEvent.click(
      screen.getByRole('button', { name: 'Add 4 random characters' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Start the match' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Share the match' }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(writeText.mock.calls[0][0]).toMatch(/\/arena#a1\./);
  });

  it('opens a shared match read-only, and can use its roster', async () => {
    const shared = { ...addRandom(emptySetup(), 5), seed: 'shared' };
    renderArena(`/arena#a1.${await encodeArena(shared)}`);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'A shared match' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('region', { name: 'Day 1' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Play again' }),
    ).not.toBeInTheDocument();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await userEvent.click(
      screen.getByRole('button', { name: 'Use this roster' }),
    );
    expect(await screen.findAllByRole('article')).toHaveLength(5);
  });

  it('explains when a link cannot be read', async () => {
    renderArena('/arena#a1.broken');
    expect(
      await screen.findByText(/This arena link cannot be read/),
    ).toBeInTheDocument();
  });
});
