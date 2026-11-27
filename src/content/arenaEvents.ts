import type {
  ArenaSetup,
  EventResult,
  Fighter,
  RollRecord,
  Skill,
} from '../types/arena';
import type { Character } from '../types/character';
import { ARENA, type ArenaEventKind } from './data';
import type { Random } from './random';
import { check, clamp } from './skills';

/** Everything an event needs to know about the match while it runs. */
export type MatchState = {
  setup: ArenaSetup;
  fighters: Record<string, Fighter>;
  characters: Record<string, Character>;
  /** Bonus to every check from the team's balance (spec 008), by contestant id. */
  balance: Record<string, number>;
  round: number;
  /** Round after which the arena forces the finale. */
  limit: number;
  random: Random;
  /** Rolls of the event being resolved. */
  rolls: RollRecord[];
  /** How close two fighters have grown, by `pairKey` (couples form from it). */
  bonds: Record<string, number>;
  /** Items left behind by contestants who are out, for others to pick up. */
  dropped: string[];
  /** Wrongs remembered: grudges[a][b] = why a resents b. */
  grudges: Record<string, Record<string, 'personal' | 'friend'>>;
};

export const pairKey = (a: Fighter, b: Fighter) =>
  a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;

/** Bond a couple needs to form (research R11). */
export const COUPLE_BOND = 3;

export const bondOf = (state: MatchState, a: Fighter, b: Fighter) =>
  state.bonds[pairKey(a, b)] ?? 0;

const addBond = (state: MatchState, a: Fighter, b: Fighter, amount: number) => {
  state.bonds[pairKey(a, b)] = bondOf(state, a, b) + amount;
};

/** a remembers a wrong done by b (a personal one is never downgraded). */
const addGrudge = (
  state: MatchState,
  a: Fighter,
  b: Fighter,
  why: 'personal' | 'friend',
) => {
  if (a.id === b.id) return;
  const list = (state.grudges[a.id] ??= {});
  if (list[b.id] !== 'personal') list[b.id] = why;
};

export const grudgeOf = (state: MatchState, a: Fighter, b: Fighter) =>
  state.grudges[a.id]?.[b.id];

const FRIENDLY_TIES = [
  'tie-life-debt',
  'tie-childhood',
  'tie-blood-oath',
  'tie-mentor',
  'tie-admiration',
];
const HOSTILE_TIES = [
  'tie-rivals',
  'tie-betrayal',
  'tie-suspicion',
  'tie-family-feud',
];

const PHYSICAL: Skill[] = ['melee', 'athletics', 'stealth', 'endurance'];

const perk = (id: string) => ARENA.perks.find((p) => p.id === id);
/** A perk or an item with this tag. */
const hasTag = (f: Fighter, tag: string) =>
  hasPerkTag(f, tag) || hasItemTag(f, tag);
const item = (id: string) => ARENA.items.find((i) => i.id === id);

export const hasPerkTag = (f: Fighter, tag: string) =>
  f.perks.some((p) => perk(p)?.tags?.includes(tag));

export const hasItemTag = (f: Fighter, tag: string) =>
  f.items.some((i) => item(i)?.tags?.includes(tag));

export const isWounded = (f: Fighter) => f.hp <= f.maxHp / 2;

// --- Skill values ------------------------------------------------------------

/** A fighter's chance for a skill: rolled value, perks, items, team balance, wounds. */
export const skillValue = (state: MatchState, f: Fighter, skill: Skill) => {
  let value = f.skills.values[skill];
  for (const p of f.perks) value += perk(p)?.bonuses?.[skill] ?? 0;
  for (const i of f.items) value += item(i)?.bonuses?.[skill] ?? 0;
  value += state.balance[f.id] ?? 0;
  if (isWounded(f) && PHYSICAL.includes(skill)) value -= 10;
  return value;
};

/** A check for a fighter; a Lucky fighter rerolls their first failure of the match. */
export const fighterCheck = (
  state: MatchState,
  f: Fighter,
  skill: Skill,
  modifier = 0,
) => {
  const value = skillValue(state, f, skill);
  const chance = clamp(value + modifier);
  const first = check(value, modifier, state.random);
  state.rolls.push({ actor: f.id, skill, chance, ...first });
  if (first.success || f.luckUsed || !hasPerkTag(f, 'reroll')) return first;
  f.luckUsed = true;
  const second = check(value, modifier, state.random);
  state.rolls.push({ actor: f.id, skill, chance, ...second, reroll: true });
  return second;
};

