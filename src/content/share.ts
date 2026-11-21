import { z } from 'zod';
import {
  type Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  type ContentRefs,
  Genders,
} from '../types/character';
import type { Party, PartyContentRefs, PartyMember } from '../types/party';
import { NPC_SECTIONS, type Npc, Occupations } from '../types/npc';
import { npcFragmentIds } from './npc';
import { parseNpc } from './storedNpc';
import {
  EPITHET_IDS,
  HOOK_IDS,
  PARTY_FRAGMENTS,
  type PartyFragmentCategory,
  ROLES,
  TIE_TYPES,
} from './data';
import { completeParty } from './partyDepth';
import { fragmentIds } from './generate';
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from './party';
import { storedCharacterSchema } from './storedCharacter';

/*
 * Share links (spec 007): `<app>/share#c1.<data>`, `#p2.<data>` or (spec 010) `#n1.<data>`. The data is
 * a positional array (data-model.md) as base64url JSON, kept in the URL
 * fragment so it never reaches the server. Enum values are indexes in the
 * `as const` objects of src/types/character.ts, which must stay append-only.
 */

const RACES = Object.values(CharacterRaces);
const CLASSES = Object.values(CharacterClasses);
const GENDERS = Object.values(Genders);
const ALIGNMENTS = Object.values(CharacterAlignments);
const OCCUPATIONS = Object.values(Occupations);

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

// --- base64url ------------------------------------------------------------

const toBase64Url = (value: unknown) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const fromBase64Url = (data: string): unknown => {
  try {
    const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return undefined;
  }
};

// --- short fragment references (research R3) -------------------------------

/** The shortest ending of `id` (in `-` segments) that no other candidate shares. */
const shorten = (id: string, candidates: readonly string[]) => {
  const segments = id.split('-');
  for (let k = 1; k <= segments.length; k++) {
    const slug = segments.slice(-k).join('-');
    const matches = candidates.filter(
      (c) => c === slug || c.endsWith(`-${slug}`),
    );
    if (matches.length === 1) return slug;
  }
  return id;
};

/** The fragment a short reference points to, or one of the same kind if it is gone (FR-008). */
const resolve = (slug: string, candidates: readonly string[]) =>
  candidates.find((c) => c === slug || c.endsWith(`-${slug}`)) ??
  pick(candidates);

type RefKey = keyof ContentRefs;

const REF_KEYS: RefKey[] = [
  'titleId',
  'originId',
  'trainingId',
  'turningPointId',
  'goalId',
  'epithetId',
];

const candidatesFor = (key: RefKey, character: Character): string[] => {
  switch (key) {
    case 'titleId':
      return fragmentIds('title', character);
    case 'originId':
      return fragmentIds('origin', character);
    case 'trainingId':
      return fragmentIds('training', character);
    case 'turningPointId':
      return fragmentIds('turningPoint', character);
    case 'goalId':
      return fragmentIds('goal', character);
    case 'epithetId':
      return [...EPITHET_IDS];
  }
};

// --- character payload ------------------------------------------------------

const name = z.string().max(40);
const slug = z.string().min(1).max(60);
const index = (items: readonly unknown[]) =>
  z
    .number()
    .int()
    .min(0)
    .max(items.length - 1);

const textSchema = z.tuple([
  z.enum(['en', 'fr']),
  z.enum(['ai', 'legacy']),
  z.string().max(400).nullable(),
  z.string().max(400).nullable(),
  z.array(z.string().max(4000)).max(20).nullable(),
]);

const characterPayload = z.union([
  z.tuple([
    name.min(1),
    name,
    index(RACES),
    index(CLASSES),
    index(GENDERS),
    index(ALIGNMENTS),
    z.number().int().min(0).max(100000),
    z.union([z.array(slug).length(6), z.literal(0)]),
  ]),
  z.tuple([
    name.min(1),
    name,
    index(RACES),
    index(CLASSES),
    index(GENDERS),
    index(ALIGNMENTS),
    z.number().int().min(0).max(100000),
    z.union([z.array(slug).length(6), z.literal(0)]),
    textSchema,
  ]),
]);

type CharacterPayload = z.infer<typeof characterPayload>;

