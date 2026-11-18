import { useMemo } from 'react';
import { useContext } from 'react';
import { AlertManagerContext } from '../contexts/AlertManagerContext';
import type { Alert } from '../types/alerts';
import { useT } from '../i18n';

const useAlert = () => {
  const context = useContext(AlertManagerContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertManagerProvider');
  }

  const { addAlert } = context;
  const t = useT();

  return useMemo(() => {
    const add = (severity: Alert['severity']) => (message: string) =>
      addAlert({ severity, title: t(`alert.${severity}`), message });
    return {
      addSuccess: add('success'),
      addError: add('error'),
      addWarning: add('warning'),
      addInfo: add('info'),
    };
  }, [addAlert, t]);
};

export default useAlert;
