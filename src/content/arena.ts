import type { Locale } from '../i18n';
import type {
  ArenaSetup,
  Contestant,
  EventResult,
  Fighter,
  Match,
  Phase,
  Round,
  Side,
  Skills,
} from '../types/arena';
import type { Character } from '../types/character';
import type { Party } from '../types/party';
import {
  allied,
  bondOf,
  COUPLE_BOND,
  fitsActor,
  friendly,
  friends,
  grudgeOf,
  hasItemTag,
  hostile,
  isGood,
  isWounded,
  MAX_HELD,
  type MatchState,
  resolveEvent,
  sameSide,
} from './arenaEvents';
import { ARENA, type ArenaEventKind } from './data';
import { balanceOf } from './partyDepth';
import { generateRandomCharacter } from './generate';
import { generateParty, renderParty } from './party';
import { createRandom, newSeed, type Random } from './random';
import { rollSkills } from './skills';

export const MAX_CONTESTANTS = 48;
export const MAX_PERKS = 2;
export const MAX_ITEMS = 3;

/** Short ids keep share links small; contestant ids also seed their skills. */
const uuid = () => newSeed();

export const emptySetup = (): ArenaSetup => ({
  contestants: [],
  sides: [],
  seed: newSeed(),
  shownRounds: 0,
});

/** A copy of a character for the arena: no saved id, so the roster never edits it. */
const snapshot = (character: Character): Character => {
  const copy = { ...character };
  delete copy.id;
  return copy;
};

const room = (setup: ArenaSetup) => MAX_CONTESTANTS - setup.contestants.length;

export const isEnrolled = (setup: ArenaSetup, sourceId: string) =>
  setup.contestants.some((c) => c.sourceId === sourceId);

/** Adds a solo contestant; ignored when the arena is full or the character is already in. */
export const addCharacter = (
  setup: ArenaSetup,
  character: Character,
  sourceId = character.id,
): ArenaSetup => {
  if (room(setup) < 1 || (sourceId && isEnrolled(setup, sourceId))) {
    return setup;
  }
  const id = uuid();
  return {
    ...setup,
    shownRounds: 0,
    contestants: [
      ...setup.contestants,
      {
        id,
        character: snapshot(character),
        sideId: id,
        perks: [],
        items: [],
        sourceId,
      },
    ],
    sides: [...setup.sides, { id, kind: 'solo', ties: [] }],
  };
};

/** Adds a party as one team, with its roles and ties (members already enrolled are skipped). */
export const addParty = (
  setup: ArenaSetup,
  party: Party,
  locale: Locale,
): ArenaSetup => {
  const members = party.members
    .filter((m) => !isEnrolled(setup, `${party.id}:${m.id}`))
    .slice(0, room(setup));
  if (!members.length) return setup;
  const sideId = uuid();
  const ids = new Map(members.map((m) => [m.id, uuid()]));
  const contestants: Contestant[] = members.map((m) => ({
    id: ids.get(m.id)!,
    character: snapshot(m.character),
    sideId,
    ...(m.role && { role: m.role }),
    perks: [],
    items: [],
    sourceId: `${party.id}:${m.id}`,
  }));
  const ties = (party.ties ?? [])
    .filter((tie) => ids.has(tie.from) && ids.has(tie.to))
    .map((tie) => ({ ...tie, from: ids.get(tie.from)!, to: ids.get(tie.to)! }));
  const side: Side =
    contestants.length > 1
      ? {
          id: sideId,
          kind: 'team',
          name: renderParty(party, locale).name,
          ties,
        }
      : { id: sideId, kind: 'solo', ties: [] };
  return {
    ...setup,
    shownRounds: 0,
    contestants: [...setup.contestants, ...contestants],
    sides: [...setup.sides, side],
  };
};

/** Adds random solo contestants, up to the cap. */
export const addRandom = (setup: ArenaSetup, count: number): ArenaSetup => {
  let next = setup;
  for (let i = 0; i < count; i++) {
    next = addCharacter(next, generateRandomCharacter());
  }
  return next;
};

/** Removes a contestant; a team left with one member becomes solo, an empty side goes. */
export const removeContestant = (setup: ArenaSetup, id: string): ArenaSetup => {
  const removed = setup.contestants.find((c) => c.id === id);
  if (!removed) return setup;
  const contestants = setup.contestants.filter((c) => c.id !== id);
  const sides = setup.sides.flatMap((side): Side[] => {
    if (side.id !== removed.sideId) return [side];
    const left = contestants.filter((c) => c.sideId === side.id);
    if (!left.length) return [];
    return [
      {
        ...side,
        kind: left.length > 1 ? 'team' : 'solo',
        ...(left.length < 2 && { name: undefined }),
        ties: side.ties.filter((t) => t.from !== id && t.to !== id),
      },
    ];
  });
  return { ...setup, contestants, sides, shownRounds: 0 };
};

