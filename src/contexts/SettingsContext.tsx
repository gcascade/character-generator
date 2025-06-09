import React, { FC, ReactNode, createContext, useState } from 'react';

type SettingsProviderProps = {
  children: ReactNode;
};

type OllamaSettings = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

type SettingsContextType = {
  ollamaSettings: OllamaSettings;
  setOllamaSettings: (settings: Partial<OllamaSettings>) => void;
};

const defaultOllamaSettings: OllamaSettings = {
  useOllamaAPI: false,
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModelName: 'llama3',
};

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [ollamaSettings, setOllamaSettingsState] = useState<OllamaSettings>(
    defaultOllamaSettings,
  );

  const setOllamaSettings = (settings: Partial<OllamaSettings>) => {
    setOllamaSettingsState((prevSettings) => ({
      ...prevSettings,
      ...settings,
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ollamaSettings,
        setOllamaSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
