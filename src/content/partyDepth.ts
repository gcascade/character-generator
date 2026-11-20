import type { Locale } from '../i18n';
import type { Character, Gender } from '../types/character';
import type {
  BalanceArea,
  HookRefs,
  Party,
  PartyMember,
  RoleId,
  Tie,
} from '../types/party';
import { DEPTH_TEXTS, HOOK_IDS, ROLES, TIE_TYPES } from './data';
import { selectGender } from './renderText';

/*
 * Party depth (spec 008): ties between members, roles, balance and the
 * adventure starting point. Pure functions over the party data.
 */

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const weighted = <T>(items: readonly T[], weight: (item: T) => number): T => {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= weight(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
};

// --- Ties (research R1) -------------------------------------------------------

export const MAX_TIES_PER_MEMBER = 2;

/** Relative chances of 0, 1, 2… ties: some parties have none (SC-001). */
const TIE_COUNT_WEIGHTS = [1, 1.4, 1.1, 0.5, 0.3];

const maxTies = (size: number) => Math.floor(size / 2) + 1;

const tiesOf = (ties: readonly Tie[], memberId: string) =>
  ties.filter((t) => t.from === memberId || t.to === memberId).length;

const samePair = (tie: Tie, a: string, b: string) =>
  (tie.from === a && tie.to === b) || (tie.from === b && tie.to === a);

/** A new tie between two members who can still have one, or undefined. */
const newTie = (
  members: readonly PartyMember[],
  ties: readonly Tie[],
  only?: string,
): Tie | undefined => {
  const free = members.filter((m) => tiesOf(ties, m.id) < MAX_TIES_PER_MEMBER);
  const pairs = free.flatMap((a, i) =>
    free
      .slice(i + 1)
      .filter((b) => !ties.some((t) => samePair(t, a.id, b.id)))
      .filter((b) => !only || a.id === only || b.id === only)
      .map((b) => [a, b] as const),
  );
  if (!pairs.length) return undefined;
  const [a, b] = shuffle(pick(pairs));
  return {
    id: crypto.randomUUID(),
    type: pick(TIE_TYPES).id,
    from: a.id,
    to: b.id,
  };
};

/** Ties for a party; `kept` ties (between kept members) stay and count. */
export const drawTies = (
  members: readonly PartyMember[],
  kept: readonly Tie[] = [],
): Tie[] => {
  const counts = TIE_COUNT_WEIGHTS.slice(0, maxTies(members.length) + 1);
  const target = weighted(
    counts.map((_, i) => i),
    (i) => counts[i],
  );
  const ties = [...kept];
  while (ties.length < target) {
    const tie = newTie(members, ties);
    if (!tie) break;
    ties.push(tie);
  }
  return ties;
};

export const removeTie = (party: Party, tieId: string): Party => ({
  ...party,
  ties: (party.ties ?? []).filter((t) => t.id !== tieId),
});

/** Another tie type between the same two members. */
export const rerollTie = (party: Party, tieId: string): Party => ({
  ...party,
  ties: (party.ties ?? []).map((t) =>
    t.id === tieId
      ? {
          ...t,
          type: pick(TIE_TYPES.filter((type) => type.id !== t.type)).id,
          ...(Math.random() < 0.5 && { from: t.to, to: t.from }),
        }
      : t,
  ),
});

/** Ties after a member was replaced: theirs are gone, the newcomer may get one. */
export const tiesAfterReplacing = (
  ties: readonly Tie[],
  oldId: string,
  members: readonly PartyMember[],
  newId: string,
): Tie[] => {
  const kept = ties.filter((t) => t.from !== oldId && t.to !== oldId);
  if (Math.random() < 0.5) return kept;
  const tie = newTie(members, kept, newId);
  return tie ? [...kept, tie] : kept;
};

export const renderTie = (tie: Tie, party: Party, locale: Locale) => {
  const name = (id: string) =>
    party.members.find((m) => m.id === id)?.character.firstName ?? '';
  return (DEPTH_TEXTS[locale].ties[tie.type] ?? '')
    .replaceAll('{a}', name(tie.from))
    .replaceAll('{b}', name(tie.to));
};

// --- Roles (research R2) ------------------------------------------------------

/** Every class can get every role, some just rarely. */
const ROLE_FLOOR = 0.3;
export const MAX_SAME_ROLE = 2;

const roleWeight = (roleId: RoleId, character: Character) => {
  const role = ROLES.find((r) => r.id === roleId)!;
  const { alignment } = character;
  const bonus =
    (alignment.startsWith('Lawful') ? (role.alignment.lawful ?? 0) : 0) +
    (alignment.startsWith('Chaotic') ? (role.alignment.chaotic ?? 0) : 0) +
    (alignment.endsWith('Good') ? (role.alignment.good ?? 0) : 0) +
    (alignment.endsWith('Evil') ? (role.alignment.evil ?? 0) : 0);
  return Math.max(role.classes[character.characterClass], ROLE_FLOOR) + bonus;
};

/** Roles still allowed given the roles already taken. */
const allowedRoles = (taken: readonly (RoleId | undefined)[]) =>
  ROLES.filter((role) => {
    const count = taken.filter((t) => t === role.id).length;
    return role.unique ? count === 0 : count < MAX_SAME_ROLE;
  }).map((r) => r.id);

const drawRole = (
  character: Character,
  taken: readonly (RoleId | undefined)[],
) => weighted(allowedRoles(taken), (role) => roleWeight(role, character));

/** Gives a role to every member without one (kept roles stay), in random order. */
export const assignRoles = (members: readonly PartyMember[]): PartyMember[] => {
  const result = [...members];
  for (const index of shuffle(result.map((_, i) => i))) {
    if (result[index].role) continue;
    const taken = result.map((m) => m.role);
    result[index] = {
      ...result[index],
      role: drawRole(result[index].character, taken),
    };
  }
  return result;
};

/**
 * Sets a member's role, or draws one at random. A unique role chosen by hand
 * is taken from the member who had it, who gets another role.
 */
export const setRole = (
  party: Party,
  memberId: string,
  role: RoleId | 'random',
): Party => {
  const target = party.members.find((m) => m.id === memberId);
  if (!target) return party;
  const others = party.members.filter((m) => m.id !== memberId);
  const allowed = allowedRoles(others.map((m) => m.role));
  // "Random" gives another role whenever there is one.
  const alternatives = allowed.filter((r) => r !== target.role);
  const chosen =
    role === 'random'
      ? weighted(alternatives.length ? alternatives : allowed, (r) =>
          roleWeight(r, target.character),
        )
      : role;
  const definition = ROLES.find((r) => r.id === chosen);
  let members = party.members.map((m) =>
    m.id === memberId ? { ...m, role: chosen } : m,
  );
  const holders = members.filter((m) => m.role === chosen && m.id !== memberId);
  const limit = definition?.unique ? 0 : MAX_SAME_ROLE - 1;
  if (holders.length > limit) {
    const displaced = holders[0].id;
    members = assignRoles(
      members.map((m) => (m.id === displaced ? { ...m, role: undefined } : m)),
    );
  }
  return { ...party, members };
};

export const roleLabel = (role: RoleId, gender: Gender, locale: Locale) =>
  selectGender(DEPTH_TEXTS[locale].roles[role] ?? role, gender);

export const ROLE_IDS = ROLES.map((r) => r.id);

// --- Balance (research R3) ----------------------------------------------------

export const BALANCE_AREAS: BalanceArea[] = [
  'fighting',
  'magic',
  'healing',
  'stealth',
  'talking',
];

const CLASS_POINTS: Record<
  Character['characterClass'],
  Partial<Record<BalanceArea, number>>
> = {
  Warrior: { fighting: 2 },
  Mage: { magic: 2 },
  Rogue: { stealth: 2, talking: 1 },
  Cleric: { healing: 2, magic: 1 },
  Ranger: { fighting: 1, stealth: 1 },
  Paladin: { fighting: 1, healing: 1 },
  Bard: { talking: 2 },
  Druid: { healing: 1, magic: 1 },
  Barbarian: { fighting: 2 },
};

export type BalanceLevel = 0 | 1 | 2 | 3;

const level = (points: number): BalanceLevel =>
  points === 0 ? 0 : points === 1 ? 1 : points <= 3 ? 2 : 3;

/** How well the party covers each area: none, weak, good or strong. */
export const balanceOf = (party: Pick<Party, 'members'>) => {
  const points: Record<BalanceArea, number> = {
    fighting: 0,
    magic: 0,
    healing: 0,
    stealth: 0,
    talking: 0,
  };
  for (const { character, role } of party.members) {
    for (const [area, value] of Object.entries(
      CLASS_POINTS[character.characterClass],
    )) {
      points[area as BalanceArea] += value;
    }
    const area = ROLES.find((r) => r.id === role)?.area;
    if (area) points[area] += 1;
  }
  return Object.fromEntries(
    BALANCE_AREAS.map((area) => [area, level(points[area])]),
  ) as Record<BalanceArea, BalanceLevel>;
};

export const gaps = (party: Pick<Party, 'members'>) => {
  const balance = balanceOf(party);
  return BALANCE_AREAS.filter((area) => balance[area] === 0);
};

// --- Adventure hook (research R4) ---------------------------------------------

export const drawHook = (): HookRefs => ({
  placeId: pick(HOOK_IDS.place),
  patronId: pick(HOOK_IDS.patron),
  threatId: pick(HOOK_IDS.threat),
});

/** Another starting point; an AI-written one is dropped. */
export const rerollHook = (party: Party): Party => {
  let hook = drawHook();
  while (
    party.hook &&
    hook.placeId === party.hook.placeId &&
    hook.patronId === party.hook.patronId &&
    hook.threatId === party.hook.threatId
  ) {
    hook = drawHook();
  }
  const text = party.text && { ...party.text };
  if (text) delete text.hook;
  return { ...party, hook, ...(text && { text }) };
};

/** The starting point in the interface language (AI text as written). */
export const renderHook = (party: Party, locale: Locale): string => {
  if (party.text?.hook) return party.text.hook;
  if (!party.hook) return '';
  const texts = DEPTH_TEXTS[locale].hooks;
  const { placeId, patronId, threatId } = party.hook;
  return `${texts[placeId]}, ${texts[patronId]}. ${texts[threatId]}`;
};

// --- Older parties --------------------------------------------------------------

/** Gives roles, a hook and an empty tie list to parties made before spec 008. */
export const completeParty = (party: Party): Party => ({
  ...party,
  members: party.members.every((m) => m.role)
    ? party.members
    : assignRoles(party.members),
  ties: party.ties ?? [],
  hook: party.hook ?? drawHook(),
});
