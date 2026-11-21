/** A fake AI Horde for tests and stories (spec 011): queue, then an image. */
export const PAINTED_IMAGE = `data:image/webp;base64,${'UklGR'.repeat(40)}`;

export const stubHorde = ({
  queue = [3, 0],
  fail,
}: { queue?: number[]; fail?: 'unreachable' | 'faulted' } = {}) => {
  const checks = [
    ...queue.map((position) => ({
      done: false,
      queue_position: position,
      wait_time: position * 20,
      processing: position === 0 ? 1 : 0,
    })),
    fail === 'faulted' ? { done: false, faulted: true } : { done: true },
  ];
  const fetch = vi.fn(async (url: string, init: RequestInit = {}) => {
    if (fail === 'unreachable') throw new TypeError('Failed to fetch');
    if (init.method === 'DELETE') return new Response('{}');
    if (url.endsWith('/generate/async')) {
      return new Response(JSON.stringify({ id: 'job' }), { status: 202 });
    }
    if (url.includes('/generate/check/')) {
      return new Response(JSON.stringify(checks.shift() ?? { done: true }));
    }
    return new Response(
      JSON.stringify({ generations: [{ img: PAINTED_IMAGE.split(',')[1] }] }),
    );
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};
