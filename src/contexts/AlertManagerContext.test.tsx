import { act, render, renderHook } from '@testing-library/react';
import React, { ReactNode, useContext } from 'react';
import {
  ALERT_DURATION_MS,
  AlertManagerContext,
  AlertManagerProvider,
  MAX_VISIBLE_ALERTS,
} from './AlertManagerContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AlertManagerProvider>{children}</AlertManagerProvider>
);

const renderAlerts = () =>
  renderHook(() => useContext(AlertManagerContext)!, { wrapper });

const success = (message: string) =>
  ({ severity: 'success', title: 'Success', message }) as const;

describe('AlertManagerContext', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

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

  it('gives each alert a unique id, even when added at the same time', () => {
    const { result } = renderAlerts();

    act(() => {
      result.current.addAlert(success('one'));
      result.current.addAlert(success('two'));
    });

    const [first, second] = result.current.alerts;
    expect(first.id).not.toBe(second.id);
  });

  it('dismisses success alerts automatically', () => {
    const { result } = renderAlerts();

    act(() => result.current.addAlert(success('saved')));
    expect(result.current.alerts).toHaveLength(1);

    act(() => vi.advanceTimersByTime(ALERT_DURATION_MS.success));
    expect(result.current.alerts).toHaveLength(0);
  });

  it('keeps errors on screen longer than successes', () => {
    const { result } = renderAlerts();

    act(() =>
      result.current.addAlert({
        severity: 'error',
        title: 'Error',
        message: 'boom',
      }),
    );
    act(() => vi.advanceTimersByTime(ALERT_DURATION_MS.success));
    expect(result.current.alerts).toHaveLength(1);

    act(() =>
      vi.advanceTimersByTime(
        ALERT_DURATION_MS.error - ALERT_DURATION_MS.success,
      ),
    );
    expect(result.current.alerts).toHaveLength(0);
  });

  it(`shows at most ${MAX_VISIBLE_ALERTS} alerts, dropping the oldest`, () => {
    const { result } = renderAlerts();

    act(() => {
      for (let i = 1; i <= MAX_VISIBLE_ALERTS + 2; i++) {
        result.current.addAlert(success(`alert ${i}`));
      }
    });

    expect(result.current.alerts.map((a) => a.message)).toEqual(
      Array.from({ length: MAX_VISIBLE_ALERTS }, (_, i) => `alert ${i + 3}`),
    );
  });
});