// --- Relations -------------------------------------------------------------

const tiesOf = (state: MatchState, a: Fighter, b: Fighter) =>
  state.setup.sides
    .flatMap((s) => s.ties)
    .filter(
      (t) =>
        (t.from === a.id && t.to === b.id) ||
        (t.from === b.id && t.to === a.id),
    )
    .map((t) => t.type);

export const friendly = (state: MatchState, a: Fighter, b: Fighter) =>
  tiesOf(state, a, b).some((t) => FRIENDLY_TIES.includes(t));

export const hostile = (state: MatchState, a: Fighter, b: Fighter) =>
  tiesOf(state, a, b).some((t) => HOSTILE_TIES.includes(t));

export const sameSide = (a: Fighter, b: Fighter) => a.sideId === b.sideId;

export const allied = (a: Fighter, b: Fighter) =>
  !!a.allianceId && a.allianceId === b.allianceId;

/** Fighters who never attack each other: teammates while the team holds, and allies. */
export const friends = (a: Fighter, b: Fighter) =>
  sameSide(a, b) || allied(a, b);

const alignment = (state: MatchState, f: Fighter) =>
  state.characters[f.id].alignment;

export const isGood = (state: MatchState, f: Fighter) =>
  alignment(state, f).endsWith('Good');
export const isEvil = (state: MatchState, f: Fighter) =>
  alignment(state, f).endsWith('Evil');
const isChaotic = (state: MatchState, f: Fighter) =>
  alignment(state, f).startsWith('Chaotic');

const isCaster = (state: MatchState, f: Fighter) =>
  ARENA.skills.casters.includes(state.characters[f.id].characterClass) ||
  hasPerkTag(f, 'caster') ||
  hasItemTag(f, 'magic');

const canShoot = (state: MatchState, f: Fighter) =>
  hasItemTag(f, 'ranged') || state.characters[f.id].characterClass === 'Ranger';

// --- Conditions -------------------------------------------------------------

/** Whether an event kind fits actor a (the partners are checked separately). */
export const fitsActor = (
  state: MatchState,
  kind: ArenaEventKind,
  a: Fighter,
) => {
  const when = kind.when ?? {};
  if (when.minRound && state.round < when.minRound) return false;
  if (when.alignment === 'good' && !isGood(state, a)) return false;
  if (when.alignment === 'evil' && !isEvil(state, a)) return false;
  if (when.alignment === 'chaotic' && !isChaotic(state, a)) return false;
  if (when.alignment === 'not-good' && isGood(state, a)) return false;
  if (when.perk && !a.perks.includes(when.perk)) return false;
  if (when.itemTag && !hasItemTag(a, when.itemTag)) return false;
  if (
    when.wounded !== undefined &&
    kind.actors === 1 &&
    when.wounded !== isWounded(a)
  )
    return false;
  if (when.caster && !isCaster(state, a)) return false;
  if (kind.skill === 'magic' && kind.type === 'fight' && !isCaster(state, a))
    return false;
  if (kind.skill === 'ranged' && kind.type === 'fight' && !canShoot(state, a))
    return false;
  if (
    when.role &&
    state.setup.contestants.find((c) => c.id === a.id)?.role !== when.role
  )
    return false;
  return true;
};

// --- Effects ------------------------------------------------------------------

const standingCount = (state: MatchState) =>
  Object.values(state.fighters).filter((f) => f.standing).length;

/** Damage a fighter; returns true when it defeats them. The last one standing is never defeated by the arena itself. */
const hurt = (
  state: MatchState,
  target: Fighter,
  amount: number,
  by?: Fighter,
): boolean => {
  const armour = hasItemTag(target, 'armour') ? 2 : 0;
  target.hp -= Math.max(1, amount - armour);
  if (by) addGrudge(state, target, by, 'personal');
  if (target.hp > 0) return false;
  if (!by && standingCount(state) <= 1) {
    target.hp = 1;
    return false;
  }
  target.hp = 0;
  target.standing = false;
  target.defeatedRound = state.round;
  dropItems(state, target);
  if (by) {
    target.defeatedBy = by.id;
    by.defeats++;
    // Teammates and the partner of the fallen remember who did it.
    for (const f of Object.values(state.fighters)) {
      if (
        f.standing &&
        (f.sideId === target.sideId || f.partner === target.id)
      ) {
        addGrudge(state, f, by, 'friend');
      }
    }
  }
  return true;
};

