// The portrait prompt recipe for the scripts (spec 011 R2): the same as src/content/portraitPrompt.ts, which the
// script cannot import without a TypeScript loader. A test checks that both give the same prompts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './portraits-lib.mjs';

const recipe = JSON.parse(
  readFileSync(join(root, 'src/data/content/portraitPrompt.json'), 'utf8'),
);

/** @param {{ race: string, gender: string, ageBand: string, characterClass?: string, occupation?: string, look?: string }} subject */
export const buildPortraitPrompt = (subject) => {
  const gear = subject.characterClass
    ? recipe.classes[subject.characterClass]
    : subject.occupation
      ? recipe.occupations[subject.occupation]
      : '';
  const who = `${recipe.ageBands[subject.ageBand]} ${recipe.gender[subject.gender]}, ${recipe.races[subject.race]}`;
  const positive = [recipe.style, who, gear, subject.look]
    .filter(Boolean)
    .join(', ');
  return { positive, negative: recipe.negative };
};

/** Default portraits show an adult of the race and class. */
export const defaultPortraitSubject = (race, characterClass, variant) => ({
  race,
  gender: variant === 'male' ? 'Male' : 'Female',
  ageBand: 'adult',
  characterClass,
});
