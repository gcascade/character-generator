import { SKILLS, type Skill, type Skills } from '../types/arena';
import type { Character } from '../types/character';
import { ARENA } from './data';
import { ageBand } from './portraitPrompt';
import type { Random } from './random';

export const MIN_CHANCE = 5;
export const MAX_CHANCE = 95;

const clamp = (value: number) =>
  Math.min(MAX_CHANCE, Math.max(MIN_CHANCE, Math.round(value)));

/** Random part of each skill, from −8 to +8 (research R2). */
const SPREAD = 8;

/**
 * Skills of a character for one match: class profile, race and age band
 * modifiers and a random part, kept between 5 and 95 (spec 012 FR-002).
 */
export const rollSkills = (
  character: Pick<Character, 'race' | 'characterClass' | 'age'>,
  random: Random,
): Skills => {
  const data = ARENA.skills;
  const base = data.classes[character.characterClass].base;
  const race = data.races[character.race] ?? {};
  const age = data.ageBands[ageBand(character.race, character.age)] ?? {};
  const values = Object.fromEntries(
    SKILLS.map((skill) => [
      skill,
      clamp(
        base[skill] +
          (race[skill] ?? 0) +
          (age[skill] ?? 0) +
          random.int(SPREAD * 2 + 1) -
          SPREAD,
      ),
    ]),
  ) as Record<Skill, number>;
  const hp =
    18 + Math.floor(values.endurance / 6) + data.hp[character.characterClass];
  return { values, hp };
};

/** The skills a class is known for (its three best in its profile). */
export const signatureSkills = (
  characterClass: Character['characterClass'],
): readonly Skill[] => ARENA.skills.classes[characterClass].signature;

/** A d100 check: success when the roll is at most the skill plus modifiers, kept within 5–95 (FR-006). */
export const check = (value: number, modifier: number, random: Random) => {
  const roll = random.roll();
  return { roll, success: roll <= clamp(value + modifier) };
};
