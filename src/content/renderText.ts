import type { Gender } from '../types/character';

/**
 * Text that may depend on the character's gender (data-model.md, GenderedText):
 * a string with `{{masculine|feminine|non-binary}}` selections, or one string per gender.
 */
export type GenderedText = string | { m: string; f: string; n: string };

export type TextNames = {
  firstName: string;
  lastName: string;
  epithet?: string;
};

export const PLACEHOLDERS = [
  'firstName',
  'lastName',
  'fullName',
  'epithet',
] as const;

const SELECTION = /\{\{([^{}]*)\}\}/g;
const PLACEHOLDER = /\{(\w+)\}/g;

const genderIndex = (gender: Gender): 0 | 1 | 2 =>
  gender === 'Male' ? 0 : gender === 'Female' ? 1 : 2;

/** Picks the gender form of a text without filling the placeholders. */
export const selectGender = (text: GenderedText, gender: Gender): string => {
  const index = genderIndex(gender);
  const source =
    typeof text === 'string' ? text : [text.m, text.f, text.n][index];
  return source.replace(SELECTION, (whole, options: string) => {
    const forms = options.split('|');
    if (forms.length !== 3) {
      throw new Error(`Expected 3 gender forms in "${whole}"`);
    }
    return forms[index];
  });
};

/** Renders a gendered text for a character: gender forms first, then names. */
export const renderText = (
  text: GenderedText,
  gender: Gender,
  names: TextNames,
): string => {
  const values: Record<(typeof PLACEHOLDERS)[number], string> = {
    firstName: names.firstName,
    lastName: names.lastName,
    fullName: `${names.firstName} ${names.lastName}`,
    epithet: names.epithet ?? '',
  };
  return selectGender(text, gender).replace(
    PLACEHOLDER,
    (whole, name: string) => {
      if (!(name in values)) throw new Error(`Unknown placeholder ${whole}`);
      return values[name as keyof typeof values];
    },
  );
};

/** Capitalizes the first letter (for epithets at the start of a title or sentence). */
export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
