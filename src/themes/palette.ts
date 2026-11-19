import type { CharacterClass, CharacterRace } from '../types/character';

export type Mode = 'light' | 'dark';

/** Colour tokens per mode, from the validated mock-ups (spec 005). */
export const TOKENS = {
  light: {
    background: '#EFE4CC', // parchment
    paper: '#FBF5E6',
    text: '#2B2118',
    textSecondary: '#5E4D3B',
    primary: '#6B3F1F', // leather brown
    onPrimary: '#FFF8EA',
    accent: '#86590C', // gold, dark enough for text
    divider: '#D8C7A3',
    menu: '#3A2717',
    onMenu: '#F3E6C8',
  },
  dark: {
    background: '#17120D', // candle-lit night
    paper: '#231B14',
    text: '#EEE3CE',
    textSecondary: '#C2B095',
    primary: '#E0B567', // gold
    onPrimary: '#21170D',
    accent: '#E0B567',
    divider: '#4A3B2A',
    menu: '#120E0A',
    onMenu: '#E8D9BB',
  },
} as const satisfies Record<Mode, Record<string, string>>;

export type BadgeColor = { main: string; contrastText: string };

export const RACE: Record<Mode, Record<CharacterRace, string>> = {
  light: {
    Human: '#3E5A7A',
    Elf: '#2F5D3A',
    Dwarf: '#8A3F12',
    Orc: '#4F5B1E',
  },
  dark: {
    Human: '#8DB4DE',
    Elf: '#7FC28E',
    Dwarf: '#E99A63',
    Orc: '#B9C76A',
  },
};

export const CLASS: Record<Mode, Record<CharacterClass, string>> = {
  light: {
    Warrior: '#8E2424',
    Mage: '#3B3F8C',
    Rogue: '#3A3A3A',
    Cleric: '#7A5A0C',
  },
  dark: {
    Warrior: '#F08A80',
    Mage: '#A9ADF2',
    Rogue: '#C9C9C9',
    Cleric: '#E6C25E',
  },
};

export const BADGE_TEXT: Record<Mode, string> = {
  light: '#FFFFFF',
  dark: '#17120D',
};

export const raceColor = (race: CharacterRace, mode: Mode): BadgeColor => ({
  main: RACE[mode][race],
  contrastText: BADGE_TEXT[mode],
});

export const classColor = (
  characterClass: CharacterClass,
  mode: Mode,
): BadgeColor => ({
  main: CLASS[mode][characterClass],
  contrastText: BADGE_TEXT[mode],
});
