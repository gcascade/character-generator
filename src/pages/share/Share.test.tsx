import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useContext } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { renderCharacter } from '../../content/character';
import { generateRandomCharacter } from '../../content/generate';
import { generateParty, renderParty } from '../../content/party';
import { shareUrl } from '../../content/share';
import { AlertManagerProvider } from '../../contexts/AlertManagerContext';
import {
  CharacterContext,
  CharacterProvider,
} from '../../contexts/CharacterContext';
import { DataProvider } from '../../contexts/DataContext';
import { HistoryProvider } from '../../contexts/HistoryContext';
import { PartyProvider } from '../../contexts/PartyContext';
import useParty from '../../hooks/useParty';
import { LocaleProvider } from '../../i18n';
import Share from './Share';
import { NpcProvider } from '../../contexts/NpcContext';
import useNpcs from '../../hooks/useNpcs';
import { generateNpc } from '../../content/npc';

const BASE = 'https://example.org/app/';
const current = generateRandomCharacter({ race: 'Orc' });

const HomeProbe = () => (
  <p>current: {useContext(CharacterContext)!.character.firstName}</p>
);
const PartyProbe = () => <p>party size: {useParty().party?.members.length}</p>;
const NpcProbe = () => <p>current npc: {useNpcs().npc.firstName}</p>;

const renderLink = (url: string, locale: 'en' | 'fr' = 'en') =>
  render(
    <MemoryRouter initialEntries={[`/share${new URL(url).hash}`]}>
      <LocaleProvider initial={locale}>
        <AlertManagerProvider>
          <CharacterProvider initCharacter={current}>
            <HistoryProvider>
              <DataProvider>
                <PartyProvider>
                  <NpcProvider>
                    <Routes>
                      <Route path="/" element={<HomeProbe />} />
                      <Route path="/party" element={<PartyProbe />} />
                      <Route path="/npcs" element={<NpcProbe />} />
                      <Route path="/share" element={<Share />} />
                    </Routes>
                  </NpcProvider>
                </PartyProvider>
              </DataProvider>
            </HistoryProvider>
          </CharacterProvider>
        </AlertManagerProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );

const stored = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

describe('Share page', () => {
  afterEach(() => localStorage.clear());

  it('shows a shared character on a fresh device, without changing anything (FR-009)', () => {
    const character = generateRandomCharacter({ race: 'Elf' });
    renderLink(shareUrl({ kind: 'character', character }, BASE));
    expect(screen.getByText('Shared character')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${character.firstName} ${character.lastName}`,
      }),
    ).toBeInTheDocument();
    for (const paragraph of renderCharacter(character, 'en').background
      .content) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(stored('characters')).toEqual([]);
  });

  it('shows the story in the visitor language', () => {
    const character = generateRandomCharacter();
    renderLink(shareUrl({ kind: 'character', character }, BASE), 'fr');
    expect(
      // The DOM text is normalized (U+202F before French punctuation becomes a space); the expected text must be too.
      screen.getByText(
        renderCharacter(character, 'fr').background.content[0].replace(
          /\s+/g,
          ' ',
        ),
      ),
    ).toBeInTheDocument();
  });

  it('saves the character once', async () => {
    const character = generateRandomCharacter();
    renderLink(shareUrl({ kind: 'character', character }, BASE));
    await userEvent.click(
      screen.getByRole('button', { name: 'Save to my characters' }),
    );
    expect(
      screen.getByRole('button', { name: 'Already in my characters' }),
    ).toBeDisabled();
    expect(stored('characters')).toHaveLength(1);
  });

  it('opens the character in the generator', async () => {
    const character = generateRandomCharacter();
    renderLink(shareUrl({ kind: 'character', character }, BASE));
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in the generator' }),
    );
    expect(
      screen.getByText(`current: ${character.firstName}`),
    ).toBeInTheDocument();
  });

  it('shows a shared party, saves it and opens it on the Party page', async () => {
    const party = generateParty({ size: 5 });
    renderLink(shareUrl({ kind: 'party', party }, BASE));
    expect(screen.getByText('Shared party')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: renderParty(party, 'en').name }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    for (const name of ['Ties', 'Balance', 'Where it begins']) {
      expect(screen.getByRole('region', { name })).toBeInTheDocument();
    }
    // Read-only: no tie, role or hook editing on a shared party.
    expect(
      screen.queryByRole('button', { name: 'Draw another starting point' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: /^Role of / })).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Save the party' }),
    );
    expect(screen.getByRole('button', { name: 'Party saved' })).toBeDisabled();
    expect(stored('parties').parties).toHaveLength(1);
    await userEvent.click(
      screen.getByRole('button', { name: 'Open on the Party page' }),
    );
    expect(screen.getByText('party size: 5')).toBeInTheDocument();
  });

  it.each([
    'https://example.org/app/share#c1.broken',
    'https://example.org/app/share#p1.eyJ0YW1wZXJlZCI6dHJ1ZX0',
    'https://example.org/app/share',
  ])('explains that %s cannot be read', (url) => {
    renderLink(url);
    expect(screen.getByText('This link cannot be read')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Go to the generator' }),
    ).toHaveAttribute('href', '/');
  });

  describe('side characters (spec 010)', () => {
    it('shows a shared side character in the visitor language and saves it once', async () => {
      const npc = generateNpc({ occupation: 'Miller', gender: 'Female' });
      renderLink(shareUrl({ kind: 'npc', npc }, BASE), 'fr');
      expect(
        screen.getByText('Personnage secondaire partagé'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: `${npc.firstName} ${npc.lastName}`,
        }),
      ).toBeInTheDocument();
      expect(screen.getByText('Meunière')).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('button', { name: 'Sauvegarder' }),
      );
      expect(screen.getByRole('button', { name: 'Sauvegardé' })).toBeDisabled();
      expect(stored('npcs').npcs).toHaveLength(1);
    });

    it('opens a shared side character on the side-character page', async () => {
      const npc = generateNpc();
      renderLink(shareUrl({ kind: 'npc', npc }, BASE));
      await userEvent.click(
        screen.getByRole('button', { name: 'Open in Side characters' }),
      );
      expect(
        screen.getByText(`current npc: ${npc.firstName}`),
      ).toBeInTheDocument();
    });
  });
});
