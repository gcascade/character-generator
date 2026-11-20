/** References to the app's content, rendered in the current language (spec 002). */
export type ContentRefs = {
  titleId: string;
  originId: string;
  trainingId: string;
  turningPointId: string;
  goalId: string;
  epithetId: string;
};

export type Character = {
  /** Set on saved characters only (spec 006). */
  id?: string;
  firstName: string;
  lastName: string;
  characterClass: CharacterClass;
  gender: Gender;
  race: CharacterRace;
  alignment: CharacterAlignment;
  age: number;
  /** App-made content; absent only for characters saved by older versions. */
  content?: ContentRefs;
  /** Epithet written as text (by the AI or an older version); overrides `content`. */
  epithet?: string;
  /** Background written as text (by the AI or an older version); overrides `content`. */
  background?: CharacterBackground;
  /** Language of `epithet` / `background` text; older versions wrote English. */
  textLanguage?: 'en' | 'fr';
  /** Who wrote the text: the AI, or an older version of the app. */
  textSource?: 'ai' | 'legacy';
};

export const Genders = {
  Male: 'Male',
  Female: 'Female',
  NonBinary: 'Non-binary',
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export const CharacterClasses = {
  Warrior: 'Warrior',
  Mage: 'Mage',
  Rogue: 'Rogue',
  Cleric: 'Cleric',
  // Append only: share links store the position (spec 007).
  Ranger: 'Ranger',
  Paladin: 'Paladin',
  Bard: 'Bard',
  Druid: 'Druid',
  Barbarian: 'Barbarian',
} as const;

export type CharacterClass =
  (typeof CharacterClasses)[keyof typeof CharacterClasses];

export const CharacterAlignments = {
  LawfulGood: 'Lawful Good',
  NeutralGood: 'Neutral Good',
  ChaoticGood: 'Chaotic Good',
  LawfulNeutral: 'Lawful Neutral',
  TrueNeutral: 'True Neutral',
  ChaoticNeutral: 'Chaotic Neutral',
  LawfulEvil: 'Lawful Evil',
  NeutralEvil: 'Neutral Evil',
  ChaoticEvil: 'Chaotic Evil',
} as const;

export type CharacterAlignment =
  (typeof CharacterAlignments)[keyof typeof CharacterAlignments];

export type CharacterBackground = {
  title: string;
  content: string[];
};

export const CharacterRaces = {
  Human: 'Human',
  Elf: 'Elf',
  Dwarf: 'Dwarf',
  Orc: 'Orc',
  // Append only: share links store the position (spec 007).
  Halfling: 'Halfling',
  Gnome: 'Gnome',
  HalfElf: 'Half-elf',
  DarkElf: 'Dark elf',
  Ashborn: 'Ashborn',
} as const;

export type CharacterRace =
  (typeof CharacterRaces)[keyof typeof CharacterRaces];
