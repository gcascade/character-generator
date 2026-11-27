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
  /** A flaw: each contestant has at most one perk and one flaw. */
  flaw?: boolean;
  bonuses?: SkillBonuses;
  hp?: number;
  tags?: string[];
};

/** A wild animal of the arena (spec 013): tamed, it becomes a companion. */
export type AnimalDefinition = {
  id: string;
  /** Malus to tame it. */
  difficulty: number;
  /** Harm it deals when it attacks. */
  damage: number;
  /** What it brings to its companion's checks. */
  bonuses?: SkillBonuses;
  /** `predator`: it attacks; `hunter`: it feeds its companion. */
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
  /** A guest who entered during the match (spec 013). */
  guest?: 'gladiator' | 'wanderer';
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
  /** The other half of a couple formed during the match. */
  partner?: string;
  /** A tamed animal (spec 013). */
  companion?: string;
  /** Periods since the last meal (spec 013): penalties from 3, harm from 5. */
  hunger: number;
  /** Holds the relic of a decree (spec 013). */
  relic?: boolean;
};

export type EventOutcome = string;

/** A d100 roll made during an event, shown to the spectator. */
export type RollRecord = {
  actor: string;
  skill: Skill;
  /** Effective chance after bonuses and penalties, 5–95. */
  chance: number;
  roll: number;
  success: boolean;
  /** A Lucky fighter's second chance. */
  reroll?: boolean;
};

export type EventResult = {
  eventId: string;
  outcome: EventOutcome;
  /** Contestant ids in text order: {a}, {b}, {c}. */
  actors: string[];
  itemId?: string;
  defeated: string[];
  /** Group events: those who were hurt. */
  hurt?: string[];
  /** Who got away with the loot (a chest fought over). */
  looter?: string;
  notable?: boolean;
  /** The animal of the event (spec 013). */
  animalId?: string;
  /** A number told by the text: a day, a count of defeats (decrees). */
  count?: number;
  /** The rolls behind the outcome, in order. */
  rolls?: RollRecord[];
  /** The actors' state just before the event (hit points, items…). */
  before?: Record<string, FighterState>;
  /** The actors' state just after it: what the event changed. */
  after?: Record<string, FighterState>;
};

export type Phase = 'day' | 'night';

/** A contestant's state at the end of a round, for the status panel. */
export type FighterState = Pick<
  Fighter,
  | 'hp'
  | 'maxHp'
  | 'items'
  | 'standing'
  | 'sideId'
  | 'allianceId'
  | 'defeats'
  | 'partner'
  | 'companion'
  | 'relic'
> &
  Partial<Pick<Fighter, 'hunger'>>;

export type Round = {
  number: number;
  phase: Phase;
  events: EventResult[];
  /** Everyone's state when the round ends. */
  after: Record<string, FighterState>;
};

/** The arena masters change the end condition (spec 013). */
export type Decree = {
  type: 'survive' | 'relic' | 'champion';
  /** Round when it is announced. */
  round: number;
  /** survive: the round at whose end everyone standing wins; champion: defeats needed. */
  goal: number;
};

export type Match = {
  rounds: Round[];
  /** The winning side (team, or the solo contestant's side). */
  winnerSideId: string;
  fighters: Record<string, Fighter>;
  /** Guests who entered during the match (spec 013), with their own sides. */
  entrants: Contestant[];
  entrantSides: Side[];
  decree?: Decree;
  /** Everyone standing won together (a survival decree). */
  shared?: boolean;
};
