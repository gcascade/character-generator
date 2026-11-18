/**
 * Safety net for content data (spec 002, FR-013): every text exists in every
 * locale, gender selections are well formed, placeholders are known, and French
 * non-binary text uses neutral phrasing.
 */
import {
  type GenderedText,
  renderText as fillText,
} from '../content/renderText';
import { Genders } from '../types/character';

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