/** What someone carried stays in the arena when they leave it. */
export const dropItems = (state: MatchState, f: Fighter) => {
  state.dropped.push(...f.items);
  f.items = [];
};

/** Minor harm (hunger, a slap): never enough to leave the arena. */
const scratch = (f: Fighter, amount: number) => {
  f.hp = Math.max(1, f.hp - amount);
};

const heal = (f: Fighter, amount: number) => {
  f.hp = Math.min(f.maxHp, f.hp + amount);
};

const consume = (f: Fighter, tag: string) => {
  const index = f.items.findIndex((i) => item(i)?.tags?.includes(tag));
  if (index < 0) return undefined;
  return f.items.splice(index, 1)[0];
};

export const MAX_HELD = 5;

const findItem = (state: MatchState, f: Fighter) => {
  if (f.items.length >= MAX_HELD) return undefined;
  const choices = ARENA.items.filter((i) => !f.items.includes(i.id));
  const found = state.random.pick(choices).id;
  f.items.push(found);
  return found;
};

// --- Fights -----------------------------------------------------------------

type Style = 'melee' | 'ranged' | 'magic';

const bestStyle = (state: MatchState, f: Fighter): Style => {
  const styles: Style[] = ['melee'];
  if (canShoot(state, f)) styles.push('ranged');
  if (isCaster(state, f)) styles.push('magic');
  return styles.reduce((best, style) =>
    skillValue(state, f, style) > skillValue(state, f, best) ? style : best,
  );
};

const weaponDamage = (state: MatchState, f: Fighter, style: Style) => {
  const fits = (tags: string[] = []) =>
    style === 'melee'
      ? !tags.includes('ranged') && !tags.includes('magic')
      : tags.includes(style);
  const weapons = f.items
    .map(item)
    .filter((i) => i?.kind === 'weapon' && fits(i.tags))
    .map((i) => i!.damage ?? 0);
  const base =
    style === 'melee'
      ? ARENA.skills.attack[state.characters[f.id].characterClass]
      : style === 'ranged'
        ? 4
        : 5;
  return Math.max(base, ...weapons);
};

/** One blow: attack check, then a hard dodge; returns the damage dealt. */
const strike = (
  state: MatchState,
  attacker: Fighter,
  defender: Fighter,
  style: Style,
  modifier: number,
) => {
  const attack = fighterCheck(state, attacker, style, modifier);
  if (!attack.success) return 0;
  const block =
    (hasItemTag(defender, 'block') ? 10 : 0) +
    (hasTag(defender, 'escape') ? 10 : 0);
  if (fighterCheck(state, defender, 'athletics', block - 30).success) return 0;
  const critical =
    attack.roll <= skillValue(state, attacker, style) / 5 ? 4 : 0;
  const damage =
    weaponDamage(state, attacker, style) + 4 + state.random.int(5) + critical;
  return damage;
};

export type FightOutcome = 'defeat' | 'defeated' | 'win' | 'lose' | 'draw';

/** A short exchange: a strikes, b answers, a strikes again (research R3). */
export const fight = (
  state: MatchState,
  a: Fighter,
  b: Fighter,
  style: Style = bestStyle(state, a),
  modifier = 0,
  untilDefeat = false,
): { outcome: FightOutcome; defeated: string[] } => {
  let dealt = 0;
  let taken = 0;
  const answer = bestStyle(state, b);
  for (let exchange = 0; exchange < (untilDefeat ? 40 : 1); exchange++) {
    const first = strike(state, a, b, style, modifier);
    dealt += first;
    if (first && hurt(state, b, first, a))
      return { outcome: 'defeat', defeated: [b.id] };
    const back = strike(state, b, a, answer, 0);
    taken += back;
    if (back && hurt(state, a, back, b))
      return { outcome: 'defeated', defeated: [a.id] };
    const second = strike(state, a, b, style, modifier);
    dealt += second;
    if (second && hurt(state, b, second, a))
      return { outcome: 'defeat', defeated: [b.id] };
  }
  return {
    outcome: dealt === taken ? 'draw' : dealt > taken ? 'win' : 'lose',
    defeated: [],
  };
};

