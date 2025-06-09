import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import theme from '../../themes/themes';
import Settings from './Settings';

const mockSetOllamaSettings = jest.fn();
const mockSetAzureSettings = jest.fn();
jest.mock('../../hooks/useSettings', () => ({
  __esModule: true,
  default: () => ({
    ollamaSettings: {
      useOllamaAPI: false,
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModelName: 'llama3',
    },
    azureSettings: {
      useAzureAPI: false,
      azureEndpoint: 'https://your-azure-endpoint.com',
      azureModelName: 'openai/gpt-4.1',
      azureToken: 'fake-token',
    },
    setOllamaSettings: mockSetOllamaSettings,
    setAzureSettings: mockSetAzureSettings,
  }),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Settings', () => {
  beforeEach(() => {
    mockSetOllamaSettings.mockClear();
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
    fireEvent.click(screen.getByLabelText(/Enable Ollama API/i));
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

  it('calls setOllamaSettings with correct values when form is valid', async () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByLabelText(/Enable Ollama API/i));
    fireEvent.change(screen.getByLabelText(/Ollama Endpoint/i), {
      target: { value: 'https://valid-url.com' },
    });
    fireEvent.change(screen.getByLabelText(/Ollama Model Name/i), {
      target: { value: 'mymodel' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(mockSetOllamaSettings).toHaveBeenCalledWith({
        useOllamaAPI: true,
        ollamaEndpoint: 'https://valid-url.com',
        ollamaModelName: 'mymodel',
      });
    });
  });

  it('disables endpoint and model fields when Ollama API is off', () => {
    renderWithTheme(<Settings />);
    expect(screen.getByLabelText(/Ollama Endpoint/i)).toBeDisabled();
    expect(screen.getByLabelText(/Ollama Model Name/i)).toBeDisabled();
  });

  it('disables endpoint and model fields when Azure API is off', () => {
    renderWithTheme(<Settings />);
    expect(screen.getByLabelText(/Azure Endpoint/i)).toBeDisabled();
    expect(screen.getByLabelText(/Azure Model Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Azure Token/i)).toBeDisabled();
  });

  it('enables endpoint and model fields when Ollama API is toggled on', () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByLabelText(/Enable Ollama API/i));
    expect(screen.getByLabelText(/Ollama Endpoint/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Ollama Model Name/i)).not.toBeDisabled();
  });

  it('enables endpoint and model fields when Azure API is toggled on', () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByLabelText(/Enable Azure API/i));
    expect(screen.getByLabelText(/Azure Endpoint/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Azure Model Name/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Azure Token/i)).not.toBeDisabled();
  });

  it('does not call setOllamaSettings if validation fails', async () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByLabelText(/Enable Ollama API/i));
    fireEvent.change(screen.getByLabelText(/Ollama Endpoint/i), {
      target: { value: 'invalid-url' },
    });
    fireEvent.change(screen.getByLabelText(/Ollama Model Name/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(mockSetOllamaSettings).not.toHaveBeenCalled();
    });
  });

  it('does not call setAzureSettings if validation fails', async () => {
    renderWithTheme(<Settings />);
    fireEvent.click(screen.getByLabelText(/Enable Azure API/i));
    fireEvent.change(screen.getByLabelText(/Azure Endpoint/i), {
      target: { value: 'invalid-url' },
    });
    fireEvent.change(screen.getByLabelText(/Azure Model Name/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() => {
      expect(mockSetAzureSettings).not.toHaveBeenCalled();
    });
  });

  it('shows initial values from context', () => {
    renderWithTheme(<Settings />);
    expect(screen.getByLabelText(/Ollama Endpoint/i)).toHaveValue(
      'http://localhost:11434',
    );
    expect(screen.getByLabelText(/Ollama Model Name/i)).toHaveValue('llama3');
    expect(screen.getByLabelText(/Azure Endpoint/i)).toHaveValue(
      'https://your-azure-endpoint.com',
    );
    expect(screen.getByLabelText(/Azure Model Name/i)).toHaveValue(
      'openai/gpt-4.1',
    );
    expect(screen.getByLabelText(/Azure Token/i)).toHaveValue('fake-token');
  });
});