export type StartCheck =
  { ok: true } | { ok: false; reason: 'too-few-sides' | 'too-many' };

export const canStart = (setup: ArenaSetup): StartCheck =>
  setup.contestants.length > MAX_CONTESTANTS
    ? { ok: false, reason: 'too-many' }
    : new Set(setup.contestants.map((c) => c.sideId)).size < 2
      ? { ok: false, reason: 'too-few-sides' }
      : { ok: true };

/** Skills of a contestant in this match: their own random stream, so others never change them. */
export const contestantSkills = (setup: ArenaSetup, id: string): Skills => {
  const contestant = setup.contestants.find((c) => c.id === id);
  if (!contestant) throw new Error(`Unknown contestant ${id}`);
  const skills = rollSkills(
    contestant.character,
    createRandom(`${setup.seed}:skills:${id}`),
  );
  const bonusHp = [
    ...contestant.perks.map((p) => ARENA.perks.find((d) => d.id === p)?.hp),
    ...contestant.items.map((i) => ARENA.items.find((d) => d.id === i)?.hp),
  ].reduce<number>((sum, hp) => sum + (hp ?? 0), 0);
  return { ...skills, hp: skills.hp + bonusHp };
};

const known = (ids: readonly string[], list: readonly { id: string }[]) =>
  ids.filter((id) => list.some((d) => d.id === id));

const update = (
  setup: ArenaSetup,
  id: string,
  change: (c: Contestant) => Contestant,
): ArenaSetup => ({
  ...setup,
  shownRounds: 0,
  contestants: setup.contestants.map((c) => (c.id === id ? change(c) : c)),
});

/** At most two different known perks. */
export const setPerks = (setup: ArenaSetup, id: string, perks: string[]) =>
  update(setup, id, (c) => ({
    ...c,
    perks: [...new Set(known(perks, ARENA.perks))].slice(0, MAX_PERKS),
  }));

/** At most three known items. */
export const setItems = (setup: ArenaSetup, id: string, items: string[]) =>
  update(setup, id, (c) => ({
    ...c,
    items: known(items, ARENA.items).slice(0, MAX_ITEMS),
  }));

/** Two random perks and one to three random items for everyone. */
export const randomLoadouts = (
  setup: ArenaSetup,
  random: Random = createRandom(newSeed()),
): ArenaSetup => ({
  ...setup,
  shownRounds: 0,
  contestants: setup.contestants.map((c) => ({
    ...c,
    perks: random.shuffle(ARENA.perks.map((p) => p.id)).slice(0, MAX_PERKS),
    items: random
      .shuffle(ARENA.items.map((i) => i.id))
      .slice(0, 1 + random.int(MAX_ITEMS)),
  })),
});

// --- The match (spec 012 US2) -------------------------------------------------

/** Bonus per well-covered area beyond the first (research R5). */
export const BALANCE_BONUS = 4;

/** Round after which the arena forces a finale (research R6). */
export const roundLimit = (contestantCount: number) =>
  Math.min(60, 4 + Math.ceil(contestantCount * 0.9));

/** Events told per day or night: 4 to 6 (maintainer feedback). */
export const MIN_EVENTS = 4;
export const MAX_EVENTS = 6;

const FIGHTS = [
  'fight',
  'ambush',
  'finish',
  'betray',
  'revenge',
  'melee',
  'gang',
];

const standingSides = (fighters: Fighter[]) =>
  new Set(fighters.filter((f) => f.standing).map((f) => f.sideId));

const startFighters = (setup: ArenaSetup) =>
  Object.fromEntries(
    setup.contestants.map((c): [string, Fighter] => {
      const skills = contestantSkills(setup, c.id);
      return [
        c.id,
        {
          id: c.id,
          sideId: c.sideId,
          skills,
          hp: skills.hp,
          maxHp: skills.hp,
          items: [...c.items],
          perks: [...c.perks],
          standing: true,
          defeats: 0,
          luckUsed: false,
        },
      ];
    }),
  );