const toPayload = (character: Character): CharacterPayload => {
  const { content } = character;
  const refs = content
    ? REF_KEYS.map((key) =>
        shorten(content[key], candidatesFor(key, character)),
      )
    : (0 as const);
  const base = [
    character.firstName,
    character.lastName,
    RACES.indexOf(character.race),
    CLASSES.indexOf(character.characterClass),
    GENDERS.indexOf(character.gender),
    ALIGNMENTS.indexOf(character.alignment),
    character.age,
    refs,
  ] as const;
  const written =
    character.epithet !== undefined || character.background !== undefined;
  if (!written) return [...base];
  return [
    ...base,
    [
      character.textLanguage ?? 'en',
      character.textSource ?? 'legacy',
      character.epithet ?? null,
      character.background?.title ?? null,
      character.background?.content ?? null,
    ],
  ];
};

const fromPayload = (payload: unknown): Character | undefined => {
  const parsed = characterPayload.safeParse(payload);
  if (!parsed.success) return undefined;
  const [firstName, lastName, r, c, g, a, age, refs, text] = parsed.data;
  const character: Character = {
    firstName,
    lastName,
    race: RACES[r],
    characterClass: CLASSES[c],
    gender: GENDERS[g],
    alignment: ALIGNMENTS[a],
    age,
  };
  if (refs !== 0) {
    character.content = Object.fromEntries(
      REF_KEYS.map((key, i) => [
        key,
        resolve(refs[i], candidatesFor(key, character)),
      ]),
    ) as ContentRefs;
  }
  if (text) {
    const [language, source, epithet, title, paragraphs] = text;
    if (epithet !== null) character.epithet = epithet;
    if (title !== null || paragraphs !== null) {
      character.background = { title: title ?? '', content: paragraphs ?? [] };
    }
    character.textLanguage = language;
    character.textSource = source;
  }
  // The same rules as for characters stored on the device (constitution IV).
  const checked = storedCharacterSchema.safeParse(character);
  return checked.success ? checked.data : undefined;
};

export const encodeCharacter = (character: Character) =>
  toBase64Url(toPayload(character));

export const decodeCharacter = (data: string): Character | undefined =>
  fromPayload(fromBase64Url(data));

/** Same character, whatever its id (spec 007 R6). */
export const sameCharacter = (a: Character, b: Character) => {
  const strip = (character: Character) => {
    const copy = { ...character };
    delete copy.id;
    delete copy.portraitId;
    return JSON.stringify(copy);
  };
  return strip(a) === strip(b);
};

// --- party payload ----------------------------------------------------------

const partyCandidates = (category: PartyFragmentCategory) =>
  PARTY_FRAGMENTS.filter((f) => f.category === category).map((f) => f.id);

const PARTY_REFS: [keyof PartyContentRefs, PartyFragmentCategory][] = [
  ['nameId', 'name'],
  ['meetingId', 'meeting'],
  ['goalId', 'goal'],
];

const optionalIndex = (items: readonly unknown[]) =>
  z
    .number()
    .int()
    .min(-1)
    .max(items.length - 1);

const partyHead = [
  slug,
  slug,
  slug,
  z.union([z.literal(0), z.literal(1)]),
  z.tuple([
    optionalIndex(RACES),
    optionalIndex(CLASSES),
    optionalIndex(GENDERS),
    optionalIndex(ALIGNMENTS),
  ]),
  z.array(z.unknown()).min(MIN_PARTY_SIZE).max(MAX_PARTY_SIZE),
] as const;

const partyTextV1 = z.tuple([
  z.enum(['en', 'fr']),
  z.string().trim().min(1).max(200),
  z.array(z.string().trim().min(1).max(4000)).min(1).max(10),
]);

/** p1 (spec 007): no ties, roles or hook. */
const partyPayloadV1 = z.tuple([...partyHead, partyTextV1.optional()]);

/** p2 (spec 008): AI text may carry the hook; then ties, roles and hook. */
const partyPayloadV2 = z.tuple([
  ...partyHead,
  z
    .union([
      partyTextV1,
      z.tuple([...partyTextV1.def.items, z.string().trim().min(1).max(4000)]),
    ])
    .nullable(),
  z.tuple([
    z
      .array(
        z.tuple([
          slug,
          z
            .number()
            .int()
            .min(0)
            .max(MAX_PARTY_SIZE - 1),
          z
            .number()
            .int()
            .min(0)
            .max(MAX_PARTY_SIZE - 1),
        ]),
      )
      .max(12),
    z.array(slug.nullable()).max(MAX_PARTY_SIZE),
    z.tuple([slug, slug, slug]).nullable(),
  ]),
]);

const ROLE_IDS = ROLES.map((r) => r.id);
const TIE_IDS = TIE_TYPES.map((t) => t.id);
const HOOK_KINDS = ['place', 'patron', 'threat'] as const;

