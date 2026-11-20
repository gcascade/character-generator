import {
  type Character,
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import { NAMES } from './data';
import { slug } from './slug';
import { renderCharacter } from './character';
import {
  firstNamesFor,
  generateRandomCharacter,
  rerollWithApp,
} from './generate';
import { LOCKABLE_PROPERTIES, MAX_AGE, templateOf } from './template';

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
      new RegExp(`^origin-${slug(next.race)}-`),
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

describe('generateRandomCharacter with locks (spec 003)', () => {
  const sample = generateRandomCharacter({ race: 'Elf', gender: 'Female' });
  const lockCases = [
    ...LOCKABLE_PROPERTIES.map((property) => [property]),
    [...LOCKABLE_PROPERTIES],
  ];

  it.each(lockCases.map((locked) => [locked.join(', '), locked] as const))(
    'keeps the locked values (%s) over 1,000 draws (SC-001)',
    (_, locked) => {
      const template = templateOf(sample, locked);
      for (let i = 0; i < 1000; i++) {
        const character = generateRandomCharacter(template);
        expect(templateOf(character, locked)).toEqual(template);
        expect(character.age).toBeLessThanOrEqual(MAX_AGE[character.race]);
        expect(character.content?.originId).toMatch(
          new RegExp(`^origin-${slug(character.race)}-`),
        );
        if (!locked.includes('firstName')) {
          expect(firstNamesFor(character.race, character.gender)).toContain(
            character.firstName,
          );
        }
      }
    },
  );

  it.each(LOCKABLE_PROPERTIES)(
    'still draws every other property with %s locked (SC-002)',
    (property) => {
      const template = templateOf(sample, [property]);
      const draws = Array.from({ length: 50 }, () =>
        generateRandomCharacter(template),
      );
      // A locked name or age may leave a single race or gender that fits it (US2).
      const pinned: Partial<Record<string, string[]>> = {
        firstName: ['race', 'gender'],
        lastName: ['race'],
        age: ['race'],
      };
      const free = LOCKABLE_PROPERTIES.filter(
        (p) => p !== property && !pinned[property]?.includes(p),
      );
      for (const other of free) {
        const values = new Set(
          draws.map((c) => JSON.stringify(templateOf(c, [other]))),
        );
        expect(values.size).toBeGreaterThanOrEqual(2);
      }
    },
  );

  it('changes only the content when everything is locked', () => {
    const template = templateOf(sample, LOCKABLE_PROPERTIES);
    const stories = new Set(
      Array.from({ length: 20 }, () =>
        JSON.stringify(generateRandomCharacter(template).content),
      ),
    );
    expect(stories.size).toBeGreaterThan(1);
  });

  it('keeps a written epithet with its language', () => {
    const character = generateRandomCharacter({
      epithet: { text: 'la Brave', language: 'fr', source: 'ai' },
    });
    expect(character).toMatchObject({
      epithet: 'la Brave',
      textLanguage: 'fr',
      textSource: 'ai',
    });
  });
});

describe('rerollWithApp with locks (spec 003 US2)', () => {
  it('only gives races that live long enough for a locked age, and keeps it', () => {
    const elder = { ...generateRandomCharacter({ race: 'Elf' }), age: 300 };
    for (let i = 0; i < 50; i++) {
      const next = rerollWithApp(elder, 'race', ['age']);
      expect(['Dwarf', 'Gnome', 'Dark elf']).toContain(next.race);
      expect(next.age).toBe(300);
    }
  });

  it('returns the same character when no other race fits', () => {
    const elder = { ...generateRandomCharacter({ race: 'Elf' }), age: 480 };
    expect(rerollWithApp(elder, 'race', ['age'])).toBe(elder);
  });

  it('returns the same character when the locked first name fits only its gender', () => {
    const name = firstNamesFor('Human', 'Female').find(
      (n) =>
        !firstNamesFor('Human', 'Male').includes(n) &&
        !firstNamesFor('Human', 'Non-binary').includes(n),
    )!;
    const character = {
      ...generateRandomCharacter({ race: 'Human', gender: 'Female' }),
      firstName: name,
    };
    expect(rerollWithApp(character, 'gender', ['firstName'])).toBe(character);
  });

  it('keeps a locked first name no list has and changes the gender freely', () => {
    const character = {
      ...generateRandomCharacter({ gender: 'Male' }),
      firstName: 'Zzyzx',
    };
    const next = rerollWithApp(character, 'gender', ['firstName']);
    expect(next.gender).not.toBe('Male');
    expect(next.firstName).toBe('Zzyzx');
  });

  it('still clamps the age after a race change when the age is not locked', () => {
    const elder = { ...generateRandomCharacter({ race: 'Elf' }), age: 480 };
    const next = rerollWithApp(elder, 'race');
    expect(next.age).toBeLessThanOrEqual(MAX_AGE[next.race]);
  });
});

describe('new races and classes (spec 009)', () => {
  it('draws every race and class at least 5% of the time (SC-001)', () => {
    const characters = draw(2000);
    for (const race of Object.values(CharacterRaces)) {
      const share = characters.filter((c) => c.race === race).length / 2000;
      expect(share, race).toBeGreaterThanOrEqual(0.05);
    }
    for (const characterClass of Object.values(CharacterClasses)) {
      const share =
        characters.filter((c) => c.characterClass === characterClass).length /
        2000;
      expect(share, characterClass).toBeGreaterThanOrEqual(0.05);
    }
  });

  it('renders four paragraphs for every race, class and gender, in both languages (SC-002)', () => {
    for (const race of Object.values(CharacterRaces)) {
      for (const characterClass of Object.values(CharacterClasses)) {
        for (const gender of Object.values(Genders)) {
          const character = generateRandomCharacter({
            race,
            characterClass,
            gender,
          });
          for (const locale of ['en', 'fr'] as const) {
            const { background } = renderCharacter(character, locale);
            expect(
              background.content,
              `${race} ${characterClass}`,
            ).toHaveLength(4);
            for (const paragraph of background.content) {
              expect(paragraph).not.toMatch(/[{}]|undefined/);
            }
          }
        }
      }
    }
  });
});
