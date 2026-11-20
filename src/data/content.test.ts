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
import { slug } from '../content/slug';
import { Occupations } from '../types/npc';

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

    // Party, tie and hook texts use their own placeholders, checked below.
    if (['party', 'ties', 'hooks'].includes(file)) return;

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
        `./content/names/${slug(race)}.json`
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

describe('party fragments (spec 004)', () => {
  type PartyFragment = { id: string; category: string };
  const fragments = import.meta.glob<{ default: PartyFragment[] }>(
    './content/party.json',
    { eager: true },
  )['./content/party.json'].default;

  it('has unique ids with text in both languages, at least 10 per category', () => {
    const ids = fragments.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(en.party).sort()).toEqual([...ids].sort());
    for (const category of ['name', 'meeting', 'goal']) {
      expect(
        fragments.filter((f) => f.category === category).length,
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it.each(['en', 'fr'] as const)(
    'only uses {members}, {first} and {count}, with no gender selection, in %s',
    (locale) => {
      for (const [id, text] of Object.entries(
        (locale === 'en' ? en : fr).party,
      )) {
        const value = text as string;
        // Agreement-free by construction: works for any mix of genders (SC-004).
        expect(value, id).not.toContain('{{');
        for (const param of params(value)) {
          expect(['members', 'first', 'count'], `${id}: ${param}`).toContain(
            param,
          );
        }
        expect(params(fr.party[id] as string), id).toEqual(params(value));
      }
    },
  );

  it('names the members in every meeting text (FR-009)', () => {
    for (const { id, category } of fragments) {
      if (category !== 'meeting') continue;
      expect(en.party[id] as string, id).toContain('{members}');
    }
  });

  it('never elides before a member name in French', () => {
    const elision =
      /\b(de|que|le|la|ne|se|jusque|lorsque|puisque) \{(members|first)\}/i;
    for (const text of texts(fr.party)) {
      expect(text).not.toMatch(elision);
    }
  });

  it('uses narrow no-break spaces before French high punctuation', () => {
    for (const text of texts(fr.party)) {
      expect(text).not.toMatch(/ [:;!?»]|« /);
    }
  });
});

describe('party depth content (spec 008)', () => {
  type Depth = {
    ties: { id: string }[];
    roles: { id: string; classes: Record<string, number> }[];
    hooks: Record<string, string[]>;
  };
  const depth = import.meta.glob<{ default: Depth }>(
    './content/partyDepth.json',
    { eager: true },
  )['./content/partyDepth.json'].default;

  it('has the minimum counts and text for every id', () => {
    expect(depth.ties.length).toBeGreaterThanOrEqual(12);
    expect(depth.roles.length).toBeGreaterThanOrEqual(10);
    for (const kind of ['place', 'patron', 'threat']) {
      expect(depth.hooks[kind].length).toBeGreaterThanOrEqual(12);
    }
    const ids = {
      ties: depth.ties.map((t) => t.id),
      roles: depth.roles.map((r) => r.id),
      hooks: Object.values(depth.hooks).flat(),
    };
    for (const [file, list] of Object.entries(ids)) {
      expect(Object.keys(en[file]).sort(), file).toEqual([...list].sort());
    }
  });

  it.each(['en', 'fr'] as const)(
    'writes ties with {a} and {b} only and no gender selection, in %s',
    (locale) => {
      for (const [id, text] of Object.entries(
        (locale === 'en' ? en : fr).ties,
      )) {
        const value = text as string;
        expect(value, id).not.toContain('{{');
        expect(new Set(params(value)), id).toEqual(new Set(['a', 'b']));
      }
    },
  );

  it('has hooks without placeholders and roles that render for every gender', () => {
    for (const locale of [en, fr]) {
      for (const text of texts(locale.hooks)) expect(text).not.toMatch(/[{}]/);
      for (const [id, text] of Object.entries(locale.roles)) {
        for (const gender of Object.values(Genders)) {
          expect(
            fillText(text as GenderedText, gender, names),
            `${id} (${gender})`,
          ).not.toMatch(/[{}]/);
        }
      }
    }
  });

  it('follows French typography and never elides before a name', () => {
    for (const text of [...texts(fr.ties), ...texts(fr.hooks)]) {
      expect(text).not.toMatch(/ [:;!?»]|« /);
      expect(text).not.toMatch(
        /\b(de|que|le|la|ne|se|jusque|lorsque|puisque) \{(a|b)\}/i,
      );
    }
  });
});

describe('side character fragments (spec 010)', () => {
  type NpcData = {
    occupations: { id: string; minAge: number }[];
    fragments: { id: string; section: string; occupation?: string }[];
  };
  const data = import.meta.glob<{ default: NpcData }>('./content/npc.json', {
    eager: true,
  })['./content/npc.json'].default;
  const count = (section: string, occupation?: string) =>
    data.fragments.filter(
      (f) => f.section === section && f.occupation === occupation,
    ).length;

  it('has unique ids, each with text and the same placeholders in both languages', () => {
    const ids = data.fragments.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(en.npc).sort()).toEqual([...ids].sort());
    for (const id of ids) {
      expect(params(fr.npc[id] as string), id).toEqual(
        params(en.npc[id] as string),
      );
    }
  });

  it('describes every occupation, with labels and at least 3 daily lives (FR-003)', () => {
    expect(data.occupations.map((o) => o.id)).toEqual(
      Object.values(Occupations),
    );
    for (const occupation of Object.values(Occupations)) {
      expect(count('daily', occupation), occupation).toBeGreaterThanOrEqual(3);
      expect(en.labels[`occupation.${occupation}`], occupation).toBeDefined();
      expect(fr.labels[`occupation.${occupation}`], occupation).toBeDefined();
    }
  });

  it('has at least 20 shared texts per section', () => {
    for (const section of ['look', 'quirk', 'rumour', 'secret', 'opinion']) {
      expect(count(section), section).toBeGreaterThanOrEqual(20);
    }
  });

  it('follows French typography', () => {
    for (const text of texts(fr.npc)) {
      expect(text).not.toMatch(/ [:;!?»]|« /);
    }
  });
});
