import { useContext, useEffect, useRef } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

type SettingsType = {
  ollamaSettings: OllamaSettings;
  setOllamaSettings: (settings: Partial<OllamaSettings>) => void;
};

type OllamaSettings = {
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

  const { ollamaSettings, setOllamaSettings } = settingsContext;

  useEffect(() => {
    if (isInitialLoad.current) {
      const savedSettings: OllamaSettings = {
        useOllamaAPI: localStorage.getItem('useOllamaAPI') === 'true',
        ollamaEndpoint: localStorage.getItem('ollamaEndpoint') || '',
        ollamaModelName: localStorage.getItem('ollamaModelName') || '',
      };

      setOllamaSettings(savedSettings);

      isInitialLoad.current = false;
    }
  }, [setOllamaSettings]);

  useEffect(() => {
    localStorage.setItem(
      'useOllamaAPI',
      ollamaSettings.useOllamaAPI.toString(),
    );
    localStorage.setItem('ollamaEndpoint', ollamaSettings.ollamaEndpoint);
    localStorage.setItem('ollamaModelName', ollamaSettings.ollamaModelName);
  }, [ollamaSettings]);

  return {
    ollamaSettings,
    setOllamaSettings,
  };
};

export default useSettings;
