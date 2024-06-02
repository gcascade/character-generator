import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { SettingsContext, SettingsProvider } from './SettingsContext';

const TestComponent: React.FC = () => {
  const context = useContext(SettingsContext);

  return (
    <div>
      <div>{context?.useOllamaAPI.toString()}</div>
      <div>{context?.ollamaEndpoint}</div>
      <div>{context?.ollamaModelName}</div>
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

  it('updates useOllamaAPI when setUseOllamaAPI is called', () => {
    const TestComponent: React.FC = () => {
      const context = useContext(SettingsContext);

      React.useEffect(() => {
        context?.setUseOllamaAPI(true);
      }, [context]);

      return <div>{context?.useOllamaAPI.toString()}</div>;
    };

    renderWithProvider(<TestComponent />);
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('updates ollamaEndpoint when setOllamaEndpoint is called', () => {
    const TestComponent: React.FC = () => {
      const context = useContext(SettingsContext);

      React.useEffect(() => {
        context?.setOllamaEndpoint('new-endpoint');
      }, [context]);

      return <div>{context?.ollamaEndpoint}</div>;
    };

    renderWithProvider(<TestComponent />);
    expect(screen.getByText('new-endpoint')).toBeInTheDocument();
  });

  it('updates ollamaModelName when setOllamaModelName is called', () => {
    const TestComponent: React.FC = () => {
      const context = useContext(SettingsContext);

      React.useEffect(() => {
        context?.setOllamaModelName('new-model-name');
      }, [context]);

      return <div>{context?.ollamaModelName}</div>;
    };

    renderWithProvider(<TestComponent />);
    expect(screen.getByText('new-model-name')).toBeInTheDocument();
  });
});
