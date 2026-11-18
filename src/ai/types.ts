import type { Character } from '../types/character';
import type { AiError } from './errors';

export const PROVIDER_TYPES = [
  'none',
  'ollama',
  'anthropic',
  'openai-compatible',
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

/** Provider types that need an API key. */
export type KeyedProviderType = 'anthropic' | 'openai-compatible';

/** Stored settings. Contains no secret: keys live in {@link ApiKeys}. */
export type ProviderSettings = {
  version: 1;
  activeType: ProviderType;
  ollama: { baseUrl: string; model: string };
  openaiCompatible: { baseUrl: string; model: string };
  anthropic: { model: string };
  rememberKey: boolean;
};

export type ApiKeys = Partial<Record<KeyedProviderType, string>>;

/** The part of a character an AI provider is allowed to write. */
export type AiContribution = {
  firstName: string;
  lastName: string;
  epithet: string;
  background: NonNullable<Character['background']>;
};

export type AiContributionField = keyof AiContribution;

export type OutcomeSource = 'ai' | 'ai-completed' | 'app';

export type GenerationOutcome = {
  /** Always complete and valid. */
  character: Character;
  source: OutcomeSource;
  /** Fields filled in by the app when `source` is `ai-completed`. */
  completedFields: AiContributionField[];
  /** Why the AI result was not used, when `source` is `app` because of a failure. */
  failure?: AiError;
  /** Set when a reroll found no other value fitting the locked properties (spec 003). */
  unchanged?: boolean;
};

export type ConnectionTestResult =
  | { ok: true; model: string; models?: string[] }
  | { ok: false; error: AiError };
