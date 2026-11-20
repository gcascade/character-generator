import { z, type ZodType } from 'zod';
import type { Locale } from '../i18n';
import type { Character } from '../types/character';
import {
  backgroundRewriteSchema,
  backgroundSchema,
  contributionFieldSchemas,
  type NameField,
  nameRerollSchema,
  translateSchema,
} from './schemas';

export type Prompt = { system: string; prompt: string; schema: ZodType };

/** A character as shown to the AI: its epithet in words. */
export type PromptCharacter = Character & { epithet: string };

export const SYSTEM_PROMPT = [
  'You write characters for a classic heroic fantasy role-playing setting:',
  'evocative and adventurous, neither grimdark nor parodic.',
  'Always answer with a single JSON object and nothing else.',
].join(' ');

export const LANGUAGE_NAME: Record<Locale, string> = {
  en: 'English',
  fr: 'French',
};

/** Writing instructions per language (spec 002 FR-014 and the French clarification). */
const languageRules = (locale: Locale, gender: Character['gender']) =>
  [
    `Write every text value in ${LANGUAGE_NAME[locale]}.`,
    locale === 'fr' && gender === 'Non-binary'
      ? 'The character is non-binary: in French, use neutral phrasing (the name, constructions without gendered pronouns or agreements); never use "iel" or inclusive punctuation.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

const EPITHET_STYLE: Record<Locale, string> = {
  en: 'an epithet such as "the Bold" or "the Lionhearted"',
  fr: 'an epithet such as "le Hardi", "la Hardie" or "Cœur-de-Lion"',
};

const BACKGROUND_RULES =
  'The background has a short title and 4 to 6 paragraphs in the third person.';

/** Races the AI may not know, explained in the prompt (spec 009). */
const RACE_NOTES: Partial<Record<Character['race'], string>> = {
  Ashborn:
    'Ashborn (an original race of people with infernal ancestry: horns, ember eyes, often distrusted)',
  'Dark elf': 'Dark elf (elves from cities deep underground)',
};

const raceText = (race: Character['race']) => RACE_NOTES[race] ?? race;

const describe = (
  character: Pick<
    Character,
    'age' | 'gender' | 'race' | 'characterClass' | 'alignment'
  >,
) =>
  `a ${character.age}-year-old ${character.gender.toLowerCase()} ${raceText(character.race)} ${character.characterClass} of ${character.alignment} alignment`;

const schemaText = (schema: ZodType) => JSON.stringify(z.toJSONSchema(schema));

/** These properties are decided by the app; the AI must not change them (FR-007). */
const fixedFacts = (character: Character) =>
  [
    `Race: ${raceText(character.race)}`,
    `Class: ${character.characterClass}`,
    `Gender: ${character.gender}`,
    `Alignment: ${character.alignment}`,
    `Age: ${character.age}`,
  ].join('\n');

const ASK_LABEL: Record<NameField, string> = {
  firstName: 'a first name',
  lastName: 'a last name',
  epithet: 'an epithet',
};

const FIXED_LABEL: Record<NameField, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  epithet: 'Epithet',
};

/**
 * New character: the AI writes the names and epithet that are not locked, and
 * the background. Locked ones are given as fixed facts (spec 003 FR-007).
 */
export const newCharacterPrompt = (
  character: PromptCharacter,
  locale: Locale = 'en',
  fixed: readonly NameField[] = [],
): Prompt => {
  const asked = (['firstName', 'lastName', 'epithet'] as const).filter(
    (field) => !fixed.includes(field),
  );
  const schema = z.object({
    ...Object.fromEntries(
      asked.map((field) => [field, contributionFieldSchemas[field]]),
    ),
    background: backgroundSchema,
  });
  const wanted = [
    ...asked.map((field) =>
      field === 'epithet' ? EPITHET_STYLE[locale] : ASK_LABEL[field],
    ),
    'a background',
  ];
  return {
    system: SYSTEM_PROMPT,
    schema,
    prompt: [
      `Create ${describe(character)}.`,
      'These facts are fixed:',
      fixedFacts(character),
      ...fixed.map((field) => `${FIXED_LABEL[field]}: ${character[field]}`),
      `Write ${wanted.slice(0, -1).join(', ')}${wanted.length > 1 ? ' and ' : ''}${wanted.at(-1)}.`,
      BACKGROUND_RULES,
      languageRules(locale, character.gender),
      `Answer with JSON matching this schema: ${schemaText(schema)}`,
    ].join('\n'),
  };
};

const currentCharacter = (character: PromptCharacter) =>
  [
    `Name: ${character.firstName} ${character.lastName}`,
    `Epithet: ${character.epithet}`,
    fixedFacts(character),
  ].join('\n');

/** Race, class, gender, alignment or age changed: rewrite the background only. */
export const backgroundRewritePrompt = (
  character: PromptCharacter,
  changed: keyof Character,
  locale: Locale = 'en',
): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: backgroundRewriteSchema,
  prompt: [
    `This character's ${changed === 'characterClass' ? 'class' : changed} has just changed. Here is the character now:`,
    currentCharacter(character),
    'Write a new background consistent with every fact above.',
    BACKGROUND_RULES,
    languageRules(locale, character.gender),
    `Answer with JSON matching this schema: ${schemaText(backgroundRewriteSchema)}`,
  ].join('\n'),
});

const FIELD_LABEL: Record<NameField, string> = {
  firstName: 'first name',
  lastName: 'last name',
  epithet: 'epithet',
};

/** First name, last name or epithet rerolled: the AI proposes the value and a matching background. */
export const nameRerollPrompt = (
  character: PromptCharacter,
  field: NameField,
  locale: Locale = 'en',
): Prompt => {
  const schema = nameRerollSchema(field);
  return {
    system: SYSTEM_PROMPT,
    schema,
    prompt: [
      'Here is a character:',
      currentCharacter(character),
      `Give this character a new ${FIELD_LABEL[field]}, different from "${character[field]}", and keep everything else.`,
      field === 'epithet' ? `Use ${EPITHET_STYLE[locale]}.` : '',
      'Then write a background consistent with the new value and every fact above.',
      BACKGROUND_RULES,
      languageRules(locale, character.gender),
      `Answer with JSON matching this schema: ${schemaText(schema)}`,
    ]
      .filter(Boolean)
      .join('\n'),
  };
};

/** Translate AI-written text into another language, keeping the story (spec 002 FR-015a). */
export const translatePrompt = (
  character: PromptCharacter,
  locale: Locale,
): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: translateSchema,
  prompt: [
    `Translate this character's epithet and background into ${LANGUAGE_NAME[locale]}.`,
    'Keep the same story, the same names and the same tone; do not add or remove events.',
    currentCharacter(character),
    `Background: ${JSON.stringify(character.background ?? null)}`,
    languageRules(locale, character.gender),
    `Answer with JSON matching this schema: ${schemaText(translateSchema)}`,
  ].join('\n'),
});
