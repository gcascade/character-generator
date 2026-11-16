const useSettings = () => ({
  ollamaSettings: {
    useOllamaAPI: false,
    ollamaEndpoint: '',
    ollamaModelName: '',
  },
  setOllamaSettings: vi.fn(),
  azureSettings: {
    useAzureAPI: false,
    azureEndpoint: '',
    azureModelName: '',
    azureToken: '',
  },
  setAzureSettings: vi.fn(),
});

export default useSettings;
