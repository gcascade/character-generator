import { z } from 'zod';

/*
 * AI Horde image client (spec 011 R1): a free community queue reachable from
 * the browser. Submit, poll the light "check" endpoint, then read the result
 * once. The anonymous key gives the lowest priority but needs no account.
 */

export const HORDE_URL = 'https://aihorde.net/api/v2';
export const ANONYMOUS_KEY = '0000000000';
const CLIENT_AGENT =
  'character-generator:1.0:https://github.com/gcascade/character-generator';

/*
 * Any available model at 512 px: a single model queues for 20 minutes or more
 * for accounts without kudos, any model usually answers within a few minutes.
 * The style comes from the prompt; the negative prompt keeps anime and cartoon
 * styles away.
 */
export const HORDE_SIZE = 512;
const POLL_MS = 4000;
export const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

export type PortraitErrorCause =
  | 'unreachable'
  | 'rejected'
  | 'impossible'
  | 'faulted'
  | 'censored'
  | 'timed-out'
  | 'invalid-answer';

export class PortraitError extends Error {
  readonly reason: PortraitErrorCause;

  constructor(reason: PortraitErrorCause, message: string = reason) {
    super(message);
    this.name = 'PortraitError';
    this.reason = reason;
  }
}

export type PaintProgress = {
  /** Place in the queue (0 while painting). */
  queuePosition: number;
  /** Estimated seconds left. */
  waitSeconds: number;
  processing: boolean;
};

const submitAnswer = z.object({ id: z.string().min(1) });
const errorAnswer = z.object({ message: z.string() }).partial();
const checkAnswer = z.object({
  done: z.boolean(),
  faulted: z.boolean().optional(),
  is_possible: z.boolean().optional(),
  wait_time: z.number().optional(),
  queue_position: z.number().optional(),
  processing: z.number().optional(),
});
const statusAnswer = z.object({
  faulted: z.boolean().optional(),
  generations: z
    .array(
      z.object({
        img: z.string().min(100),
        censored: z.boolean().optional(),
      }),
    )
    .min(1),
});

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

type PaintOptions = {
  signal: AbortSignal;
  onProgress?: (progress: PaintProgress) => void;
  timeoutMs?: number;
  apiKey?: string;
  size?: number;
};

/**
 * Paints one image and returns it as a data URL. Throws `PortraitError` on
 * failure, the abort reason when cancelled; a cancelled request is withdrawn
 * from the queue.
 */
export const paintWithHorde = async (
  prompt: { positive: string; negative: string },
  {
    signal,
    onProgress,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    apiKey = ANONYMOUS_KEY,
    size = HORDE_SIZE,
  }: PaintOptions,
): Promise<string> => {
  const headers = {
    apikey: apiKey,
    'Client-Agent': CLIENT_AGENT,
    'Content-Type': 'application/json',
  };
  const call = async (path: string, init: RequestInit = {}) => {
    let response: Response;
    try {
      response = await fetch(`${HORDE_URL}${path}`, {
        ...init,
        headers,
        signal: init.signal ?? signal,
      });
    } catch (error) {
      if (signal.aborted) throw signal.reason;
      throw new PortraitError('unreachable', String(error));
    }
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const message = errorAnswer.safeParse(body).data?.message;
      throw new PortraitError('rejected', message ?? `HTTP ${response.status}`);
    }
    return body;
  };

  const submitted = submitAnswer.safeParse(
    await call('/generate/async', {
      method: 'POST',
      body: JSON.stringify({
        prompt: `${prompt.positive} ### ${prompt.negative}`,
        params: {
          width: size,
          height: size,
          steps: 25,
          cfg_scale: 6,
          sampler_name: 'k_euler_a',
          n: 1,
        },
        nsfw: false,
        censor_nsfw: true,
        r2: false,
        shared: false,
      }),
    }),
  );
  if (!submitted.success) throw new PortraitError('invalid-answer');
  const { id } = submitted.data;

  const withdraw = () =>
    fetch(`${HORDE_URL}/generate/status/${id}`, {
      method: 'DELETE',
      headers,
    }).catch(() => undefined);

  const deadline = Date.now() + timeoutMs;
  try {
    for (;;) {
      const check = checkAnswer.safeParse(await call(`/generate/check/${id}`));
      if (!check.success) throw new PortraitError('invalid-answer');
      const state = check.data;
      if (state.faulted) throw new PortraitError('faulted');
      if (state.is_possible === false) throw new PortraitError('impossible');
      if (state.done) break;
      onProgress?.({
        queuePosition: state.queue_position ?? 0,
        waitSeconds: state.wait_time ?? 0,
        processing: (state.processing ?? 0) > 0,
      });
      if (Date.now() > deadline) throw new PortraitError('timed-out');
      await sleep(POLL_MS, signal);
    }
    const status = statusAnswer.safeParse(await call(`/generate/status/${id}`));
    if (!status.success) throw new PortraitError('invalid-answer');
    const [generation] = status.data.generations;
    if (generation.censored) throw new PortraitError('censored');
    return generation.img.startsWith('data:')
      ? generation.img
      : `data:image/webp;base64,${generation.img}`;
  } catch (error) {
    if (signal.aborted || isAbort(error) || error instanceof PortraitError) {
      if (!(error instanceof PortraitError) || error.reason === 'timed-out') {
        void withdraw();
      }
    }
    throw error;
  }
};
