import React, { createContext, FC, ReactNode, useState } from 'react';

type AlertType = {
  id: number;
  severity: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
};

type AlertManagerContextType = {
  addAlert: (alert: Omit<AlertType, 'id'>) => void;
  removeAlert: (id: number) => void;
  alerts: AlertType[];
};

export const AlertManagerContext = createContext<
  AlertManagerContextType | undefined
>(undefined);

export const AlertManagerProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = (alert: Omit<AlertType, 'id'>) => {
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
