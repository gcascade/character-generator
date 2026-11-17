import { storedKeysSchema, storedSettingsSchema } from './schemas';
import type { ApiKeys, KeyedProviderType, ProviderSettings } from './types';

export const SETTINGS_KEY = 'aiSettings';
export const KEYS_KEY = 'aiApiKeys';

export const DEFAULT_SETTINGS: ProviderSettings = {
  version: 1,
  activeType: 'none',
  ollama: { baseUrl: 'http://localhost:11434', model: 'llama3' },
  openaiCompatible: {
    baseUrl: 'https://models.github.ai/inference',
    model: 'openai/gpt-4.1',
  },
  anthropic: { model: 'claude-opus-5-5' },
  rememberKey: true,
};

/** Keys written by versions before the AI provider layer. */
export const LEGACY_KEYS = [
  'useOllamaAPI',
  'ollamaEndpoint',
  'ollamaModelName',
  'useAzureAPI',
  'azureEndpoint',
  'azureModelName',
  'azureToken',
] as const;

const readJson = (storage: Storage, key: string): unknown => {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const cloneDefaults = (): ProviderSettings => structuredClone(DEFAULT_SETTINGS);

/** Converts the pre-1.0 settings (one localStorage entry per field), then deletes them. */
const migrateLegacy = (): { settings: ProviderSettings; keys: ApiKeys } => {
  const legacy = Object.fromEntries(
    LEGACY_KEYS.map((key) => [key, localStorage.getItem(key)]),
  );
  const candidate = cloneDefaults();
  if (legacy.useOllamaAPI === 'true') candidate.activeType = 'ollama';
  else if (legacy.useAzureAPI === 'true')
    candidate.activeType = 'openai-compatible';

  const pick = <T>(value: string | null, apply: (v: string) => T) => {
    if (value && value.trim()) apply(value.trim());
  };
  pick(legacy.ollamaEndpoint, (v) => (candidate.ollama.baseUrl = v));
  pick(legacy.ollamaModelName, (v) => (candidate.ollama.model = v));
  pick(legacy.azureEndpoint, (v) => (candidate.openaiCompatible.baseUrl = v));
  pick(legacy.azureModelName, (v) => (candidate.openaiCompatible.model = v));

  // Keep each provider's legacy values only if they are valid; fall back to defaults otherwise.
  const settings = cloneDefaults();
  settings.activeType = candidate.activeType;
  for (const section of ['ollama', 'openaiCompatible'] as const) {
    const checked = storedSettingsSchema.shape[section].safeParse(
      candidate[section],
    );
    if (checked.success) settings[section] = checked.data;
  }

  const keys: ApiKeys = {};
  if (legacy.azureToken && legacy.azureToken.trim()) {
    keys['openai-compatible'] = legacy.azureToken.trim();
  }

  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  return { settings, keys };
};

const hasLegacy = () =>
  LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);

/** Loads settings and keys, migrating legacy data once. Never throws. */
export const loadAiState = (): {
  settings: ProviderSettings;
  keys: ApiKeys;
} => {
  try {
    if (localStorage.getItem(SETTINGS_KEY) === null && hasLegacy()) {
      const migrated = migrateLegacy();
      saveSettings(migrated.settings);
      saveKeys(migrated.keys, migrated.settings.rememberKey);
      return migrated;
    }
    const parsed = storedSettingsSchema.safeParse(
      readJson(localStorage, SETTINGS_KEY),
    );
    const settings = parsed.success ? parsed.data : cloneDefaults();
    return { settings, keys: loadKeys(settings.rememberKey) };
  } catch {
    return { settings: cloneDefaults(), keys: {} };
  }
};

export const saveSettings = (settings: ProviderSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadKeys = (remember: boolean): ApiKeys => {
  const storage = remember ? localStorage : sessionStorage;
  const parsed = storedKeysSchema.safeParse(readJson(storage, KEYS_KEY));
  return parsed.success ? parsed.data : {};
};

/**
 * Remembered keys go to localStorage; otherwise to sessionStorage, and any
 * localStorage copy is deleted immediately.
 */
export const saveKeys = (keys: ApiKeys, remember: boolean): void => {
  const entries = Object.entries(keys).filter(([, value]) => value);
  const serialized = JSON.stringify(Object.fromEntries(entries));
  if (remember) {
    if (entries.length) localStorage.setItem(KEYS_KEY, serialized);
    else localStorage.removeItem(KEYS_KEY);
    sessionStorage.removeItem(KEYS_KEY);
  } else {
    if (entries.length) sessionStorage.setItem(KEYS_KEY, serialized);
    else sessionStorage.removeItem(KEYS_KEY);
    localStorage.removeItem(KEYS_KEY);
  }
};

/** Removes one provider's key from both storages. */
export const forgetKey = (
  keys: ApiKeys,
  type: KeyedProviderType,
  remember: boolean,
): ApiKeys => {
  const rest = { ...keys };
  delete rest[type];
  saveKeys(rest, remember);
  return rest;
};
