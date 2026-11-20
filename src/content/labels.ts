import enLabels from '../data/locales/en/labels.json';
import frLabels from '../data/locales/fr/labels.json';
import type { Locale } from '../i18n';
import type { Gender } from '../types/character';
import { type GenderedText, selectGender } from './renderText';

export type LabelKind = 'race' | 'class' | 'alignment' | 'gender' | 'occupation';

const LABELS: Record<Locale, Record<string, GenderedText>> = {
  en: enLabels,
  fr: frLabels,
};

/**
 * Name of a race, class, alignment, gender or occupation in the given language, agreeing
 * with the character's gender where the language needs it (FR-005).
 */
export const label = (
  kind: LabelKind,
  value: string,
  gender: Gender,
  locale: Locale,
): string => {
  const text =
    LABELS[locale][`${kind}.${value}`] ?? LABELS.en[`${kind}.${value}`];
  return text === undefined ? value : selectGender(text, gender);
};
