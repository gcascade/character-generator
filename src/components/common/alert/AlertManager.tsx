import CloseIcon from '@mui/icons-material/Close';
import { Alert, Grow, IconButton, Stack, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import { TransitionGroup } from 'react-transition-group';
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
      <TransitionGroup>
        {alerts.map((alert) => (
          <Grow key={alert.id}>
            <Alert
              severity={alert.severity}
              sx={{
                mb: 2,
                boxShadow: 3,
                border: '1px solid',
              }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => removeAlert(alert.id)}
                  sx={{
                    padding: 0,
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {alert.message}
              </Typography>
            </Alert>
          </Grow>
        ))}
      </TransitionGroup>
    </Stack>
  );
};

export default AlertManager;
