import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { AiError, type AiErrorCause, throwIfAborted } from '../errors';
import type { AiProvider, CompletionRequest } from './provider';

type Options = {
  model: string;
  apiKey?: string;
  /** Injected in tests; defaults to the browser's fetch. */
  fetch?: typeof globalThis.fetch;
};

const PROVIDER = 'anthropic' as const;

const causeFromSdkError = (error: unknown): AiErrorCause => {
  if (error instanceof Anthropic.AuthenticationError) return 'auth';
  if (error instanceof Anthropic.PermissionDeniedError) return 'auth';
  if (error instanceof Anthropic.NotFoundError) return 'unknown-model';
  if (error instanceof Anthropic.RateLimitError) return 'rate-limited';
  if (error instanceof Anthropic.APIConnectionError) return 'unreachable';
  if (error instanceof Anthropic.APIError) return 'provider-error';
  // Anything else (e.g. the structured answer could not be parsed).
  return 'invalid-answer';
};

/**
 * Wraps an SDK call: a caller abort is rethrown, a timeout and every SDK error
 * become an AiError.
 */
const guard = async <T>(signal: AbortSignal, call: () => Promise<T>) => {
  try {
    return await call();
  } catch (error) {
    throwIfAborted(signal, PROVIDER);
    if (error instanceof AiError) throw error;
    throw new AiError(causeFromSdkError(error), PROVIDER, {
      status: error instanceof Anthropic.APIError ? error.status : undefined,
    });
  }
};

/** Adapter for Claude through Anthropic's official SDK, called directly from the browser. */
export const createAnthropicProvider = ({
  model,
  apiKey,
  fetch,
}: Options): AiProvider => {
  const client = new Anthropic({
    fetch,
    apiKey: apiKey ?? '',
    // The key is the user's own, entered in this browser and sent only to Anthropic (FR-005).
    dangerouslyAllowBrowser: true,
    // The orchestration owns the 60 s limit; SDK retries would hide it.
    maxRetries: 0,
  });

  return {
    type: PROVIDER,

    complete({ system, prompt, schema, signal }: CompletionRequest) {
      return guard(signal, async () => {
        if (!apiKey) throw new AiError('auth', PROVIDER);
        const message = await client.beta.messages.parse(
          {
            model,
            max_tokens: 4096,
            system,
            messages: [{ role: 'user', content: prompt }],
            output_config: {
              format: betaZodOutputFormat(schema),
              // Short creative text: low effort keeps answers fast and well under the time limit.
              effort: 'low',
            },
            // On a refusal, let Anthropic retry with a suitable model before giving up.
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
          },
          { signal },
        );
        if (message.stop_reason === 'refusal') {
          throw new AiError('refused', PROVIDER);
        }
        if (message.parsed_output === null) {
          throw new AiError('invalid-answer', PROVIDER);
        }
        return message.parsed_output;
      });
    },

    listModels(signal: AbortSignal) {
      return guard(signal, async () => {
        if (!apiKey) throw new AiError('auth', PROVIDER);
        const ids: string[] = [];
        for await (const model of client.models.list(
          { limit: 100 },
          { signal },
        )) {
          ids.push(model.id);
        }
        return ids;
      });
    },
  };
};
