import type { Alert } from '../types/alerts';
import type { AiErrorCause } from './errors';
import type { AiError } from './errors';
import type {
  AiContributionField,
  GenerationOutcome,
  ProviderSettings,
} from './types';

export type AlertContent = Pick<Alert, 'severity' | 'message'>;

export type ProviderContext = {
  /** Human name of the provider, e.g. "Ollama" or "api.openai.com". */
  name: string;
  address?: string;
  model?: string;
};

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/** Describes the active provider for messages. */
export const providerContext = (
  settings: ProviderSettings,
): ProviderContext | undefined => {
  switch (settings.activeType) {
    case 'none':
      return undefined;
    case 'ollama':
      return {
        name: 'Ollama',
        address: settings.ollama.baseUrl,
        model: settings.ollama.model,
      };
    case 'anthropic':
      return { name: 'Claude', model: settings.anthropic.model };
    case 'openai-compatible':
      return {
        name: hostOf(settings.openaiCompatible.baseUrl),
        address: settings.openaiCompatible.baseUrl,
        model: settings.openaiCompatible.model,
      };
  }
};

const FIELD_NAMES: Record<AiContributionField, string> = {
  firstName: 'the first name',
  lastName: 'the last name',
  epithet: 'the epithet',
  background: 'the background',
};

const listFields = (fields: AiContributionField[]) => {
  const names = fields.map((field) => FIELD_NAMES[field]);
  return names.length <= 1
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

/** Plain-words cause, and where to fix it when the user can (FR-017). */
export const describeFailure = (
  error: AiError,
  provider: ProviderContext,
): string => {
  const { name, address = '', model = '' } = provider;
  const messages: Record<AiErrorCause, string> = {
    unreachable: `Couldn't reach ${name}${address ? ` at ${address}` : ''}. Check that it is running and the address in Settings. If it runs on your machine, allow this site to call it (for Ollama: OLLAMA_ORIGINS).`,
    'blocked-insecure': `Your browser blocks requests from this secure page to ${address || name} (http). Use an https address or run the provider on this computer (localhost).`,
    auth: `${name} refused the API key. Check it in Settings.`,
    'unknown-model': `${name} doesn't know the model "${model}". Pick another one in Settings.`,
    'rate-limited': `${name} is limiting requests. Try again in a moment.`,
    'provider-error': `${name} returned an error${error.status ? ` (${error.status})` : ''}. Try again later.`,
    timeout: `${name} took longer than 60 seconds.`,
    refused: `${name} declined to write this character.`,
    'invalid-answer': `${name}'s answer couldn't be used.`,
  };
  return messages[error.cause];
};

/** Chooses the alert shown after a generation or a reroll (FR-016). */
export const outcomeToAlert = (
  outcome: GenerationOutcome,
  kind: 'generate' | 'reroll',
  provider: ProviderContext | undefined,
): AlertContent => {
  const done =
    kind === 'generate' ? 'New character generated' : 'Character updated';

  if (!provider || (outcome.source === 'app' && !outcome.failure)) {
    return { severity: 'success', message: done };
  }
  if (outcome.source === 'ai') {
    return { severity: 'success', message: `${done} with ${provider.name}.` };
  }
  if (outcome.source === 'ai-completed') {
    return {
      severity: 'info',
      message: `${done} with ${provider.name}. ${provider.name} left out ${listFields(outcome.completedFields)}, filled in by the generator.`,
    };
  }
  const ending =
    kind === 'generate'
      ? 'A character was generated without AI.'
      : 'The background comes from the generator.';
  return {
    severity: 'warning',
    message: `${describeFailure(outcome.failure!, provider)} ${ending}`,
  };
};
