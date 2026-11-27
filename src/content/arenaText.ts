import type { Locale } from '../i18n';
import type { ArenaSetup, EventResult, Round } from '../types/arena';
import type { Gender } from '../types/character';
import { ARENA, ARENA_TEXTS } from './data';
import { capitalize } from './renderText';

export type TextActor = { firstName: string; gender: Gender };

export type TextExtras = {
  item?: string;
  theItem?: string;
  team?: string;
  animal?: string;
  theAnimal?: string;
  /** A day or a number of defeats (decrees). */
  count?: string;
  /** Lists of actor indexes: `{all}`, `{others}`, `{fallen}`, `{hurt}` (group events). */
  lists?: Partial<
    Record<'all' | 'others' | 'fallen' | 'hurt' | 'looter', number[]>
  >;
  /** The word joining the last two names of a list ("and", "et"). */
  and?: string;
};

const ACTORS = ['a', 'b', 'c'] as const;

// `{{a:masculine|feminine|non-binary}}`: forms chosen by the gender of actor a.
const SELECTION = /\{\{([abc]):((?:[^{}]|\{\w+\})*)\}\}/g;
const PLACEHOLDER = /\{(\w+)\}/g;

const genderIndex = (gender: Gender) =>
  gender === 'Male' ? 0 : gender === 'Female' ? 1 : 2;

/**
 * Renders an arena text with several actors (spec 012 research R7): per-actor
 * gender selections first, then `{a}`, `{b}`, `{c}`, `{item}`, `{theItem}`, `{team}`.
 */
export const fillActorText = (
  text: string,
  actors: readonly TextActor[],
  extras: TextExtras = {},
  /** Wraps each name as \uE000<actor index>\uE001 so it can be shown apart. */
  markNames = false,
): string => {
  const actor = (key: string) => {
    const found = actors[ACTORS.indexOf(key as (typeof ACTORS)[number])];
    if (!found) throw new Error(`Missing actor {${key}} in "${text}"`);
    return found;
  };
  const selected = text.replace(SELECTION, (whole, key: string, forms) => {
    const options = (forms as string).split('|');
    if (options.length !== 3) {
      throw new Error(`Expected 3 gender forms in "${whole}"`);
    }
    return options[genderIndex(actor(key).gender)];
  });
  const nameAt = (index: number) => {
    const found = actors[index];
    if (!found) throw new Error(`Missing actor ${index} in "${text}"`);
    return markNames
      ? `\uE000${index}${found.firstName}\uE001`
      : found.firstName;
  };
  const filled = selected.replace(PLACEHOLDER, (whole, key: string) => {
    const list = extras.lists?.[key as keyof NonNullable<TextExtras['lists']>];
    if (list) {
      const names = list.map(nameAt);
      return names.length < 2
        ? (names[0] ?? '')
        : `${names.slice(0, -1).join(', ')} ${extras.and ?? 'and'} ${names.at(-1)}`;
    }
    if ((ACTORS as readonly string[]).includes(key)) {
      const name = actor(key).firstName;
      return markNames
        ? `\uE000${ACTORS.indexOf(key as (typeof ACTORS)[number])}${name}\uE001`
        : name;
    }
    const value =
      extras[
        key as 'item' | 'theItem' | 'team' | 'animal' | 'theAnimal' | 'count'
      ];
    if (value === undefined) throw new Error(`Missing {${key}} in "${text}"`);
    return value;
  });
  return capitalize(filled);
};

const actorOf = (setup: ArenaSetup, id: string): TextActor => {
  const contestant = setup.contestants.find((c) => c.id === id);
  if (!contestant) throw new Error(`Unknown contestant ${id}`);
  return contestant.character;
};

