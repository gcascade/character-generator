import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import type { Character } from '../types/character';
import type { Party } from '../types/party';
import { generateRandomCharacter } from './generate';
import { generateParty } from './party';
import {
  decodeCharacter,
  decodeParty,
  encodeCharacter,
  encodeParty,
  parseShareHash,
  sameCharacter,
  shareUrl,
} from './share';

const BASE = 'https://gcascade.github.io/character-generator/';

const withAiText = (character: Character): Character => ({
  ...character,
  epithet: "l'Inflexible",
  background: {
    title: 'Le serment',
    content: [
      'Un premier paragraphe — avec des accents : é, œ, « guillemets ».',
      'Deux.',
    ],
  },
  textLanguage: 'fr',
  textSource: 'ai',
});

describe('character links', () => {
  it('recreate 1,000 characters identically, with or without AI text (SC-002)', () => {
    for (let i = 0; i < 1000; i++) {
      const base = generateRandomCharacter();
      const character = i % 2 ? withAiText(base) : base;
      expect(decodeCharacter(encodeCharacter(character))).toEqual(character);
    }
  });

  it('recreate legacy characters (text, no content)', () => {
    // Read like a character saved by an earlier version: English text.
    expect(decodeCharacter(encodeCharacter(korvusBlackiron))).toEqual({
      ...korvusBlackiron,
      textLanguage: 'en',
      textSource: 'legacy',
    });
  });

  it('never share the saved id', () => {
    const decoded = decodeCharacter(
      encodeCharacter({ ...generateRandomCharacter(), id: 'mine' }),
    );
    expect(decoded?.id).toBeUndefined();
  });

  it('stay short for app-made characters (SC-003)', () => {
    for (let i = 0; i < 200; i++) {
      const url = shareUrl(
        { kind: 'character', character: generateRandomCharacter() },
        BASE,
      );
      expect(url.length).toBeLessThanOrEqual(300);
    }
  });

  it('replace a story fragment that no longer exists by one of the same kind (FR-008)', () => {
    const character = generateRandomCharacter({ race: 'Dwarf' });
    const payload = JSON.parse(
      atob(encodeCharacter(character).replace(/-/g, '+').replace(/_/g, '/')),
    );
    payload[7][1] = 'vanished-place';
    const data = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const decoded = decodeCharacter(data);
    expect(decoded?.content?.originId).toMatch(/^origin-dwarf-/);
  });
});

describe('party links', () => {
  it('recreate 1,000 parties, with or without AI story (SC-002)', () => {
    for (let i = 0; i < 1000; i++) {
      const party = generateParty({
        size: 2 + (i % 5),
        constraints: i % 3 ? {} : { race: 'Elf' },
        alignmentMode: i % 2 ? 'anything' : 'harmonious',
      });
      if (i % 4 === 0) {
        party.text = {
          name: 'La Rose',
          story: ['Un.', 'Deux.'],
          language: 'fr',
          source: 'ai',
        };
      }
      const decoded = decodeParty(encodeParty(party))!;
      expect(decoded.members.map((m) => m.character)).toEqual(
        party.members.map((m) => m.character),
      );
      expect(decoded).toMatchObject({
        content: party.content,
        constraints: party.constraints,
        alignmentMode: party.alignmentMode,
      });
      expect(decoded.text).toEqual(party.text);
      expect(decoded.id).not.toBe(party.id);
      expect(decoded.members.every((m) => !m.locked)).toBe(true);
    }
  });

  it('stay under 1,500 characters for a party of 6 (SC-003)', () => {
    for (let i = 0; i < 200; i++) {
      const url = shareUrl(
        { kind: 'party', party: generateParty({ size: 6 }) },
        BASE,
      );
      expect(url.length).toBeLessThanOrEqual(1500);
    }
  });
});

