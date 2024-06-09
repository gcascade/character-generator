import { useContext } from 'react';
import { AlertManagerContext } from '../contexts/AlertManagerContext';

const useAlert = () => {
  const context = useContext(AlertManagerContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertManagerProvider');
  }

  const { addAlert } = context;

  const addAlertWithSeverity = (
    severity: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => {
    const titleMap: {
      [key in 'success' | 'error' | 'warning' | 'info']: string;
    } = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    };

    addAlert({ severity, title: titleMap[severity], message });
  };

  const addSuccess = (message: string) =>
    addAlertWithSeverity('success', message);
  const addError = (message: string) => addAlertWithSeverity('error', message);
  const addWarning = (message: string) =>
    addAlertWithSeverity('warning', message);
  const addInfo = (message: string) => addAlertWithSeverity('info', message);

  return {
    addSuccess,
    addError,
    addWarning,
    addInfo,
  };
};

export default useAlert;
