import { DEFAULT_SETTINGS } from '../../ai/storage';

// Default test double: "No AI" with no keys. Tests that need a provider use
// vi.mocked(useSettings).mockReturnValue(...) or render the real SettingsProvider.
const useSettings = vi.fn(() => ({
  settings: DEFAULT_SETTINGS,
  keys: {},
  updateSettings: vi.fn(),
  setKey: vi.fn(),
  setRememberKey: vi.fn(),
  forgetKey: vi.fn(),
}));

export default useSettings;
