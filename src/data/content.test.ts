/**
 * Safety net for content data (spec 002, FR-013): every text exists in every
 * locale, gender selections are well formed, placeholders are known, and French
 * non-binary text uses neutral phrasing.
 */
import {
  type GenderedText,
  renderText as fillText,
} from '../content/renderText';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../types/character';

type LocaleFiles = Record<string, Record<string, unknown>>;

const load = (locale: string): LocaleFiles => {
  const modules = import.meta.glob<{ default: Record<string, unknown> }>(
    './locales/*/*.json',
    { eager: true },
  );
  const files: LocaleFiles = {};
  for (const [path, module] of Object.entries(modules)) {
    const [, fileLocale, file] = path.match(/locales\/(\w+)\/(\w+)\.json$/)!;
    if (fileLocale === locale) files[file] = module.default;
  }
  return files;
};

const en = load('en');
const fr = load('fr');

const params = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const texts = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : value && typeof value === 'object'
      ? Object.values(value).flatMap(texts)
      : [];

const names = { firstName: 'Aria', lastName: 'Vale', epithet: 'the Bold' };

describe('locale files', () => {
  it('have the same files in every locale', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });

  describe.each(Object.keys(en))('%s.json', (file) => {
    it('has the same keys in French and English', () => {
      expect(Object.keys(fr[file] ?? {}).sort()).toEqual(
        Object.keys(en[file]).sort(),
      );
    });

    if (file === 'ui') {
      it('uses the same {params} in both languages', () => {
        for (const [key, text] of Object.entries(en.ui)) {
          expect(params(fr.ui[key] as string), key).toEqual(
            params(text as string),
          );
        }
      });
      return;
    }

    it.each(['en', 'fr'] as const)(
      'renders every entry for every gender in %s',
      (locale) => {
        const entries = (locale === 'en' ? en : fr)[file];
        for (const [id, text] of Object.entries(entries)) {
          for (const gender of Object.values(Genders)) {
            const output = fillText(text as GenderedText, gender, names);
            expect(output, `${id} (${gender})`).not.toMatch(/[{}]/);
            expect(output.trim(), `${id} (${gender})`).not.toBe('');
          }
        }
      },
    );
  });

  it('never uses a neopronoun or inclusive punctuation in French', () => {
    const forbidden = /\biels?\b|·|\w\.e\b|\(e\)|\(s\)/i;
    for (const [file, entries] of Object.entries(fr)) {
      for (const text of texts(entries)) {
        expect(text, `${file}: ${text}`).not.toMatch(forbidden);
      }
    }
  });
});

describe('fragments and names', () => {
  type Fragment = {
    id: string;
    category: string;
    race?: string;
    characterClass?: string;
    alignment?: string;
  };
  const fragments = import.meta.glob<{ default: Fragment[] }>(
    './content/fragments.json',
    {
      eager: true,
    },
  )['./content/fragments.json'].default;
  const count = (category: string, key?: keyof Fragment, value?: string) =>
    fragments.filter(
      (f) => f.category === category && (!key || f[key] === value),
    ).length;

  it('has unique ids, each with text in both languages', () => {
    const ids = fragments.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    const file: Record<string, string> = {
      title: 'titles',
      origin: 'origins',
      training: 'trainings',
      turningPoint: 'turningPoints',
      goal: 'goals',
    };
    for (const fragment of fragments) {
      expect(
        en[file[fragment.category]][fragment.id],
        fragment.id,
      ).toBeDefined();
      expect(
        fr[file[fragment.category]][fragment.id],
        fragment.id,
      ).toBeDefined();
    }
  });

  it('meets the minimum counts (FR-009)', () => {
    expect(count('title')).toBeGreaterThanOrEqual(6);
    expect(count('goal')).toBeGreaterThanOrEqual(10);
    for (const race of Object.values(CharacterRaces)) {
      expect(count('origin', 'race', race), race).toBeGreaterThanOrEqual(4);
    }
    for (const characterClass of Object.values(CharacterClasses)) {
      expect(
        count('training', 'characterClass', characterClass),
        characterClass,
      ).toBeGreaterThanOrEqual(4);
    }
    for (const alignment of Object.values(CharacterAlignments)) {
      expect(
        count('turningPoint', 'alignment', alignment),
        alignment,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('has at least 40 epithets, in both languages', () => {
    const ids = import.meta.glob<{ default: string[] }>(
      './content/epithets.json',
      { eager: true },
    )['./content/epithets.json'].default;
    expect(ids.length).toBeGreaterThanOrEqual(40);
    for (const id of ids) {
      expect(en.epithets[id], id).toBeDefined();
      expect(fr.epithets[id], id).toBeDefined();
    }
  });

  it.each(Object.values(CharacterRaces))(
    'has 40 unique names per list for %s',
    (race) => {
      const names = import.meta.glob<{
        default: { first: Record<string, string[]>; last: string[] };
      }>('./content/names/*.json', { eager: true })[
        `./content/names/${race.toLowerCase()}.json`
      ].default;
      const lists = [...Object.values(names.first), names.last];
      expect(Object.keys(names.first).sort()).toEqual([
        'female',
        'male',
        'neutral',
      ]);
      for (const list of lists) {
        expect(list.length).toBeGreaterThanOrEqual(40);
        expect(new Set(list).size).toBe(list.length);
      }
      const firstNames = Object.values(names.first).flat();
      expect(new Set(firstNames).size).toBe(firstNames.length);
    },
  );

  it('never puts an article or "de" right before a name in French (no elision issue)', () => {
    const elision =
      /\b(de|que|le|la|ne|se|jusque|lorsque|puisque) \{(firstName|lastName|fullName)\}/i;
    for (const [file, entries] of Object.entries(fr)) {
      for (const text of texts(entries)) {
        expect(text, `${file}: ${text}`).not.toMatch(elision);
      }
    }
  });
});
