import type { Locale } from '../i18n';
import {
  type Character,
  type CharacterRace,
  CharacterRaces,
  type Gender,
  Genders,
} from '../types/character';
import { NAMES } from './data';

export const MIN_AGE = 15;

/** Oldest age the app gives each race. */
export const MAX_AGE: Record<CharacterRace, number> = {
  Human: 85,
  Elf: 500,
  Dwarf: 400,
  Orc: 60,
  Halfling: 150,
  Gnome: 400,
  'Half-elf': 180,
  'Dark elf': 450,
  Ashborn: 120,
};

export const LOCKABLE_PROPERTIES = [
  'firstName',
  'lastName',
  'epithet',
  'race',
  'characterClass',
  'gender',
  'age',
  'alignment',
] as const;

export type LockableProperty = (typeof LOCKABLE_PROPERTIES)[number];

/** A locked epithet: from the app's content, or text written by the AI (or a previous version). */
export type EpithetTemplate =
  { id: string } | { text: string; language: Locale; source: 'ai' | 'legacy' };

/** Values a generation must keep (spec 003): a key present means the property is locked. */
export type CharacterTemplate = Partial<
  Pick<
    Character,
    | 'firstName'
    | 'lastName'
    | 'race'
    | 'characterClass'
    | 'gender'
    | 'age'
    | 'alignment'
  >
> & { epithet?: EpithetTemplate };

/** First names that fit a race and gender: neutral names for non-binary characters. */
export const firstNamesFor = (race: CharacterRace, gender: Gender) => {
  const { first } = NAMES[race];
  return gender === 'Male'
    ? first.male
    : gender === 'Female'
      ? first.female
      : first.neutral;
};

const epithetOf = (character: Character): EpithetTemplate | undefined => {
  if (character.epithet !== undefined) {
    return {
      text: character.epithet,
      language: character.textLanguage ?? 'en',
      source: character.textSource ?? 'legacy',
    };
  }
  return character.content ? { id: character.content.epithetId } : undefined;
};

/** The locked values of a character (research R1, R3). */
export const templateOf = (
  character: Character,
  locked: readonly LockableProperty[],
): CharacterTemplate => {
  const template: CharacterTemplate = {};
  for (const property of locked) {
    if (property === 'epithet') {
      const epithet = epithetOf(character);
      if (epithet) template.epithet = epithet;
    } else {
      Object.assign(template, { [property]: character[property] });
    }
  }
  return template;
};

export type RaceGender = { race: CharacterRace; gender: Gender };

const ALL_PAIRS: RaceGender[] = Object.values(CharacterRaces).flatMap((race) =>
  Object.values(Genders).map((gender) => ({ race, gender })),
);

/** Keeps the pairs a constraint allows, or all of them when it allows none (custom or AI names). */
const narrow = (pairs: RaceGender[], allows: (pair: RaceGender) => boolean) => {
  const kept = pairs.filter(allows);
  return kept.length ? kept : pairs;
};

/**
 * Race and gender pairs consistent with the locked values (research R2). Locked
 * race and gender always apply; an age or a name no pair allows does not
 * constrain (a character loaded from elsewhere, an AI name).
 */
export const compatibleRaceGenders = (
  template: CharacterTemplate,
): RaceGender[] => {
  let pairs = ALL_PAIRS.filter(
    ({ race, gender }) =>
      (template.race === undefined || race === template.race) &&
      (template.gender === undefined || gender === template.gender),
  );
  const { age } = template;
  if (age !== undefined) {
    pairs = narrow(pairs, ({ race }) => age <= MAX_AGE[race]);
  }
  const { firstName, lastName } = template;
  if (firstName !== undefined) {
    pairs = narrow(pairs, ({ race, gender }) =>
      firstNamesFor(race, gender).includes(firstName),
    );
  }
  if (lastName !== undefined) {
    pairs = narrow(pairs, ({ race }) => NAMES[race].last.includes(lastName));
  }
  return pairs;
};
