import arena from '../data/content/arena.json';
import enArena from '../data/locales/en/arena.json';
import frArena from '../data/locales/fr/arena.json';
import epithetIds from '../data/content/epithets.json';
import fragments from '../data/content/fragments.json';
import partyFragments from '../data/content/party.json';
import partyDepth from '../data/content/partyDepth.json';
import npcData from '../data/content/npc.json';
import enNpc from '../data/locales/en/npc.json';
import frNpc from '../data/locales/fr/npc.json';
import enHooks from '../data/locales/en/hooks.json';
import enRoles from '../data/locales/en/roles.json';
import enTies from '../data/locales/en/ties.json';
import frHooks from '../data/locales/fr/hooks.json';
import frRoles from '../data/locales/fr/roles.json';
import frTies from '../data/locales/fr/ties.json';
import enParty from '../data/locales/en/party.json';
import frParty from '../data/locales/fr/party.json';
import dwarf from '../data/content/names/dwarf.json';
import elf from '../data/content/names/elf.json';
import human from '../data/content/names/human.json';
import orc from '../data/content/names/orc.json';
import ashborn from '../data/content/names/ashborn.json';
import darkElf from '../data/content/names/dark-elf.json';
import gnome from '../data/content/names/gnome.json';
import halfElf from '../data/content/names/half-elf.json';
import halfling from '../data/content/names/halfling.json';
import enEpithets from '../data/locales/en/epithets.json';
import enGoals from '../data/locales/en/goals.json';
import enOrigins from '../data/locales/en/origins.json';
import enTitles from '../data/locales/en/titles.json';
import enTrainings from '../data/locales/en/trainings.json';
import enTurningPoints from '../data/locales/en/turningPoints.json';
import frEpithets from '../data/locales/fr/epithets.json';
import frGoals from '../data/locales/fr/goals.json';
import frOrigins from '../data/locales/fr/origins.json';
import frTitles from '../data/locales/fr/titles.json';
import frTrainings from '../data/locales/fr/trainings.json';
import frTurningPoints from '../data/locales/fr/turningPoints.json';
import type { Locale } from '../i18n';
import type {
  CharacterAlignment,
  CharacterClass,
  CharacterRace,
} from '../types/character';
import type { BalanceArea } from '../types/party';
import type { NpcSection, Occupation } from '../types/npc';
import type { GenderedText } from './renderText';
import type {
  ItemDefinition,
  PerkDefinition,
  Skill,
  SkillBonuses,
  SkillFamily,
} from '../types/arena';
import type { AgeBand } from './portraitPrompt';

export type FragmentCategory =
  'title' | 'origin' | 'training' | 'turningPoint' | 'goal';

export type Fragment = {
  id: string;
  category: FragmentCategory;
  race?: CharacterRace;
  characterClass?: CharacterClass;
  alignment?: CharacterAlignment;
};

export const FRAGMENTS = fragments as Fragment[];
export const EPITHET_IDS: readonly string[] = epithetIds;

export type NameLists = {
  first: { male: string[]; female: string[]; neutral: string[] };
  last: string[];
};

export const NAMES: Record<CharacterRace, NameLists> = {
  Human: human,
  Elf: elf,
  Dwarf: dwarf,
  Orc: orc,
  Halfling: halfling,
  Gnome: gnome,
  'Half-elf': halfElf,
  'Dark elf': darkElf,
  Ashborn: ashborn,
};

type Texts = Record<string, GenderedText>;

/** Text of every fragment and epithet, per locale (same ids in every locale). */
export const TEXTS: Record<
  Locale,
  Record<FragmentCategory | 'epithet', Texts>
> = {
  en: {
    title: enTitles,
    origin: enOrigins,
    training: enTrainings,
    turningPoint: enTurningPoints,
    goal: enGoals,
    epithet: enEpithets,
  },
  fr: {
    title: frTitles,
    origin: frOrigins,
    training: frTrainings,
    turningPoint: frTurningPoints,
    goal: frGoals,
    epithet: frEpithets,
  },
};

export type PartyFragmentCategory = 'name' | 'meeting' | 'goal';

export type PartyFragment = { id: string; category: PartyFragmentCategory };

/** Party name, meeting and goal fragments (spec 004); texts use {members}, {first}, {count}. */
export const PARTY_FRAGMENTS = partyFragments as PartyFragment[];

