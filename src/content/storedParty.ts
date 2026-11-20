import { z } from 'zod';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import type { AlignmentMode, Party, PartyConstraints } from '../types/party';
import { HOOK_IDS, PARTY_FRAGMENTS, ROLES, TIE_TYPES } from './data';
import { DEFAULT_PARTY_SIZE, MAX_PARTY_SIZE, MIN_PARTY_SIZE } from './party';
import { storedCharacterSchema } from './storedCharacter';

export const PARTY_KEY = 'party';
export const PARTIES_KEY = 'parties';

const fragmentId = (category: string) =>
  z
    .string()
    .refine((id) =>
      PARTY_FRAGMENTS.some((f) => f.id === id && f.category === category),
    );

const constraintsSchema = z
  .object({
    race: z.enum(Object.values(CharacterRaces)).optional(),
    characterClass: z.enum(Object.values(CharacterClasses)).optional(),
    gender: z.enum(Object.values(Genders)).optional(),
    alignment: z.enum(Object.values(CharacterAlignments)).optional(),
  })
  .catch({});

const modeSchema = z.enum(['harmonious', 'anything']).catch('harmonious');

const partySchema = z
  .object({
    id: z.string().min(1).max(100),
    members: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          character: storedCharacterSchema,
          locked: z.boolean(),
          role: z.string().max(60).optional(),
        }),
      )
      .min(MIN_PARTY_SIZE)
      .max(MAX_PARTY_SIZE),
    constraints: constraintsSchema,
    alignmentMode: modeSchema,
    content: z.object({
      nameId: fragmentId('name'),
      meetingId: fragmentId('meeting'),
      goalId: fragmentId('goal'),
    }),
    text: z
      .object({
        name: z.string().trim().min(1).max(200),
        story: z.array(z.string().trim().min(1).max(4000)).min(1).max(10),
        hook: z.string().trim().min(1).max(4000).optional(),
        language: z.enum(['en', 'fr']),
        source: z.literal('ai'),
      })
      .optional(),
    ties: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          type: z.string().max(60),
          from: z.string().max(100),
          to: z.string().max(100),
        }),
      )
      .max(20)
      .optional(),
    hook: z
      .object({
        placeId: z.string().max(60),
        patronId: z.string().max(60),
        threatId: z.string().max(60),
      })
      .optional(),
  })
  // Unknown roles, ties and hook fragments are dropped, not the whole party (spec 008).
  .transform((party): Party => {
    const memberIds = new Set(party.members.map((m) => m.id));
    const members = party.members.map((m) => {
      if (m.role && ROLES.some((r) => r.id === m.role)) return m;
      const copy = { ...m };
      delete copy.role;
      return copy;
    });
    const ties = party.ties?.filter(
      (t) =>
        TIE_TYPES.some((type) => type.id === t.type) &&
        memberIds.has(t.from) &&
        memberIds.has(t.to) &&
        t.from !== t.to,
    );
    const hook =
      party.hook &&
      HOOK_IDS.place.includes(party.hook.placeId) &&
      HOOK_IDS.patron.includes(party.hook.patronId) &&
      HOOK_IDS.threat.includes(party.hook.threatId)
        ? party.hook
        : undefined;
    const result = { ...party, members } as Party;
    if (ties) result.ties = ties;
    else delete result.ties;
    if (hook) result.hook = hook;
    else delete result.hook;
    return result;
  });

export type PartySettings = {
  size: number;
  constraints: PartyConstraints;
  alignmentMode: AlignmentMode;
};

export const DEFAULT_SETTINGS: PartySettings = {
  size: DEFAULT_PARTY_SIZE,
  constraints: {},
  alignmentMode: 'harmonious',
};

const settingsSchema = z
  .object({
    size: z
      .number()
      .int()
      .min(MIN_PARTY_SIZE)
      .max(MAX_PARTY_SIZE)
      .catch(DEFAULT_PARTY_SIZE),
    constraints: constraintsSchema,
    alignmentMode: modeSchema,
  })
  .catch(DEFAULT_SETTINGS);

const json = (raw: string | null): unknown => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

/** The current party and the page settings; invalid parts are dropped, never throws. */
export const parseStoredParty = (
  raw: string | null,
): { party?: Party; settings: PartySettings } => {
  const data = json(raw);
  if (
    !data ||
    typeof data !== 'object' ||
    (data as { version?: unknown }).version !== 1
  ) {
    return { settings: DEFAULT_SETTINGS };
  }
  const record = data as Record<string, unknown>;
  const party = partySchema.safeParse(record.party);
  return {
    party: party.success ? party.data : undefined,
    settings: settingsSchema.parse(record.settings ?? DEFAULT_SETTINGS),
  };
};

/** Saved parties; invalid entries are dropped individually. */
export const parseStoredParties = (raw: string | null): Party[] => {
  const data = json(raw);
  const list = (data as { version?: unknown; parties?: unknown } | undefined)
    ?.parties;
  if (!Array.isArray(list)) return [];
  return list.flatMap((entry) => {
    const parsed = partySchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
};

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ version: 1, ...(value as object) }),
    );
  } catch {
    // Storage full or blocked: the party simply won't survive a reload.
  }
};

export const saveCurrentParty = (
  party: Party | undefined,
  settings: PartySettings,
) => save(PARTY_KEY, { party, settings });

export const saveParties = (parties: Party[]) => save(PARTIES_KEY, { parties });
