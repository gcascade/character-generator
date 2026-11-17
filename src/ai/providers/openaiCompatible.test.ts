import { z } from 'zod';
import { createOpenAiCompatibleProvider } from './openaiCompatible';
import { activeSignal, json, queuedFetch } from './testing';

const schema = z.object({});

const provider = (apiKey?: string) =>
  createOpenAiCompatibleProvider({
    providerType: 'openai-compatible',
    baseUrl: 'https://api.example.com/v1/',
    model: 'model-a',
    apiKey,
  });

const answer = (content: unknown) =>
  json({ choices: [{ message: { content } }] });

describe('OpenAI-compatible adapter', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the system and user messages to /chat/completions with the key', async () => {
    const fetchMock = queuedFetch(answer('{"ok":true}'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await provider('secret').complete({
      system: 'sys',
      prompt: 'hello',
      schema,
      signal: activeSignal(),
    });

    expect(result).toBe('{"ok":true}');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.com/v1/chat/completions');
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      'Bearer secret',
    );
    expect(JSON.parse(init?.body as string)).toEqual({
      model: 'model-a',
      messages: [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'hello' },
      ],
    });
  });

  it('sends no Authorization header without a key', async () => {
    const fetchMock = queuedFetch(answer('x'));
    vi.stubGlobal('fetch', fetchMock);
    await provider().complete({
      system: '',
      prompt: '',
      schema,
      signal: activeSignal(),
    });
    expect(
      (fetchMock.mock.calls[0][1]?.headers as Record<string, string>)
        .Authorization,
    ).toBeUndefined();
  });

  it('rejects an empty answer as invalid', async () => {
    vi.stubGlobal('fetch', queuedFetch(answer('   ')));
    await expect(
      provider().complete({
        system: '',
        prompt: '',
        schema,
        signal: activeSignal(),
      }),
    ).rejects.toMatchObject({ cause: 'invalid-answer' });
  });

  it('refuses an insecure address before sending anything', async () => {
    const fetchMock = queuedFetch();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('location', { protocol: 'https:' });
    const insecure = createOpenAiCompatibleProvider({
      providerType: 'ollama',
      baseUrl: 'http://192.168.1.10:11434/v1',
      model: 'llama3',
    });
    await expect(
      insecure.complete({
        system: '',
        prompt: '',
        schema,
        signal: activeSignal(),
      }),
    ).rejects.toMatchObject({ cause: 'blocked-insecure' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lists model ids from /models', async () => {
    const fetchMock = queuedFetch(json({ data: [{ id: 'a' }, { id: 'b' }] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(provider().listModels(activeSignal())).resolves.toEqual([
      'a',
      'b',
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.example.com/v1/models',
    );
  });

  it('resolves undefined when the service cannot list models', async () => {
    vi.stubGlobal('fetch', queuedFetch(new Response('', { status: 404 })));
    await expect(
      provider().listModels(activeSignal()),
    ).resolves.toBeUndefined();
  });
});
