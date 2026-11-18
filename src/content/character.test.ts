import type { Character } from '../types/character';
import { renderCharacter as display } from './character';
import { generateRandomCharacter } from './generate';

const combination = {
  race: 'Orc',
  characterClass: 'Cleric',
  gender: 'Female',
  alignment: 'Chaotic Good',
} as const;

describe('renderCharacter', () => {
  it.each(['en', 'fr'] as const)(
    'gives at least 60 distinct backgrounds in 100 draws for one combination in %s (SC-002)',
    (locale) => {
      const backgrounds = new Set(
        Array.from({ length: 100 }, () =>
          display(
            generateRandomCharacter(combination),
            locale,
          ).background.content.join('\n'),
        ),
      );
      expect(backgrounds.size).toBeGreaterThanOrEqual(60);
    },
  );

  it('renders a title and four paragraphs with the name and no placeholder', () => {
    const character = generateRandomCharacter(combination);
    for (const locale of ['en', 'fr'] as const) {
      const { background, epithet } = display(character, locale);
      expect(background.content).toHaveLength(4);
      const all = [background.title, ...background.content].join(' ');
      expect(all).not.toMatch(/[{}]/);
      expect(all).toContain(character.firstName);
      expect(epithet).toBeTruthy();
    }
  });

  it('tells the same story in both languages', () => {
    const character = generateRandomCharacter(combination);
    const en = display(character, 'en');
    const fr = display(character, 'fr');
    expect(en.background.content).not.toEqual(fr.background.content);
    expect(display(character, 'en')).toEqual(en);
  });

  it('agrees with the gender in French', () => {
    const female = generateRandomCharacter({ ...combination });
    female.content = { ...female.content!, epithetId: 'epithet-bold' };
    expect(display(female, 'fr').epithet).toBe('la Hardie');
    expect(display({ ...female, gender: 'Male' }, 'fr').epithet).toBe(
      'le Hardi',
    );
    expect(display({ ...female, gender: 'Non-binary' }, 'fr').epithet).toBe(
      'au Cœur hardi',
    );
  });

  it('shows AI text as written, labelled when the interface uses another language', () => {
    const character: Character = {
      ...generateRandomCharacter(combination),
      epithet: 'la Brave',
      background: { title: 'Titre', content: ['Texte.'] },
      textLanguage: 'fr',
      textSource: 'ai',
    };
    expect(display(character, 'fr')).toMatchObject({
      epithet: 'la Brave',
      writtenIn: undefined,
    });
    expect(display(character, 'en')).toMatchObject({
      background: { title: 'Titre' },
      writtenIn: 'fr',
      writtenBy: 'ai',
    });
  });

  it('labels legacy text as English', () => {
    const legacy: Character = {
      ...generateRandomCharacter(combination),
      content: undefined,
      epithet: 'The Old',
      background: { title: 'Old', content: ['Old text.'] },
    };
    expect(display(legacy, 'fr')).toMatchObject({
      writtenIn: 'en',
      writtenBy: 'legacy',
    });
  });
});
