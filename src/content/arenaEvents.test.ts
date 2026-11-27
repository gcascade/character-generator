import { arenaSetup } from '@Test/stubs/Arena.stubs';
import type { Fighter } from '../types/arena';
import { setItems, setPerks, simulate } from './arena';
import {
  fighterCheck,
  type MatchState,
  resolveEvent,
  skillValue,
} from './arenaEvents';
import { ARENA } from './data';
import { createRandom } from './random';

const fighter = (overrides: Partial<Fighter> = {}): Fighter => ({
  id: 'korvus',
  sideId: 'korvus',
  skills: {
    values: {
      melee: 50,
      ranged: 50,
      magic: 50,
      athletics: 50,
      stealth: 50,
      endurance: 50,
      perception: 50,
      survival: 50,
      lore: 50,
      healing: 50,
      persuasion: 50,
      intimidation: 50,
      deception: 50,
    },
    hp: 30,
  },
  hp: 30,
  maxHp: 30,
  items: [],
  perks: [],
  standing: true,
  defeats: 0,
  luckUsed: false,
  hunger: 0,
  ...overrides,
});

const state = (seed: string): MatchState => ({
  setup: arenaSetup,
  fighters: {},
  characters: Object.fromEntries(
    arenaSetup.contestants.map((c) => [c.id, c.character]),
  ),
  balance: {},
  guests: 0,
  round: 1,
  limit: 8,
  random: createRandom(seed),
  rolls: [],
  bonds: {},
  grudges: {},
  dropped: [],
});

describe('perks and items in the engine (spec 012 US4)', () => {
  it('adds perk and item bonuses, and takes 10 off physical skills when wounded', () => {
    const s = state('bonus');
    expect(skillValue(s, fighter({ perks: ['perk-brute'] }), 'melee')).toBe(60);
    expect(skillValue(s, fighter({ items: ['item-sword'] }), 'melee')).toBe(55);
    expect(skillValue(s, fighter({ hp: 10 }), 'melee')).toBe(40);
    expect(skillValue(s, fighter({ hp: 10 }), 'lore')).toBe(50);
  });

  it('lets a Lucky fighter reroll one failed check per match', () => {
    const lucky = fighter({ perks: ['perk-lucky'] });
    const s = state('lucky');
    let rerolled = 0;
    for (let i = 0; i < 200 && !lucky.luckUsed; i++) {
      fighterCheck(s, lucky, 'lore', -40);
      if (lucky.luckUsed) rerolled++;
    }
    expect(rerolled).toBe(1);
    const unlucky = fighter();
    for (let i = 0; i < 50; i++) fighterCheck(s, unlucky, 'lore', -40);
    expect(unlucky.luckUsed).toBe(false);
  });

  it('changes the story when the loadouts change, with the same seed', () => {
    const plain = { ...arenaSetup, seed: 'loadout' };
    let equipped = setItems(plain, 'korvus', ['item-sword', 'item-shield']);
    equipped = setPerks(equipped, 'sil', ['perk-shadow', 'perk-lucky']);
    expect(simulate(equipped)).not.toEqual(simulate(plain));
  });
});

describe('tools, animals and hunger (spec 013)', () => {
  const kind = (id: string) => ARENA.events.find((e) => e.id === id)!;

  it('settles an event with the right tool, without a roll, and uses up a consumable', () => {
    const s = state('tool');
    const climber = fighter({ items: ['item-rope'] });
    const result = resolveEvent(s, kind('event-tool-cliff'), [climber]);
    expect(result).toMatchObject({ outcome: 'tool', itemId: 'item-rope' });
    expect(s.rolls).toEqual([]);
    expect(climber.items).toEqual(['item-rope']);
    const poisoned = fighter({ items: ['item-antidote'] });
    resolveEvent(s, kind('event-tool-poison'), [poisoned]);
    expect(poisoned.items).toEqual([]);
  });

  it('lets a perk stand in for the tool, with its own text', () => {
    const s = state('knack');
    const result = resolveEvent(s, kind('event-tool-cliff'), [
      fighter({ perks: ['perk-climber'] }),
    ]);
    expect(result.outcome).toBe('knack');
    expect(result.itemId).toBeUndefined();
  });

  it('gives a companion when taming works, whose bonuses count', () => {
    const s = state('tame');
    const tamer = fighter({ items: ['item-rations'] });
    const result = resolveEvent(s, kind('event-tame-wolf'), [tamer]);
    expect(result.outcome).toBe('tool');
    expect(tamer.companion).toBe('animal-wolf');
    expect(skillValue(s, tamer, 'perception')).toBe(55);
  });

  it('makes hunger cost points on every check', () => {
    const s = state('hunger');
    expect(skillValue(s, fighter({ hunger: 3 }), 'lore')).toBe(45);
    expect(skillValue(s, fighter({ hunger: 6 }), 'lore')).toBe(40);
  });
});
