import React, { FC, ReactNode, createContext, useState } from 'react';
import { RequestStatus } from '../types/requests';

type RequestProviderProps = {
  children: ReactNode;
};

type RequestContextType = {
  requestStatus: RequestStatus;
  setRequestStatus: (request: RequestStatus) => void;
  error: string;
  setError: (error: string) => void;
};

export const RequestContext = createContext<RequestContextType | undefined>(
  undefined,
);

export const RequestProvider: FC<RequestProviderProps> = ({ children }) => {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('success');
  const [error, setError] = useState('');

  return (
    <RequestContext.Provider
      value={{ requestStatus, setRequestStatus, error, setError }}
    >
      {children}
    </RequestContext.Provider>
  );
};
