import epithetIds from '../data/content/epithets.json';
import fragments from '../data/content/fragments.json';
import dwarf from '../data/content/names/dwarf.json';
import elf from '../data/content/names/elf.json';
import human from '../data/content/names/human.json';
import orc from '../data/content/names/orc.json';
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
import type { GenderedText } from './renderText';

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
