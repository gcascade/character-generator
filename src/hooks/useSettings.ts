import { useContext, useEffect, useRef } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

type SettingsType = {
  ollamaSettings: OllamaSettings;
  setOllamaSettings: (settings: Partial<OllamaSettings>) => void;
  azureSettings: AzureSettings;
  setAzureSettings: (settings: Partial<AzureSettings>) => void;
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

const useSettings = (): SettingsType => {
  const settingsContext = useContext(SettingsContext);
  const isInitialLoad = useRef(true);

  if (!settingsContext) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  const { ollamaSettings, setOllamaSettings, azureSettings, setAzureSettings } =
    settingsContext;

  useEffect(() => {
    if (isInitialLoad.current) {
      const savedOllamaSettings: OllamaSettings = {
        useOllamaAPI: localStorage.getItem('useOllamaAPI') === 'true',
        ollamaEndpoint: localStorage.getItem('ollamaEndpoint') || '',
        ollamaModelName: localStorage.getItem('ollamaModelName') || '',
      };

      setOllamaSettings(savedOllamaSettings);

      const savedAzureSettings = {
        useAzureAPI: localStorage.getItem('useAzureAPI') === 'true',
        azureEndpoint: localStorage.getItem('azureEndpoint') || '',
        azureModelName: localStorage.getItem('azureModelName') || '',
        azureToken: localStorage.getItem('azureToken') || '',
      };

      setAzureSettings(savedAzureSettings);

      isInitialLoad.current = false;
    }
  }, [setOllamaSettings, setAzureSettings]);

  useEffect(() => {
    localStorage.setItem(
      'useOllamaAPI',
      ollamaSettings.useOllamaAPI.toString(),
    );
    localStorage.setItem('ollamaEndpoint', ollamaSettings.ollamaEndpoint);
    localStorage.setItem('ollamaModelName', ollamaSettings.ollamaModelName);
  }, [ollamaSettings]);

  useEffect(() => {
    localStorage.setItem('useAzureAPI', azureSettings.useAzureAPI.toString());
    localStorage.setItem('azureEndpoint', azureSettings.azureEndpoint);
    localStorage.setItem('azureModelName', azureSettings.azureModelName);
    localStorage.setItem('azureToken', azureSettings.azureToken);
  }, [azureSettings]);

  return {
    ollamaSettings,
    setOllamaSettings,
    azureSettings,
    setAzureSettings,
  };
};

export default useSettings;
