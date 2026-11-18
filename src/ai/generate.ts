import { z } from 'zod';
import { renderCharacter } from '../content/character';
import { generateRandomCharacter, rerollWithApp } from '../content/generate';
import type { CharacterTemplate, LockableProperty } from '../content/template';
import type { Locale } from '../i18n';
import type { Character } from '../types/character';
import { AiError, isCallerAbort } from './errors';
import { extractJson } from './extractJson';
import {
  backgroundRewritePrompt,
  nameRerollPrompt,
  newCharacterPrompt,
  type Prompt,
  type PromptCharacter,
  translatePrompt,
} from './prompts';
import { type AiProvider, withTimeout } from './providers';
import { type NameField, validateContribution } from './schemas';
import type {
  AiContributionField,
  ConnectionTestResult,
  GenerationOutcome,
} from './types';

export { rerollWithApp };

const NAME_FIELDS: readonly NameField[] = ['firstName', 'lastName', 'epithet'];

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

/** The character as the AI should see it: with its epithet in words. */
const view = (character: Character, locale: Locale): PromptCharacter => ({
  ...character,
  epithet: renderCharacter(character, locale).epithet,
});

/** Marks text as written by the AI in `locale` (FR-015). */
const writtenByAi = (character: Character, locale: Locale): Character => ({
  ...character,
  textLanguage: locale,
  textSource: 'ai',
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
 * New character: the app decides the rules values and its own content; the AI
 * writes names, epithet and background in `locale` (FR-007, spec 002 FR-014).
 */
export const generateCharacter = async (
  provider: AiProvider | undefined,
  signal: AbortSignal,
  locale: Locale = 'en',
  template: CharacterTemplate = {},
): Promise<GenerationOutcome> => {
  const base = generateRandomCharacter(template);
  if (!provider) return appOnly(base);

  // Locked names and epithet are fixed facts: never asked, never read (spec 003 FR-007).
  const fixed = NAME_FIELDS.filter((field) => template[field] !== undefined);
  const asked = NAME_FIELDS.filter((field) => !fixed.includes(field));
  let answer: unknown;
  try {
    answer = await ask(
      provider,
      newCharacterPrompt(view(base, locale), locale, fixed),
      signal,
    );
  } catch (error) {
    return appOnly(base, toAiError(error, provider));
  }

  const valid = validateContribution(answer, [...asked, 'background']);
  if (!valid.background) {
    return appOnly(base, new AiError('invalid-answer', provider.type));
  }
  const completedFields = asked.filter((field) => !valid[field]);
  return {
    // Missing fields keep the app's values (an epithet from content, rendered in any language).
    character: writtenByAi({ ...base, ...valid }, locale),
    source: completedFields.length ? 'ai-completed' : 'ai',
    completedFields,
  };
};

const rerollName = async (
  provider: AiProvider,
  character: Character,
  field: NameField,
  fallback: Character,
  signal: AbortSignal,
  locale: Locale,
): Promise<GenerationOutcome> => {
  const current = view(character, locale);
  let answer: unknown;
  try {
    answer = await ask(
      provider,
      nameRerollPrompt(current, field, locale),
      signal,
    );
  } catch (error) {
    return appOnly(fallback, toAiError(error, provider));
  }

  const valid = validateContribution(answer, [field, 'background']);
  const proposed = valid[field];
  const accepted =
    proposed !== undefined && differs(proposed, current[field])
      ? proposed
      : undefined;

  if (!valid.background) {
    // The app's own content, with the AI's value when it was usable.
    return appOnly(
      accepted !== undefined ? { ...fallback, [field]: accepted } : fallback,
      new AiError('invalid-answer', provider.type),
    );
  }
  const base = accepted !== undefined ? character : fallback;
  return {
    character: writtenByAi(
      {
        ...base,
        ...(accepted !== undefined ? { [field]: accepted } : {}),
        background: valid.background,
      },
      locale,
    ),
    source: accepted !== undefined ? 'ai' : 'ai-completed',
    completedFields: accepted !== undefined ? [] : [field],
  };
};

const rerollRulesValue = async (
  provider: AiProvider,
  character: Character,
  property: keyof Character,
  updated: Character,
  signal: AbortSignal,
  locale: Locale,
): Promise<GenerationOutcome> => {
  let answer: unknown;
  try {
    answer = await ask(
      provider,
      backgroundRewritePrompt(view(updated, locale), property, locale),
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
    character: writtenByAi({ ...updated, background }, locale),
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
  locale: Locale = 'en',
  locked: readonly LockableProperty[] = [],
): Promise<GenerationOutcome> => {
  const withApp = rerollWithApp(character, property, locked);
  if (withApp === character) {
    // Nothing else fits the other locked properties (spec 003 R5).
    return Promise.resolve({ ...appOnly(character), unchanged: true });
  }
  if (!provider) return Promise.resolve(appOnly(withApp));
  return isNameField(property)
    ? rerollName(provider, character, property, withApp, signal, locale)
    : rerollRulesValue(provider, character, property, withApp, signal, locale);
};

/**
 * Rewrites AI-written text (epithet and background) in `locale`, keeping the
 * story (spec 002 FR-015a). On failure the character is returned unchanged.
 */
export const translateWritten = async (
  provider: AiProvider,
  character: Character,
  locale: Locale,
  signal: AbortSignal,
): Promise<GenerationOutcome> => {
  const current = view(character, locale);
  const fields: AiContributionField[] =
    character.epithet !== undefined
      ? ['epithet', 'background']
      : ['background'];
  let answer: unknown;
  try {
    answer = await ask(provider, translatePrompt(current, locale), signal);
  } catch (error) {
    return appOnly(character, toAiError(error, provider));
  }
  const valid = validateContribution(answer, fields);
  if (!valid.background) {
    return appOnly(character, new AiError('invalid-answer', provider.type));
  }
  return {
    character: writtenByAi(
      {
        ...character,
        background: valid.background,
        ...(character.epithet !== undefined && valid.epithet
          ? { epithet: valid.epithet }
          : {}),
      },
      locale,
    ),
    source: 'ai',
    completedFields: [],
  };
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
