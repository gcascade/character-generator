import {
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../src/types/character';
import { Occupations } from '../src/types/npc';
import { buildPortraitPrompt } from '../src/content/portraitPrompt';
import { buildPortraitPrompt as scriptPrompt } from './portrait-prompt.mjs';

describe('script portrait prompts (spec 011 T014)', () => {
  it('match the app for every race, class, occupation, gender and age band', () => {
    for (const race of Object.values(CharacterRaces)) {
      for (const gender of Object.values(Genders)) {
        for (const ageBand of [
          'young',
          'adult',
          'middle-aged',
          'elderly',
        ] as const) {
          for (const characterClass of Object.values(CharacterClasses)) {
            const subject = { race, gender, ageBand, characterClass };
            expect(scriptPrompt(subject)).toEqual(buildPortraitPrompt(subject));
          }
          for (const occupation of Object.values(Occupations)) {
            const subject = {
              race,
              gender,
              ageBand,
              occupation,
              look: 'A hat.',
            };
            expect(scriptPrompt(subject)).toEqual(buildPortraitPrompt(subject));
          }
        }
      }
    }
  });
});
