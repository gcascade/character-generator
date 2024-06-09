import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import theme from '../../../themes/themes';
import AlertManager from './AlertManager';

describe('AlertManager', () => {
  const mockAlerts = [
    { id: 1, severity: 'error', message: 'Error message', title: 'Error' },
    {
      id: 2,
      severity: 'warning',
      message: 'Warning message',
      title: 'Warning',
    },
    { id: 3, severity: 'info', message: 'Info message', title: 'Info' },
    {
      id: 4,
      severity: 'success',
      message: 'Success message',
      title: 'Success',
    },
  ];

  const mockRemoveAlert = jest.fn();

  const renderWithProvider = (alerts = mockAlerts) => {
    return render(
      <ThemeProvider theme={theme}>
        <AlertManagerContext.Provider
          value={{ alerts, removeAlert: mockRemoveAlert }}
        >
          <AlertManager width="400px" />
        </AlertManagerContext.Provider>
      </ThemeProvider>,
    );
  };

  test('renders without crashing', () => {
    renderWithProvider();
  });

  test('displays alerts correctly', () => {
    renderWithProvider();

    mockAlerts.forEach((alert) => {
      expect(screen.getByText(alert.message)).toBeInTheDocument();
    });
  });

  test('calls removeAlert when close button is clicked', () => {
    renderWithProvider();

    const closeButtons = screen.getAllByLabelText('close');
    fireEvent.click(closeButtons[0]);

    expect(mockRemoveAlert).toHaveBeenCalledWith(mockAlerts[0].id);
  });

  test('throws an error if used outside of a provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AlertManager width="400px" />)).toThrow(
      'AlertManager must be used within an AlertManagerProvider',
    );
    console.error.mockRestore();
  });
});
