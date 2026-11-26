import {
  addCharacter,
  addParty,
  addRandom,
  canStart,
  contestantSkills,
  emptySetup,
  fillRoster,
  MAX_CONTESTANTS,
  randomLoadouts,
  removeContestant,
  roundLimit,
  setItems,
  setPerks,
  simulate,
  summarize,
} from './arena';
import { renderEvent } from './arenaText';
import { generateRandomCharacter } from './generate';
import { generateParty } from './party';
import { assignRoles } from './partyDepth';
import {
  CharacterClasses,
  type CharacterAlignment,
  type CharacterClass,
} from '../types/character';
import type { Party } from '../types/party';
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

describe('arena match (spec 012 US2)', () => {
  const rosterOf = (n: number, seed: string) => ({
    ...randomLoadouts(addRandom(emptySetup(), n), createRandom(seed)),
    seed,
  });

  it('ends with exactly one side standing, within the round limit, in 1,000 matches (SC-003)', () => {
    for (let i = 0; i < 1000; i++) {
      const n = 2 + (i % 47);
      const setup = rosterOf(n, `m${i}`);
      const match = simulate(setup);
      const standing = Object.values(match.fighters).filter((f) => f.standing);
      expect(new Set(standing.map((f) => f.sideId)).size).toBe(1);
      expect(standing[0].sideId).toBe(match.winnerSideId);
      expect(match.rounds.length).toBeLessThanOrEqual(
        roundLimit(setup.contestants.length) + 1,
      );
      const alive = new Set(setup.contestants.map((c) => c.id));
      match.rounds.forEach((round, index) => {
        const actors = round.events.flatMap((e) => e.actors);
        // In the finale, a winner may fight several duels in a row.
        const finale = round.events.every((e) =>
          e.eventId.startsWith('event-finale'),
        );
        if (!finale) {
          expect(new Set(actors).size, `round ${round.number}`).toBe(
            actors.length,
          );
        }
        // 4 to 6 events per period, fewer only when too few fighters are left.
        if (!finale) {
          expect(round.events.length).toBeLessThanOrEqual(6);
          if (alive.size >= 12 && index < match.rounds.length - 1) {
            expect(round.events.length).toBeGreaterThanOrEqual(4);
          }
        }
        for (const e of round.events)
          for (const id of e.defeated) alive.delete(id);
      });
    }
  }, 60_000);

  it('tells the same match for the same seed, and another for another seed (SC-006)', () => {
    const setup = rosterOf(12, 'same');
    expect(simulate(setup)).toEqual(simulate(setup));
    expect(simulate({ ...setup, seed: 'other' })).not.toEqual(simulate(setup));
  });

  it('renders every event in both languages, line for line', () => {
    for (let i = 0; i < 100; i++) {
      const setup = rosterOf(12, `r${i}`);
      const match = simulate(setup);
      for (const round of match.rounds) {
        for (const event of round.events) {
          expect(renderEvent(event, setup, 'en')).not.toMatch(/[{}]/);
          expect(renderEvent(event, setup, 'fr')).not.toMatch(/[{}]/);
        }
      }
    }
  });

  it('reads in about five minutes for twelve contestants (SC-004)', () => {
    let lines = 0;
    for (let i = 0; i < 200; i++) {
      lines += simulate(rosterOf(12, `l${i}`)).rounds.flatMap(
        (r) => r.events,
      ).length;
    }
    expect(lines / 200).toBeGreaterThan(35);
    expect(lines / 200).toBeLessThan(75);
  });

  it('simulates 48 contestants quickly', () => {
    const setup = rosterOf(48, 'big');
    const start = performance.now();
    simulate(setup);
    expect(performance.now() - start).toBeLessThan(300);
  });

  it('rarely repeats the same text within a match (SC-007)', () => {
    let repeats = 0;
    for (let i = 0; i < 100; i++) {
      const setup = rosterOf(12, `t${i}`);
      const counts = new Map<string, number>();
      for (const event of simulate(setup).rounds.flatMap((r) => r.events)) {
        const key = `${event.eventId}.${event.outcome}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      if ([...counts.values()].some((n) => n > 3)) repeats++;
    }
    expect(repeats).toBeLessThan(50);
  });
});

describe('match summary (spec 012 FR-017)', () => {
  it('names the winners, every contestant and up to five moments, ending with the last event', () => {
    for (let i = 0; i < 50; i++) {
      const setup = {
        ...addParty(
          addRandom(emptySetup(), 6),
          generateParty({ size: 3 }),
          'en',
        ),
        seed: `sum${i}`,
      };
      const match = simulate(setup);
      const summary = summarize(setup, match);
      expect(summary.rows).toHaveLength(setup.contestants.length);
      expect(match.fighters[summary.winners[0]].standing).toBe(true);
      expect(summary.moments.length).toBeGreaterThanOrEqual(
        Math.min(3, match.rounds.flatMap((r) => r.events).length),
      );
      expect(summary.moments.length).toBeLessThanOrEqual(5);
      expect(summary.moments.at(-1)).toBe(match.rounds.at(-1)!.events.at(-1));
      const survivors = summary.rows.filter(
        (r) => r.defeatedRound === undefined,
      );
      expect(summary.rows.slice(0, survivors.length)).toEqual(survivors);
    }
  });
});

describe('teams, alignment and ties (spec 012 US3)', () => {
  const teamOf = (
    classes: CharacterClass[],
    alignment: CharacterAlignment,
  ): Party => {
    const base = generateParty({ size: classes.length });
    const members = assignRoles(
      classes.map((characterClass, i) => ({
        id: `m${i}`,
        locked: false,
        character: {
          ...generateRandomCharacter({ characterClass, alignment }),
          race: 'Human' as const,
          age: 30,
        },
      })),
    );
    return { ...base, id: crypto.randomUUID(), members };
  };

  it('never lets teammates defeat each other while the team holds, nor good allies betray (SC-003)', () => {
    for (let i = 0; i < 1000; i++) {
      let setup = emptySetup();
      for (let t = 0; t < 2 + (i % 4); t++) {
        setup = addParty(setup, generateParty({ size: 2 + (t % 4) }), 'en');
      }
      setup = { ...addRandom(setup, i % 5), seed: `team${i}` };
      const match = simulate(setup);
      const characters = new Map(
        setup.contestants.map((c) => [c.id, c.character]),
      );
      for (const fighter of Object.values(match.fighters)) {
        if (!fighter.defeatedBy) continue;
        const killer = match.fighters[fighter.defeatedBy];
        expect(killer.sideId, `seed ${setup.seed}`).not.toBe(fighter.sideId);
      }
      for (const event of match.rounds.flatMap((r) => r.events)) {
        if (event.eventId.startsWith('event-betray')) {
          expect(characters.get(event.actors[0])!.alignment).not.toMatch(
            /Good$/,
          );
        }
      }
    }
  }, 60_000);

  it('makes balanced teams win more often than unbalanced teams of the same size (SC-005)', () => {
    const classes = Object.values(CharacterClasses);
    let wins = 0;
    const matches = 300;
    for (let i = 0; i < matches; i++) {
      const balanced = teamOf(
        ['Warrior', 'Cleric', 'Mage', 'Rogue'],
        'True Neutral',
      );
      const one = classes[i % classes.length];
      const unbalanced = teamOf([one, one, one, one], 'True Neutral');
      let setup = addParty(emptySetup(), balanced, 'en');
      setup = { ...addParty(setup, unbalanced, 'en'), seed: `bal${i}` };
      if (simulate(setup).winnerSideId === setup.sides[0].id) wins++;
    }
    expect(wins / matches).toBeGreaterThan(0.6);
  }, 60_000);
});

describe('filling the arena (maintainer feedback)', () => {
  it('fills up to the target with teams of the chosen size', () => {
    const setup = fillRoster(addRandom(emptySetup(), 2), 12, 3, 'en');
    expect(setup.contestants).toHaveLength(12);
    const teams = setup.sides.filter((s) => s.kind === 'team');
    expect(teams.length).toBeGreaterThanOrEqual(3);
    for (const team of teams) {
      expect(
        setup.contestants.filter((c) => c.sideId === team.id).length,
      ).toBeLessThanOrEqual(3);
    }
  });

  it('fills with solos, or a mix, and never past 48', () => {
    expect(
      fillRoster(emptySetup(), 5, 1, 'en').sides.every(
        (s) => s.kind === 'solo',
      ),
    ).toBe(true);
    expect(
      fillRoster(emptySetup(), 100, 'mixed', 'fr').contestants,
    ).toHaveLength(48);
  });
});
