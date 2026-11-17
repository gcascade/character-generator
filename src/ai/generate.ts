import { z } from 'zod';
import type { Character } from '../types/character';
import { generateRandomCharacter } from '../utils/character';
import { AiError, isCallerAbort } from './errors';
import { extractJson } from './extractJson';
import {
  backgroundRewritePrompt,
  nameRerollPrompt,
  newCharacterPrompt,
  type Prompt,
} from './prompts';
import { type AiProvider, withTimeout } from './providers';
import { type NameField, validateContribution } from './schemas';
import type {
  AiContributionField,
  ConnectionTestResult,
  GenerationOutcome,
} from './types';

const NAME_FIELDS: readonly NameField[] = ['firstName', 'lastName', 'epithet'];
const ALL_FIELDS: readonly AiContributionField[] = [
  ...NAME_FIELDS,
  'background',
];

const isNameField = (property: keyof Character): property is NameField =>
  (NAME_FIELDS as readonly string[]).includes(property);

const appOnly = (
  character: Character,
  failure?: AiError,
): GenerationOutcome => ({
  character,
  source: 'app',
  completedFields: [],
  failure,
});

/** Calls the provider and turns the answer into a JSON value (or undefined). */
const ask = async (
  provider: AiProvider,
  { system, prompt, schema }: Prompt,
  signal: AbortSignal,
): Promise<unknown> => {
  const answer = await provider.complete({
    system,
    prompt,
    schema,
    signal: withTimeout(signal),
  });
  return typeof answer === 'string' ? extractJson(answer) : answer;
};

/**
 * Normalises any failure: a caller abort (component gone) is rethrown so the
 * caller can ignore it; everything else becomes an AiError.
 */
const toAiError = (error: unknown, provider: AiProvider): AiError => {
  if (isCallerAbort(error)) throw error;
  return error instanceof AiError
    ? error
    : new AiError('provider-error', provider.type);
};

const differs = (a: unknown, b: unknown) =>
  typeof a === 'string' && typeof b === 'string'
    ? a.trim().toLowerCase() !== b.trim().toLowerCase()
    : a !== b;

/**
 * Rerolls one property with the app's own content, making sure the new value
 * differs from the previous one. Other properties are kept; the background is
 * regenerated from the app's templates.
 */
export const rerollWithApp = (
  character: Character,
  property: keyof Character,
): Character => {
  let next = character;
  for (let attempt = 0; attempt < 20; attempt++) {
    next = generateRandomCharacter({ ...character, [property]: undefined });
    if (differs(next[property], character[property])) break;
  }
  return next;
};

/** New character: the app decides the rules values, the AI writes the text (FR-007). */
export const generateCharacter = async (
  provider: AiProvider | undefined,
  signal: AbortSignal,
): Promise<GenerationOutcome> => {
  const base = generateRandomCharacter({});
  if (!provider) return appOnly(base);

  let answer: unknown;
  try {
    answer = await ask(provider, newCharacterPrompt(base), signal);
  } catch (error) {
    return appOnly(base, toAiError(error, provider));
  }

  const valid = validateContribution(answer, ALL_FIELDS);
  if (!valid.background) {
    return appOnly(base, new AiError('invalid-answer', provider.type));
  }
  const completedFields = NAME_FIELDS.filter((field) => !valid[field]);
  return {
    character: { ...base, ...valid },
    source: completedFields.length ? 'ai-completed' : 'ai',
    completedFields,
  };
};

const rerollName = async (
  provider: AiProvider,
  character: Character,
  field: NameField,
  signal: AbortSignal,
): Promise<GenerationOutcome> => {
  const fallback = rerollWithApp(character, field);
  let answer: unknown;
  try {
    answer = await ask(provider, nameRerollPrompt(character, field), signal);
  } catch (error) {
    return appOnly(fallback, toAiError(error, provider));
  }

  const valid = validateContribution(answer, [field, 'background']);
  const proposed = valid[field];
  const accepted =
    proposed !== undefined && differs(proposed, character[field])
      ? proposed
      : undefined;
  const value = accepted ?? fallback[field];

  if (!valid.background) {
    // Background from the app's templates, consistent with the chosen value.
    return appOnly(
      generateRandomCharacter({ ...character, [field]: value }),
      new AiError('invalid-answer', provider.type),
    );
  }
  return {
    character: { ...character, [field]: value, background: valid.background },
    source: accepted ? 'ai' : 'ai-completed',
    completedFields: accepted ? [] : [field],
  };
};

const rerollRulesValue = async (
  provider: AiProvider,
  character: Character,
  property: keyof Character,
  signal: AbortSignal,
): Promise<GenerationOutcome> => {
  const updated = rerollWithApp(character, property);
  let answer: unknown;
  try {
    answer = await ask(
      provider,
      backgroundRewritePrompt(updated, property),
      signal,
    );
  } catch (error) {
    return appOnly(updated, toAiError(error, provider));
  }
  const { background } = validateContribution(answer, ['background']);
  if (!background) {
    return appOnly(updated, new AiError('invalid-answer', provider.type));
  }
  return {
    character: { ...updated, background },
    source: 'ai',
    completedFields: [],
  };
};

/**
 * Rerolls one property and nothing else (FR-008). Names and epithet are proposed
 * by the AI; race, class, gender, alignment and age are chosen by the app and the
 * AI rewrites the background.
 */
export const rerollProperty = (
  provider: AiProvider | undefined,
  character: Character,
  property: keyof Character,
  signal: AbortSignal,
): Promise<GenerationOutcome> => {
  if (!provider)
    return Promise.resolve(appOnly(rerollWithApp(character, property)));
  return isNameField(property)
    ? rerollName(provider, character, property, signal)
    : rerollRulesValue(provider, character, property, signal);
};

const PING = {
  system: 'Answer with a single JSON object and nothing else.',
  prompt: 'Reply with {"ok": true}.',
  schema: z.object({ ok: z.boolean() }),
};

/**
 * Checks that the provider answers with the chosen model, and lists the models
 * it offers when it can (FR-006, FR-006a).
 */
export const testConnection = async (
  provider: AiProvider,
  model: string,
  signal: AbortSignal,
): Promise<ConnectionTestResult> => {
  try {
    let models: string[] | undefined;
    try {
      models = await provider.listModels(withTimeout(signal));
    } catch (error) {
      const aiError = toAiError(error, provider);
      // A refused key or a blocked address will fail the completion too: report it now.
      if (['auth', 'blocked-insecure'].includes(aiError.cause)) throw aiError;
    }
    await provider.complete({ ...PING, signal: withTimeout(signal) });
    return { ok: true, model, models: models?.length ? models : undefined };
  } catch (error) {
    return { ok: false, error: toAiError(error, provider) };
  }
};
