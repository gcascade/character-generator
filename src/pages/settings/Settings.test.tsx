import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import useSettings from '../../hooks/useSettings';
import theme from '../../themes/themes';
import Settings from './Settings';

jest.mock('../../hooks/useSettings', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Settings', () => {
  beforeEach(() => {
    mockUseSettings.mockReturnValue({
      settings: {
        useOllamaAPI: false,
        ollamaEndpoint: '',
        ollamaModelName: '',
      },
      setUseOllamaAPI: jest.fn(),
      setOllamaEndpoint: jest.fn(),
      setOllamaModelName: jest.fn(),
    });
  });

  it('renders the settings form', () => {
    renderWithTheme(<Settings />);
    expect(
      screen.getByText('Character Generator Settings'),
    ).toBeInTheDocument();
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('API Integration')).toBeInTheDocument();
  });

  it('displays validation errors', async () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText(/Ollama Endpoint/i), {
      target: { value: 'invalid-url' },
    });
    fireEvent.change(screen.getByLabelText(/Ollama Model Name/i), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();
      expect(screen.getByText('Model name is required')).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const setUseOllamaAPI = jest.fn();
    const setOllamaEndpoint = jest.fn();
    const setOllamaModelName = jest.fn();

    mockUseSettings.mockReturnValue({
      settings: {
        useOllamaAPI: false,
        ollamaEndpoint: '',
        ollamaModelName: '',
      },
      setUseOllamaAPI,
      setOllamaEndpoint,
      setOllamaModelName,
    });

    renderWithTheme(<Settings />);

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText(/Ollama Endpoint/i), {
      target: { value: 'https://valid-url.com' },
    });
    fireEvent.change(screen.getByLabelText(/Ollama Model Name/i), {
      target: { value: 'model-name' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(setUseOllamaAPI).toHaveBeenCalledWith(true);
      expect(setOllamaEndpoint).toHaveBeenCalledWith('https://valid-url.com');
      expect(setOllamaModelName).toHaveBeenCalledWith('model-name');
    });
  });
});
