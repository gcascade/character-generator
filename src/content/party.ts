import type { Locale } from '../i18n';
import {
  type Character,
  type CharacterAlignment,
  CharacterAlignments,
  type CharacterClass,
  CharacterClasses,
} from '../types/character';
import type {
  AlignmentMode,
  Party,
  PartyConstraints,
  PartyContentRefs,
  PartyMember,
} from '../types/party';
import {
  PARTY_FRAGMENTS,
  PARTY_TEXTS,
  type PartyFragmentCategory,
} from './data';
import { generateRandomCharacter } from './generate';
import { firstNamesFor } from './template';

export const MIN_PARTY_SIZE = 2;
export const MAX_PARTY_SIZE = 6;
export const DEFAULT_PARTY_SIZE = 4;

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const CLASSES = Object.values(CharacterClasses);
const ALIGNMENTS = Object.values(CharacterAlignments);
const isGood = (a: CharacterAlignment) => a.endsWith('Good');
const isEvil = (a: CharacterAlignment) => a.endsWith('Evil');
const GOOD_SIDE = ALIGNMENTS.filter((a) => !isEvil(a));
const EVIL_SIDE = ALIGNMENTS.filter((a) => !isGood(a));

/**
 * Alignments a new member may have (research R2). Harmonious parties lean Good
 * or Evil, never both: the members already there decide, otherwise Good is
 * twice as likely (heroic tone).
 */
export const allowedAlignments = (
  mode: AlignmentMode,
  constraints: PartyConstraints,
  others: readonly Character[],
): CharacterAlignment[] => {
  if (constraints.alignment) return [constraints.alignment];
  if (mode === 'anything') return ALIGNMENTS;
  if (others.some((c) => isGood(c.alignment))) return GOOD_SIDE;
  if (others.some((c) => isEvil(c.alignment))) return EVIL_SIDE;
  return Math.random() < 2 / 3 ? GOOD_SIDE : EVIL_SIDE;
};

/** The class for the next member: one of the least represented (research R1). */
const nextClass = (
  constraints: PartyConstraints,
  others: readonly Character[],
  avoid?: CharacterClass,
): CharacterClass => {
  if (constraints.characterClass) return constraints.characterClass;
  const count = (c: CharacterClass) =>
    others.filter((o) => o.characterClass === c).length;
  const fewest = Math.min(...CLASSES.map(count));
  const candidates = CLASSES.filter((c) => count(c) === fewest);
  const different = candidates.filter((c) => c !== avoid);
  return pick(different.length ? different : candidates);
};

/** A new member that fits the constraints and does not share a first name. */
const newMember = (
  constraints: PartyConstraints,
  characterClass: CharacterClass,
  alignments: readonly CharacterAlignment[],
  others: readonly Character[],
): PartyMember => {
  const taken = new Set(others.map((c) => c.firstName));
  let character = generateRandomCharacter({
    ...constraints,
    characterClass,
    alignment: pick(alignments),
  });
  for (let tries = 0; taken.has(character.firstName) && tries < 20; tries++) {
    character = generateRandomCharacter({
      ...constraints,
      characterClass,
      alignment: character.alignment,
    });
  }
  if (taken.has(character.firstName)) {
    const free = firstNamesFor(character.race, character.gender).filter(
      (name) => !taken.has(name),
    );
    if (free.length) character = { ...character, firstName: pick(free) };
  }
  return { id: crypto.randomUUID(), character, locked: false };
};

const pickContent = (): PartyContentRefs => {
  const ids = (category: PartyFragmentCategory) =>
    PARTY_FRAGMENTS.filter((f) => f.category === category).map((f) => f.id);
  return {
    nameId: pick(ids('name')),
    meetingId: pick(ids('meeting')),
    goalId: pick(ids('goal')),
  };
};

export type PartyOptions = {
  size: number;
  constraints?: PartyConstraints;
  alignmentMode?: AlignmentMode;
  /** Current members: the locked ones are kept at their place. */
  keep?: readonly PartyMember[];
};

