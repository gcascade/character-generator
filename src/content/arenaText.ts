import type { Locale } from '../i18n';
import type { ArenaSetup, EventResult, Round } from '../types/arena';
import type { Gender } from '../types/character';
import { ARENA, ARENA_TEXTS } from './data';
import { capitalize } from './renderText';

export type TextActor = { firstName: string; gender: Gender };

export type TextExtras = { item?: string; theItem?: string; team?: string };

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
  const filled = selected.replace(PLACEHOLDER, (whole, key: string) => {
    if ((ACTORS as readonly string[]).includes(key)) {
      return actor(key).firstName;
    }
    const value = extras[key as keyof TextExtras];
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

/** One event of a match in the given language (spec 012 FR-012). */
export const renderEvent = (
  result: EventResult,
  setup: ArenaSetup,
  locale: Locale,
): string => {
  const texts = ARENA_TEXTS[locale];
  const text = texts.events[result.eventId]?.[result.outcome];
  if (text === undefined) {
    throw new Error(`No text for ${result.eventId}.${result.outcome}`);
  }
  const item = result.itemId ? texts.items[result.itemId] : undefined;
  const side = setup.sides.find(
    (s) =>
      s.id === setup.contestants.find((c) => c.id === result.actors[0])?.sideId,
  );
  return fillActorText(
    text,
    result.actors.map((id) => actorOf(setup, id)),
    {
      ...(item && { item: item.a, theItem: item.the }),
      ...(side?.name && { team: side.name }),
    },
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
const UNDERGONE = ['hazard', 'arena'];
/** Event types with a single actor acting on their own (shown on the left). */
const SOLO = ['find', 'gift', 'forage', 'rest', 'quiet', 'potion', 'treat'];

/**
 * Who starts an event and who undergoes it, for the portraits beside each line
 * (maintainer feedback): the first actor acts, the others undergo it.
 */
export const eventSides = (
  result: EventResult,
): { left: string[]; right: string[] } => {
  const type = ARENA.events.find((e) => e.id === result.eventId)?.type ?? '';
  const [first, ...others] = result.actors;
  if (UNDERGONE.includes(type)) return { left: [], right: result.actors };
  if (SOLO.includes(type)) return { left: [first], right: [] };
  return { left: [first], right: others };
};
