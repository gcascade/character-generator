import type { MessageKey, MessageParams } from '../i18n';
import { translate } from '../i18n';
import type { Alert } from '../types/alerts';
import type { AiError } from './errors';
import type {
  AiContributionField,
  GenerationOutcome,
  ProviderSettings,
} from './types';

export type AlertContent = Pick<Alert, 'severity' | 'message'>;

/** Translation function, `useT()` in components. Defaults to English. */
export type Translate = (key: MessageKey, params?: MessageParams) => string;

const english: Translate = (key, params) => translate('en', key, params);

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

const listFields = (fields: AiContributionField[], t: Translate) => {
  const names = fields.map((field) => t(`ai.field.${field}`));
  return names.length <= 1
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} ${t('ai.and')} ${names[names.length - 1]}`;
};

/** Plain-words cause, and where to fix it when the user can (FR-017). */
export const describeFailure = (
  error: AiError,
  provider: ProviderContext,
  t: Translate = english,
): string => {
  const { name, address = '', model = '' } = provider;
  return t(`ai.error.${error.cause}`, {
    provider: name,
    address: address || name,
    model,
    at: address ? t('ai.error.at', { address }) : '',
    status: error.status ? t('ai.error.status', { status: error.status }) : '',
  });
};

export type OutcomeKind = 'generate' | 'reroll' | 'translate';

/** Chooses the alert shown after a generation, a reroll or a translation (FR-016). */
export const outcomeToAlert = (
  outcome: GenerationOutcome,
  kind: OutcomeKind,
  provider: ProviderContext | undefined,
  t: Translate = english,
): AlertContent => {
  const done = t(`ai.done.${kind}`);

  if (!provider || (outcome.source === 'app' && !outcome.failure)) {
    return { severity: 'success', message: done };
  }
  if (outcome.source === 'ai') {
    return {
      severity: 'success',
      message: t('ai.withProvider', { done, provider: provider.name }),
    };
  }
  if (outcome.source === 'ai-completed') {
    return {
      severity: 'info',
      message: t('ai.completed', {
        done,
        provider: provider.name,
        fields: listFields(outcome.completedFields, t),
      }),
    };
  }
  return {
    severity: 'warning',
    message: `${describeFailure(outcome.failure!, provider, t)} ${t(`ai.fallback.${kind}`)}`,
  };
};
