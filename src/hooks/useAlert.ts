import { useMemo } from 'react';
import { useContext } from 'react';
import { AlertManagerContext } from '../contexts/AlertManagerContext';
import type { Alert } from '../types/alerts';

const TITLES: Record<Alert['severity'], string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

const useAlert = () => {
  const context = useContext(AlertManagerContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertManagerProvider');
  }

  const { addAlert } = context;

  return useMemo(() => {
    const add = (severity: Alert['severity']) => (message: string) =>
      addAlert({ severity, title: TITLES[severity], message });
    return {
      addSuccess: add('success'),
      addError: add('error'),
      addWarning: add('warning'),
      addInfo: add('info'),
    };
  }, [addAlert]);
};

export default useAlert;
