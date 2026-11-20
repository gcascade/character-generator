import type { Locale } from '../i18n';
import type { CharacterRace, Gender } from './character';

/** Trades of side characters (spec 010). Append only: share links store the position. */
export const Occupations = {
  Blacksmith: 'Blacksmith',
  Innkeeper: 'Innkeeper',
  Farmer: 'Farmer',
  Beggar: 'Beggar',
  Priest: 'Priest',
  Merchant: 'Merchant',
  Guard: 'Guard',
  Fisher: 'Fisher',
  Healer: 'Healer',
  Scribe: 'Scribe',
  Hunter: 'Hunter',
  Miller: 'Miller',
  Baker: 'Baker',
  Tailor: 'Tailor',
  Stablehand: 'Stablehand',
  Minstrel: 'Minstrel',
  Sailor: 'Sailor',
  Noble: 'Noble',
  Alchemist: 'Alchemist',
  Gravedigger: 'Gravedigger',
} as const;

export type Occupation = (typeof Occupations)[keyof typeof Occupations];

/** Sections of an NPC sheet, in display order. */
export const NPC_SECTIONS = [
  'look',
  'daily',
  'quirk',
  'rumour',
  'secret',
  'opinion',
] as const;

export type NpcSection = (typeof NPC_SECTIONS)[number];

/** Fragment id of each section (rendered in the current language). */
export type NpcContentRefs = Record<NpcSection, string>;

/** A sheet written by the AI, in one language; overrides the fragments. */
export type NpcText = Record<NpcSection, string> & {
  language: Locale;
  source: 'ai';
};

export type Npc = {
  /** Set on saved NPCs only. */
  id?: string;
  firstName: string;
  lastName: string;
  race: CharacterRace;
  gender: Gender;
  age: number;
  occupation: Occupation;
  content: NpcContentRefs;
  text?: NpcText;
};

export const LOCKABLE_NPC_PROPERTIES = [
  'firstName',
  'lastName',
  'race',
  'gender',
  'age',
  'occupation',
] as const;

export type LockableNpcProperty = (typeof LOCKABLE_NPC_PROPERTIES)[number];

export type NpcTemplate = Partial<Pick<Npc, LockableNpcProperty>>;
