import { generateParty } from './party';
import {
  DEFAULT_SETTINGS,
  parseStoredParties,
  parseStoredParty,
} from './storedParty';

const party = generateParty({ size: 3, constraints: { race: 'Elf' } });

describe('parseStoredParty', () => {
  it('reads back the current party and settings', () => {
    const settings = {
      size: 3,
      constraints: { race: 'Elf' },
      alignmentMode: 'anything',
    };
    const raw = JSON.stringify({ version: 1, party, settings });
    expect(parseStoredParty(raw)).toEqual({ party, settings });
  });

  it('drops an invalid party but keeps valid settings', () => {
    const broken = { ...party, members: party.members.slice(0, 1) };
    const raw = JSON.stringify({
      version: 1,
      party: broken,
      settings: { size: 5, constraints: {}, alignmentMode: 'harmonious' },
    });
    expect(parseStoredParty(raw)).toEqual({
      party: undefined,
      settings: { size: 5, constraints: {}, alignmentMode: 'harmonious' },
    });
  });

  it('rejects unknown fragment ids', () => {
    const raw = JSON.stringify({
      version: 1,
      party: { ...party, content: { ...party.content, nameId: 'nope' } },
    });
    expect(parseStoredParty(raw).party).toBeUndefined();
  });

  it.each([null, '', '{', '[]', '{"version":2}'])(
    'falls back to defaults for %s',
    (raw) => {
      expect(parseStoredParty(raw)).toEqual({ settings: DEFAULT_SETTINGS });
    },
  );

  it('fixes invalid settings field by field', () => {
    const raw = JSON.stringify({
      version: 1,
      settings: {
        size: 42,
        constraints: { race: 'Dragon' },
        alignmentMode: 'x',
      },
    });
    expect(parseStoredParty(raw).settings).toEqual(DEFAULT_SETTINGS);
  });
});

describe('parseStoredParties', () => {
  it('keeps valid parties and drops the others', () => {
    const raw = JSON.stringify({
      version: 1,
      parties: [party, { id: 'broken' }],
    });
    expect(parseStoredParties(raw)).toEqual([party]);
  });

  it('returns no party for damaged data', () => {
    expect(parseStoredParties('nope')).toEqual([]);
  });
});