export const encodeParty = (party: Party) => {
  const { race, characterClass, gender, alignment } = party.constraints;
  const index = (id: string) => party.members.findIndex((m) => m.id === id);
  const payload = [
    ...PARTY_REFS.map(([key, category]) =>
      shorten(party.content[key], partyCandidates(category)),
    ),
    party.alignmentMode === 'anything' ? 1 : 0,
    [
      race ? RACES.indexOf(race) : -1,
      characterClass ? CLASSES.indexOf(characterClass) : -1,
      gender ? GENDERS.indexOf(gender) : -1,
      alignment ? ALIGNMENTS.indexOf(alignment) : -1,
    ],
    party.members.map((m) => toPayload(m.character)),
    party.text
      ? [
          party.text.language,
          party.text.name,
          party.text.story,
          ...(party.text.hook ? [party.text.hook] : []),
        ]
      : null,
    [
      (party.ties ?? []).map((t) => [
        shorten(t.type, TIE_IDS),
        index(t.from),
        index(t.to),
      ]),
      party.members.map((m) => (m.role ? shorten(m.role, ROLE_IDS) : null)),
      party.hook
        ? [
            shorten(party.hook.placeId, HOOK_IDS.place),
            shorten(party.hook.patronId, HOOK_IDS.patron),
            shorten(party.hook.threatId, HOOK_IDS.threat),
          ]
        : null,
    ],
  ];
  return toBase64Url(payload);
};

/** Shared parts of p1 and p2: members, content, constraints, mode. */
const decodeHead = (
  head: [
    string,
    string,
    string,
    0 | 1,
    [number, number, number, number],
    unknown[],
  ],
): Party | undefined => {
  const [nameSlug, meetingSlug, goalSlug, mode, [r, c, g, a], rawMembers] =
    head;
  const members: PartyMember[] = [];
  for (const raw of rawMembers) {
    const character = fromPayload(raw);
    if (!character) return undefined;
    // Locks are not shared: members arrive free, with new ids.
    members.push({ id: crypto.randomUUID(), character, locked: false });
  }
  const slugs = [nameSlug, meetingSlug, goalSlug];
  const content = Object.fromEntries(
    PARTY_REFS.map(([key, category], i) => [
      key,
      resolve(slugs[i], partyCandidates(category)),
    ]),
  ) as PartyContentRefs;
  const constraints: Party['constraints'] = {};
  if (r >= 0) constraints.race = RACES[r];
  if (c >= 0) constraints.characterClass = CLASSES[c];
  if (g >= 0) constraints.gender = GENDERS[g];
  if (a >= 0) constraints.alignment = ALIGNMENTS[a];
  return {
    id: crypto.randomUUID(),
    members,
    constraints,
    alignmentMode: mode === 1 ? 'anything' : 'harmonious',
    content,
  };
};

/** Reads a party link of the given format version (p1 links get roles and a hook). */
export const decodeParty = (
  data: string,
  version: 1 | 2 = 2,
): Party | undefined => {
  const json = fromBase64Url(data);
  if (version === 1) {
    const parsed = partyPayloadV1.safeParse(json);
    if (!parsed.success) return undefined;
    const party = decodeHead(parsed.data.slice(0, 6) as never);
    const text = parsed.data[6];
    return (
      party &&
      completeParty({
        ...party,
        ...(text && {
          text: {
            language: text[0],
            name: text[1],
            story: text[2],
            source: 'ai',
          },
        }),
      })
    );
  }
  const parsed = partyPayloadV2.safeParse(json);
  if (!parsed.success) return undefined;
  const party = decodeHead(parsed.data.slice(0, 6) as never);
  if (!party) return undefined;
  const text = parsed.data[6];
  const [ties, roles, hook] = parsed.data[7];
  const ids = party.members.map((m) => m.id);
  return completeParty({
    ...party,
    members: party.members.map((m, i) =>
      roles[i] ? { ...m, role: resolve(roles[i], ROLE_IDS) } : m,
    ),
    ties: ties
      .filter(([, from, to]) => from !== to && ids[from] && ids[to])
      .map(([type, from, to]) => ({
        id: crypto.randomUUID(),
        type: resolve(type, TIE_IDS),
        from: ids[from],
        to: ids[to],
      })),
    ...(hook && {
      hook: {
        placeId: resolve(hook[0], HOOK_IDS[HOOK_KINDS[0]]),
        patronId: resolve(hook[1], HOOK_IDS[HOOK_KINDS[1]]),
        threatId: resolve(hook[2], HOOK_IDS[HOOK_KINDS[2]]),
      },
    }),
    ...(text && {
      text: {
        language: text[0],
        name: text[1],
        story: text[2],
        ...(text[3] && { hook: text[3] }),
        source: 'ai',
      },
    }),
  });
};

