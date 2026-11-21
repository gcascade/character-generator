import recipe from '../data/content/portraitPrompt.json';
import type {
  Character,
  CharacterClass,
  CharacterRace,
  Gender,
} from '../types/character';
import type { Npc, Occupation } from '../types/npc';
import { NPC_TEXTS } from './data';
import { renderText } from './renderText';
import { MAX_AGE } from './template';

export type AgeBand = 'young' | 'adult' | 'middle-aged' | 'elderly';

/** What a portrait shows: visible traits only, never names or written text (spec 011 FR-002). */
export type PortraitSubject = {
  race: CharacterRace;
  gender: Gender;
  ageBand: AgeBand;
  characterClass?: CharacterClass;
  occupation?: Occupation;
  /** App-written English look of a side character. */
  look?: string;
};

/** Traits a portrait was painted from; a change makes it possibly outdated. */
export type PortraitTraits = Pick<
  PortraitSubject,
  'race' | 'gender' | 'ageBand'
> & {
  role: string;
};

/** Age band from the share of the race's lifespan (research R2). */
export const ageBand = (race: CharacterRace, age: number): AgeBand => {
  const share = age / MAX_AGE[race];
  return share < 0.25
    ? 'young'
    : share < 0.5
      ? 'adult'
      : share < 0.75
        ? 'middle-aged'
        : 'elderly';
};

export const subjectOfCharacter = (character: Character): PortraitSubject => ({
  race: character.race,
  gender: character.gender,
  ageBand: ageBand(character.race, character.age),
  characterClass: character.characterClass,
});

/** A look sentence as a phrase of the prompt: lower-case start, no final full stop. */
const lookPhrase = (sentence: string) =>
  sentence.charAt(0).toLowerCase() + sentence.slice(1).replace(/\.$/, '');

export const subjectOfNpc = (npc: Npc): PortraitSubject => ({
  race: npc.race,
  gender: npc.gender,
  ageBand: ageBand(npc.race, npc.age),
  occupation: npc.occupation,
  // Look texts have no name placeholder (checked by a test); empty names keep it that way.
  look: lookPhrase(
    renderText(NPC_TEXTS.en[npc.content.look], npc.gender, {
      firstName: '',
      lastName: '',
    }),
  ),
});

export const traitsOf = (subject: PortraitSubject): PortraitTraits => ({
  race: subject.race,
  gender: subject.gender,
  ageBand: subject.ageBand,
  role: subject.characterClass ?? subject.occupation ?? '',
});

export const sameTraits = (a: PortraitTraits, b: PortraitTraits) =>
  a.race === b.race &&
  a.gender === b.gender &&
  a.ageBand === b.ageBand &&
  a.role === b.role;

/** The text sent to the image service: style, race, gender, age, gear (contracts/portraits.md). */
export const buildPortraitPrompt = (subject: PortraitSubject) => {
  const gear = subject.characterClass
    ? recipe.classes[subject.characterClass]
    : subject.occupation
      ? recipe.occupations[subject.occupation]
      : '';
  // A race may be described per gender (e.g. dwarf women have no beard).
  const race: string | Record<string, string> = recipe.races[subject.race];
  const looks = typeof race === 'string' ? race : race[subject.gender];
  const who = `${recipe.ageBands[subject.ageBand]} ${recipe.gender[subject.gender]}, ${looks}`;
  const positive = [recipe.style, who, gear, subject.look]
    .filter(Boolean)
    .join(', ');
  return { positive, negative: recipe.negative };
};
