import type { ApiKeys, ProviderSettings } from '../types';
import { createAnthropicProvider } from './anthropic';
import { createOpenAiCompatibleProvider } from './openaiCompatible';
import type { AiProvider } from './provider';

export type { AiProvider, CompletionRequest } from './provider';

/** Every AI request stops after this delay (FR-011). */
export const AI_TIMEOUT_MS = 60_000;

/** Combines the time limit with the caller's signal (aborted when the caller goes away). */
export const withTimeout = (
  signal: AbortSignal,
  timeoutMs: number = AI_TIMEOUT_MS,
): AbortSignal => AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path}`;

/** Builds the adapter for the active provider, or `undefined` for "No AI". */
export const createProvider = (
  settings: ProviderSettings,
  keys: ApiKeys,
): AiProvider | undefined => {
  switch (settings.activeType) {
    case 'none':
      return undefined;
    case 'ollama':
      // Ollama speaks the OpenAI protocol under /v1 and needs no key.
      return createOpenAiCompatibleProvider({
        providerType: 'ollama',
        baseUrl: joinUrl(settings.ollama.baseUrl, 'v1'),
        model: settings.ollama.model,
      });
    case 'openai-compatible':
      return createOpenAiCompatibleProvider({
        providerType: 'openai-compatible',
        baseUrl: settings.openaiCompatible.baseUrl,
        model: settings.openaiCompatible.model,
        apiKey: keys['openai-compatible'],
      });
    case 'anthropic':
      return createAnthropicProvider({
        model: settings.anthropic.model,
        apiKey: keys.anthropic,
      });
  }
};

/** Model currently selected for the active provider. */
export const activeModel = (settings: ProviderSettings): string | undefined => {
  switch (settings.activeType) {
    case 'none':
      return undefined;
    case 'ollama':
      return settings.ollama.model;
    case 'openai-compatible':
      return settings.openaiCompatible.model;
    case 'anthropic':
      return settings.anthropic.model;
  }
};
