import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('renders children without error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('catches an error and displays fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('logs error to console when an error is thrown', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Uncaught error:'),
      expect.any(Error),
      expect.any(Object),
    );

    consoleErrorSpy.mockRestore();
  });
});
