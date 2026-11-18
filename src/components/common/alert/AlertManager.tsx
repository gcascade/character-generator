import { Close as CloseIcon } from '@mui/icons-material';
import { Alert, Grow, IconButton, Stack, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { AlertManagerContext } from '../../../contexts/AlertManagerContext';
import { useT } from '../../../i18n';

// Bottom-right so alerts never cover the navigation menu.
const AlertManager: FC = () => {
  const context = useContext(AlertManagerContext);
  const t = useT();

  if (!context) {
    throw new Error('AlertManager must be used within an AlertManagerProvider');
  }

  const { alerts, removeAlert } = context;

  return (
    <Stack
      sx={{
        width: { xs: 'calc(100% - 32px)', sm: 360 },
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: (theme) => theme.zIndex.snackbar,
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
                  aria-label={t('alert.close')}
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
