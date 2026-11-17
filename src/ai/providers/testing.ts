import { vi } from 'vitest';

/** A fetch mock answering each call with the next queued response. */
export const queuedFetch = (...responses: (Response | Error)[]) =>
  vi.fn<typeof fetch>(async () => {
    const next = responses.shift();
    if (!next) throw new Error('No more queued responses');
    if (next instanceof Error) throw next;
    return next;
  });

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const activeSignal = () => new AbortController().signal;

export const timedOutSignal = () => {
  const controller = new AbortController();
  controller.abort(new DOMException('Timed out', 'TimeoutError'));
  return controller.signal;
};

export const cancelledSignal = () => {
  const controller = new AbortController();
  controller.abort();
  return controller.signal;
};

/**
 * A fake AiProvider answering `complete` with the queued values (an AiError or
 * any Error is thrown instead). Records each request.
 */
export const fakeProvider = (
  answers: unknown[],
  options: {
    type?: 'ollama' | 'openai-compatible' | 'anthropic';
    models?: string[] | Error;
  } = {},
) => {
  const requests: { system: string; prompt: string }[] = [];
  return {
    requests,
    provider: {
      type: options.type ?? 'ollama',
      complete: vi.fn(async (request: { system: string; prompt: string }) => {
        requests.push({ system: request.system, prompt: request.prompt });
        const next = answers.shift();
        // jsdom's DOMException does not extend Error.
        if (next instanceof Error || next instanceof DOMException) throw next;
        return next;
      }),
      listModels: vi.fn(async () => {
        if (options.models instanceof Error) throw options.models;
        return options.models;
      }),
    },
  };
};
