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
