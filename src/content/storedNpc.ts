import { z } from 'zod';
import { CharacterRaces, Genders } from '../types/character';
import {
  LOCKABLE_NPC_PROPERTIES,
  type LockableNpcProperty,
  NPC_SECTIONS,
  type Npc,
  type NpcContentRefs,
  Occupations,
} from '../types/npc';
import { npcFragmentIds } from './npc';

export const NPC_KEY = 'npc';
export const NPCS_KEY = 'npcs';
export const BATCH_SIZE = 5;

const text = z.string().trim().min(1).max(600);

const npcSchema = z
  .object({
    id: z.string().min(1).max(100).optional(),
    portraitId: z.string().min(1).max(100).optional(),
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    race: z.enum(Object.values(CharacterRaces)),
    gender: z.enum(Object.values(Genders)),
    age: z.number().int().min(1).max(1000),
    occupation: z.enum(Object.values(Occupations)),
    content: z.object(
      Object.fromEntries(
        NPC_SECTIONS.map((section) => [section, z.string().max(100)]),
      ) as Record<keyof NpcContentRefs, z.ZodString>,
    ),
    text: z
      .object({
        language: z.enum(['en', 'fr']),
        source: z.literal('ai'),
        ...(Object.fromEntries(
          NPC_SECTIONS.map((section) => [section, text]),
        ) as Record<keyof NpcContentRefs, typeof text>),
      })
      .optional(),
  })
  // A fragment that no longer exists is replaced by one of the same section (as for links).
  .transform((npc): Npc => {
    const content = { ...npc.content };
    for (const section of NPC_SECTIONS) {
      const ids = npcFragmentIds(section, npc.occupation);
      if (!ids.includes(content[section])) {
        content[section] = ids[Math.floor(Math.random() * ids.length)];
      }
    }
    const result: Npc = { ...npc, content };
    if (!npc.text) delete result.text;
    if (!npc.id) delete result.id;
    if (!npc.portraitId) delete result.portraitId;
    return result;
  });

/** Parses one NPC from outside (storage, link); `undefined` when invalid. */
export const parseNpc = (value: unknown): Npc | undefined => {
  const parsed = npcSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export type NpcConstraints = Partial<
  Pick<Npc, 'occupation' | 'race' | 'gender'>
>;

export type NpcState = {
  current?: Npc;
  batch: Npc[];
  locked: LockableNpcProperty[];
  constraints: NpcConstraints;
};

export const EMPTY_NPC_STATE: NpcState = {
  batch: [],
  locked: [],
  constraints: {},
};

const constraintsSchema = z
  .object({
    occupation: z.enum(Object.values(Occupations)).optional().catch(undefined),
    race: z.enum(Object.values(CharacterRaces)).optional().catch(undefined),
    gender: z.enum(Object.values(Genders)).optional().catch(undefined),
  })
  .catch({});

const json = (raw: string | null): unknown => {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const versioned = (raw: string | null) => {
  const data = json(raw);
  return data &&
    typeof data === 'object' &&
    (data as { version?: unknown }).version === 1
    ? (data as Record<string, unknown>)
    : undefined;
};

const list = (value: unknown): Npc[] =>
  Array.isArray(value) ? value.flatMap((v) => parseNpc(v) ?? []) : [];

/** The side-character page state; invalid parts are dropped, never throws (research R6). */
export const parseStoredNpcState = (raw: string | null): NpcState => {
  const data = versioned(raw);
  if (!data) return EMPTY_NPC_STATE;
  const locked = Array.isArray(data.locked)
    ? LOCKABLE_NPC_PROPERTIES.filter((p) =>
        (data.locked as unknown[]).includes(p),
      )
    : [];
  const constraints = Object.fromEntries(
    Object.entries(constraintsSchema.parse(data.constraints ?? {})).filter(
      ([, value]) => value !== undefined,
    ),
  ) as NpcConstraints;
  const current = parseNpc(data.current);
  return {
    ...(current && { current }),
    batch: list(data.batch).slice(0, BATCH_SIZE),
    locked,
    constraints,
  };
};

/** Saved side characters; invalid entries are dropped individually. */
export const parseStoredNpcs = (raw: string | null): Npc[] =>
  list(versioned(raw)?.npcs);

const save = (key: string, value: object) => {
  try {
    localStorage.setItem(key, JSON.stringify({ version: 1, ...value }));
  } catch {
    // Storage full or blocked: the NPCs simply won't survive a reload.
  }
};

export const saveNpcState = (state: NpcState) => save(NPC_KEY, state);
export const saveNpcs = (npcs: Npc[]) => save(NPCS_KEY, { npcs });
