import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { SettingsContext, SettingsProvider } from './SettingsContext';

const TestComponent: React.FC<{
  update?: Partial<ReturnType<typeof useContext>>;
}> = ({ update }) => {
  const context = useContext(SettingsContext);

  React.useEffect(() => {
    if (update && context) {
      context.setOllamaSettings(update);
    }
    // eslint-disable-next-line
  }, [update]);

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
    expect(screen.getByText('false')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:11434')).toBeInTheDocument();
    expect(screen.getByText('llama3')).toBeInTheDocument();
  });

  it('updates a single ollamaSettings field', () => {
    renderWithProvider(<TestComponent update={{ useOllamaAPI: true }} />);
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('true');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://localhost:11434',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent('llama3');
  });

  it('updates multiple ollamaSettings fields', () => {
    renderWithProvider(
      <TestComponent
        update={{
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

  it('merges updates with previous state', () => {
    renderWithProvider(
      <TestComponent update={{ ollamaModelName: 'merged-model' }} />,
    );
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://localhost:11434',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent(
      'merged-model',
    );
  });

  it('setOllamaSettings does not remove unspecified fields', () => {
    renderWithProvider(
      <TestComponent update={{ ollamaEndpoint: 'http://changed:5678' }} />,
    );
    expect(screen.getByTestId('useOllamaAPI')).toHaveTextContent('false');
    expect(screen.getByTestId('ollamaEndpoint')).toHaveTextContent(
      'http://changed:5678',
    );
    expect(screen.getByTestId('ollamaModelName')).toHaveTextContent('llama3');
  });
});
