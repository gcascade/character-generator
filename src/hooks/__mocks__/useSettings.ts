const useSettings = () => ({
  ollamaSettings: {
    useOllamaAPI: false,
    ollamaEndpoint: '',
    ollamaModelName: '',
  },
  setOllamaSettings: jest.fn(),
});

export default useSettings;
