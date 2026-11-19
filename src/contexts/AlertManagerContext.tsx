import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from '../types/alerts';

/** One notification at a time: a new one replaces it (spec 005 US4). */
export const MAX_VISIBLE_ALERTS = 1;

// Successes and infos leave on their own; warnings and errors stay until closed or replaced.
export const ALERT_DURATION_MS: Record<Alert['severity'], number | null> = {
  success: 5000,
  info: 5000,
  warning: null,
  error: null,
};

type AlertManagerContextType = {
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  removeAlert: (id: number) => void;
  alerts: Alert[];
};

export const AlertManagerContext = createContext<
  AlertManagerContextType | undefined
>(undefined);

export const AlertManagerProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const removeAlert = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }, []);

  const addAlert = useCallback(
    (alert: Omit<Alert, 'id'>) => {
      const id = nextId.current++;
      setAlerts((prevAlerts) => {
        const kept = [...prevAlerts, { ...alert, id }].slice(
          -MAX_VISIBLE_ALERTS,
        );
        // Replaced alerts no longer need their timer.
        for (const { id: gone } of prevAlerts) {
          if (!kept.some((a) => a.id === gone)) {
            clearTimeout(timers.current.get(gone));
            timers.current.delete(gone);
          }
        }
        return kept;
      });
      const duration = ALERT_DURATION_MS[alert.severity];
      if (duration !== null) {
        timers.current.set(
          id,
          setTimeout(() => removeAlert(id), duration),
        );
      }
    },
    [removeAlert],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return (
    <AlertManagerContext.Provider value={{ addAlert, removeAlert, alerts }}>
      {children}
    </AlertManagerContext.Provider>
  );
};
