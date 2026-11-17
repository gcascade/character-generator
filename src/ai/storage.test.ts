import {
  DEFAULT_SETTINGS,
  forgetKey,
  KEYS_KEY,
  LEGACY_KEYS,
  loadAiState,
  saveKeys,
  saveSettings,
  SETTINGS_KEY,
} from './storage';

describe('AI settings storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('uses defaults ("No AI") when nothing is stored', () => {
    const { settings, keys } = loadAiState();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.activeType).toBe('none');
    expect(keys).toEqual({});
  });

  it('uses defaults when the stored settings are corrupted', () => {
    localStorage.setItem(SETTINGS_KEY, '{not json');
    expect(loadAiState().settings).toEqual(DEFAULT_SETTINGS);
  });

  it('uses defaults when the stored settings have an unknown version', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, version: 2 }),
    );
    expect(loadAiState().settings).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      activeType: 'anthropic' as const,
      anthropic: { model: 'claude-sonnet-5-5' },
    };
    saveSettings(settings);
    expect(loadAiState().settings).toEqual(settings);
  });

  describe('legacy migration', () => {
    it('migrates an enabled Ollama configuration', () => {
      localStorage.setItem('useOllamaAPI', 'true');
      localStorage.setItem('ollamaEndpoint', 'http://192.168.1.10:11434');
      localStorage.setItem('ollamaModelName', 'mistral');
      localStorage.setItem('useAzureAPI', 'false');

      const { settings } = loadAiState();

      expect(settings.activeType).toBe('ollama');
      expect(settings.ollama).toEqual({
        baseUrl: 'http://192.168.1.10:11434',
        model: 'mistral',
      });
      LEGACY_KEYS.forEach((key) =>
        expect(localStorage.getItem(key)).toBeNull(),
      );
      expect(localStorage.getItem(SETTINGS_KEY)).not.toBeNull();
    });

    it('migrates an enabled Azure configuration to OpenAI-compatible with a remembered key', () => {
      localStorage.setItem('useOllamaAPI', 'false');
      localStorage.setItem('useAzureAPI', 'true');
      localStorage.setItem(
        'azureEndpoint',
        'https://models.github.ai/inference',
      );
      localStorage.setItem('azureModelName', 'openai/gpt-4.1-mini');
      localStorage.setItem('azureToken', 'secret-token');

      const { settings, keys } = loadAiState();

      expect(settings.activeType).toBe('openai-compatible');
      expect(settings.openaiCompatible.model).toBe('openai/gpt-4.1-mini');
      expect(keys['openai-compatible']).toBe('secret-token');
      expect(JSON.parse(localStorage.getItem(KEYS_KEY)!)).toEqual({
        'openai-compatible': 'secret-token',
      });
    });

    it('keeps defaults for invalid or empty legacy values', () => {
      localStorage.setItem('useOllamaAPI', 'false');
      localStorage.setItem('ollamaEndpoint', '');
      localStorage.setItem('ollamaModelName', '');
      localStorage.setItem('useAzureAPI', 'false');
      localStorage.setItem('azureEndpoint', 'not a url');

      const { settings } = loadAiState();

      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('does not migrate again once the new settings exist', () => {
      saveSettings(DEFAULT_SETTINGS);
      localStorage.setItem('useOllamaAPI', 'true');
      expect(loadAiState().settings.activeType).toBe('none');
    });
  });

  describe('API keys', () => {
    it('stores remembered keys in localStorage', () => {
      saveKeys({ anthropic: 'k1' }, true);
      expect(localStorage.getItem(KEYS_KEY)).toContain('k1');
      expect(sessionStorage.getItem(KEYS_KEY)).toBeNull();
    });

    it('stores session-only keys in sessionStorage and removes the durable copy', () => {
      saveKeys({ anthropic: 'k1' }, true);
      saveKeys({ anthropic: 'k1' }, false);
      expect(localStorage.getItem(KEYS_KEY)).toBeNull();
      expect(sessionStorage.getItem(KEYS_KEY)).toContain('k1');
    });

    it('loads keys from the storage matching the remember choice', () => {
      saveSettings({ ...DEFAULT_SETTINGS, rememberKey: false });
      sessionStorage.setItem(KEYS_KEY, JSON.stringify({ anthropic: 'k2' }));
      expect(loadAiState().keys).toEqual({ anthropic: 'k2' });
    });

    it('forgets one key without touching the others', () => {
      const keys = forgetKey(
        { anthropic: 'k1', 'openai-compatible': 'k2' },
        'anthropic',
        true,
      );
      expect(keys).toEqual({ 'openai-compatible': 'k2' });
      expect(localStorage.getItem(KEYS_KEY)).not.toContain('k1');
    });

    it('leaves no copy at all once the last key is forgotten', () => {
      saveKeys({ anthropic: 'k1' }, true);
      forgetKey({ anthropic: 'k1' }, 'anthropic', true);
      expect(localStorage.getItem(KEYS_KEY)).toBeNull();
      expect(sessionStorage.getItem(KEYS_KEY)).toBeNull();
    });

    it('ignores corrupted stored keys', () => {
      localStorage.setItem(KEYS_KEY, '["nope"]');
      expect(loadAiState().keys).toEqual({});
    });
  });
});
