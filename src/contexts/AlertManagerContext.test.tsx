import { render } from '@testing-library/react';
import React from 'react';
import {
  AlertManagerContext,
  AlertManagerProvider,
} from './AlertManagerContext';

describe('AlertManagerContext', () => {
  it('provides alerts, addAlert and removeAlert function', () => {
    const TestComponent = () => {
      return (
        <AlertManagerContext.Consumer>
          {(context) => {
            expect(context?.alerts).toBeDefined();
            expect(typeof context?.addAlert).toBe('function');
            expect(typeof context?.removeAlert).toBe('function');
            return null;
          }}
        </AlertManagerContext.Consumer>
      );
    };

    render(
      <AlertManagerProvider>
        <TestComponent />
      </AlertManagerProvider>,
    );
  });
});
