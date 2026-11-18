export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_KEY = 'locale';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/**
 * The stored choice wins; otherwise the first browser language decides:
 * any French variant gives French, anything else English (FR-002).
 */
export const detectLocale = (
  stored: string | null,
  browserLanguages: readonly string[],
): Locale => {
  if (isLocale(stored)) return stored;
  const first = browserLanguages[0]?.toLowerCase() ?? '';
  return first.startsWith('fr') ? 'fr' : 'en';
};