const teamBalance = (setup: ArenaSetup) => {
  const balance: MatchState['balance'] = {};
  for (const side of setup.sides) {
    if (side.kind !== 'team') continue;
    const members = setup.contestants.filter((c) => c.sideId === side.id);
    const levels = balanceOf({
      members: members.map((m) => ({
        id: m.id,
        character: m.character,
        locked: false,
        role: m.role,
      })),
    });
    // A team that covers many areas well gets a bonus on every check (research R5).
    const covered = Object.values(levels).filter((level) => level >= 2).length;
    const bonus = BALANCE_BONUS * Math.max(0, covered - 1);
    for (const m of members) balance[m.id] = bonus;
  }
  return balance;
};

type Candidate = { kind: ArenaEventKind; actors: Fighter[]; weight: number };

/** The event kinds that can happen to a now, with their partners and weights. */
const originalSide = (state: MatchState, f: Fighter) =>
  state.setup.contestants.find((c) => c.id === f.id)?.sideId;

/** The actors of a group event, or nothing when the group cannot gather (research R12). */
const groupFor = (
  state: MatchState,
  kind: ArenaEventKind,
  a: Fighter,
  others: Fighter[],
): Fighter[] | undefined => {
  const { random } = state;
  const some = (pool: Fighter[], min: number, max: number) =>
    pool.length < min
      ? undefined
      : random.shuffle(pool).slice(0, min + random.int(max - min + 1));
  switch (kind.type) {
    case 'melee': {
      const group = some(others, 2, 4);
      return group && group.some((f) => !friends(a, f))
        ? [a, ...group]
        : undefined;
    }
    case 'gang': {
      if (kind.when?.coalition) {
        // The most dangerous contestant against those who are not their friends.
        const foes = others.filter((f) => !friends(a, f) && f.defeats > 0);
        if (!foes.length) return undefined;
        const target = foes.reduce((x, y) => (y.defeats > x.defeats ? y : x));
        const helpers = some(
          others.filter(
            (f) => f !== target && !friends(f, target) && !sameSide(f, a),
          ),
          1,
          2,
        );
        return helpers && [target, a, ...helpers];
      }
      // A team (or an alliance, or a couple) falls on someone.
      // A team (or an alliance, or a couple) falls on someone who is a foe of all of them.
      const mates = some(
        others.filter((f) => friends(a, f)),
        1,
        3,
      );
      if (!mates) return undefined;
      const attackers = [a, ...mates];
      const foes = others.filter(
        (f) => !attackers.includes(f) && attackers.every((x) => !friends(x, f)),
      );
      if (!foes.length) return undefined;
      return [random.pick(foes), ...attackers];
    }
    case 'group-hazard': {
      const group = some(others, 2, 4);
      return group && [a, ...group];
    }
    case 'feast': {
      const group = some(others, 2, 5);
      return group && [a, ...group];
    }
    default:
      return undefined;
  }
};

const candidatesFor = (
  state: MatchState,
  a: Fighter,
  free: Fighter[],
  phase: Phase,
): Candidate[] => {
  const list: Candidate[] = [];
  const others = free.filter((f) => f !== a && f.standing);
  for (const kind of ARENA.events) {
    if (kind.phase && kind.phase !== phase) continue;
    if (kind.type === 'finale') continue;
    if (!fitsActor(state, kind, a)) continue;
    const when = kind.when ?? {};
    let weight = kind.weight;
    if (FIGHTS.includes(kind.type)) weight *= 1.5 + state.round * 0.5;
    if (kind.type === 'arena') {
      // The arena tightens in the second half of the match, deadly at the very end.
      if (state.round < Math.ceil(state.limit * 0.4)) continue;
      weight *= (10 * state.round) / state.limit;
      if (state.round >= state.limit - 1) weight *= 5;
    }
    if (kind.actors === 1) {
      if (kind.type === 'potion' && !(isWounded(a) && hasItemTag(a, 'heal')))
        continue;
      if (kind.type === 'gift' && a.items.length >= MAX_HELD) continue;
      list.push({ kind, actors: [a], weight });
      continue;
    }
    const fits = (b: Fighter) => {
      if (kind.relation === 'friend' && !friends(a, b)) return false;
      if (kind.relation === 'foe' && friends(a, b)) return false;
      if (when.targetWounded && !isWounded(b)) return false;
      if (when.couple && a.partner !== b.id) return false;
      if (when.grudge && grudgeOf(state, a, b) !== when.grudge) return false;
      if (when.tie === 'friendly' && !friendly(state, a, b)) return false;
      if (when.tie === 'hostile' && !hostile(state, a, b)) return false;
      switch (kind.type) {
        case 'steal':
          return b.items.length > 0;
        case 'trade':
          return (
            b.items.length < MAX_HELD &&
            a.items.some((i) => !b.items.includes(i))
          );
        case 'split':
          return sameSide(a, b) && !a.partner;
        case 'couple':
          return (
            !a.partner &&
            !b.partner &&
            !sameSide(a, b) &&
            bondOf(state, a, b) >= COUPLE_BOND
          );
        case 'jealousy':
          return (
            !!b.partner &&
            b.partner !== a.id &&
            a.sideId === originalSide(state, b)
          );
        case 'reconcile':
          return !!grudgeOf(state, a, b) || !!grudgeOf(state, b, a);
        case 'betray':
          return allied(a, b) && !sameSide(a, b);
        case 'alliance': {
          const size = (id?: string) =>
            id
              ? Object.values(state.fighters).filter(
                  (f) => f.standing && f.allianceId === id,
                ).length
              : 1;
          return size(a.allianceId) + size(b.allianceId) <= 3;
        }
        default:
          return true;
      }
    };
    if (kind.actors === 'group') {
      const group = groupFor(state, kind, a, others);
      if (group) list.push({ kind, actors: group, weight });
      continue;
    }
    if (kind.actors === 2) {
      const partners = others.filter(fits);
      if (!partners.length) continue;
      if (kind.type === 'split' && isGood(state, a)) weight *= 0.3;
      list.push({ kind, actors: [a, state.random.pick(partners)], weight });
      continue;
    }
    // Three actors: a protects (or gives their life for) b against c.
    const protegees = others.filter(
      (b) =>
        friends(a, b) &&
        isWounded(b) &&
        (!when.couple || a.partner === b.id) &&
        (kind.type === 'sacrifice'
          ? friendly(state, a, b) || a.partner === b.id
          : friendly(state, a, b) ||
            a.partner === b.id ||
            isGood(state, a) ||
            state.setup.contestants.find((c) => c.id === a.id)?.role ===
              'role-leader'),
    );
    const foes = others.filter((c) => !friends(a, c));
    if (!protegees.length || !foes.length) continue;
    const b = state.random.pick(protegees);
    const c = state.random.pick(foes.filter((f) => f !== b));
    if (!c) continue;
    list.push({ kind, actors: [a, b, c], weight });
  }
  return list;
};

