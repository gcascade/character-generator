import type { Locale } from '../i18n';
import type { ArenaSetup, Contestant, Side, Skills } from '../types/arena';
import type { Character } from '../types/character';
import type { Party } from '../types/party';
import { ARENA } from './data';
import { generateRandomCharacter } from './generate';
import { renderParty } from './party';
import { createRandom, newSeed, type Random } from './random';
import { rollSkills } from './skills';

export const MAX_CONTESTANTS = 48;
export const MAX_PERKS = 2;
export const MAX_ITEMS = 3;

const uuid = () => crypto.randomUUID();

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
