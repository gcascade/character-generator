import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { loadAiState, saveKeys, saveSettings } from '../ai/storage';
import type { ApiKeys, KeyedProviderType, ProviderSettings } from '../ai/types';

export type SettingsContextType = {
  settings: ProviderSettings;
  keys: ApiKeys;
  updateSettings: (
    update: (settings: ProviderSettings) => ProviderSettings,
  ) => void;
  setKey: (type: KeyedProviderType, key: string) => void;
  setRememberKey: (remember: boolean) => void;
  forgetKey: (type: KeyedProviderType) => void;
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

type SettingsProviderProps = {
  children: ReactNode;
};

/**
 * Holds the AI provider settings and API keys. Loaded once from the browser
 * storage (with legacy migration) and saved on every change.
 */
export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [initial] = useState(loadAiState);
  const [settings, setSettings] = useState(initial.settings);
  const [keys, setKeys] = useState(initial.keys);

  useEffect(() => saveSettings(settings), [settings]);
  useEffect(
    () => saveKeys(keys, settings.rememberKey),
    [keys, settings.rememberKey],
  );

  const updateSettings = useCallback(
    (update: (settings: ProviderSettings) => ProviderSettings) =>
      setSettings(update),
    [],
  );

  const setKey = useCallback((type: KeyedProviderType, key: string) => {
    setKeys((previous) => ({ ...previous, [type]: key.trim() || undefined }));
  }, []);

  const setRememberKey = useCallback((rememberKey: boolean) => {
    setSettings((previous) => ({ ...previous, rememberKey }));
  }, []);

  const forgetKey = useCallback((type: KeyedProviderType) => {
    setKeys((previous) => {
      const rest = { ...previous };
      delete rest[type];
      return rest;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      keys,
      updateSettings,
      setKey,
      setRememberKey,
      forgetKey,
    }),
    [settings, keys, updateSettings, setKey, setRememberKey, forgetKey],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
