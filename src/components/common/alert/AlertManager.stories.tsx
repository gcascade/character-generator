import { Button, ButtonGroup } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import React, { FC, useState } from 'react';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import useAlert from '../../../hooks/useAlert';
import { Alert } from '../../../types/alerts';
import AlertManager from './AlertManager';

const mockAlerts: Alert[] = [
  { id: 1, title: 'error', severity: 'error', message: 'Error alert message' },
  {
    id: 2,
    title: 'warning',
    severity: 'warning',
    message: 'Warning alert message',
  },
  { id: 3, title: 'info', severity: 'info', message: 'Info alert message' },
  {
    id: 4,
    title: 'success',
    severity: 'success',
    message: 'Success alert message',
  },
];

type DemoComponentProps = {
  alerts: Alert[];
  width: string;
};

type AddAlertButtonsProps = {
  resetAlerts: VoidFunction;
};

const AddAlertButtons: FC<AddAlertButtonsProps> = ({ resetAlerts }) => {
  const { addSuccess, addError, addWarning, addInfo } = useAlert();

  return (
    <ButtonGroup orientation="vertical">
      <Button
        onClick={() => addSuccess('Success alert message')}
        variant="contained"
        color="success"
        sx={{ margin: '5px' }}
      >
        Add Success
      </Button>
      <Button
        onClick={() => addInfo('Info alert message')}
        variant="contained"
        color="info"
        sx={{ margin: '5px' }}
      >
        Add Info
      </Button>
      <Button
        onClick={() => addWarning('Warning alert message')}
        variant="contained"
        color="warning"
        sx={{ margin: '5px' }}
      >
        Add Warning
      </Button>
      <Button
        onClick={() => addError('Error alert message')}
        variant="contained"
        color="error"
        sx={{ margin: '5px' }}
      >
        Add Error
      </Button>
      <Button
        onClick={resetAlerts}
        variant="contained"
        color="secondary"
        sx={{ margin: '5px' }}
      >
        Reset
      </Button>
    </ButtonGroup>
  );
};

const DemoComponent: FC<DemoComponentProps> = ({ alerts, width }) => {
  const [currentAlerts, setCurrentAlerts] = useState<Alert[]>(alerts);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert = { ...alert, id: Date.now() };
    setCurrentAlerts((prevAlerts) => [...prevAlerts, newAlert]);
  };

  const removeAlert = (id: number) => {
    setCurrentAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== id),
    );
  };

  const resetAlerts = () => {
    currentAlerts.forEach((alert) => removeAlert(alert.id));
    setCurrentAlerts([...alerts]);
  };

  return (
    <AlertManagerContext.Provider
      value={{ alerts: currentAlerts, addAlert, removeAlert }}
    >
      <AddAlertButtons resetAlerts={resetAlerts} />
      <AlertManager width={width} />
    </AlertManagerContext.Provider>
  );
};

const meta: Meta<DemoComponentProps> = {
  title: 'Common/Alert/AlertManager',
  component: AlertManager,
  parameters: {
    layout: 'centered',
  },
  render: function RenderStory(args) {
    return <DemoComponent {...args} />;
  },
  tags: ['autodocs'],
  args: {
    width: '300px',
  },
  argTypes: {
    width: {
      control: 'text',
      defaultValue: '300px',
    },
  },
} satisfies Meta<DemoComponentProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alerts: [],
  },
};

export const WithAlerts: Story = {
  args: {
    alerts: mockAlerts,
  },
};
