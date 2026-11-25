import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { ArenaProvider } from '../../contexts/ArenaContext';
import { CharacterProvider } from '../../contexts/CharacterContext';
import { DataProvider } from '../../contexts/DataContext';
import { PartyProvider } from '../../contexts/PartyContext';
import { LocaleProvider } from '../../i18n';
import Arena from './Arena';

const renderArena = () =>
  render(
    <MemoryRouter>
      <LocaleProvider initial="en">
        <CharacterProvider initCharacter={korvusBlackiron}>
          <DataProvider>
            <PartyProvider>
              <ArenaProvider>
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