// --- links --------------------------------------------------------------------

// --- side characters (spec 010, research R7) ---------------------------------

const npcText = z.string().max(600);

const npcPayload = z.union([
  z.tuple([
    name.min(1),
    name,
    index(RACES),
    index(GENDERS),
    z.number().int().min(0).max(100000),
    index(OCCUPATIONS),
    z.array(slug).length(NPC_SECTIONS.length),
  ]),
  z.tuple([
    name.min(1),
    name,
    index(RACES),
    index(GENDERS),
    z.number().int().min(0).max(100000),
    index(OCCUPATIONS),
    z.array(slug).length(NPC_SECTIONS.length),
    // [language, look, daily, quirk, rumour, secret, opinion]
    z.tuple([
      z.enum(['en', 'fr']),
      npcText,
      npcText,
      npcText,
      npcText,
      npcText,
      npcText,
    ]),
  ]),
]);

export const encodeNpc = (npc: Npc) => {
  const refs = NPC_SECTIONS.map((section) =>
    shorten(npc.content[section], npcFragmentIds(section, npc.occupation)),
  );
  const base = [
    npc.firstName,
    npc.lastName,
    RACES.indexOf(npc.race),
    GENDERS.indexOf(npc.gender),
    npc.age,
    OCCUPATIONS.indexOf(npc.occupation),
    refs,
  ];
  return toBase64Url(
    npc.text
      ? [
          ...base,
          [
            npc.text.language,
            ...NPC_SECTIONS.map((section) => npc.text![section]),
          ],
        ]
      : base,
  );
};

export const decodeNpc = (data: string): Npc | undefined => {
  const parsed = npcPayload.safeParse(fromBase64Url(data));
  if (!parsed.success) return undefined;
  const [firstName, lastName, r, g, age, o, refs, text] = parsed.data;
  const occupation = OCCUPATIONS[o];
  const npc = {
    firstName,
    lastName,
    race: RACES[r],
    gender: GENDERS[g],
    age,
    occupation,
    content: Object.fromEntries(
      NPC_SECTIONS.map((section, i) => [
        section,
        resolve(refs[i], npcFragmentIds(section, occupation)),
      ]),
    ),
    ...(text && {
      text: {
        language: text[0],
        source: 'ai',
        ...Object.fromEntries(
          NPC_SECTIONS.map((section, i) => [section, text[i + 1]]),
        ),
      },
    }),
  };
  // The same rules as for side characters stored on the device (constitution IV).
  return parseNpc(npc);
};

const PREFIX = {
  character: 'c1.',
  party: 'p2.',
  partyV1: 'p1.',
  npc: 'n1.',
} as const;

export const shareUrl = (
  shared:
    | { kind: 'character'; character: Character }
    | { kind: 'party'; party: Party }
    | { kind: 'npc'; npc: Npc },
  base = `${location.origin}${import.meta.env.BASE_URL}`,
) =>
  `${base}share#${
    shared.kind === 'character'
      ? PREFIX.character + encodeCharacter(shared.character)
      : shared.kind === 'party'
        ? PREFIX.party + encodeParty(shared.party)
        : PREFIX.npc + encodeNpc(shared.npc)
  }`;

export type SharedContent =
  | { kind: 'character'; character: Character }
  | { kind: 'party'; party: Party }
  | { kind: 'npc'; npc: Npc };

/** Reads the `#…` part of a share link; `undefined` when it cannot be read (FR-007). */
export const parseShareHash = (hash: string): SharedContent | undefined => {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  if (value.startsWith(PREFIX.character)) {
    const character = decodeCharacter(value.slice(PREFIX.character.length));
    return character && { kind: 'character', character };
  }
  if (value.startsWith(PREFIX.npc)) {
    const npc = decodeNpc(value.slice(PREFIX.npc.length));
    return npc && { kind: 'npc', npc };
  }
  if (value.startsWith(PREFIX.party)) {
    const party = decodeParty(value.slice(PREFIX.party.length), 2);
    return party && { kind: 'party', party };
  }
  // Links shared before spec 008 keep opening.
  if (value.startsWith(PREFIX.partyV1)) {
    const party = decodeParty(value.slice(PREFIX.partyV1.length), 1);
    return party && { kind: 'party', party };
  }
  return undefined;
};
