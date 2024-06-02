import { useContext, useEffect, useMemo, useRef } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

type SettingsType = {
  settings: Settings;
  setUseOllamaAPI: (useOllamaAPI: boolean) => void;
  setOllamaEndpoint: (ollamaEndpoint: string) => void;
  setOllamaModelName: (ollamaModelName: string) => void;
};

type Settings = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const useSettings = (): SettingsType => {
  const settingsContext = useContext(SettingsContext);
  const isInitialLoad = useRef(true);

  if (!settingsContext) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  const {
    useOllamaAPI,
    ollamaEndpoint,
    ollamaModelName,
    setUseOllamaAPI,
    setOllamaEndpoint,
    setOllamaModelName,
  } = settingsContext;

  useEffect(() => {
    if (isInitialLoad.current) {
      const savedUseOllamaAPI = localStorage.getItem('useOllamaAPI');
      const savedOllamaEndpoint = localStorage.getItem('ollamaEndpoint');
      const savedOllamaModelName = localStorage.getItem('ollamaModelName');

      if (savedUseOllamaAPI !== null) {
        setUseOllamaAPI(savedUseOllamaAPI === 'true');
      }
      if (savedOllamaEndpoint) {
        setOllamaEndpoint(savedOllamaEndpoint);
      }
      if (savedOllamaModelName) {
        setOllamaModelName(savedOllamaModelName);
      }

      isInitialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('useOllamaAPI', useOllamaAPI.toString());
    localStorage.setItem('ollamaEndpoint', ollamaEndpoint);
    localStorage.setItem('ollamaModelName', ollamaModelName);
  }, [useOllamaAPI, ollamaEndpoint, ollamaModelName]);

  const settings = useMemo(
    () => ({
      useOllamaAPI,
      ollamaEndpoint,
      ollamaModelName,
    }),
    [useOllamaAPI, ollamaEndpoint, ollamaModelName],
  );

  return {
    settings,
    setUseOllamaAPI,
    setOllamaEndpoint,
    setOllamaModelName,
  };
};

export default useSettings;
