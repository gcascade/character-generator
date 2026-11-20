import {
  ANONYMOUS_KEY,
  HORDE_URL,
  paintWithHorde,
  PortraitError,
} from './horde';

const prompt = { positive: 'a gnome bard', negative: 'text' };
const IMAGE = 'A'.repeat(200);

type Reply = { status?: number; body: unknown } | Error;

/** A fetch that answers in order and records the calls. */
const fakeHorde = (replies: Reply[]) => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetch = vi.fn(async (url: string, init: RequestInit = {}) => {
    calls.push({ url, init });
    if (init.method === 'DELETE') return new Response('{}');
    const reply = replies.shift();
    if (!reply) throw new Error('no more replies');
    if (reply instanceof Error) throw reply;
    return new Response(JSON.stringify(reply.body), {
      status: reply.status ?? 200,
    });
  });
  vi.stubGlobal('fetch', fetch);
  return calls;
};

const submitted = { status: 202, body: { id: 'job1' } };
const waiting = (queue: number, wait: number) => ({
  body: { done: false, queue_position: queue, wait_time: wait, processing: 0 },
});
const done = { body: { done: true } };
const result = (extra = {}) => ({
  body: { generations: [{ img: IMAGE, ...extra }] },
});

describe('paintWithHorde', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('submits anonymously, reports the queue and returns the image', async () => {
    const calls = fakeHorde([
      submitted,
      waiting(5, 60),
      waiting(0, 10),
      done,
      result(),
    ]);
    const progress = vi.fn();
    const painting = paintWithHorde(prompt, {
      signal: new AbortController().signal,
      onProgress: progress,
    });
    await vi.advanceTimersByTimeAsync(10000);
    await expect(painting).resolves.toBe(`data:image/webp;base64,${IMAGE}`);

    const [submit] = calls;
    expect(submit.url).toBe(`${HORDE_URL}/generate/async`);
    expect((submit.init.headers as Record<string, string>).apikey).toBe(
      ANONYMOUS_KEY,
    );
    const body = JSON.parse(submit.init.body as string);
    expect(body).toMatchObject({ nsfw: false, censor_nsfw: true, r2: false });
    expect(body.prompt).toBe('a gnome bard ### text');
    expect(progress).toHaveBeenNthCalledWith(1, {
      queuePosition: 5,
      waitSeconds: 60,
      processing: false,
    });
    expect(calls.map((c) => c.url.replace(HORDE_URL, ''))).toEqual([
      '/generate/async',
      '/generate/check/job1',
      '/generate/check/job1',
      '/generate/check/job1',
      '/generate/status/job1',
    ]);
  });

  it('withdraws the request when cancelled', async () => {
    const calls = fakeHorde([submitted, waiting(9, 120), waiting(9, 120)]);
    const controller = new AbortController();
    const painting = paintWithHorde(prompt, { signal: controller.signal });
    const settled = painting.catch((error) => error);
    await vi.advanceTimersByTimeAsync(1000);
    controller.abort(new DOMException('Cancelled', 'AbortError'));
    expect((await settled).name).toBe('AbortError');
    expect(calls.at(-1)).toMatchObject({
      url: `${HORDE_URL}/generate/status/job1`,
      init: { method: 'DELETE' },
    });
  });

  it('stops after the time limit and withdraws the request', async () => {
    const calls = fakeHorde([submitted, ...Array(10).fill(waiting(30, 900))]);
    const painting = paintWithHorde(prompt, {
      signal: new AbortController().signal,
      timeoutMs: 6000,
    });
    const settled = painting.catch((error) => error);
    await vi.advanceTimersByTimeAsync(20000);
    const error = await settled;
    expect(error).toBeInstanceOf(PortraitError);
    expect(error.reason).toBe('timed-out');
    expect(calls.at(-1)?.init.method).toBe('DELETE');
  });

  it.each([
    ['unreachable', [new TypeError('Failed to fetch')]],
    ['rejected', [{ status: 429, body: { message: 'Too many requests' } }]],
    ['invalid-answer', [{ status: 202, body: {} }]],
    ['faulted', [submitted, { body: { done: false, faulted: true } }]],
    ['impossible', [submitted, { body: { done: false, is_possible: false } }]],
    ['censored', [submitted, done, result({ censored: true })]],
  ] as [string, Reply[]][])('fails with "%s"', async (reason, replies) => {
    fakeHorde(replies);
    const error = await paintWithHorde(prompt, {
      signal: new AbortController().signal,
    }).catch((e) => e);
    expect(error).toBeInstanceOf(PortraitError);
    expect(error.reason).toBe(reason);
  });
});
