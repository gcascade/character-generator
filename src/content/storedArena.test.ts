import { addParty, addRandom, emptySetup, setPerks } from './arena';
import { generateParty } from './party';
import { parseStoredArena } from './storedArena';

describe('stored arena (spec 012 FR-019)', () => {
  it('reads back what was saved', () => {
    const setup = addParty(
      addRandom(emptySetup(), 3),
      generateParty({ size: 3 }),
      'en',
    );
    const parsed = parseStoredArena(JSON.stringify({ version: 1, ...setup }));
    expect(parsed).toEqual(setup);
  });

  it('starts empty on missing or broken data', () => {
    expect(parseStoredArena(null).contestants).toEqual([]);
    expect(parseStoredArena('{oops').contestants).toEqual([]);
    expect(parseStoredArena('{"contestants": 3}').contestants).toEqual([]);
  });

  it('drops unknown perks and items, and contestants without a side', () => {
    const setup = setPerks(addRandom(emptySetup(), 2), '', []);
    const raw = {
      ...setup,
      contestants: setup.contestants.map((c, i) => ({
        ...c,
        perks: ['perk-lucky', 'perk-gone'],
        items: ['item-sword', 'item-laser'],
        sideId: i === 0 ? c.sideId : 'nowhere',
      })),
    };
    const parsed = parseStoredArena(JSON.stringify(raw));
    expect(parsed.contestants).toHaveLength(1);
    expect(parsed.contestants[0].perks).toEqual(['perk-lucky']);
    expect(parsed.contestants[0].items).toEqual(['item-sword']);
    expect(parsed.sides).toHaveLength(1);
  });
});
