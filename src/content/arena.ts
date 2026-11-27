import type { Locale } from '../i18n';
import type {
  ArenaSetup,
  Contestant,
  Decree,
  EventResult,
  Fighter,
  Match,
  Phase,
  Round,
  Side,
  Skills,
} from '../types/arena';
import {
  CharacterAlignments,
  CharacterClasses,
  type Character,
} from '../types/character';
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
  leaveArena,
  MAX_GUESTS,
  MAX_HELD,
  type MatchState,
  resolveEvent,
  sameSide,
} from './arenaEvents';
import { ARENA, NAMES, type ArenaEventKind } from './data';
import { balanceOf } from './partyDepth';
import { generateRandomCharacter } from './generate';
import { generateParty, renderParty } from './party';
import { createRandom, newSeed, type Random } from './random';
import { rollSkills } from './skills';
import { compatibleRaceGenders, firstNamesFor } from './template';

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

const NUMERALS = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** A team name nobody else uses in the arena: "The Grey Company II" for a second one. */
const uniqueTeamName = (setup: ArenaSetup, name: string) => {
  const taken = new Set(setup.sides.map((s) => s.name));
  if (!taken.has(name)) return name;
  const free = NUMERALS.map((n) => `${name} ${n}`).find((n) => !taken.has(n));
  return free ?? `${name} ${setup.sides.length + 1}`;
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
          name: uniqueTeamName(setup, renderParty(party, locale).name),
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

const fullName = (c: Pick<Character, 'firstName' | 'lastName'>) =>
  `${c.firstName} ${c.lastName}`;

const namesIn = (setup: ArenaSetup) =>
  new Set(setup.contestants.map((c) => fullName(c.character)));

/** Draws until the result has no name already in the arena (a few tries). */
const fresh = <T>(
  setup: ArenaSetup,
  draw: () => T,
  names: (t: T) => string[],
) => {
  const taken = namesIn(setup);
  let result = draw();
  for (let i = 0; i < 20 && names(result).some((n) => taken.has(n)); i++) {
    result = draw();
  }
  return result;
};

/** Adds random solo contestants, up to the cap, never twice the same name. */
export const addRandom = (setup: ArenaSetup, count: number): ArenaSetup => {
  let next = setup;
  for (let i = 0; i < count; i++) {
    next = addCharacter(
      next,
      fresh(
        next,
        () => generateRandomCharacter(),
        (c) => [fullName(c)],
      ),
    );
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
  'companion-attack',
];

/** Events that feed someone weigh more as hunger grows (spec 013). */
const MEALS = ['forage', 'eat', 'feed'];

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
          hunger: 0,
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
    if (MEALS.includes(kind.type) || kind.effect === 'feed')
      weight *= 1 + a.hunger / 2;
    if (kind.type === 'arrival') {
      if (state.guests >= MAX_GUESTS || state.winner) continue;
      if (state.round < 3 || state.round > state.limit - 2) continue;
      if (kind.guest === 'wanderer' && a.partner) continue;
      if (
        kind.guest === 'gladiator' &&
        Object.values(state.fighters).filter((f) => f.standing).length < 3
      )
        continue;
    }
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
      if (
        kind.type === 'scavenge' &&
        (!state.dropped.length || a.items.length >= MAX_HELD)
      )
        continue;
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
        case 'relic-steal':
          return !!b.relic;
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
        hunger: f.hunger,
        ...(f.allianceId && { allianceId: f.allianceId }),
        ...(f.partner && { partner: f.partner }),
        ...(f.companion && { companion: f.companion }),
        ...(f.relic && { relic: true }),
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

/** A narrator's line between events (maintainer feedback): no rolls, no portraits. */
const announce = (id: string, actors: string[]): EventResult => ({
  eventId: `announce-${id}`,
  outcome: 'only',
  actors,
  defeated: [],
});

export const isAnnouncement = (event: EventResult) =>
  event.eventId.startsWith('announce-');

// --- Guests and decrees (spec 013) ------------------------------------------

const GUEST_CLASSES = {
  gladiator: [
    CharacterClasses.Warrior,
    CharacterClasses.Barbarian,
    CharacterClasses.Paladin,
    CharacterClasses.Ranger,
  ],
  wanderer: Object.values(CharacterClasses),
};

/** A guest drawn from the seed, so the same match always has the same guests. */
const makeGuest = (
  setup: ArenaSetup,
  role: 'gladiator' | 'wanderer',
  number: number,
): { contestant: Contestant; side: Side } => {
  const random = createRandom(`${setup.seed}:guest:${number}`);
  const taken = namesIn(setup);
  const draw = (): Character => {
    const { race, gender } = random.pick(compatibleRaceGenders({}));
    const alignments = Object.values(CharacterAlignments).filter(
      (a) => role === 'gladiator' || !a.endsWith('Evil'),
    );
    return {
      race,
      gender,
      characterClass: random.pick(GUEST_CLASSES[role]),
      alignment: random.pick(alignments),
      age: 18 + random.int(40),
      firstName: random.pick(firstNamesFor(race, gender)),
      lastName: random.pick(NAMES[race].last),
    };
  };
  let character = draw();
  for (let i = 0; i < 20 && taken.has(fullName(character)); i++) {
    character = draw();
  }
  const id = `guest-${number}`;
  const side: Side = { id: `guest:${id}`, kind: 'solo', ties: [] };
  const weapons = ARENA.items.filter((i) => i.kind === 'weapon');
  const perks = random.shuffle(ARENA.perks.map((p) => p.id));
  const contestant: Contestant = {
    id,
    character,
    sideId: side.id,
    guest: role,
    perks:
      role === 'gladiator'
        ? ['perk-brute', perks.find((p) => p !== 'perk-brute')!]
        : perks.slice(0, MAX_PERKS),
    items:
      role === 'gladiator'
        ? [random.pick(weapons).id, 'item-shield']
        : [random.pick(ARENA.items).id],
  };
  return { contestant, side };
};

/** About one match in six gets a decree (spec 013 clarification). */
export const DECREE_CHANCE = 1 / 6;

const planDecree = (
  setup: ArenaSetup,
  limit: number,
): Pick<Decree, 'type' | 'round'> | undefined => {
  const random = createRandom(`${setup.seed}:decree`);
  if (random.next() >= DECREE_CHANCE) return undefined;
  const type = random.pick(['survive', 'relic', 'champion'] as const);
  const round = 3 + random.int(Math.max(1, Math.floor(limit / 2) - 2));
  return round < limit - 1 ? { type, round } : undefined;
};

/** The setup with the guests who entered the match, for texts, cards and summaries. */
export const matchSetup = (setup: ArenaSetup, match: Match): ArenaSetup =>
  match.entrants.length
    ? {
        ...setup,
        contestants: [...setup.contestants, ...match.entrants],
        sides: [...setup.sides, ...match.entrantSides],
      }
    : setup;

/** Plays the whole match from the setup and its seed (spec 012 FR-011 to FR-018). */
export const simulate = (setup: ArenaSetup): Match => {
  const fighters = startFighters(setup);
  // A copy that grows with the guests.
  const live: ArenaSetup = {
    ...setup,
    contestants: [...setup.contestants],
    sides: [...setup.sides],
  };
  const entrants: Contestant[] = [];
  const entrantSides: Side[] = [];
  const all = Object.values(fighters);
  const state: MatchState = {
    setup: live,
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
    dropped: [],
    guests: 0,
    random: createRandom(`${setup.seed}:match`),
  };
  state.enter = (role, host) => {
    const { contestant, side } = makeGuest(live, role, entrants.length + 1);
    live.contestants.push(contestant);
    live.sides.push(side);
    entrants.push(contestant);
    entrantSides.push(side);
    state.characters[contestant.id] = contestant.character;
    const skills = contestantSkills(live, contestant.id);
    const guest: Fighter = {
      id: contestant.id,
      sideId: role === 'wanderer' ? host.sideId : side.id,
      ...(role === 'wanderer' &&
        host.allianceId && { allianceId: host.allianceId }),
      skills,
      hp: skills.hp,
      maxHp: skills.hp,
      items: [...contestant.items],
      perks: [...contestant.perks],
      standing: true,
      defeats: 0,
      luckUsed: false,
      hunger: 0,
    };
    fighters[guest.id] = guest;
    all.push(guest);
    return guest;
  };
  const plan = planDecree(setup, state.limit);
  // Teams whose last member has just fallen get a line of their own.
  const gone = new Set<string>();
  const teamsOut = (result: EventResult) =>
    result.defeated.flatMap((id) => {
      const sideId = fighters[id].sideId;
      const team = live.sides.find((s) => s.id === sideId && s.kind === 'team');
      if (!team || gone.has(sideId)) return [];
      if (all.some((f) => f.standing && f.sideId === sideId)) return [];
      gone.add(sideId);
      return [announce('team-out', [id])];
    });
  const rounds: Round[] = [];
  const phaseOf = (n: number): Phase => (n % 2 === 1 ? 'day' : 'night');
  const standingIds = () => all.filter((f) => f.standing).map((f) => f.id);

  while (
    !state.winner &&
    standingSides(all).size > 1 &&
    state.round < state.limit
  ) {
    state.round++;
    const phase = phaseOf(state.round);
    const events: EventResult[] = [];
    if (plan?.round === state.round && standingSides(all).size > 2) {
      // The arena masters change the rules (spec 013 FR-005).
      const maxDefeats = Math.max(...all.map((f) => f.defeats));
      const lastNight = state.limit - 1 - ((state.limit - 1) % 2);
      const goal =
        plan.type === 'survive'
          ? Math.min(lastNight, state.round + 4 - ((state.round + 4) % 2))
          : plan.type === 'champion'
            ? Math.max(2, maxDefeats + 2)
            : 0;
      if (plan.type !== 'survive' || goal > state.round) {
        state.decree = { ...plan, goal };
        events.push({
          ...announce(`decree-${plan.type}`, []),
          ...(plan.type === 'survive' && { count: goal / 2 + 1 }),
          ...(plan.type === 'champion' && { count: goal }),
        });
      }
    }
    const free = state.random.shuffle(all.filter((f) => f.standing));
    const count = MIN_EVENTS + state.random.int(MAX_EVENTS - MIN_EVENTS + 1);
    const told = () => events.filter((e) => !isAnnouncement(e)).length;
    while (free.length && told() < count) {
      const a = free[0];
      const candidates = candidatesFor(state, a, free, phase);
      const chosen = pickWeighted(state.random, candidates);
      state.rolls = [];
      const before = stateOf(chosen.actors);
      const result = resolveEvent(state, chosen.kind, chosen.actors);
      const actors = result.actors.map((id) => fighters[id]);
      result.before = { ...stateOf(actors), ...before };
      result.after = stateOf(actors);
      if (state.rolls.length) result.rolls = state.rolls;
      events.push(result);
      events.push(...teamsOut(result));
      for (const f of chosen.actors) {
        const index = free.indexOf(f);
        if (index >= 0) free.splice(index, 1);
      }
      const decree = state.decree;
      if (decree?.type === 'champion') {
        const champion = all.find(
          (f) => f.standing && f.defeats >= decree.goal,
        );
        if (champion) state.winner = { sideId: champion.sideId };
      }
      if (state.winner || standingSides(all).size <= 1) break;
    }
    // Hunger grows with every period (spec 013 FR-003).
    for (const f of all) if (f.standing) f.hunger++;
    // The narrator sums up the period: who left the arena, or nobody.
    const fallen = events.flatMap((e) => (isAnnouncement(e) ? [] : e.defeated));
    events.push(
      announce(`${fallen.length ? 'recap' : 'quiet'}-${phase}`, fallen),
    );
    if (
      state.decree?.type === 'survive' &&
      state.round === state.decree.goal &&
      standingSides(all).size > 1
    ) {
      state.winner = { sideId: all.find((f) => f.standing)!.sideId, shared: true };
    }
    if (state.winner && state.decree) {
      const winners = state.winner.shared
        ? standingIds()
        : all
            .filter((f) => f.standing && f.sideId === state.winner!.sideId)
            .map((f) => f.id);
      events.push(announce(`decree-won-${state.decree.type}`, winners));
    }
    rounds.push({ number: state.round, phase, events, after: stateOf(all) });
  }

  if (!state.winner && standingSides(all).size > 1) {
    // The finale: duels between the last sides until one remains, the winner
    // of each duel facing the next opponent (maintainer feedback).
    state.round++;
    const events: EventResult[] = [announce('finale', standingIds())];
    let champion: Fighter | undefined;
    while (standingSides(all).size > 1) {
      const standing = state.random.shuffle(all.filter((f) => f.standing));
      const a = champion?.standing ? champion : standing[0];
      const b = standing.find((f) => f.sideId !== a.sideId)!;
      if (champion) events.push(announce('next-duel', [a.id, b.id]));
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
        leaveArena(state, loser);
        loser.defeatedRound = state.round;
        loser.defeatedBy = winner.id;
        winner.defeats++;
        result.outcome = loser === a ? 'defeated' : 'defeat';
        result.defeated = [loser.id];
      }
      result.notable = true;
      result.after = stateOf([a, b]);
      events.push(result);
      champion = a.standing ? a : b;
    }
    rounds.push({
      number: state.round,
      phase: phaseOf(state.round),
      events,
      after: stateOf(all),
    });
  }

  const winnerSideId =
    state.winner?.sideId ?? all.find((f) => f.standing)!.sideId;
  return {
    rounds,
    winnerSideId,
    fighters,
    entrants,
    entrantSides,
    ...(state.decree && { decree: state.decree }),
    ...(state.winner?.shared && { shared: true }),
  };
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
  /** Everyone standing won together (a survival decree, spec 013). */
  shared: boolean;
  /** The decree that changed the end, if any. */
  decree?: Decree['type'];
};

const MAX_MOMENTS = 5;

/** The end of a match: winner, defeats and notable moments (spec 012 FR-017). */
export const summarize = (setup: ArenaSetup, match: Match): MatchSummary => {
  const fighters = Object.values(match.fighters);
  const winners = fighters
    .filter((f) =>
      match.shared ? f.standing : f.sideId === match.winnerSideId,
    )
    .sort((a, b) => Number(b.standing) - Number(a.standing))
    .map((f) => f.id);
  const rows = matchSetup(setup, match).contestants
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
  const events = match.rounds
    .flatMap((r) => r.events)
    .filter((e) => !isAnnouncement(e));
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
    couple: !match.shared && match.winnerSideId.startsWith('couple:'),
    shared: !!match.shared,
    ...(match.decree && { decree: match.decree.type }),
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
        : addParty(
            next,
            fresh(
              next,
              () => generateParty({ size }),
              (party) => party.members.map((m) => fullName(m.character)),
            ),
            locale,
          );
  }
  return next;
};
