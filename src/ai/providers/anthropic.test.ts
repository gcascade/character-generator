import { z } from 'zod';
import { createAnthropicProvider } from './anthropic';
import { activeSignal, json, queuedFetch } from './testing';

const schema = z.object({ epithet: z.string() });

const message = (overrides: Record<string, unknown> = {}) =>
  json({
    id: 'msg_1',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    content: [{ type: 'text', text: '{"epithet":"The Bold"}' }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 5 },
    ...overrides,
  });

describe('Anthropic adapter', () => {
  it('asks for structured output with low effort and model fallbacks', async () => {
    const fetchMock = queuedFetch(message());
    const provider = createAnthropicProvider({
      model: 'claude-opus-5-5',
      apiKey: 'sk-test',
      fetch: fetchMock,
    });

    const result = await provider.complete({
      system: 'sys',
      prompt: 'hello',
      schema,
      signal: activeSignal(),
    });

    expect(result).toEqual({ epithet: 'The Bold' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/messages');
    const body = JSON.parse(init?.body as string);
    expect(body).toMatchObject({
      model: 'claude-opus-5-5',
      system: 'sys',
      messages: [{ role: 'user', content: 'hello' }],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema' } },
    });
    const headers = new Headers(init?.headers);
    expect(headers.get('authorization')).toBe('Bearer sk-test');
    expect(headers.get('anthropic-beta')).toContain(
      'server-side-fallback-2026-07-01',
    );
    expect(headers.get('anthropic-dangerous-direct-browser-access')).toBe(
      'true',
    );
  });

  it('maps a refusal to the "refused" cause', async () => {
    const provider = createAnthropicProvider({
      model: 'm',
      apiKey: 'k',
      fetch: queuedFetch(message({ stop_reason: 'refusal', content: [] })),
    });
    await expect(
      provider.complete({
        system: '',
        prompt: '',
        schema,
        signal: activeSignal(),
      }),
    ).rejects.toMatchObject({ cause: 'refused' });
  });

  it('rejects with "auth" without calling the API when there is no key', async () => {
    const fetchMock = queuedFetch();
    const provider = createAnthropicProvider({ model: 'm', fetch: fetchMock });
    await expect(
      provider.complete({
        system: '',
        prompt: '',
        schema,
        signal: activeSignal(),
      }),
    ).rejects.toMatchObject({ cause: 'auth' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lists model ids', async () => {
    const provider = createAnthropicProvider({
      model: 'm',
      apiKey: 'k',
      fetch: queuedFetch(
        json({
          data: [
            {
              id: 'claude-opus-5-5',
              type: 'model',
              display_name: 'Opus',
              created_at: '2026-01-01T00:00:00Z',
            },
          ],
          has_more: false,
          first_id: 'claude-opus-5-5',
          last_id: 'claude-opus-5-5',
        }),
      ),
    });
    await expect(provider.listModels(activeSignal())).resolves.toEqual([
      'claude-opus-5-5',
    ]);
  });
});
