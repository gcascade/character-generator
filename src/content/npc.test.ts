import { CharacterRaces, Genders } from '../types/character';
import {
  LOCKABLE_NPC_PROPERTIES,
  NPC_SECTIONS,
  Occupations,
} from '../types/npc';
import { NAMES } from './data';
import {
  generateNpc,
  generateNpcs,
  minAgeOf,
  npcFragmentIds,
  npcTemplateOf,
  renderNpc as npcSheet,
  rerollNpc,
} from './npc';
import { firstNamesFor, MAX_AGE } from './template';

const draw = (count: number) =>
  Array.from({ length: count }, () => generateNpc());

describe('generateNpc', () => {
  it('fills every field from the right lists (SC-002)', () => {
    for (const npc of draw(1000)) {
      expect(firstNamesFor(npc.race, npc.gender)).toContain(npc.firstName);
      expect(NAMES[npc.race].last).toContain(npc.lastName);
      expect(npc.age).toBeGreaterThanOrEqual(minAgeOf(npc.occupation));
      expect(npc.age).toBeLessThanOrEqual(MAX_AGE[npc.race]);
      expect(npcFragmentIds('daily', npc.occupation)).toContain(
        npc.content.daily,
      );
      for (const section of NPC_SECTIONS) {
        expect(npcFragmentIds(section, npc.occupation)).toContain(
          npc.content[section],
        );
      }
    }
  });

  it('draws every occupation, race and gender (SC-003)', () => {
    const npcs = draw(1000);
    for (const occupation of Object.values(Occupations)) {
      expect(
        npcs.some((n) => n.occupation === occupation),
        occupation,
      ).toBe(true);
    }
    for (const race of Object.values(CharacterRaces)) {
      expect(
        npcs.some((n) => n.race === race),
        race,
      ).toBe(true);
    }
  });

  it('varies the sheet from one NPC to the next (SC-003)', () => {
    const npcs = [generateNpc()];
    while (npcs.length < 1000) npcs.push(generateNpc({}, npcs.at(-1)));
    for (let i = 1; i < npcs.length; i++) {
      const [a, b] = [npcs[i - 1].content, npcs[i].content];
      expect(
        a.rumour === b.rumour && a.secret === b.secret && a.quirk === b.quirk,
      ).toBe(false);
    }
  });

  it('respects the template', () => {
    for (let i = 0; i < 200; i++) {
      const npc = generateNpc({
        occupation: 'Innkeeper',
        race: 'Gnome',
        gender: 'Female',
      });
      expect(npc).toMatchObject({
        occupation: 'Innkeeper',
        race: 'Gnome',
        gender: 'Female',
      });
      expect(npc.content.daily).toMatch(/^daily-innkeeper-/);
    }
  });

  it('only gives occupations a locked age allows', () => {
    for (let i = 0; i < 200; i++) {
      const npc = generateNpc({ age: 17 });
      expect(minAgeOf(npc.occupation)).toBeLessThanOrEqual(17);
    }
  });

  it('renders every section in both languages for every gender (SC-002)', () => {
    for (const occupation of Object.values(Occupations)) {
      for (const gender of Object.values(Genders)) {
        const npc = generateNpc({ occupation, gender });
        for (const locale of ['en', 'fr'] as const) {
          const sheet = npcSheet(npc, locale);
          for (const section of NPC_SECTIONS) {
            expect(sheet[section], `${occupation} ${section}`).not.toMatch(
              /[{}]|undefined/,
            );
            expect(sheet[section].length).toBeGreaterThan(10);
          }
          expect(sheet.writtenByAi).toBe(false);
        }
      }
    }
  });

  it('shows AI text as written, with its language', () => {
    const npc = {
      ...generateNpc(),
      text: {
        language: 'en' as const,
        source: 'ai' as const,
        look: 'l',
        daily: 'd',
        quirk: 'q',
        rumour: 'r',
        secret: 's',
        opinion: 'o',
      },
    };
    expect(npcSheet(npc, 'fr')).toMatchObject({
      look: 'l',
      opinion: 'o',
      writtenByAi: true,
      writtenIn: 'en',
    });
    expect(npcSheet(npc, 'en').writtenIn).toBeUndefined();
  });
});

describe('generateNpcs', () => {
  it('gives five NPCs with different first names, within the constraints', () => {
    for (let i = 0; i < 100; i++) {
      const npcs = generateNpcs(5, { occupation: 'Guard', race: 'Dwarf' });
      expect(npcs).toHaveLength(5);
      expect(new Set(npcs.map((n) => n.firstName)).size).toBe(5);
      expect(npcs.every((n) => n.occupation === 'Guard')).toBe(true);
      expect(npcs.every((n) => n.race === 'Dwarf')).toBe(true);
    }
  });
});

describe('rerollNpc', () => {
  it('changes only the rerolled section and drops AI text', () => {
    for (const section of NPC_SECTIONS) {
      const npc = generateNpc();
      const next = rerollNpc(
        {
          ...npc,
          text: { ...npcSheet(npc, 'en'), language: 'en', source: 'ai' },
        },
        section,
      );
      expect(next.content[section]).not.toBe(npc.content[section]);
      expect({ ...next.content, [section]: 'x' }).toEqual({
        ...npc.content,
        [section]: 'x',
      });
      expect(next.text).toBeUndefined();
      expect(next.firstName).toBe(npc.firstName);
    }
  });

  it('changes the occupation with its daily life and a fitting age', () => {
    for (let i = 0; i < 100; i++) {
      const npc = generateNpc({ occupation: 'Beggar', age: 15 });
      const next = rerollNpc(npc, 'occupation');
      expect(next.occupation).not.toBe('Beggar');
      expect(next.content.daily).toMatch(
        new RegExp(`^daily-${next.occupation.toLowerCase()}-`),
      );
      expect(next.age).toBeGreaterThanOrEqual(minAgeOf(next.occupation));
      expect(next.content.rumour).toBe(npc.content.rumour);
    }
  });

  it('keeps a locked age when changing the occupation', () => {
    const npc = generateNpc({ occupation: 'Beggar', age: 15 });
    for (let i = 0; i < 50; i++) {
      const next = rerollNpc(npc, 'occupation', ['age']);
      expect(next.age).toBe(15);
      expect(minAgeOf(next.occupation)).toBeLessThanOrEqual(15);
    }
  });

  it('changes the race and keeps the names, with an age the race reaches', () => {
    const npc = generateNpc({ race: 'Elf', age: 300 });
    const next = rerollNpc(npc, 'race');
    expect(next.race).not.toBe('Elf');
    expect(next.firstName).toBe(npc.firstName);
    expect(next.age).toBeLessThanOrEqual(MAX_AGE[next.race]);
  });

  it('returns the same NPC when no other race fits the locked age', () => {
    const npc = generateNpc({ race: 'Elf', age: 480 });
    expect(rerollNpc(npc, 'race', ['age'])).toBe(npc);
  });

  it('gives each property a new value', () => {
    for (const property of LOCKABLE_NPC_PROPERTIES) {
      const npc = generateNpc({ race: 'Human' });
      const next = rerollNpc(npc, property);
      expect(next[property], property).not.toEqual(npc[property]);
    }
  });

  it('reads the locked values', () => {
    const npc = generateNpc();
    expect(npcTemplateOf(npc, ['race', 'occupation'])).toEqual({
      race: npc.race,
      occupation: npc.occupation,
    });
  });
});
