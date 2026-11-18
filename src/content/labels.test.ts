import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import { label } from './labels';

describe('label', () => {
  it('names a female dwarf warrior with French agreement', () => {
    expect(label('race', 'Dwarf', 'Female', 'fr')).toBe('Naine');
    expect(label('class', 'Warrior', 'Female', 'fr')).toBe('Guerrière');
    expect(label('alignment', 'Lawful Good', 'Female', 'fr')).toBe(
      'Loyale Bonne',
    );
  });

  it('uses the category name for non-binary characters in French', () => {
    expect(label('race', 'Dwarf', 'Non-binary', 'fr')).toBe('Nain');
    expect(label('class', 'Rogue', 'Non-binary', 'fr')).toBe('Roublard');
  });

  it('keeps English labels as they are', () => {
    expect(label('alignment', 'True Neutral', 'Female', 'en')).toBe(
      'True Neutral',
    );
  });

  it.each(['en', 'fr'] as const)(
    'has a label for every value in %s',
    (locale) => {
      const values = [
        ...Object.values(CharacterRaces).map((v) => ['race', v] as const),
        ...Object.values(CharacterClasses).map((v) => ['class', v] as const),
        ...Object.values(CharacterAlignments).map(
          (v) => ['alignment', v] as const,
        ),
        ...Object.values(Genders).map((v) => ['gender', v] as const),
      ];
      for (const [kind, value] of values) {
        for (const gender of Object.values(Genders)) {
          expect(label(kind, value, gender, locale)).not.toMatch(/[{}|]/);
        }
      }
    },
  );
});
