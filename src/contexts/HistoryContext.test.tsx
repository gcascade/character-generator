import { render } from '@testing-library/react';
import React from 'react';
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
});
