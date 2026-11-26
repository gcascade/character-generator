import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addCharacter,
  addParty,
  addRandom,
  emptySetup,
  type FillShape,
  fillRoster,
  randomLoadouts,
  removeContestant,
  setItems,
  setPerks,
} from '../content/arena';
import { newSeed } from '../content/random';
import { ARENA_KEY, parseStoredArena, saveArena } from '../content/storedArena';
import type { Locale } from '../i18n';
import type { ArenaSetup } from '../types/arena';
import type { Character } from '../types/character';
import type { Party } from '../types/party';

export type ArenaContextType = {
  setup: ArenaSetup;
  addCharacter: (character: Character, sourceId?: string) => void;
  addParty: (party: Party, locale: Locale) => void;
  addRandom: (count: number) => void;
  fill: (target: number, shape: FillShape, locale: Locale) => void;
  remove: (id: string) => void;
  clear: VoidFunction;
  setPerks: (id: string, perks: string[]) => void;
  setItems: (id: string, items: string[]) => void;
  randomLoadouts: VoidFunction;
  /** Shows rounds of the match (0 = back to the roster). */
  showRounds: (count: number) => void;
  /** Same roster and choices, a new draw: new skills and a new story. */
  newDraw: VoidFunction;
  /** Replaces the whole setup (a shared match). */
  replace: (setup: ArenaSetup) => void;
};

export const ArenaContext = createContext<ArenaContextType | undefined>(
  undefined,
);

export const ArenaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [setup, setSetup] = useState(() =>
    parseStoredArena(localStorage.getItem(ARENA_KEY)),
  );

  useEffect(() => saveArena(setup), [setup]);

  const value = useMemo<ArenaContextType>(
    () => ({
      setup,
      addCharacter: (character, sourceId) =>
        setSetup((s) => addCharacter(s, character, sourceId)),
      addParty: (party, locale) => setSetup((s) => addParty(s, party, locale)),
      addRandom: (count) => setSetup((s) => addRandom(s, count)),
      fill: (target, shape, locale) =>
        setSetup((s) => fillRoster(s, target, shape, locale)),
      remove: (id) => setSetup((s) => removeContestant(s, id)),
      clear: () => setSetup(emptySetup()),
      setPerks: (id, perks) => setSetup((s) => setPerks(s, id, perks)),
      setItems: (id, items) => setSetup((s) => setItems(s, id, items)),
      randomLoadouts: () => setSetup((s) => randomLoadouts(s)),
      showRounds: (count) =>
        setSetup((s) => ({ ...s, shownRounds: Math.max(0, count) })),
      newDraw: () =>
        setSetup((s) => ({ ...s, seed: newSeed(), shownRounds: 1 })),
      replace: (next) => setSetup(next),
    }),
    [setup],
  );

  return (
    <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>
  );
};