const stateOf = (fighters: Fighter[]): Round['after'] =>
  Object.fromEntries(
    fighters.map((f) => [
      f.id,
      {
        hp: Math.max(0, f.hp),
        maxHp: f.maxHp,
        items: [...f.items],
        standing: f.standing,
        sideId: f.sideId,
        defeats: f.defeats,
        ...(f.allianceId && { allianceId: f.allianceId }),
        ...(f.partner && { partner: f.partner }),
      },
    ]),
  );

const pickWeighted = (random: Random, candidates: Candidate[]) => {
  const total = candidates.reduce((sum, c) => sum + c.weight, 0);
  let roll = random.next() * total;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll < 0) return candidate;
  }
  return candidates[candidates.length - 1];
};

/** Plays the whole match from the setup and its seed (spec 012 FR-011 to FR-018). */
export const simulate = (setup: ArenaSetup): Match => {
  const fighters = startFighters(setup);
  const state: MatchState = {
    setup,
    fighters,
    characters: Object.fromEntries(
      setup.contestants.map((c) => [c.id, c.character]),
    ),
    balance: teamBalance(setup),
    round: 0,
    limit: roundLimit(setup.contestants.length),
    rolls: [],
    bonds: {},
    grudges: {},
    random: createRandom(`${setup.seed}:match`),
  };
  const all = Object.values(fighters);
  const rounds: Round[] = [];
  const phaseOf = (n: number): Phase => (n % 2 === 1 ? 'day' : 'night');

  while (standingSides(all).size > 1 && state.round < state.limit) {
    state.round++;
    const phase = phaseOf(state.round);
    const events: EventResult[] = [];
    const free = state.random.shuffle(all.filter((f) => f.standing));
    const count = MIN_EVENTS + state.random.int(MAX_EVENTS - MIN_EVENTS + 1);
    while (free.length && events.length < count) {
      const a = free[0];
      const candidates = candidatesFor(state, a, free, phase);
      const chosen = pickWeighted(state.random, candidates);
      state.rolls = [];
      const before = stateOf(chosen.actors);
      const result = resolveEvent(state, chosen.kind, chosen.actors);
      result.before = before;
      if (state.rolls.length) result.rolls = state.rolls;
      events.push(result);
      for (const f of chosen.actors) {
        const index = free.indexOf(f);
        if (index >= 0) free.splice(index, 1);
      }
      if (standingSides(all).size <= 1) break;
    }
    rounds.push({ number: state.round, phase, events, after: stateOf(all) });
  }

  if (standingSides(all).size > 1) {
    // The finale: duels between the last sides until one remains.
    state.round++;
    const events: EventResult[] = [];
    while (standingSides(all).size > 1) {
      const standing = state.random.shuffle(all.filter((f) => f.standing));
      const a = standing[0];
      const b = standing.find((f) => f.sideId !== a.sideId)!;
      const honour = isGood(state, a) && isGood(state, b);
      const kind = ARENA.events.find(
        (e) => e.type === 'finale' && (e.when?.alignment === 'good') === honour,
      )!;
      state.rolls = [];
      const before = stateOf([a, b]);
      const result = resolveEvent(state, kind, [a, b]);
      result.before = before;
      if (!result.defeated.length) {
        // Nobody fell after a long duel: the more wounded yields.
        const loser = a.hp / a.maxHp < b.hp / b.maxHp ? a : b;
        const winner = loser === a ? b : a;
        loser.hp = 0;
        loser.standing = false;
        loser.defeatedRound = state.round;
        loser.defeatedBy = winner.id;
        winner.defeats++;
        result.outcome = loser === a ? 'defeated' : 'defeat';
        result.defeated = [loser.id];
      }
      result.notable = true;
      events.push(result);
    }
    rounds.push({
      number: state.round,
      phase: phaseOf(state.round),
      events,
      after: stateOf(all),
    });
  }

  const winner = all.find((f) => f.standing)!;
  return { rounds, winnerSideId: winner.sideId, fighters };
};

