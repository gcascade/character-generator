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

export const MAX_VISIBLE_ALERTS = 3;

// Errors and warnings stay longer so they can be read.
export const ALERT_DURATION_MS: Record<Alert['severity'], number> = {
  success: 4000,
  info: 4000,
  warning: 8000,
  error: 8000,
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
      setAlerts((prevAlerts) =>
        [...prevAlerts, { ...alert, id }].slice(-MAX_VISIBLE_ALERTS),
      );
      timers.current.set(
        id,
        setTimeout(() => removeAlert(id), ALERT_DURATION_MS[alert.severity]),
      );
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
