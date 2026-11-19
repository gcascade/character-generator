import type { AlignmentMode, Party } from '../types/party';
import {
  checkParty,
  generateParty,
  matchesConstraints,
  MAX_PARTY_SIZE,
  MIN_PARTY_SIZE,
  renderParty,
  rerollMember,
} from './party';

const sizes = Array.from(
  { length: MAX_PARTY_SIZE - MIN_PARTY_SIZE + 1 },
  (_, i) => MIN_PARTY_SIZE + i,
);

describe('generateParty', () => {
  it.each(
    sizes.flatMap((size) =>
      (['harmonious', 'anything'] as AlignmentMode[]).map(
        (mode) => [size, mode] as const,
      ),
    ),
  )(
    'follows every rule over 1,000 parties of %i (%s) (SC-002)',
    (size, alignmentMode) => {
      for (let i = 0; i < 1000; i++) {
        const party = generateParty({ size, alignmentMode });
        expect(party.members).toHaveLength(size);
        expect(checkParty(party)).toEqual([]);
      }
    },
  );

  it('mixes Good and Evil only when anything goes', () => {
    const mixed = Array.from({ length: 300 }, () =>
      generateParty({ size: 6, alignmentMode: 'anything' }),
    ).some((party) => {
      const alignments = party.members.map((m) => m.character.alignment);
      return (
        alignments.some((a) => a.endsWith('Good')) &&
        alignments.some((a) => a.endsWith('Evil'))
      );
    });
    expect(mixed).toBe(true);
  });

  it('applies shared constraints to every member (SC-003)', () => {
    const constraints = { race: 'Elf', gender: 'Female' } as const;
    for (let i = 0; i < 1000; i++) {
      const party = generateParty({ size: 5, constraints });
      expect(checkParty(party)).toEqual([]);
      for (const { character } of party.members) {
        expect(character).toMatchObject(constraints);
      }
    }
  });

  it('gives every member the shared class when there is one', () => {
    const party = generateParty({
      size: 4,
      constraints: { characterClass: 'Cleric' },
    });
    expect(
      party.members.every((m) => m.character.characterClass === 'Cleric'),
    ).toBe(true);
    expect(checkParty(party)).toEqual([]);
  });

  it('keeps locked members exactly, at their place (SC-003)', () => {
    const first = generateParty({ size: 4 });
    const locked = { ...first.members[1], locked: true };
    const keep = first.members.map((m, i) => (i === 1 ? locked : m));
    for (let i = 0; i < 1000; i++) {
      const next = generateParty({ size: 4, keep });
      expect(next.members[1]).toBe(locked);
      expect(checkParty(next)).toEqual([]);
    }
  });

  it('lets a locked Evil member decide a harmonious party side', () => {
    const first = generateParty({ size: 3, alignmentMode: 'anything' });
    const villain = {
      ...first.members[0],
      character: { ...first.members[0].character, alignment: 'Chaotic Evil' },
      locked: true,
    } as const;
    for (let i = 0; i < 200; i++) {
      const next = generateParty({ size: 3, keep: [villain] });
      expect(
        next.members.some((m) => m.character.alignment.endsWith('Good')),
      ).toBe(false);
    }
  });
});

describe('rerollMember', () => {
  it('replaces only that member, keeping the rules', () => {
    const party = generateParty({ size: 4, constraints: { race: 'Dwarf' } });
    const target = party.members[2];
    const next = rerollMember(party, target.id);
    expect(next.members[2].id).not.toBe(target.id);
    expect(next.members.filter((_, i) => i !== 2)).toEqual(
      party.members.filter((_, i) => i !== 2),
    );
    expect(next.content).toEqual(party.content);
    expect(next.members[2].character.race).toBe('Dwarf');
    expect(checkParty(next)).toEqual([]);
  });

  it('drops the AI story, which no longer fits', () => {
    const party: Party = {
      ...generateParty({ size: 2 }),
      text: { name: 'N', story: ['S'], language: 'en', source: 'ai' },
    };
    expect(rerollMember(party, party.members[0].id).text).toBeUndefined();
  });
});

describe('matchesConstraints', () => {
  it('flags a member that no longer matches', () => {
    const party = generateParty({ size: 2, constraints: { race: 'Orc' } });
    const member = party.members[0].character;
    expect(matchesConstraints(member, { race: 'Orc' })).toBe(true);
    expect(matchesConstraints(member, { race: 'Elf' })).toBe(false);
  });
});

describe('renderParty', () => {
  it.each(['en', 'fr'] as const)(
    'names the members without leaving placeholders in %s',
    (locale) => {
      for (const size of [2, 6]) {
        const party = generateParty({ size });
        const { name, story } = renderParty(party, locale);
        const all = [name, ...story].join(' ');
        expect(all).not.toMatch(/[{}]/);
        expect(story).toHaveLength(2);
        const listed = party.members.map((m) => m.character.firstName);
        expect(story.join(' ')).toContain(listed.at(-1));
      }
    },
  );

  it.each(['en', 'fr'] as const)(
    'gives at least 20 distinct stories in 100 parties in %s (SC-005)',
    (locale) => {
      const party = generateParty({ size: 4 });
      const stories = new Set(
        Array.from({ length: 100 }, () => {
          const again = generateParty({
            size: 4,
            keep: party.members.map((m) => ({ ...m, locked: true })),
          });
          return renderParty(again, locale).story.join(' ');
        }),
      );
      expect(stories.size).toBeGreaterThanOrEqual(20);
    },
  );

  it('shows AI text as written, labelled in another language', () => {
    const party: Party = {
      ...generateParty({ size: 2 }),
      text: {
        name: 'La Rose Noire',
        story: ['Un.'],
        language: 'fr',
        source: 'ai',
      },
    };
    expect(renderParty(party, 'en')).toMatchObject({
      name: 'La Rose Noire',
      writtenIn: 'fr',
      writtenBy: 'ai',
    });
    expect(renderParty(party, 'fr').writtenIn).toBeUndefined();
  });
});
