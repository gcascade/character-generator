import {
  type Character,
  type CharacterAlignment,
  CharacterAlignments,
  type CharacterClass,
  CharacterClasses,
  type CharacterRace,
  CharacterRaces,
  type ContentRefs,
  type Gender,
  Genders,
} from '../types/character';
import { EPITHET_IDS, FRAGMENTS, type FragmentCategory, NAMES } from './data';

const MIN_AGE = 15;

const MAX_AGE: Record<CharacterRace, number> = {
  Human: 85,
  Elf: 500,
  Dwarf: 400,
  Orc: 60,
};

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/** Picks a different item when possible. */
const pickOther = <T>(items: readonly T[], current: T | undefined): T => {
  const others = items.filter((item) => item !== current);
  return pick(others.length ? others : items);
};

const randomAge = (race: CharacterRace) =>
  MIN_AGE + Math.floor(Math.random() * (MAX_AGE[race] - MIN_AGE));

/** First names that fit a race and gender: neutral names for non-binary characters (FR-010). */
export const firstNamesFor = (race: CharacterRace, gender: Gender) => {
  const { first } = NAMES[race];
  return gender === 'Male'
    ? first.male
    : gender === 'Female'
      ? first.female
      : first.neutral;
};

const fragmentIds = (
  category: FragmentCategory,
  character: Pick<Character, 'race' | 'characterClass' | 'alignment'>,
) =>
  FRAGMENTS.filter(
    (fragment) =>
      fragment.category === category &&
      (fragment.race === undefined || fragment.race === character.race) &&
      (fragment.characterClass === undefined ||
        fragment.characterClass === character.characterClass) &&
      (fragment.alignment === undefined ||
        fragment.alignment === character.alignment),
  ).map((fragment) => fragment.id);

const pickContent = (
  character: Pick<Character, 'race' | 'characterClass' | 'alignment'>,
): ContentRefs => ({
  titleId: pick(fragmentIds('title', character)),
  originId: pick(fragmentIds('origin', character)),
  trainingId: pick(fragmentIds('training', character)),
  turningPointId: pick(fragmentIds('turningPoint', character)),
  goalId: pick(fragmentIds('goal', character)),
  epithetId: pick(EPITHET_IDS),
});

/** A new character made from the app's content (no text, only references). */
export const generateRandomCharacter = (
  template: Partial<
    Pick<
      Character,
      | 'race'
      | 'characterClass'
      | 'gender'
      | 'alignment'
      | 'age'
      | 'firstName'
      | 'lastName'
    >
  > = {},
): Character => {
  const race = template.race ?? pick(Object.values(CharacterRaces));
  const characterClass =
    template.characterClass ?? pick(Object.values(CharacterClasses));
  const gender = template.gender ?? pick(Object.values(Genders));
  const alignment =
    template.alignment ?? pick(Object.values(CharacterAlignments));
  const rules = { race, characterClass, gender, alignment };
  return {
    ...rules,
    age: template.age ?? randomAge(race),
    firstName: template.firstName ?? pick(firstNamesFor(race, gender)),
    lastName: template.lastName ?? pick(NAMES[race].last),
    content: pickContent(rules),
  };
};

/** Content references of a character, created for characters saved by older versions. */
const contentOf = (character: Character): ContentRefs =>
  character.content ?? pickContent(character);

const withoutBackgroundText = (character: Character): Character => {
  const copy = { ...character };
  delete copy.background;
  if (copy.epithet === undefined) {
    delete copy.textLanguage;
    delete copy.textSource;
  }
  return copy;
};

/**
 * Rerolls one property with the app's content (FR-012): only that property and
 * the content that depends on it change. Text written for the old value (AI or
 * legacy background) is dropped so the app's content is shown instead.
 */
export const rerollWithApp = (
  character: Character,
  property: keyof Character,
): Character => {
  const content = contentOf(character);
  switch (property) {
    case 'race': {
      const race = pickOther(Object.values(CharacterRaces), character.race);
      return {
        ...withoutBackgroundText(character),
        race,
        age: Math.min(character.age, MAX_AGE[race]),
        content: {
          ...content,
          originId: pick(fragmentIds('origin', { ...character, race })),
        },
      };
    }
    case 'characterClass': {
      const characterClass = pickOther<CharacterClass>(
        Object.values(CharacterClasses),
        character.characterClass,
      );
      return {
        ...withoutBackgroundText(character),
        characterClass,
        content: {
          ...content,
          trainingId: pick(
            fragmentIds('training', { ...character, characterClass }),
          ),
        },
      };
    }
    case 'alignment': {
      const alignment = pickOther<CharacterAlignment>(
        Object.values(CharacterAlignments),
        character.alignment,
      );
      return {
        ...withoutBackgroundText(character),
        alignment,
        content: {
          ...content,
          turningPointId: pick(
            fragmentIds('turningPoint', { ...character, alignment }),
          ),
        },
      };
    }
    case 'gender': {
      const gender = pickOther<Gender>(
        Object.values(Genders),
        character.gender,
      );
      const names = firstNamesFor(character.race, gender);
      // Keep the first name unless it no longer fits the new gender (spec edge case).
      const firstName = names.includes(character.firstName)
        ? character.firstName
        : pick(names);
      return {
        ...withoutBackgroundText(character),
        gender,
        firstName,
        content,
      };
    }
    case 'age': {
      let age = character.age;
      while (age === character.age) age = randomAge(character.race);
      return { ...character, age };
    }
    case 'firstName':
      return {
        ...withoutBackgroundText(character),
        firstName: pickOther(
          firstNamesFor(character.race, character.gender),
          character.firstName,
        ),
        content,
      };
    case 'lastName':
      return {
        ...withoutBackgroundText(character),
        lastName: pickOther(NAMES[character.race].last, character.lastName),
        content,
      };
    case 'epithet': {
      const copy = { ...character };
      delete copy.epithet;
      if (copy.background === undefined) {
        delete copy.textLanguage;
        delete copy.textSource;
      }
      return {
        ...copy,
        content: {
          ...content,
          epithetId: pickOther(EPITHET_IDS, content.epithetId),
        },
      };
    }
    default:
      return character;
  }
};
