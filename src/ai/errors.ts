import type { ProviderType } from './types';

export const AI_ERROR_CAUSES = [
  'unreachable',
  'blocked-insecure',
  'auth',
  'unknown-model',
  'rate-limited',
  'provider-error',
  'timeout',
  'refused',
  'invalid-answer',
] as const;

export type AiErrorCause = (typeof AI_ERROR_CAUSES)[number];

/** The only error type adapters and the orchestration let through. */
export class AiError extends Error {
  readonly cause: AiErrorCause;
  readonly providerType: ProviderType;
  readonly status?: number;

  constructor(
    cause: AiErrorCause,
    providerType: ProviderType,
    options: { status?: number; detail?: string } = {},
  ) {
    super(options.detail ? `${cause}: ${options.detail}` : cause);
    this.name = 'AiError';
    this.cause = cause;
    this.providerType = providerType;
    this.status = options.status;
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Browsers block requests from an https page to a plain http address,
 * except for the local machine.
 */
export const isInsecureAddress = (
  url: string,
  pageProtocol: string = globalThis.location?.protocol ?? 'https:',
): boolean => {
  if (pageProtocol !== 'https:') return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'http:' && !LOCAL_HOSTS.has(hostname);
  } catch {
    return false;
  }
};

/** Maps an HTTP error status to a cause. */
export const causeFromStatus = (status: number, body: string): AiErrorCause => {
  if (status === 401 || status === 403) return 'auth';
  if (status === 404 && /model/i.test(body)) return 'unknown-model';
  if (status === 429) return 'rate-limited';
  return 'provider-error';
};

// DOMExceptions can come from another realm (e.g. jsdom), so compare names, not classes.
const errorName = (error: unknown): string | undefined =>
  typeof error === 'object' && error !== null && 'name' in error
    ? String((error as { name: unknown }).name)
    : undefined;

/**
 * When `signal` is aborted: a timeout becomes an AiError, a caller abort
 * (component gone) is rethrown as-is so callers can ignore it.
 * Returns normally when the signal is not aborted.
 */
export const throwIfAborted = (
  signal: AbortSignal,
  providerType: ProviderType,
): void => {
  if (!signal.aborted) return;
  const reason: unknown = signal.reason;
  if (errorName(reason) === 'TimeoutError') {
    throw new AiError('timeout', providerType);
  }
  throw reason;
};

export const isCallerAbort = (error: unknown): boolean =>
  errorName(error) === 'AbortError';
