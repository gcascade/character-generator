import React, {
  FC,
  ReactNode,
  createContext,
  useEffect,
  useState,
} from 'react';

type SettingsProviderProps = {
  children: ReactNode;
};

export type OllamaSettings = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

export type AzureSettings = {
  useAzureAPI: boolean;
  azureEndpoint: string;
  azureModelName: string;
  azureToken: string;
};

export type SettingsContextType = {
  ollamaSettings: OllamaSettings;
  setOllamaSettings: (settings: Partial<OllamaSettings>) => void;
  azureSettings: AzureSettings;
  setAzureSettings: (settings: Partial<AzureSettings>) => void;
};

const defaultOllamaSettings: OllamaSettings = {
  useOllamaAPI: false,
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModelName: 'llama3',
};

const defaultAzureSettings: AzureSettings = {
  useAzureAPI: false,
  azureEndpoint: 'https://your-azure-endpoint.com',
  azureModelName: 'openai/gpt-4.1',
  azureToken: '',
};

// Settings are stored one key per field (kept for compatibility with existing data).
// A missing key falls back to the default value.
const loadSettings = <T extends Record<string, string | boolean>>(
  defaults: T,
): T => {
  const loaded: Record<string, string | boolean> = { ...defaults };
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const stored = localStorage.getItem(key);
    if (stored === null) continue;
    loaded[key] =
      typeof defaultValue === 'boolean' ? stored === 'true' : stored;
  }
  return loaded as T;
};

const saveSettings = (settings: Record<string, string | boolean>) => {
  for (const [key, value] of Object.entries(settings)) {
    localStorage.setItem(key, String(value));
  }
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [ollamaSettings, setOllamaSettingsState] = useState(() =>
    loadSettings(defaultOllamaSettings),
  );

  const [azureSettings, setAzureSettingsState] = useState(() =>
    loadSettings(defaultAzureSettings),
  );

  useEffect(() => saveSettings(ollamaSettings), [ollamaSettings]);
  useEffect(() => saveSettings(azureSettings), [azureSettings]);

  const setOllamaSettings = (settings: Partial<OllamaSettings>) => {
    setOllamaSettingsState((prevSettings) => ({
      ...prevSettings,
      ...settings,
    }));
  };

  const setAzureSettings = (settings: Partial<AzureSettings>) => {
    setAzureSettingsState((prevSettings) => ({
      ...prevSettings,
      ...settings,
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ollamaSettings,
        setOllamaSettings,
        azureSettings,
        setAzureSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
