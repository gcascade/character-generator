/**
 * Every adapter must behave the same way for the orchestration (FR-019).
 * A new provider is added to `adapters` below and must pass the same suite.
 */
import { z } from 'zod';
import { createAnthropicProvider } from './anthropic';
import { createOpenAiCompatibleProvider } from './openaiCompatible';
import type { AiProvider } from './provider';
import {
  activeSignal,
  cancelledSignal,
  json,
  queuedFetch,
  timedOutSignal,
} from './testing';

type Responder = (Response | Error | DOMException)[];

type Adapter = {
  name: string;
  /** Builds the adapter on top of a fetch answering with `responses`. */
  build: (responses: Responder) => AiProvider;
  success: () => Response;
  modelList: (ids: string[]) => Response;
};

const schema = z.object({ ok: z.boolean() });

const adapters: Adapter[] = [
  {
    name: 'OpenAI-compatible',
    build: (responses) => {
      vi.stubGlobal('fetch', queuedFetch(...responses));
      return createOpenAiCompatibleProvider({
        providerType: 'openai-compatible',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        apiKey: 'k',
      });
    },
    success: () => json({ choices: [{ message: { content: '{"ok":true}' } }] }),
    modelList: (ids) => json({ data: ids.map((id) => ({ id })) }),
  },
  {
    name: 'Anthropic',
    build: (responses) =>
      createAnthropicProvider({
        model: 'm',
        apiKey: 'k',
        fetch: queuedFetch(...responses),
      }),
    success: () =>
      json({
        id: 'msg',
        type: 'message',
        role: 'assistant',
        model: 'm',
        content: [{ type: 'text', text: '{"ok":true}' }],
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
      }),
    modelList: (ids) =>
      json({
        data: ids.map((id) => ({
          id,
          type: 'model',
          display_name: id,
          created_at: '2026-01-01T00:00:00Z',
        })),
        has_more: false,
        first_id: ids[0] ?? null,
        last_id: ids[ids.length - 1] ?? null,
      }),
  },
];

const errorResponse = (status: number, message = 'error') =>
  json({ error: { type: 'error', message } }, status);

const complete = (provider: AiProvider, signal = activeSignal()) =>
  provider.complete({ system: 's', prompt: 'p', schema, signal });

describe.each(adapters)('$name adapter conformance', (adapter) => {
  afterEach(() => vi.unstubAllGlobals());

  it('exposes its provider type', () => {
    expect(adapter.build([]).type).toBeTruthy();
  });

  it('returns an answer that the orchestration can read', async () => {
    const answer = await complete(adapter.build([adapter.success()]));
    const parsed = typeof answer === 'string' ? JSON.parse(answer) : answer;
    expect(parsed).toEqual({ ok: true });
  });

  it.each([
    [401, 'auth'],
    [403, 'auth'],
    [429, 'rate-limited'],
    [500, 'provider-error'],
  ] as const)('maps HTTP %i to "%s"', async (status, cause) => {
    await expect(
      complete(adapter.build([errorResponse(status)])),
    ).rejects.toMatchObject({ cause, status });
  });

  it('maps an unknown model to "unknown-model"', async () => {
    await expect(
      complete(adapter.build([errorResponse(404, 'model "m" not found')])),
    ).rejects.toMatchObject({ cause: 'unknown-model' });
  });

  it('maps a network failure to "unreachable"', async () => {
    await expect(
      complete(adapter.build([new TypeError('Failed to fetch')])),
    ).rejects.toMatchObject({ cause: 'unreachable' });
  });

  it('maps the time limit to "timeout"', async () => {
    await expect(
      complete(
        adapter.build([new DOMException('Timed out', 'TimeoutError')]),
        timedOutSignal(),
      ),
    ).rejects.toMatchObject({ cause: 'timeout' });
  });

  it('lets a caller abort through so the caller can ignore it', async () => {
    await expect(
      complete(
        adapter.build([new DOMException('Aborted', 'AbortError')]),
        cancelledSignal(),
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('lists model ids', async () => {
    await expect(
      adapter.build([adapter.modelList(['a', 'b'])]).listModels(activeSignal()),
    ).resolves.toEqual(['a', 'b']);
  });
});
