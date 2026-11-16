import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';
import backgrounds from './backgrounds.json';

const allowed = (values: Record<string, string>) => [
  'Any',
  ...Object.values(values),
];

describe('backgrounds.json', () => {
  it.each(backgrounds.map((b, index) => [index, b.title, b] as const))(
    'background #%i (%s) only uses known values',
    (_, __, background) => {
      expect(allowed(Genders)).toContain(background.gender);
      expect(allowed(CharacterRaces)).toContain(background.race);
      expect(allowed(CharacterClasses)).toContain(background.characterClass);
      expect(allowed(CharacterAlignments)).toContain(background.alignment);
    },
  );

  it.each(Object.values(Genders))('has a default background for %s', (g) => {
    expect(
      backgrounds.some(
        (b) =>
          b.gender === g &&
          b.race === 'Any' &&
          b.characterClass === 'Any' &&
          b.alignment === 'Any',
      ),
    ).toBe(true);
  });
});
