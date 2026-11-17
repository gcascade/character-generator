import { z, type ZodType } from 'zod';
import type { Character } from '../types/character';
import {
  backgroundRewriteSchema,
  type NameField,
  nameRerollSchema,
  newCharacterSchema,
} from './schemas';

export type Prompt = { system: string; prompt: string; schema: ZodType };

export const SYSTEM_PROMPT = [
  'You write characters for a classic heroic fantasy role-playing setting:',
  'evocative and adventurous, neither grimdark nor parodic.',
  'Always answer with a single JSON object and nothing else.',
].join(' ');

const BACKGROUND_RULES =
  'The background has a short title and 4 to 6 paragraphs in the third person.';

const describe = (
  character: Pick<
    Character,
    'age' | 'gender' | 'race' | 'characterClass' | 'alignment'
  >,
) =>
  `a ${character.age}-year-old ${character.gender.toLowerCase()} ${character.race} ${character.characterClass} of ${character.alignment} alignment`;

const schemaText = (schema: ZodType) => JSON.stringify(z.toJSONSchema(schema));

/** These properties are decided by the app; the AI must not change them (FR-007). */
const fixedFacts = (character: Character) =>
  [
    `Race: ${character.race}`,
    `Class: ${character.characterClass}`,
    `Gender: ${character.gender}`,
    `Alignment: ${character.alignment}`,
    `Age: ${character.age}`,
  ].join('\n');

/** New character: the AI writes names, epithet and background. */
export const newCharacterPrompt = (character: Character): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: newCharacterSchema,
  prompt: [
    `Create ${describe(character)}.`,
    'These facts are fixed:',
    fixedFacts(character),
    'Write a first name, a last name, an epithet starting with "The", and a background.',
    BACKGROUND_RULES,
    `Answer with JSON matching this schema: ${schemaText(newCharacterSchema)}`,
  ].join('\n'),
});

const currentCharacter = (character: Character) =>
  [
    `Name: ${character.firstName} ${character.lastName}`,
    `Epithet: ${character.epithet}`,
    fixedFacts(character),
  ].join('\n');

/** Race, class, gender, alignment or age changed: rewrite the background only. */
export const backgroundRewritePrompt = (
  character: Character,
  changed: keyof Character,
): Prompt => ({
  system: SYSTEM_PROMPT,
  schema: backgroundRewriteSchema,
  prompt: [
    `This character's ${changed === 'characterClass' ? 'class' : changed} has just changed. Here is the character now:`,
    currentCharacter(character),
    'Write a new background consistent with every fact above.',
    BACKGROUND_RULES,
    `Answer with JSON matching this schema: ${schemaText(backgroundRewriteSchema)}`,
  ].join('\n'),
});

const FIELD_LABEL: Record<NameField, string> = {
  firstName: 'first name',
  lastName: 'last name',
  epithet: 'epithet (starting with "The")',
};

/** First name, last name or epithet rerolled: the AI proposes the value and a matching background. */
export const nameRerollPrompt = (
  character: Character,
  field: NameField,
): Prompt => {
  const schema = nameRerollSchema(field);
  return {
    system: SYSTEM_PROMPT,
    schema,
    prompt: [
      'Here is a character:',
      currentCharacter(character),
      `Give this character a new ${FIELD_LABEL[field]}, different from "${character[field]}", and keep everything else.`,
      'Then write a background consistent with the new value and every fact above.',
      BACKGROUND_RULES,
      `Answer with JSON matching this schema: ${schemaText(schema)}`,
    ].join('\n'),
  };
};
