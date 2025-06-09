const useSettings = () => ({
  ollamaSettings: {
    useOllamaAPI: false,
    ollamaEndpoint: '',
    ollamaModelName: '',
  },
  setOllamaSettings: jest.fn(),
  azureSettings: {
    useAzureAPI: false,
    azureEndpoint: '',
    azureModelName: '',
    azureToken: '',
  },
  setAzureSettings: jest.fn(),
});

export default useSettings;
