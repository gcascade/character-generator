import React, { createContext, FC, ReactNode, useState } from 'react';
import { Alert } from '../types/alerts';

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

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert = { ...alert, id: Date.now() };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
  };

  const removeAlert = (id: number) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertManagerContext.Provider value={{ addAlert, removeAlert, alerts }}>
      {children}
    </AlertManagerContext.Provider>
  );
};
