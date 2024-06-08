import CloseIcon from '@mui/icons-material/Close';
import { Alert, IconButton, Stack, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';

type AlertManagerProps = {
  width: string;
};

const AlertManager: FC<AlertManagerProps> = ({ width }) => {
  const context = useContext(AlertManagerContext);

  if (!context) {
    throw new Error('AlertManager must be used within an AlertManagerProvider');
  }

  const { alerts, removeAlert } = context;

  return (
    <Stack
      sx={{
        width,
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 9999,
        spacing: 2,
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          sx={{
            mb: 2,
            boxShadow: 3,
            border: '1px solid',
            borderColor: (theme) => theme.palette[alert.severity].dark,
            backgroundColor: (theme) => theme.palette[alert.severity].main,
            color: (theme) => theme.palette.common.white,
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => removeAlert(alert.id)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="caption">{alert.message}</Typography>
        </Alert>
      ))}
    </Stack>
  );
};

export default AlertManager;
