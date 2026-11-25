import type { Character } from './character';
import type { RoleId, Tie } from './party';

/** The thirteen arena skills (spec 012), each a percent chance from 0 to 100. */
export const SKILLS = [
  'melee',
  'ranged',
  'magic',
  'athletics',
  'stealth',
  'endurance',
  'perception',
  'survival',
  'lore',
  'healing',
  'persuasion',
  'intimidation',
  'deception',
] as const;

export type Skill = (typeof SKILLS)[number];

export const SKILL_FAMILIES = {
  combat: ['melee', 'ranged', 'magic'],
  physical: ['athletics', 'stealth', 'endurance'],
  mind: ['perception', 'survival', 'lore', 'healing'],
  social: ['persuasion', 'intimidation', 'deception'],
} as const satisfies Record<string, readonly Skill[]>;

export type SkillFamily = keyof typeof SKILL_FAMILIES;

/** Skills rolled for a contestant: integers 5–95 when rolled, and hit points. */
export type Skills = { values: Record<Skill, number>; hp: number };

export type SkillBonuses = Partial<Record<Skill, number>>;

export type PerkDefinition = {
  id: string;
  bonuses?: SkillBonuses;
  hp?: number;
  tags?: string[];
};

export type ItemKind = 'weapon' | 'tool' | 'protection' | 'consumable';

export type ItemDefinition = {
  id: string;
  kind: ItemKind;
  bonuses?: SkillBonuses;
  hp?: number;
  /** Weapons only, 2–8. */
  damage?: number;
  tags?: string[];
};

export type Contestant = {
  id: string;
  /** Snapshot of the character when enrolled. */
  character: Character;
  sideId: string;
  /** The member's party role (teams only). */
  role?: RoleId;
  /** 0–2 distinct known perk ids. */
  perks: string[];
  /** 0–3 known item ids. */
  items: string[];
  /** Saved character id, to avoid enrolling it twice. */
  sourceId?: string;
};

export type Side = {
  id: string;
  kind: 'team' | 'solo';
  /** The party's name at enrolment (teams). */
  name?: string;
  /** The party's ties, with contestant ids. */
  ties: Tie[];
};

export type ArenaSetup = {
  contestants: Contestant[];
  sides: Side[];
  seed: string;
  /** Rounds the player has revealed (0 = setup view). */
  shownRounds: number;
};

export type Fighter = {
  id: string;
  sideId: string;
  allianceId?: string;
  skills: Skills;
  hp: number;
  maxHp: number;
  items: string[];
  perks: string[];
  standing: boolean;
  defeatedRound?: number;
  defeatedBy?: string;
  defeats: number;
  luckUsed: boolean;
};

export type EventOutcome = string;

export type EventResult = {
  eventId: string;
  outcome: EventOutcome;
  /** Contestant ids in text order: {a}, {b}, {c}. */
  actors: string[];
  itemId?: string;
  defeated: string[];
  notable?: boolean;
};

export type Phase = 'day' | 'night';

export type Round = { number: number; phase: Phase; events: EventResult[] };

export type Match = {
  rounds: Round[];
  /** The winning side (team, or the solo contestant's side). */
  winnerSideId: string;
  fighters: Record<string, Fighter>;
};
