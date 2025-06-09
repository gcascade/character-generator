import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { SettingsContext, SettingsProvider } from './SettingsContext';

const TestComponent: React.FC<{
  updateOllama?: Partial<ReturnType<typeof useContext>['ollamaSettings']>;
  updateAzure?: Partial<ReturnType<typeof useContext>['azureSettings']>;
}> = ({ updateOllama, updateAzure }) => {
  const context = useContext(SettingsContext);

  React.useEffect(() => {
    if (updateOllama && context) {
      context.setOllamaSettings(updateOllama);
    }
    if (updateAzure && context) {
      context.setAzureSettings(updateAzure);
    }
    // eslint-disable-next-line
  }, [updateOllama, updateAzure]);

  return (
    <div>
      <div data-testid="useOllamaAPI">
        {context?.ollamaSettings?.useOllamaAPI.toString()}
      </div>
      <div data-testid="ollamaEndpoint">
        {context?.ollamaSettings?.ollamaEndpoint}
      </div>
      <div data-testid="ollamaModelName">
        {context?.ollamaSettings?.ollamaModelName}
      </div>

      <div data-testid="useAzureAPI">
        {context?.azureSettings?.useAzureAPI.toString()}
      </div>
      <div data-testid="azureEndpoint">
        {context?.azureSettings?.azureEndpoint}
      </div>
      <div data-testid="azureModelName">
        {context?.azureSettings?.azureModelName}
      </div>
      <div data-testid="azureToken">{context?.azureSettings?.azureToken}</div>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
};

describe('SettingsProvider', () => {
  it('renders its children', () => {
    renderWithProvider(<div>Test</div>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('provides the correct initial values', () => {
    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://localhost:11434',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent('llama3');
    expect(screen.getByTestId('useAzureAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('azureEndpoint')).toHaveTextContent(
      'https://your-azure-endpoint.com',
    );
    expect(screen.getByTestId('azureModelName')).toHaveTextContent(
      'openai/gpt-4.1',
    );
    expect(screen.getByTestId('azureToken')).toHaveTextContent('');
  });

  it('updates a single ollamaSettings field', () => {
    renderWithProvider(<TestComponent updateOllama={{ useOllamaAPI: true }} />);
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('true');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://localhost:11434',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent('llama3');
  });

  it('updates multiple ollamaSettings fields', () => {
    renderWithProvider(
      <TestComponent
        updateOllama={{
          ollamaEndpoint: 'http://remote:1234',
          ollamaModelName: 'other-model',
        }}
      />,
    );
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://remote:1234',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent(
      'other-model',
    );
  });

  it('merges updates with previous ollama state', () => {
    renderWithProvider(
      <TestComponent updateOllama={{ ollamaModelName: 'merged-model' }} />,
    );
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://localhost:11434',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent(
      'merged-model',
    );
  });

  it('setOllamaSettings does not remove unspecified ollama fields', () => {
    renderWithProvider(
      <TestComponent
        updateOllama={{ ollamaEndpoint: 'http://changed:5678' }}
      />,
    );
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://changed:5678',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent('llama3');
  });

  it('updates a single azureSettings field', () => {
    renderWithProvider(<TestComponent updateAzure={{ useAzureAPI: true }} />);
    expect(screen.getByTestId('useAzureAPI')).toHaveTextContent('true');
    expect(screen.getByTestId('azureEndpoint')).toHaveTextContent(
      'https://your-azure-endpoint.com',
    );
    expect(screen.getByTestId('azureModelName')).toHaveTextContent(
      'openai/gpt-4.1',
    );
    expect(screen.getByTestId('azureToken')).toHaveTextContent('');
  });

  it('updates multiple azureSettings fields', () => {
    renderWithProvider(
      <TestComponent
        updateAzure={{
          azureEndpoint: 'https://remote-azure.com',
          azureModelName: 'gpt-4-azure',
          azureToken: 'secret-token',
        }}
      />,
    );
    expect(screen.getByTestId('useAzureAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('azureEndpoint')).toHaveTextContent(
      'https://remote-azure.com',
    );
    expect(screen.getByTestId('azureModelName')).toHaveTextContent(
      'gpt-4-azure',
    );
    expect(screen.getByTestId('azureToken')).toHaveTextContent('secret-token');
  });

  it('merges updates with previous azure state', () => {
    renderWithProvider(
      <TestComponent updateAzure={{ azureModelName: 'merged-azure-model' }} />,
    );
    expect(screen.getByTestId('useAzureAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('azureEndpoint')).toHaveTextContent(
      'https://your-azure-endpoint.com',
    );
    expect(screen.getByTestId('azureModelName')).toHaveTextContent(
      'merged-azure-model',
    );
    expect(screen.getByTestId('azureToken')).toHaveTextContent('');
  });

  it('setAzureSettings does not remove unspecified azure fields', () => {
    renderWithProvider(
      <TestComponent
        updateAzure={{ azureEndpoint: 'https://changed-azure.com' }}
      />,
    );
    expect(screen.getByTestId('useAzureAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('azureEndpoint')).toHaveTextContent(
      'https://changed-azure.com',
    );
    expect(screen.getByTestId('azureModelName')).toHaveTextContent(
      'openai/gpt-4.1',
    );
    expect(screen.getByTestId('azureToken')).toHaveTextContent('');
  });
});
