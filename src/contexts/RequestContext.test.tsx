import { render } from '@testing-library/react';
import React from 'react';
import { RequestContext, RequestProvider } from './RequestContext';

describe('RequestContext', () => {
  it('provides requestStatus, setRequestStatus, error, and setError', () => {
    const TestComponent = () => {
      return (
        <RequestContext.Consumer>
          {(context) => {
            expect(context?.requestStatus).toBeDefined();
            expect(typeof context?.setRequestStatus).toBe('function');
            expect(context?.error).toBeDefined();
            expect(typeof context?.setError).toBe('function');
            return null;
          }}
        </RequestContext.Consumer>
      );
    };

    render(
      <RequestProvider>
        <TestComponent />
      </RequestProvider>,
    );
  });
});
