import {
  addCharacter,
  addParty,
  addRandom,
  canStart,
  contestantSkills,
  emptySetup,
  MAX_CONTESTANTS,
  randomLoadouts,
  removeContestant,
  setItems,
  setPerks,
} from './arena';
import { generateRandomCharacter } from './generate';
import { generateParty } from './party';
import { createRandom } from './random';

describe('arena roster (spec 012 US1)', () => {
  it('adds solo contestants, never the same saved character twice', () => {
    const saved = { ...generateRandomCharacter(), id: 'saved-1' };
    let setup = addCharacter(emptySetup(), saved);
    setup = addCharacter(setup, saved);
    expect(setup.contestants).toHaveLength(1);
    expect(setup.contestants[0].character.id).toBeUndefined();
    expect(setup.sides).toEqual([
      { id: setup.contestants[0].sideId, kind: 'solo', ties: [] },
    ]);
  });

  it('adds a party as one team with its roles and ties', () => {
    const party = generateParty({ size: 4 });
    const setup = addParty(emptySetup(), party, 'en');
    expect(setup.sides).toHaveLength(1);
    const [side] = setup.sides;
    expect(side.kind).toBe('team');
    expect(side.name).toBeTruthy();
    expect(setup.contestants.every((c) => c.sideId === side.id)).toBe(true);
    expect(setup.contestants.map((c) => c.role)).toEqual(
      party.members.map((m) => m.role),
    );
    const ids = setup.contestants.map((c) => c.id);
    for (const tie of side.ties) {
      expect(ids).toContain(tie.from);
      expect(ids).toContain(tie.to);
    }
    expect(side.ties).toHaveLength(party.ties?.length ?? 0);
    expect(addParty(setup, party, 'en')).toBe(setup);
  });

  it('stops at 48 contestants', () => {
    const setup = addRandom(emptySetup(), 60);
    expect(setup.contestants).toHaveLength(MAX_CONTESTANTS);
    expect(addRandom(setup, 1)).toBe(setup);
  });

  it('turns a team of one into a solo and drops empty sides', () => {
    const party = generateParty({ size: 2 });
    let setup = addParty(emptySetup(), party, 'en');
    setup = removeContestant(setup, setup.contestants[0].id);
    expect(setup.sides[0].kind).toBe('solo');
    expect(setup.sides[0].ties).toEqual([]);
    setup = removeContestant(setup, setup.contestants[0].id);
    expect(setup.sides).toEqual([]);
  });

  it('needs two sides to start', () => {
    const team = addParty(emptySetup(), generateParty({ size: 3 }), 'en');
    expect(canStart(team)).toEqual({ ok: false, reason: 'too-few-sides' });
    expect(canStart(addRandom(team, 1))).toEqual({ ok: true });
  });

  it('rolls skills from the seed and the contestant only', () => {
    const setup = addRandom(emptySetup(), 2);
    const [first, second] = setup.contestants;
    const before = contestantSkills(setup, first.id);
    const more = addRandom(removeContestant(setup, second.id), 5);
    expect(contestantSkills(more, first.id)).toEqual(before);
    expect(contestantSkills({ ...setup, seed: 'other' }, first.id)).not.toEqual(
      before,
    );
  });

  it('limits perks to two known ones and items to three', () => {
    const setup = addRandom(emptySetup(), 1);
    const id = setup.contestants[0].id;
    const withPerks = setPerks(setup, id, [
      'perk-lucky',
      'perk-lucky',
      'perk-unknown',
      'perk-brute',
      'perk-tough',
    ]);
    expect(withPerks.contestants[0].perks).toEqual([
      'perk-lucky',
      'perk-brute',
    ]);
    const withItems = setItems(setup, id, [
      'item-sword',
      'item-bow',
      'item-rope',
      'item-map',
    ]);
    expect(withItems.contestants[0].items).toEqual([
      'item-sword',
      'item-bow',
      'item-rope',
    ]);
    expect(contestantSkills(setPerks(setup, id, ['perk-tough']), id).hp).toBe(
      contestantSkills(setup, id).hp + 8,
    );
  });

  it('draws random loadouts within the limits', () => {
    const setup = randomLoadouts(
      addRandom(emptySetup(), 10),
      createRandom('l'),
    );
    for (const c of setup.contestants) {
      expect(c.perks).toHaveLength(2);
      expect(c.items.length).toBeGreaterThanOrEqual(1);
      expect(c.items.length).toBeLessThanOrEqual(3);
    }
  });
});
