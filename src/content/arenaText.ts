import type { Gender } from '../types/character';
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
export const renderActorText = (
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