describe('parseShareHash', () => {
  it('reads character and party links', () => {
    const character = generateRandomCharacter();
    const url = shareUrl({ kind: 'character', character }, BASE);
    expect(parseShareHash(new URL(url).hash)).toEqual({
      kind: 'character',
      character,
    });
    const party = generateParty({ size: 3 });
    const partyUrl = shareUrl({ kind: 'party', party }, BASE);
    expect(parseShareHash(new URL(partyUrl).hash)?.kind).toBe('party');
  });

  it.each(['', '#', '#c1.', '#x1.abc', '#c2.abc', '#c1.!!!', '#p1.e30'])(
    'rejects %j',
    (hash) => {
      expect(parseShareHash(hash)).toBeUndefined();
    },
  );

  it('rejects invalid values that pass the format (FR-007)', () => {
    const encode = (payload: unknown) =>
      btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    for (const payload of [
      ['A', 'B', 99, 0, 0, 0, 30, 0],
      ['A', 'B', 0, 0, 0, 0, -5, 0],
      ['', 'B', 0, 0, 0, 0, 30, 0],
      ['A'.repeat(500), 'B', 0, 0, 0, 0, 30, 0],
      ['A', 'B', 0, 0, 0, 0, 30, 0], // no content and no text
    ]) {
      expect(
        decodeCharacter(encode(payload)),
        JSON.stringify(payload),
      ).toBeUndefined();
    }
  });

  it('never throws on 1,000 damaged links, and shows either nothing or valid data (SC-004)', () => {
    const valid = [
      shareUrl(
        { kind: 'character', character: withAiText(generateRandomCharacter()) },
        BASE,
      ),
      shareUrl({ kind: 'party', party: generateParty({ size: 4 }) }, BASE),
    ].map((url) => new URL(url).hash);
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (let i = 0; i < 1000; i++) {
      const hash = valid[i % 2];
      const chars = [...hash];
      const at = 4 + Math.floor(Math.random() * (chars.length - 4));
      const mutated =
        i % 3 === 0
          ? hash.slice(0, at) // truncated
          : (chars.splice(
              at,
              1,
              alphabet[Math.floor(Math.random() * alphabet.length)],
            ),
            chars.join(''));
      const result = parseShareHash(mutated);
      if (result?.kind === 'character') {
        expect(result.character.firstName.length).toBeGreaterThan(0);
      }
      if (result?.kind === 'party') {
        expect(result.party.members.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('sameCharacter', () => {
  it('ignores the id', () => {
    const character = generateRandomCharacter();
    expect(sameCharacter(character, { ...character, id: 'x' })).toBe(true);
    expect(
      sameCharacter(character, { ...character, age: character.age + 1 }),
    ).toBe(false);
  });
});

describe('party links with ties, roles and hook (spec 008)', () => {
  const tiesByIndex = (party: Party) =>
    (party.ties ?? []).map((t) => [
      t.type,
      party.members.findIndex((m) => m.id === t.from),
      party.members.findIndex((m) => m.id === t.to),
    ]);

  it('keep ties, roles and hook over 1,000 parties (SC-005)', () => {
    for (let i = 0; i < 1000; i++) {
      const party = generateParty({ size: 2 + (i % 5) });
      if (i % 5 === 0) {
        party.text = {
          name: 'N',
          story: ['S.', 'T.'],
          hook: 'Somewhere, someone needs help.',
          language: 'en',
          source: 'ai',
        };
      }
      const decoded = decodeParty(encodeParty(party))!;
      expect(decoded.members.map((m) => m.role)).toEqual(
        party.members.map((m) => m.role),
      );
      expect(tiesByIndex(decoded)).toEqual(tiesByIndex(party));
      expect(decoded.hook).toEqual(party.hook);
      expect(decoded.text).toEqual(party.text);
    }
  });

  it('still opens links made before ties and roles (p1), with roles and a hook drawn', () => {
    const party = generateParty({ size: 3 });
    const v1 = [
      ...JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(
            atob(encodeParty(party).replace(/-/g, '+').replace(/_/g, '/')),
            (c) => c.charCodeAt(0),
          ),
        ),
      ).slice(0, 6),
    ];
    const data = btoa(JSON.stringify(v1))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const shared = parseShareHash(`#p1.${data}`);
    expect(shared?.kind).toBe('party');
    const decoded = (shared as { party: Party }).party;
    expect(decoded.members.map((m) => m.character)).toEqual(
      party.members.map((m) => m.character),
    );
    expect(decoded.members.every((m) => m.role)).toBe(true);
    expect(decoded.ties).toEqual([]);
    expect(decoded.hook).toBeDefined();
  });
});
