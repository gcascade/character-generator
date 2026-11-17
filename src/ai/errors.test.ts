import {
  AiError,
  causeFromStatus,
  isCallerAbort,
  isInsecureAddress,
  throwIfAborted,
} from './errors';

describe('AiError', () => {
  it('carries a cause, the provider and the HTTP status', () => {
    const error = new AiError('auth', 'anthropic', { status: 401 });
    expect(error).toBeInstanceOf(Error);
    expect(error.cause).toBe('auth');
    expect(error.providerType).toBe('anthropic');
    expect(error.status).toBe(401);
  });
});

describe('isInsecureAddress', () => {
  it.each([
    ['http://192.168.1.10:11434', 'https:', true],
    ['http://my-server.lan', 'https:', true],
    ['http://localhost:11434', 'https:', false],
    ['http://127.0.0.1:11434', 'https:', false],
    ['https://api.example.com', 'https:', false],
    ['http://192.168.1.10:11434', 'http:', false],
    ['not a url', 'https:', false],
  ])('%s from an %s page → %s', (url, protocol, expected) => {
    expect(isInsecureAddress(url, protocol)).toBe(expected);
  });
});

describe('causeFromStatus', () => {
  it.each([
    [401, '', 'auth'],
    [403, '', 'auth'],
    [404, '{"error":"model \\"x\\" not found"}', 'unknown-model'],
    [404, 'Not Found', 'provider-error'],
    [429, '', 'rate-limited'],
    [500, '', 'provider-error'],
  ] as const)('%i %s → %s', (status, body, cause) => {
    expect(causeFromStatus(status, body)).toBe(cause);
  });
});

describe('throwIfAborted', () => {
  it('does nothing while the signal is active', () => {
    expect(() =>
      throwIfAborted(new AbortController().signal, 'ollama'),
    ).not.toThrow();
  });

  it('turns a timeout into an AiError', () => {
    const controller = new AbortController();
    controller.abort(new DOMException('slow', 'TimeoutError'));
    expect(() => throwIfAborted(controller.signal, 'ollama')).toThrow(
      expect.objectContaining({ cause: 'timeout' }),
    );
  });

  it('rethrows a caller abort as is', () => {
    const controller = new AbortController();
    controller.abort();
    let thrown: unknown;
    try {
      throwIfAborted(controller.signal, 'ollama');
    } catch (error) {
      thrown = error;
    }
    expect(isCallerAbort(thrown)).toBe(true);
  });
});
