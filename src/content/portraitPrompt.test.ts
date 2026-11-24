import { CharacterClasses, CharacterRaces, Genders } from '../types/character';
import { NPC_SECTIONS, Occupations } from '../types/npc';
import { generateRandomCharacter } from './generate';
import { generateNpc } from './npc';
import {
  ageBand,
  buildPortraitPrompt,
  randomVariety,
  sameTraits,
  subjectOfCharacter,
  subjectOfNpc,
  traitsOf,
} from './portraitPrompt';
import { renderCharacter } from './character';
import { renderNpc as npcSheet } from './npc';

describe('portrait prompts (spec 011)', () => {
  it('describe every race, class and gender, without names or story (SC-004)', () => {
    for (const race of Object.values(CharacterRaces)) {
      for (const characterClass of Object.values(CharacterClasses)) {
        for (const gender of Object.values(Genders)) {
          const character = generateRandomCharacter({
            race,
            characterClass,
            gender,
          });
          const { positive, negative } = buildPortraitPrompt(
            subjectOfCharacter(character),
          );
          expect(positive).toMatch(
            /^photorealistic fantasy character portrait.*turned toward the viewer/,
          );
          expect(positive).not.toMatch(/undefined|\{|\}/);
          expect(positive).not.toContain(character.firstName);
          expect(positive).not.toContain(character.lastName);
          const { epithet, background } = renderCharacter(character, 'en');
          expect(positive).not.toContain(epithet);
          for (const paragraph of background.content) {
            expect(positive).not.toContain(paragraph);
          }
          expect(negative).toMatch(/nudity/);
        }
      }
    }
  });

  it('describe every occupation with the look only, never the other sections', () => {
    for (const occupation of Object.values(Occupations)) {
      for (const gender of Object.values(Genders)) {
        const npc = generateNpc({ occupation, gender });
        const { positive } = buildPortraitPrompt(subjectOfNpc(npc));
        const sheet = npcSheet(npc, 'en');
        const look =
          sheet.look.charAt(0).toLowerCase() + sheet.look.slice(1, -1);
        expect(positive).toContain(look);
        expect(positive).not.toContain(npc.firstName);
        expect(positive).not.toContain(npc.lastName);
        for (const section of NPC_SECTIONS.filter((s) => s !== 'look')) {
          expect(positive).not.toContain(sheet[section]);
        }
      }
    }
  });

  it('sorts ages into bands by share of the lifespan', () => {
    expect(ageBand('Human', 18)).toBe('young');
    expect(ageBand('Human', 30)).toBe('adult');
    expect(ageBand('Human', 50)).toBe('middle-aged');
    expect(ageBand('Human', 75)).toBe('elderly');
    expect(ageBand('Elf', 75)).toBe('young');
  });

  it('tells when traits changed', () => {
    const character = generateRandomCharacter({ race: 'Gnome', age: 100 });
    const traits = traitsOf(subjectOfCharacter(character));
    expect(
      sameTraits(
        traits,
        traitsOf(subjectOfCharacter({ ...character, age: 110 })),
      ),
    ).toBe(true);
    expect(
      sameTraits(
        traits,
        traitsOf(subjectOfCharacter({ ...character, race: 'Elf' })),
      ),
    ).toBe(false);
  });

  it('adds a pose when one is given, and only then', () => {
    const subject = subjectOfCharacter(generateRandomCharacter());
    expect(buildPortraitPrompt(subject).positive).not.toMatch(/heroic stance/);
    expect(buildPortraitPrompt({ ...subject, pose: 0 }).positive).toMatch(
      /heroic stance/,
    );
  });

  it('draws a light and an expression for everyone, a pose for adventurers only', () => {
    for (let i = 0; i < 50; i++) {
      const variety = randomVariety(true);
      expect(variety.pose).toEqual(expect.any(Number));
      expect(variety.light).toEqual(expect.any(Number));
      expect(variety.expression).toEqual(expect.any(Number));
      expect(randomVariety(false).pose).toBeUndefined();
    }
    const subject = subjectOfCharacter(generateRandomCharacter());
    const prompt = buildPortraitPrompt({
      ...subject,
      light: 0,
      expression: 1,
    }).positive;
    expect(prompt).toMatch(/morning light/);
    expect(prompt).toMatch(/determined, fierce gaze/);
  });
});
