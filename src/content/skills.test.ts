import {
  CharacterClasses,
  CharacterRaces,
  type CharacterClass,
} from '../types/character';
import { SKILLS } from '../types/arena';
import { MAX_AGE } from './template';
import { createRandom } from './random';
import { check, rollSkills, signatureSkills } from './skills';

const AGES = [0.1, 0.4, 0.6, 0.9];

describe('arena skills (spec 012)', () => {
  it('keeps every skill between 5 and 95 and hit points between 18 and 40', () => {
    const random = createRandom('bounds');
    for (const race of Object.values(CharacterRaces)) {
      for (const characterClass of Object.values(CharacterClasses)) {
        for (const share of AGES) {
          const age = Math.max(1, Math.floor(MAX_AGE[race] * share));
          const { values, hp } = rollSkills(
            { race, characterClass, age },
            random,
          );
          expect(Object.keys(values).sort()).toEqual([...SKILLS].sort());
          for (const value of Object.values(values)) {
            expect(value).toBeGreaterThanOrEqual(5);
            expect(value).toBeLessThanOrEqual(95);
          }
          expect(hp).toBeGreaterThanOrEqual(18);
          expect(hp).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it('puts the class signature skills among the three highest in at least 90% of contestants (SC-001)', () => {
    const random = createRandom('signature');
    const races = Object.values(CharacterRaces);
    let fine = 0;
    const total = 1000;
    for (let i = 0; i < total; i++) {
      const race = random.pick(races);
      const characterClass = random.pick(
        Object.values(CharacterClasses),
      ) as CharacterClass;
      const age = 1 + random.int(MAX_AGE[race]);
      const { values } = rollSkills({ race, characterClass, age }, random);
      const third = [...Object.values(values)].sort((a, b) => b - a)[2];
      if (signatureSkills(characterClass).every((s) => values[s] >= third)) {
        fine++;
      }
    }
    expect(fine / total).toBeGreaterThanOrEqual(0.9);
  });

  it('gives races their strengths: orcs intimidate, halflings hide', () => {
    const random = createRandom('races');
    const average = (
      race: (typeof CharacterRaces)[keyof typeof CharacterRaces],
      skill: 'intimidation' | 'stealth',
    ) => {
      let sum = 0;
      for (let i = 0; i < 300; i++) {
        sum += rollSkills({ race, characterClass: 'Warrior', age: 30 }, random)
          .values[skill];
      }
      return sum / 300;
    };
    expect(average('Orc', 'intimidation')).toBeGreaterThan(
      average('Human', 'intimidation') + 5,
    );
    expect(average('Halfling', 'stealth')).toBeGreaterThan(
      average('Human', 'stealth') + 5,
    );
  });

  it('succeeds about as often as the skill says', () => {
    const random = createRandom('checks');
    for (const value of [20, 50, 80]) {
      let successes = 0;
      for (let i = 0; i < 10_000; i++) {
        if (check(value, 0, random).success) successes++;
      }
      expect(Math.abs(successes / 100 - value)).toBeLessThan(2);
    }
  });

  it('keeps the effective chance between 5 and 95', () => {
    const random = createRandom('clamp');
    let low = 0;
    let high = 0;
    for (let i = 0; i < 10_000; i++) {
      if (check(5, -50, random).success) low++;
      if (check(95, 50, random).success) high++;
    }
    expect(low).toBeGreaterThan(300);
    expect(high).toBeLessThan(9700);
  });
});
