import { type Character, CharacterRaces } from '../types/character';
import { generateRandomCharacter } from './generate';
import {
  compatibleRaceGenders,
  firstNamesFor,
  LOCKABLE_PROPERTIES,
  templateOf,
} from './template';

describe('templateOf', () => {
  const character = generateRandomCharacter({
    race: 'Elf',
    gender: 'Female',
  });

  it('keeps only the locked properties', () => {
    expect(templateOf(character, ['race', 'age'])).toEqual({
      race: 'Elf',
      age: character.age,
    });
    expect(templateOf(character, [])).toEqual({});
  });

  it('locks every property', () => {
    expect(Object.keys(templateOf(character, LOCKABLE_PROPERTIES))).toEqual(
      LOCKABLE_PROPERTIES,
    );
  });

  it('locks an app epithet by id and a written epithet with its language', () => {
    expect(templateOf(character, ['epithet'])).toEqual({
      epithet: { id: character.content!.epithetId },
    });
    const written: Character = {
      ...character,
      epithet: 'la Brave',
      textLanguage: 'fr',
      textSource: 'ai',
    };
    expect(templateOf(written, ['epithet'])).toEqual({
      epithet: { text: 'la Brave', language: 'fr', source: 'ai' },
    });
  });
});

describe('compatibleRaceGenders', () => {
  it('allows every pair without locks', () => {
    expect(compatibleRaceGenders({})).toHaveLength(
      Object.keys(CharacterRaces).length * 3,
    );
  });

  it('only allows races that live long enough for a locked age', () => {
    const races = new Set(
      compatibleRaceGenders({ age: 300 }).map((p) => p.race),
    );
    expect(races).toEqual(new Set(['Elf', 'Dwarf', 'Gnome', 'Dark elf']));
  });

  it('only allows pairs whose list has a locked first name', () => {
    const name = firstNamesFor('Human', 'Female')[0];
    const pairs = compatibleRaceGenders({ firstName: name });
    expect(pairs.length).toBeGreaterThan(0);
    for (const { race, gender } of pairs) {
      expect(firstNamesFor(race, gender)).toContain(name);
    }
  });

  it('ignores a name no list has', () => {
    expect(compatibleRaceGenders({ firstName: 'Zzyzx' })).toHaveLength(
      Object.keys(CharacterRaces).length * 3,
    );
    expect(
      compatibleRaceGenders({ lastName: 'Zzyzx', gender: 'Male' }),
    ).toHaveLength(Object.keys(CharacterRaces).length);
  });

  it('ignores an age no locked race allows', () => {
    expect(compatibleRaceGenders({ race: 'Human', age: 300 })).toHaveLength(3);
  });
});
