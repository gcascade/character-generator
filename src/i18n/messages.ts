import en from '../data/locales/en/ui.json';
import fr from '../data/locales/fr/ui.json';
import type { Locale } from './locale';

export type MessageKey = keyof typeof en;
export type MessageParams = Record<string, string | number>;

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, fr };

const PARAM = /\{(\w+)\}/g;

/** Looks up a UI text and fills its `{param}` placeholders. */
export const translate = (
  locale: Locale,
  key: MessageKey,
  params: MessageParams = {},
): string =>
  (MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key).replace(
    PARAM,
    (whole, name: string) => (name in params ? String(params[name]) : whole),
  );