export type MatchSummary = {
  /** Contestants of the winning side, standing ones first. */
  winners: string[];
  /** Every contestant: defeats caused and the round they fell (none for survivors). */
  rows: { id: string; defeats: number; defeatedRound?: number }[];
  /** Up to five notable moments, in the order they happened. */
  moments: EventResult[];
  /** The winners are a couple formed during the match. */
  couple: boolean;
};

const MAX_MOMENTS = 5;

/** The end of a match: winner, defeats and notable moments (spec 012 FR-017). */
export const summarize = (setup: ArenaSetup, match: Match): MatchSummary => {
  const fighters = Object.values(match.fighters);
  const winners = fighters
    .filter((f) => f.sideId === match.winnerSideId)
    .sort((a, b) => Number(b.standing) - Number(a.standing))
    .map((f) => f.id);
  const rows = setup.contestants
    .map((c) => match.fighters[c.id])
    .map((f) => ({
      id: f.id,
      defeats: f.defeats,
      ...(f.defeatedRound !== undefined && { defeatedRound: f.defeatedRound }),
    }))
    .sort(
      (a, b) =>
        (b.defeatedRound ?? Infinity) - (a.defeatedRound ?? Infinity) ||
        b.defeats - a.defeats,
    );
  const events = match.rounds.flatMap((r) => r.events);
  const notable = events.filter((e) => e.notable);
  // Defeats by another contestant make better moments than those by the arena.
  const byHand = (e: EventResult) =>
    e.defeated.some((id) => match.fighters[id].defeatedBy !== undefined);
  const defeats = events
    .filter((e) => !e.notable && e.defeated.length)
    .sort((x, y) => Number(byHand(x)) - Number(byHand(y)));
  // Notable moments first, then the latest defeats, and always the last event.
  const chosen = new Set<EventResult>(notable.slice(-(MAX_MOMENTS - 1)));
  for (const e of defeats.reverse()) {
    if (chosen.size >= MAX_MOMENTS - 1) break;
    chosen.add(e);
  }
  const last = events.at(-1);
  if (last) chosen.add(last);
  for (const e of [...events].reverse()) {
    if (chosen.size >= 3) break;
    chosen.add(e);
  }
  const moments = events.filter((e) => chosen.has(e)).slice(-MAX_MOMENTS);
  return {
    winners,
    rows,
    moments,
    couple: match.winnerSideId.startsWith('couple:'),
  };
};

export type FillShape = number | 'mixed';

/**
 * Fills the arena up to `target` contestants with random characters: solos
 * (shape 1), random parties of `shape` members, or a mix of both.
 */
export const fillRoster = (
  setup: ArenaSetup,
  target: number,
  shape: FillShape,
  locale: Locale,
  random: Random = createRandom(newSeed()),
): ArenaSetup => {
  let next = setup;
  const goal = Math.min(MAX_CONTESTANTS, target);
  while (next.contestants.length < goal) {
    const left = goal - next.contestants.length;
    const size = Math.min(left, shape === 'mixed' ? 1 + random.int(4) : shape);
    next =
      size < 2
        ? addRandom(next, 1)
        : addParty(next, generateParty({ size }), locale);
  }
  return next;
};
