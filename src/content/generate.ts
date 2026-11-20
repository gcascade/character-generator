import {
  type Character,
  type CharacterAlignment,
  CharacterAlignments,
  type CharacterClass,
  CharacterClasses,
  type CharacterRace,
  type ContentRefs,
} from '../types/character';
import { EPITHET_IDS, FRAGMENTS, type FragmentCategory, NAMES } from './data';
import {
  type CharacterTemplate,
  compatibleRaceGenders,
  firstNamesFor,
  type LockableProperty,
  MAX_AGE,
  MIN_AGE,
  type RaceGender,
  templateOf,
} from './template';

export { firstNamesFor };

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

/** Picks a different item when possible. */
const pickOther = <T>(items: readonly T[], current: T | undefined): T => {
  const others = items.filter((item) => item !== current);
  return pick(others.length ? others : items);
};

const randomAge = (race: CharacterRace) =>
  MIN_AGE + Math.floor(Math.random() * (MAX_AGE[race] - MIN_AGE));

export const fragmentIds = (
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

const orPick = <T>(value: T | undefined, items: readonly T[]) =>
  value ?? pick(items);

/**
 * A new character made from the app's content, keeping every value of the
 * template (spec 003 FR-004) and drawing the others among the values that fit
 * them (FR-005). Content is drawn anew for the final race, class and alignment.
 */
export const generateRandomCharacter = (
  template: CharacterTemplate = {},
): Character => {
  const { race, gender } = pick(compatibleRaceGenders(template));
  const characterClass = orPick(
    template.characterClass,
    Object.values(CharacterClasses),
  );
  const alignment = orPick(
    template.alignment,
    Object.values(CharacterAlignments),
  );
  const rules = { race, characterClass, gender, alignment };
  const content = pickContent(rules);
  const character: Character = {
    ...rules,
    age: template.age ?? randomAge(race),
    firstName: template.firstName ?? pick(firstNamesFor(race, gender)),
    lastName: template.lastName ?? pick(NAMES[race].last),
    content,
  };
  const { epithet } = template;
  if (epithet && 'id' in epithet) {
    content.epithetId = epithet.id;
  } else if (epithet) {
    character.epithet = epithet.text;
    character.textLanguage = epithet.language;
    character.textSource = epithet.source;
  }
  return character;
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
 *
 * The new value fits the other `locked` properties (spec 003 R5): the same
 * character is returned when no other value does.
 */
export const rerollWithApp = (
  character: Character,
  property: keyof Character,
  locked: readonly LockableProperty[] = [],
): Character => {
  const content = contentOf(character);
  const others = templateOf(
    character,
    locked.filter((p) => p !== property),
  );
  /** Values of `key` other than the current one, among the pairs that fit the other locks. */
  const fitting = <K extends keyof RaceGender>(
    key: K,
    template: CharacterTemplate,
  ) => [
    ...new Set(
      compatibleRaceGenders(template)
        .map((pair) => pair[key])
        .filter((value) => value !== character[key]),
    ),
  ];
  switch (property) {
    case 'race': {
      const races = fitting('race', { ...others, gender: character.gender });
      if (!races.length) return character;
      const race = pick(races);
      return {
        ...withoutBackgroundText(character),
        race,
        age: locked.includes('age')
          ? character.age
          : Math.min(character.age, MAX_AGE[race]),
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
      const genders = fitting('gender', { ...others, race: character.race });
      if (!genders.length) return character;
      const gender = pick(genders);
      const names = firstNamesFor(character.race, gender);
      // Keep the first name if it is locked or still fits the new gender (spec edge case).
      const firstName =
        locked.includes('firstName') || names.includes(character.firstName)
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
