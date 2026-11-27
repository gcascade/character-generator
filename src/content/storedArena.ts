import { z } from 'zod';
import type { ArenaSetup } from '../types/arena';
import {
  MAX_CONTESTANTS,
  MAX_ITEMS,
  emptySetup,
  normalizePerks,
} from './arena';
import { ARENA } from './data';
import { storedCharacterSchema } from './storedCharacter';

export const ARENA_KEY = 'arena';

const id = z.string().min(1).max(100);
const knownIds = (list: readonly { id: string }[], max: number) =>
  z
    .array(z.string().max(60))
    .max(20)
    .transform((ids) =>
      ids.filter((i) => list.some((d) => d.id === i)).slice(0, max),
    );

const contestantSchema = z.object({
  id,
  character: storedCharacterSchema,
  sideId: id,
  role: z.string().max(60).optional(),
  perks: knownIds(ARENA.perks, 20).transform(normalizePerks),
  items: knownIds(ARENA.items, MAX_ITEMS),
  sourceId: z.string().max(220).optional(),
});

const sideSchema = z.object({
  id,
  kind: z.enum(['team', 'solo']),
  name: z.string().max(200).optional(),
  ties: z
    .array(z.object({ id, type: z.string().max(60), from: id, to: id }))
    .max(40),
});

/** Arena setups read from the browser or from a link (constitution IV). */
export const arenaSetupSchema = z
  .object({
    contestants: z.array(contestantSchema).max(MAX_CONTESTANTS),
    sides: z.array(sideSchema).max(MAX_CONTESTANTS),
    seed: z.string().min(1).max(40),
    shownRounds: z.number().int().min(0).max(100).catch(0),
  })
  .transform((setup): ArenaSetup => {
    const ids = new Set(setup.contestants.map((c) => c.id));
    const contestants = setup.contestants.filter((c) =>
      setup.sides.some((s) => s.id === c.sideId),
    );
    const sides = setup.sides
      .filter((s) => contestants.some((c) => c.sideId === s.id))
      .map((s) => ({
        ...s,
        ties: s.ties.filter((t) => ids.has(t.from) && ids.has(t.to)),
      }));
    return { ...setup, contestants, sides };
  });

/** The stored setup, or an empty one when missing or unreadable. */
export const parseStoredArena = (raw: string | null): ArenaSetup => {
  if (!raw) return emptySetup();
  try {
    const parsed = arenaSetupSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptySetup();
  } catch {
    return emptySetup();
  }
};

export const saveArena = (setup: ArenaSetup) => {
  try {
    localStorage.setItem(ARENA_KEY, JSON.stringify({ version: 1, ...setup }));
  } catch {
    // Storage full or blocked: the roster simply won't survive a reload.
  }
};
