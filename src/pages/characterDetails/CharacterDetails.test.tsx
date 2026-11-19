import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useContext } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { generateRandomCharacter } from '../../content/generate';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import {
  CharacterContext,
  CharacterProvider,
} from '../../contexts/CharacterContext';
import { DataProvider } from '../../contexts/DataContext';
import { HistoryContext, HistoryProvider } from '../../contexts/HistoryContext';
import { RequestProvider } from '../../contexts/RequestContext';
import type { Character } from '../../types/character';
import Characters from '../characters/Characters';
import CharacterDetails from './CharacterDetails';

const current = generateRandomCharacter({ race: 'Orc' });

/** Shows what the generator would display, to check "Open in the generator". */
const HomeProbe = () => {
  const { character } = useContext(CharacterContext)!;
  const { history } = useContext(HistoryContext)!;
  return (
    <p>
      current: {character.firstName} {character.id}; history:{' '}
      {history.map((c) => c.firstName).join(',')}
    </p>
  );
};

const renderAt = (path: string, saved: Character[]) => {
  localStorage.setItem('characters', JSON.stringify(saved));
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AlertManagerProvider>
        <RequestProvider>
          <CharacterProvider initCharacter={current}>
            <HistoryProvider>
              <DataProvider>
                <Routes>
                  <Route path="/" element={<HomeProbe />} />
                  <Route path="/characters" element={<Characters />} />
                  <Route
                    path="/characters/:id"
                    element={<CharacterDetails />}
                  />
                </Routes>
              </DataProvider>
            </HistoryProvider>
          </CharacterProvider>
        </RequestProvider>
      </AlertManagerProvider>
    </MemoryRouter>,
  );
};

const hero = { ...generateRandomCharacter({ race: 'Elf' }), id: 'hero' };
const twin = { ...hero, id: 'twin' };

describe('CharacterDetails page', () => {
  afterEach(() => localStorage.clear());

  it('shows a saved character from its address (reload-proof)', () => {
    renderAt('/characters/hero', [hero]);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${hero.firstName} ${hero.lastName}`,
      }),
    ).toBeInTheDocument();
  });

  it('shows "not found" for an unknown address', () => {
    renderAt('/characters/nope', [hero]);
    expect(screen.getByText('Character not found')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to my characters' }),
    ).toHaveAttribute('href', '/characters');
  });

  it('opens from My characters and goes back to the list', async () => {
    renderAt('/characters', [hero]);
    await userEvent.click(
      screen.getByRole('link', {
        name: `Open ${hero.firstName} ${hero.lastName}`,
      }),
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to my characters' }),
    );
    expect(screen.getByText('My Characters')).toBeInTheDocument();
  });

  it('opens a legacy character saved without an id (SC-002)', async () => {
    const legacy = { ...hero };
    delete (legacy as Partial<Character>).id;
    renderAt('/characters', [legacy]);
    await userEvent.click(screen.getByRole('link', { name: /^Open / }));
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('opens the character in the generator, keeping the previous one in the history', async () => {
    renderAt('/characters/hero', [hero]);
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in the generator' }),
    );
    expect(
      screen.getByText(
        `current: ${hero.firstName} hero; history: ${current.firstName}`,
      ),
    ).toBeInTheDocument();
  });

  it('deletes only this character, after confirmation', async () => {
    renderAt('/characters/hero', [hero, twin]);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Click again to delete' }),
    );
    const stored: Character[] = JSON.parse(localStorage.getItem('characters')!);
    expect(stored.map((c) => c.id)).toEqual(['twin']);
    expect(screen.getByText('My Characters')).toBeInTheDocument();
  });
});
