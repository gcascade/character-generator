import type { ZodType } from 'zod';

export type CompletionRequest = {
  system: string;
  prompt: string;
  /** Expected answer shape; used for structured output where the provider supports it. */
  schema: ZodType;
  /** Combines the 60 s time limit and the caller's signal. */
  signal: AbortSignal;
};

/**
 * Contract every AI provider adapter implements (contracts/ai-provider.md).
 * Adapters reject with `AiError` only, except when the caller aborts.
 */
export interface AiProvider {
  /** Resolves with the answer: a parsed object when the provider guarantees JSON, text otherwise. */
  complete(request: CompletionRequest): Promise<unknown>;
  /** Model ids offered by the provider, or `undefined` when listing is not supported. */
  listModels(signal: AbortSignal): Promise<string[] | undefined>;
}