// --- Resolution ---------------------------------------------------------------

const solo = (
  kind: ArenaEventKind,
  a: Fighter,
  outcome: string,
  extra: Partial<EventResult> = {},
): EventResult => ({
  eventId: kind.id,
  outcome,
  actors: [a.id],
  defeated: [],
  ...(kind.notable && { notable: true }),
  ...extra,
});

/** Group attackers who were not friends become allies. */
const allyAll = (fighters: Fighter[]) => {
  const standing = fighters.filter((f) => f.standing);
  const alliance =
    standing.find((f) => f.allianceId)?.allianceId ??
    `alliance:${standing[0]?.id}`;
  for (const f of standing) {
    if (!f.partner && standing.some((g) => g !== f && g.sideId !== f.sideId)) {
      f.allianceId = alliance;
    }
  }
};

/** Plays an event kind with its actors and returns what happened (research R4). */
export const resolveEvent = (
  state: MatchState,
  kind: ArenaEventKind,
  actors: Fighter[],
): EventResult => {
  const [a, b, c] = actors;
  const { random } = state;
  const ids = actors.map((f) => f.id);
  const result = (outcome: string, extra: Partial<EventResult> = {}) => ({
    ...solo(kind, a, outcome, extra),
    actors: ids,
  });
  const skill = kind.skill ?? 'perception';
  const modifier = kind.modifier ?? 0;

  switch (kind.type) {
    case 'find': {
      const tools = hasTag(a, 'lockpick') ? 10 : 0;
      if (fighterCheck(state, a, skill, modifier + tools).success) {
        const found = findItem(state, a);
        return found ? result('success', { itemId: found }) : result('failure');
      }
      return result('failure');
    }
    case 'gift': {
      return result('only', { itemId: findItem(state, a) });
    }
    case 'forage': {
      const food =
        (hasItemTag(a, 'food') ? 15 : 0) + (hasTag(a, 'forager') ? 10 : 0);
      if (fighterCheck(state, a, skill, modifier + food).success) {
        heal(a, 4);
        return result('success');
      }
      scratch(a, kind.damage ?? 3);
      return result('failure');
    }
    case 'hazard':
    case 'arena': {
      const help =
        (hasItemTag(a, 'climb') && skill === 'athletics' ? 15 : 0) +
        (hasTag(a, 'trap-sense') && (skill === 'perception' || skill === 'lore')
          ? 15
          : 0);
      if (fighterCheck(state, a, skill, modifier + help).success)
        return result('success');
      const deadly = kind.type === 'arena' && state.round >= state.limit - 1;
      const damage = deadly ? 40 : (kind.damage ?? 5) + random.int(3);
      const lost =
        kind.loseItem && a.items.length ? random.pick(a.items) : undefined;
      if (lost) a.items = a.items.filter((i) => i !== lost);
      if (hurt(state, a, damage))
        return result('defeated', { defeated: [a.id] });
      return lost ? result('lost', { itemId: lost }) : result('failure');
    }
    case 'rest':
      heal(a, kind.damage ?? 4);
      return result('only');
    case 'quiet':
      return result('only');
    case 'potion': {
      const used = consume(a, 'heal');
      heal(a, 14);
      return result('only', used ? { itemId: used } : {});
    }
    case 'treat': {
      if (fighterCheck(state, a, 'healing', modifier).success) {
        heal(a, 8);
        return result('success');
      }
      return result('failure');
    }
    case 'fight':
    case 'finish':
    case 'finale': {
      const style = (kind.skill as Style | undefined) ?? bestStyle(state, a);
      const { outcome, defeated } = fight(
        state,
        a,
        b,
        style,
        modifier,
        kind.type === 'finale',
      );
      return result(outcome, { defeated });
    }
    case 'ambush': {
      const spotted =
        hasTag(b, 'alert') || fighterCheck(state, b, 'perception', -10).success;
      const hidden = fighterCheck(state, a, 'stealth', modifier).success;
      if (hidden && !spotted) {
        const damage =
          weaponDamage(state, a, bestStyle(state, a)) + 4 + random.int(5);
        if (hurt(state, b, damage, a))
          return result('defeat', { defeated: [b.id] });
        return result('success');
      }
      const back = strike(state, b, a, bestStyle(state, b), 10);
      if (back && hurt(state, a, back, b))
        return result('defeated', { defeated: [a.id] });
      return result('failure');
    }
    case 'social': {
      // Opposed by the target's perception for lies, by their endurance for threats.
      const resist: Skill = skill === 'deception' ? 'perception' : 'endurance';
      const success =
        fighterCheck(state, a, skill, modifier).success &&
        !fighterCheck(state, b, resist, -20).success;
      if (success) {
        if (kind.effect === 'hurt') {
          if (hurt(state, b, (kind.damage ?? 5) + random.int(3), a))
            return result('defeat', { defeated: [b.id] });
        }
        if (
          kind.effect === 'take' &&
          b.items.length &&
          a.items.length < MAX_HELD
        ) {
          const taken = random.pick(b.items);
          b.items = b.items.filter((i) => i !== taken);
          a.items.push(taken);
          return result('took', { itemId: taken });
        }
        return result('success');
      }
      scratch(a, 2);
      return result('failure');
    }
    case 'steal': {
      const taken = b.items.length ? random.pick(b.items) : undefined;
      if (
        taken &&
        fighterCheck(state, a, skill, modifier).success &&
        !fighterCheck(state, b, 'perception', -15).success
      ) {
        b.items = b.items.filter((i) => i !== taken);
        if (a.items.length < MAX_HELD) a.items.push(taken);
        addGrudge(state, b, a, 'personal');
        return result('success', { itemId: taken });
      }
      scratch(a, 2);
      return result('failure');
    }
    case 'spare':
      addBond(state, a, b, 2);
      return result('only');
    case 'team-heal': {
      const bonus = hasPerkTag(a, 'healer') ? 10 : 0;
      if (fighterCheck(state, a, 'healing', modifier + bonus).success) {
        heal(b, 10);
        addBond(state, a, b, 2);
        return result('success');
      }
      return result('failure');
    }
    case 'share':
      heal(a, 2);
      heal(b, 3);
      addBond(state, a, b, 1);
      return result('only');
    case 'banter':
      addBond(state, a, b, 1);
      return result('only');
    case 'trade': {
      const given = a.items.find((i) => !b.items.includes(i));
      if (!given) throw new Error('Nothing to trade');
      a.items = a.items.filter((i) => i !== given);
      b.items.push(given);
      return result('only', { itemId: given });
    }
    case 'split': {
      a.sideId = `${a.id}:split`;
      a.allianceId = undefined;
      return result('only', { notable: true });
    }
    case 'alliance': {
      const charm = hasPerkTag(a, 'charming') ? 15 : 0;
      const both = isGood(state, a) && isGood(state, b) ? 10 : 0;
      if (
        fighterCheck(state, a, 'persuasion', modifier + charm + both).success
      ) {
        const alliance = a.allianceId ?? b.allianceId ?? `alliance:${a.id}`;
        a.allianceId = alliance;
        b.allianceId = alliance;
        addBond(state, a, b, 3);
        return result('success', { notable: true });
      }
      return result('failure');
    }
    case 'betray': {
      a.allianceId = undefined;
      b.allianceId = undefined;
      addGrudge(state, b, a, 'personal');
      const damage =
        weaponDamage(state, a, bestStyle(state, a)) + 6 + random.int(5);
      if (hurt(state, b, damage, a))
        return result('defeat', { defeated: [b.id], notable: true });
      return result('success', { notable: true });
    }
    case 'protect': {
      const { outcome, defeated } = fight(state, a, c, bestStyle(state, a), 5);
      addBond(state, a, b, 2);
      const map: Record<FightOutcome, string> = {
        defeat: 'defeat',
        defeated: 'defeated',
        win: 'success',
        draw: 'success',
        lose: 'failure',
      };
      return result(map[outcome], { defeated, notable: defeated.length > 0 });
    }
    case 'sacrifice': {
      heal(b, 12);
      a.hp = 0;
      a.standing = false;
      dropItems(state, a);
      a.defeatedRound = state.round;
      a.defeatedBy = c.id;
      c.defeats++;
      return result('only', { defeated: [a.id], notable: true });
    }
    case 'couple': {
      // They leave their teams and alliances, and win or lose together.
      const sideId = `couple:${a.id}`;
      for (const f of [a, b]) {
        f.sideId = sideId;
        f.allianceId = undefined;
      }
      a.partner = b.id;
      b.partner = a.id;
      return result('only', { notable: true });
    }
    case 'jealousy':
      return result('only');
    case 'revenge': {
      const { outcome, defeated } = fight(
        state,
        a,
        b,
        bestStyle(state, a),
        modifier,
      );
      if (defeated.includes(b.id)) delete state.grudges[a.id]?.[b.id];
      return result(outcome, {
        defeated,
        notable: defeated.length > 0 || undefined,
      });
    }
    case 'reconcile': {
      if (fighterCheck(state, a, 'persuasion', modifier).success) {
        delete state.grudges[a.id]?.[b.id];
        delete state.grudges[b.id]?.[a.id];
        addBond(state, a, b, 2);
        return result('success');
      }
      return result('failure');
    }
    case 'melee': {
      // Everyone strikes someone who is not a friend; several may fall.
      const defeated: string[] = [];
      const hurtIds = new Set<string>();
      const dealt = new Map<Fighter, number>();
      for (const attacker of random.shuffle(actors)) {
        if (!attacker.standing) continue;
        const targets = actors.filter(
          (t) => t !== attacker && t.standing && !friends(attacker, t),
        );
        if (!targets.length) continue;
        const target = random.pick(targets);
        const damage = strike(
          state,
          attacker,
          target,
          bestStyle(state, attacker),
          0,
        );
        if (!damage) continue;
        dealt.set(attacker, (dealt.get(attacker) ?? 0) + damage);
        hurtIds.add(target.id);
        if (hurt(state, target, damage, attacker)) defeated.push(target.id);
      }
      const hurtList = [...hurtIds].filter((id) => !defeated.includes(id));
      // A chest: whoever fought best and still stands opens it.
      const best = [...dealt.entries()]
        .filter(([f]) => f.standing)
        .sort((x, y) => y[1] - x[1])[0]?.[0];
      if (kind.loot && best && best.items.length >= MAX_HELD) {
        // Full hands: something is left behind for the chest's contents.
        state.dropped.push(best.items.shift()!);
      }
      const loot =
        kind.loot && best
          ? { looter: best.id, itemId: findItem(state, best) }
          : {};
      return result(
        defeated.length ? 'defeat' : hurtList.length ? 'hurt' : 'none',
        {
          defeated,
          ...(hurtList.length && { hurt: hurtList }),
          ...loot,
          notable: defeated.length > 1 || undefined,
        },
      );
    }
    case 'gang': {
      // a is the target; the others attack together.
      const attackers = actors.slice(1);
      for (const attacker of attackers) {
        if (!a.standing) break;
        const damage = strike(
          state,
          attacker,
          a,
          bestStyle(state, attacker),
          10,
        );
        if (damage && hurt(state, a, damage, attacker)) {
          if (kind.when?.coalition) allyAll(attackers);
          return result('defeat', { defeated: [a.id], notable: true });
        }
      }
      if (kind.when?.coalition) allyAll(attackers);
      return result('escape');
    }
    case 'group-hazard': {
      const defeated: string[] = [];
      const hurtIds: string[] = [];
      for (const f of actors) {
        if (fighterCheck(state, f, skill, modifier).success) continue;
        if (hurt(state, f, (kind.damage ?? 5) + random.int(3)))
          defeated.push(f.id);
        else hurtIds.push(f.id);
      }
      return result(
        defeated.length ? 'defeat' : hurtIds.length ? 'hurt' : 'safe',
        {
          defeated,
          ...(hurtIds.length && { hurt: hurtIds }),
        },
      );
    }
    case 'scavenge': {
      const index = random.int(state.dropped.length);
      const [found] = state.dropped.splice(index, 1);
      a.items.push(found);
      return result('only', { itemId: found });
    }
    case 'feast': {
      for (const f of actors) heal(f, 6);
      for (const f of actors)
        for (const g of actors) if (f.id < g.id) addBond(state, f, g, 2);
      return result('only');
    }
    default:
      throw new Error(`Unknown event type ${kind.type}`);
  }
};
