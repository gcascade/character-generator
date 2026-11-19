import { generateRandomCharacter } from './generate';
import { parseStoredCharacters, withIds } from './storedCharacter';

const legacy = {
  firstName: 'Eira',
  lastName: 'Stonehelm',
  epithet: 'The Whispering Blade',
  race: 'Dwarf',
  characterClass: 'Rogue',
  gender: 'Female',
  age: 87,
  alignment: 'Chaotic Neutral',
  background: {
    title: 'Outcast of the Deep Delve',
    content: ['Eira was born deep within…'],
  },
};

describe('parseStoredCharacters', () => {
  it('reads a character saved by a previous version as English legacy text', () => {
    const [character] = parseStoredCharacters(JSON.stringify([legacy]));
    expect(character).toMatchObject({
      ...legacy,
      textLanguage: 'en',
      textSource: 'legacy',
    });
  });

  it('keeps an app-made character as references', () => {
    const made = generateRandomCharacter({});
    const [character] = parseStoredCharacters(JSON.stringify([made]));
    expect(character).toEqual(made);
  });

  it('drops invalid entries and keeps the valid ones', () => {
    const characters = parseStoredCharacters(
      JSON.stringify([
        legacy,
        { firstName: 'Nope' },
        { ...legacy, race: 'Dragon' },
        42,
      ]),
    );
    expect(characters).toHaveLength(1);
  });

  it.each([null, '', '{not json', '{"a":1}'])(
    'returns nothing for %j',
    (raw) => {
      expect(parseStoredCharacters(raw)).toEqual([]);
    },
  );
});

describe('withIds', () => {
  const base = generateRandomCharacter({ race: 'Elf' });

  it('gives an id to characters without one and keeps existing ones', () => {
    const [a, b] = withIds([base, { ...base, id: 'kept' }]);
    expect(a.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(b.id).toBe('kept');
  });

  it('replaces duplicate ids', () => {
    const [a, b] = withIds([
      { ...base, id: 'same' },
      { ...base, id: 'same' },
    ]);
    expect(a.id).toBe('same');
    expect(b.id).not.toBe('same');
  });

  it('reads the id back from storage', () => {
    const raw = JSON.stringify([{ ...base, id: 'abc' }]);
    expect(parseStoredCharacters(raw)[0].id).toBe('abc');
  });
});
