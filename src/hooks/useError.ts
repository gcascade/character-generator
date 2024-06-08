import { useContext } from 'react';
import { AlertManagerContext } from '../contexts/AlertManagerContext';

const useError = () => {
  const context = useContext(AlertManagerContext);

  if (!context) {
    throw new Error('useError must be used within an AlertManagerProvider');
  }

  const { addAlert } = context;

  const addError = (message: string) => {
    addAlert({ severity: 'error', title: 'Error', message });
  };

  return {
    addError,
  };
};

export default useError;
