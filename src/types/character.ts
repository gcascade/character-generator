export type Character = {
  firstName: string;
  lastName: string;
  epithet: string;
  characterClass: CharacterClass;
  gender: Gender;
  race: CharacterRace;
  alignment: CharacterAlignment;
  age: number;
  background: CharacterBackground;
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
} as const;

export type CharacterRace =
  (typeof CharacterRaces)[keyof typeof CharacterRaces];
