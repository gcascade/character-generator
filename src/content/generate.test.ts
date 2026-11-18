import {
  type Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import { NAMES } from './data';
import {
  firstNamesFor,
  generateRandomCharacter,
  rerollWithApp,
} from './generate';

const draw = (count: number, template = {}) =>
  Array.from({ length: count }, () => generateRandomCharacter(template));

describe('generateRandomCharacter', () => {
  it('always returns content references and no text', () => {
    for (const character of draw(50)) {
      expect(character.content).toBeDefined();
      expect(character.background).toBeUndefined();
      expect(character.epithet).toBeUndefined();
    }
  });

  it('respects the template', () => {
    const character = generateRandomCharacter({
      race: 'Orc',
      characterClass: 'Cleric',
      gender: 'Female',
      alignment: 'Chaotic Good',
    });
    expect(character).toMatchObject({
      race: 'Orc',
      characterClass: 'Cleric',
      gender: 'Female',
      alignment: 'Chaotic Good',
    });
    expect(character.content?.originId).toMatch(/^origin-orc-/);
    expect(character.content?.trainingId).toMatch(/^training-cleric-/);
    expect(character.content?.turningPointId).toMatch(/^turning-cg-/);
  });

  it('names every character from its race and gender lists (SC-004)', () => {
    for (const character of draw(200)) {
      expect(firstNamesFor(character.race, character.gender)).toContain(
        character.firstName,
      );
      expect(NAMES[character.race].last).toContain(character.lastName);
    }
  });

  it('gives non-binary characters neutral first names only', () => {
    for (const race of Object.values(CharacterRaces)) {
      for (const character of draw(20, { race, gender: 'Non-binary' })) {
        expect(NAMES[race].first.neutral).toContain(character.firstName);
      }
    }
  });
});

describe('rerollWithApp', () => {
  const base: Character = generateRandomCharacter({
    race: 'Dwarf',
    characterClass: 'Warrior',
    gender: 'Female',
    alignment: 'Lawful Good',
  });

  it('changes the race and only the origin fragment, keeping the names', () => {
    const next = rerollWithApp(base, 'race');
    expect(next.race).not.toBe(base.race);
    expect(next.firstName).toBe(base.firstName);
    expect(next.content?.originId).toMatch(
      new RegExp(`^origin-${next.race.toLowerCase()}-`),
    );
    expect({ ...next.content, originId: '' }).toEqual({
      ...base.content,
      originId: '',
    });
  });

  it.each([
    ['characterClass', 'trainingId'],
    ['alignment', 'turningPointId'],
  ] as const)('changes the %s and only the %s', (property, ref) => {
    const next = rerollWithApp(base, property);
    expect(next[property]).not.toBe(base[property]);
    expect({ ...next.content, [ref]: '' }).toEqual({
      ...base.content,
      [ref]: '',
    });
  });

  it('rerolls the epithet reference only', () => {
    const next = rerollWithApp(base, 'epithet');
    expect(next.content?.epithetId).not.toBe(base.content?.epithetId);
    expect({ ...next.content, epithetId: '' }).toEqual({
      ...base.content,
      epithetId: '',
    });
  });

  it('keeps a first name that still fits after a gender change, and replaces one that does not', () => {
    const next = rerollWithApp(base, 'gender');
    expect(firstNamesFor(next.race, next.gender)).toContain(next.firstName);
  });

  it('drops AI text written for the old value and creates content for legacy characters', () => {
    const legacy: Character = {
      ...base,
      content: undefined,
      epithet: 'The Old',
      background: { title: 'Old', content: ['Old text.'] },
      textLanguage: 'en',
      textSource: 'legacy',
    };
    const next = rerollWithApp(legacy, 'race');
    expect(next.background).toBeUndefined();
    expect(next.epithet).toBe('The Old');
    expect(next.content).toBeDefined();
  });

  it.each([
    ...Object.values(CharacterClasses),
    ...Object.values(CharacterAlignments),
    ...Object.values(Genders),
  ])('has content for every value (%s)', (value) => {
    expect(value).toBeTruthy();
  });
});
