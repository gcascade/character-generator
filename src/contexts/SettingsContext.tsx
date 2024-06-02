import React, { FC, ReactNode, createContext, useState } from 'react';

type SettingsProviderProps = {
  children: ReactNode;
};

type SettingsContextType = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
  setUseOllamaAPI: (useOllamaAPI: boolean) => void;
  setOllamaEndpoint: (endpoint: string) => void;
  setOllamaModelName: (modelName: string) => void;
};

const defaultOllamaEndPoint = 'http://localhost:11434';
const defaultOllamaModel = 'llama3';

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: FC<SettingsProviderProps> = ({ children }) => {
  const [useOllamaAPI, setUseOllamaAPI] = useState(false);
  const [ollamaEndpoint, setOllamaEndpoint] = useState(defaultOllamaEndPoint);
  const [ollamaModelName, setOllamaModelName] = useState(defaultOllamaModel);

  const setEndpoint = (endpoint: string) => setOllamaEndpoint(endpoint);
  const setModelName = (modelName: string) => setOllamaModelName(modelName);

  return (
    <SettingsContext.Provider
      value={{
        useOllamaAPI,
        ollamaEndpoint,
        ollamaModelName,
        setUseOllamaAPI,
        setOllamaEndpoint: setEndpoint,
        setOllamaModelName: setModelName,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