/** A new party (spec 004 FR-002 to FR-009). */
export const generateParty = ({
  size,
  constraints = {},
  alignmentMode = 'harmonious',
  keep = [],
}: PartyOptions): Party => {
  const count = Math.min(MAX_PARTY_SIZE, Math.max(MIN_PARTY_SIZE, size));
  const slots: (PartyMember | undefined)[] = Array.from(
    { length: count },
    (_, i) => (keep[i]?.locked ? keep[i] : undefined),
  );
  const kept = slots.filter((m): m is PartyMember => !!m);
  const alignments = allowedAlignments(
    alignmentMode,
    constraints,
    kept.map((m) => m.character),
  );
  const members: PartyMember[] = [];
  for (const slot of slots) {
    const others = [...kept, ...members.filter((m) => !kept.includes(m))].map(
      (m) => m.character,
    );
    members.push(
      slot ??
        newMember(
          constraints,
          nextClass(constraints, others),
          alignments,
          others,
        ),
    );
  }
  return {
    id: crypto.randomUUID(),
    members,
    constraints,
    alignmentMode,
    content: pickContent(),
  };
};

/** Replaces one member, keeping the party's rules and the others (FR-008). */
export const rerollMember = (party: Party, memberId: string): Party => {
  const index = party.members.findIndex((m) => m.id === memberId);
  if (index < 0) return party;
  const current = party.members[index].character;
  const others = party.members
    .filter((m) => m.id !== memberId)
    .map((m) => m.character);
  const member = newMember(
    party.constraints,
    nextClass(party.constraints, others, current.characterClass),
    allowedAlignments(party.alignmentMode, party.constraints, others),
    [...others, current],
  );
  const members = [...party.members];
  members[index] = member;
  const rerolled = { ...party, members };
  delete rerolled.text;
  return rerolled;
};

/** Whether a member still matches the party's shared constraints. */
export const matchesConstraints = (
  character: Character,
  constraints: PartyConstraints,
) =>
  (Object.keys(constraints) as (keyof PartyConstraints)[]).every(
    (key) =>
      constraints[key] === undefined || character[key] === constraints[key],
  );

/** Rule violations of a party (empty when valid); used by tests. */
export const checkParty = (party: Party): string[] => {
  const problems: string[] = [];
  const characters = party.members.map((m) => m.character);
  if (
    characters.length < MIN_PARTY_SIZE ||
    characters.length > MAX_PARTY_SIZE
  ) {
    problems.push('size');
  }
  const names = characters.map((c) => c.firstName);
  if (new Set(names).size !== names.length) problems.push('names');
  if (!party.constraints.characterClass) {
    const counts = CLASSES.map(
      (cls) => characters.filter((c) => c.characterClass === cls).length,
    );
    if (Math.max(...counts) - Math.min(...counts) > 1) problems.push('classes');
  }
  if (
    party.alignmentMode === 'harmonious' &&
    characters.some((c) => isGood(c.alignment)) &&
    characters.some((c) => isEvil(c.alignment))
  ) {
    problems.push('alignments');
  }
  if (!characters.every((c) => matchesConstraints(c, party.constraints))) {
    problems.push('constraints');
  }
  return problems;
};

const NUMBERS: Record<Locale, string[]> = {
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six'],
  fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'],
};

const AND: Record<Locale, string> = { en: 'and', fr: 'et' };

const listNames = (names: string[], locale: Locale) =>
  names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} ${AND[locale]} ${names.at(-1)}`;

export type RenderedParty = {
  name: string;
  story: string[];
  writtenIn?: Locale;
  writtenBy?: 'ai';
};

/** The party's name and story in the interface language. */
export const renderParty = (party: Party, locale: Locale): RenderedParty => {
  if (party.text) {
    return {
      name: party.text.name,
      story: party.text.story,
      ...(party.text.language !== locale && {
        writtenIn: party.text.language,
        writtenBy: 'ai' as const,
      }),
    };
  }
  const names = party.members.map((m) => m.character.firstName);
  const fill = (id: string) =>
    PARTY_TEXTS[locale][id]
      .replaceAll('{members}', listNames(names, locale))
      .replaceAll('{first}', names[0] ?? '')
      .replaceAll(
        '{count}',
        NUMBERS[locale][names.length] ?? `${names.length}`,
      );
  return {
    name: fill(party.content.nameId),
    story: [fill(party.content.meetingId), fill(party.content.goalId)],
  };
};
