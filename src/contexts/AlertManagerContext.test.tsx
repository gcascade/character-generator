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

  it('gives each alert a new id, so a replacement shows as a new notification', () => {
    const { result } = renderAlerts();

    act(() => result.current.addAlert(success('one')));
    const [first] = result.current.alerts;
    act(() => result.current.addAlert(success('one')));
    const [second] = result.current.alerts;
    expect(first.id).not.toBe(second.id);
  });

  it('dismisses success alerts automatically', () => {
    const { result } = renderAlerts();

    act(() => result.current.addAlert(success('saved')));
    expect(result.current.alerts).toHaveLength(1);

    act(() => vi.advanceTimersByTime(ALERT_DURATION_MS.success!));
    expect(result.current.alerts).toHaveLength(0);
  });

  it('keeps errors on screen until closed or replaced', () => {
    const { result } = renderAlerts();

    act(() =>
      result.current.addAlert({
        severity: 'error',
        title: 'Error',
        message: 'boom',
      }),
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.alerts).toHaveLength(1);

    act(() => result.current.addAlert(success('saved')));
    expect(result.current.alerts.map((a) => a.message)).toEqual(['saved']);
  });

  it('shows one notification at a time, the latest one', () => {
    const { result } = renderAlerts();

    act(() => {
      for (let i = 1; i <= 5; i++) {
        result.current.addAlert(success(`alert ${i}`));
      }
    });

    expect(MAX_VISIBLE_ALERTS).toBe(1);
    expect(result.current.alerts.map((a) => a.message)).toEqual(['alert 5']);
  });
});
