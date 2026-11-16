import { korvusBlackiron } from '@Test/stubs/Character.stubs';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { HistoryContext, HistoryProvider } from './HistoryContext';

describe('HistoryContext', () => {
  it('provides character and setCharacter function', () => {
    const TestComponent = () => {
      return (
        <HistoryContext.Consumer>
          {(context) => {
            expect(context?.history).toBeDefined();
            expect(typeof context?.addToHistory).toBe('function');
            expect(typeof context?.clearHistory).toBe('function');
            expect(typeof context?.removeFromHistory).toBe('function');
            return null;
          }}
        </HistoryContext.Consumer>
      );
    };

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>,
    );
  });

  describe('persistence', () => {
    const HistoryLength = () => {
      const context = useContext(HistoryContext);
      return <div data-testid="length">{context?.history.length}</div>;
    };

    beforeEach(() => localStorage.clear());

    it('loads the saved history', () => {
      localStorage.setItem(
        'characterHistory',
        JSON.stringify([korvusBlackiron, korvusBlackiron]),
      );
      render(
        <HistoryProvider>
          <HistoryLength />
        </HistoryProvider>,
      );
      expect(screen.getByTestId('length')).toHaveTextContent('2');
    });

    it('starts empty when the saved history is corrupted', () => {
      localStorage.setItem('characterHistory', '{not json');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <HistoryProvider>
          <HistoryLength />
        </HistoryProvider>,
      );
      expect(screen.getByTestId('length')).toHaveTextContent('0');
    });
  });
});