const extrasOf = (
  result: EventResult,
  setup: ArenaSetup,
  locale: Locale,
): TextExtras => {
  const texts = ARENA_TEXTS[locale];
  const item = result.itemId ? texts.items[result.itemId] : undefined;
  const beast = result.animalId ? texts.animals[result.animalId] : undefined;
  const side = setup.sides.find(
    (s) =>
      s.id === setup.contestants.find((c) => c.id === result.actors[0])?.sideId,
  );
  const indexes = (ids: string[] = []) =>
    ids.map((id) => result.actors.indexOf(id)).filter((i) => i >= 0);
  return {
    ...(item && { item: item.a, theItem: item.the }),
    ...(side?.name && { team: side.name }),
    ...(beast && { animal: beast.a, theAnimal: beast.the }),
    ...(result.count !== undefined && { count: String(result.count) }),
    lists: {
      all: result.actors.map((_, i) => i),
      others: result.actors.slice(1).map((_, i) => i + 1),
      fallen: indexes(result.defeated),
      hurt: indexes(result.hurt),
      looter: indexes(result.looter ? [result.looter] : []),
    },
    and: texts.and,
  };
};

/** One event of a match in the given language (spec 012 FR-012). */
export const renderEvent = (
  result: EventResult,
  setup: ArenaSetup,
  locale: Locale,
): string => {
  const texts = ARENA_TEXTS[locale];
  const text = result.eventId.startsWith('announce-')
    ? texts.announcements[result.eventId]
    : texts.events[result.eventId]?.[result.outcome];
  if (text === undefined) {
    throw new Error(`No text for ${result.eventId}.${result.outcome}`);
  }
  return fillActorText(
    text,
    result.actors.map((id) => actorOf(setup, id)),
    extrasOf(result, setup, locale),
  );
};

/** "Day 2", "Nuit 3", or the finale after the round limit. */
export const renderRoundTitle = (
  round: Round,
  locale: Locale,
  finale = false,
): string => {
  const texts = ARENA_TEXTS[locale].rounds;
  if (finale) return texts.finale;
  return texts[round.phase].replace(
    '{number}',
    String(Math.ceil(round.number / 2)),
  );
};

/** Event types where the only actor undergoes the event (shown on the right). */
const UNDERGONE = [
  'hazard',
  'arena',
  'group-hazard',
  'melee',
  'beast',
  'hunger',
];
/** Event types where everyone acts together (shown on the left). */
const TOGETHER = ['feast'];
/** Event types with a single actor acting on their own (shown on the left). */
const SOLO = [
  'find',
  'gift',
  'forage',
  'rest',
  'quiet',
  'potion',
  'treat',
  'eat',
  'feed',
  'tame',
  'companion',
  'relic-find',
  'relic-return',
];

/**
 * Who starts an event and who undergoes it, for the portraits beside each line
 * (maintainer feedback): the first actor acts, the others undergo it.
 */
export const eventSides = (
  result: EventResult,
): { left: string[]; right: string[] } => {
  if (result.eventId.startsWith('announce-')) return { left: [], right: [] };
  const type = ARENA.events.find((e) => e.id === result.eventId)?.type ?? '';
  const [first, ...others] = result.actors;
  if (UNDERGONE.includes(type)) return { left: [], right: result.actors };
  if (TOGETHER.includes(type)) return { left: result.actors, right: [] };
  // Group attacks: the target comes first, the attackers act.
  if (type === 'gang') return { left: others, right: [first] };
  if (SOLO.includes(type)) return { left: [first], right: [] };
  return { left: [first], right: others };
};

export type EventPart = string | { actor: string; name: string };

/** An event as text with its names apart, so they can be highlighted (maintainer feedback). */
export const eventParts = (
  result: EventResult,
  setup: ArenaSetup,
  locale: Locale,
): EventPart[] => {
  const texts = ARENA_TEXTS[locale];
  const text = result.eventId.startsWith('announce-')
    ? texts.announcements[result.eventId]
    : texts.events[result.eventId]?.[result.outcome];
  if (text === undefined) {
    throw new Error(`No text for ${result.eventId}.${result.outcome}`);
  }
  const marked = fillActorText(
    text,
    result.actors.map((id) => actorOf(setup, id)),
    extrasOf(result, setup, locale),
    true,
  );
  return marked
    .split(/(\uE000\d[^\uE001]*\uE001)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('\uE000')
        ? { actor: result.actors[Number(part[1])], name: part.slice(2, -1) }
        : part,
    );
};