export const PARTY_TEXTS: Record<Locale, Record<string, string>> = {
  en: enParty,
  fr: frParty,
};

// --- Party depth (spec 008) ---

export type TieType = { id: string; directed: boolean };

export type RoleDefinition = {
  id: string;
  unique: boolean;
  area: BalanceArea;
  classes: Record<CharacterClass, number>;
  alignment: Partial<Record<'lawful' | 'chaotic' | 'good' | 'evil', number>>;
};

export const TIE_TYPES = partyDepth.ties as TieType[];
export const ROLES = partyDepth.roles as RoleDefinition[];
export const HOOK_IDS = partyDepth.hooks as Record<
  'place' | 'patron' | 'threat',
  string[]
>;

export const DEPTH_TEXTS: Record<
  Locale,
  {
    ties: Record<string, string>;
    roles: Record<string, string>;
    hooks: Record<string, string>;
  }
> = {
  en: { ties: enTies, roles: enRoles, hooks: enHooks },
  fr: { ties: frTies, roles: frRoles, hooks: frHooks },
};

// --- Side characters (spec 010) ---

export type OccupationDefinition = {
  id: Occupation;
  /** Youngest age for this occupation. */
  minAge: number;
};

export type NpcFragment = {
  id: string;
  section: NpcSection;
  /** Daily-life fragments belong to an occupation; the others are shared. */
  occupation?: Occupation;
};

export const OCCUPATIONS = npcData.occupations as OccupationDefinition[];
export const NPC_FRAGMENTS = npcData.fragments as NpcFragment[];

export const NPC_TEXTS: Record<Locale, Record<string, GenderedText>> = {
  en: enNpc,
  fr: frNpc,
};

// --- Arena (spec 012) ---

export type ArenaEventKind = {
  id: string;
  type: string;
  phase?: 'day' | 'night';
  skill?: Skill;
  modifier?: number;
  damage?: number;
  weight: number;
  notable?: boolean;
  /** Actors: 1 (solo), 2 (a and b), 3 (a protects b from c) or a group of 3 to 6. */
  actors: 1 | 2 | 3 | 'group';
  /** Between a and b: same side or ally, other side, or b wounded on another side. */
  relation?: 'friend' | 'foe' | 'any';
  /** Hazards: a failure loses an item. */
  loseItem?: boolean;
  /** Social events: what a success does to b. */
  effect?: 'hurt' | 'take';
  when?: {
    alignment?: 'good' | 'evil' | 'chaotic' | 'not-good';
    perk?: string;
    itemTag?: string;
    wounded?: boolean;
    tie?: 'friendly' | 'hostile';
    role?: string;
    minRound?: number;
    caster?: boolean;
    /** b must be wounded (pair events). */
    targetWounded?: boolean;
    /** b must be a's partner in a couple. */
    couple?: boolean;
    /** a must hold a grudge against b: for a personal wrong, or for a fallen friend. */
    grudge?: 'personal' | 'friend';
    /** Group attacks: attackers from different sides gang up on the most dangerous. */
    coalition?: boolean;
  };
};

type ArenaSkillData = {
  classes: Record<
    CharacterClass,
    { signature: Skill[]; base: Record<Skill, number> }
  >;
  races: Record<CharacterRace, SkillBonuses>;
  ageBands: Record<AgeBand, SkillBonuses>;
  hp: Record<CharacterClass, number>;
  attack: Record<CharacterClass, number>;
  casters: CharacterClass[];
};

export const ARENA = arena as unknown as {
  skills: ArenaSkillData;
  perks: PerkDefinition[];
  items: ItemDefinition[];
  events: ArenaEventKind[];
};

type GenderedOutcomes = Record<string, string>;

export type ArenaTexts = {
  skills: Record<Skill, string>;
  families: Record<SkillFamily, string>;
  perks: Record<string, { name: string; description: string }>;
  items: Record<string, { a: string; the: string; description: string }>;
  events: Record<string, GenderedOutcomes>;
  /** The narrator's lines between events, by announcement id. */
  announcements: Record<string, string>;
  rounds: Record<string, string>;
  /** Joins the last two names of a list. */
  and: string;
};

export const ARENA_TEXTS = { en: enArena, fr: frArena } as unknown as Record<
  Locale,
  ArenaTexts
>;
