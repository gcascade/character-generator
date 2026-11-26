import { arenaSetup } from '@Test/stubs/Arena.stubs';
import type { Fighter } from '../types/arena';
import { setItems, setPerks, simulate } from './arena';
import { fighterCheck, type MatchState, skillValue } from './arenaEvents';
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
  ...overrides,
});

const state = (seed: string): MatchState => ({
  setup: arenaSetup,
  fighters: {},
  characters: Object.fromEntries(
    arenaSetup.contestants.map((c) => [c.id, c.character]),
  ),
  balance: {},
  round: 1,
  limit: 8,
  random: createRandom(seed),
  rolls: [],
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
