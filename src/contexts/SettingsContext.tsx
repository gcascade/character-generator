import React, { FC, ReactNode, createContext, useState } from 'react';

type SettingsProviderProps = {
  children: ReactNode;
};

type OllamaSettings = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

type AzureSettings = {
  useAzureAPI: boolean;
  azureEndpoint: string;
  azureModelName: string;
  azureToken: string;
};

type SettingsContextType = {
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

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [ollamaSettings, setOllamaSettingsState] = useState<OllamaSettings>(
    defaultOllamaSettings,
  );

  const [azureSettings, setAzureSettingsState] =
    useState<AzureSettings>(defaultAzureSettings);

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
