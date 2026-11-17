import { DEFAULT_SETTINGS } from '../storage';
import type { ProviderSettings } from '../types';
import { activeModel, createProvider, withTimeout } from './index';
import { activeSignal, json, queuedFetch } from './testing';

const settings = (overrides: Partial<ProviderSettings>): ProviderSettings => ({
  ...DEFAULT_SETTINGS,
  ...overrides,
});

describe('createProvider', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns no provider for "No AI"', () => {
    expect(
      createProvider(settings({ activeType: 'none' }), {}),
    ).toBeUndefined();
  });

  it('calls Ollama through its OpenAI-compatible /v1 API without a key', async () => {
    const fetchMock = queuedFetch(json({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = createProvider(
      settings({
        activeType: 'ollama',
        ollama: { baseUrl: 'http://localhost:11434/', model: 'llama3' },
      }),
      { 'openai-compatible': 'not-for-ollama' },
    );
    await provider!.listModels(activeSignal());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:11434/v1/models');
    expect(
      (init?.headers as Record<string, string>).Authorization,
    ).toBeUndefined();
  });

  it('sends the OpenAI-compatible key only to the OpenAI-compatible service', async () => {
    const fetchMock = queuedFetch(json({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = createProvider(
      settings({ activeType: 'openai-compatible' }),
      {
        'openai-compatible': 'k1',
        anthropic: 'k2',
      },
    );
    await provider!.listModels(activeSignal());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://models.github.ai/inference/models');
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer k1',
    );
  });

  it('builds the Anthropic adapter for Claude', () => {
    expect(
      createProvider(settings({ activeType: 'anthropic' }), { anthropic: 'k' }),
    ).toBeDefined();
  });
});

describe('activeModel', () => {
  it.each([
    ['none', undefined],
    ['ollama', 'llama3'],
    ['openai-compatible', 'openai/gpt-4.1'],
    ['anthropic', 'claude-opus-5-5'],
  ] as const)('%s → %s', (activeType, model) => {
    expect(activeModel(settings({ activeType }))).toBe(model);
  });
});

describe('withTimeout', () => {
  it('aborts with a TimeoutError after the delay', async () => {
    const signal = withTimeout(activeSignal(), 10);
    await new Promise((resolve) => signal.addEventListener('abort', resolve));
    expect((signal.reason as DOMException).name).toBe('TimeoutError');
  });

  it('aborts with the caller reason when the caller aborts first', () => {
    const controller = new AbortController();
    const signal = withTimeout(controller.signal);
    controller.abort();
    expect((signal.reason as DOMException).name).toBe('AbortError');
  });
});
