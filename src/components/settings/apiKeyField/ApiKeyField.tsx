import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import { useT } from '../../../i18n';

type ApiKeyFieldProps = {
  providerName: string;
  value: string;
  onChange: (value: string) => void;
  remember: boolean;
  onRememberChange: (remember: boolean) => void;
  /** Deletes the stored key; disabled when nothing is stored. */
  onForget: VoidFunction;
  hasStoredKey: boolean;
  required?: boolean;
  error?: string;
};

/** API key input with the storage notice, "remember" choice and "forget" action (FR-005). */
const ApiKeyField: FC<ApiKeyFieldProps> = ({
  providerName,
  value,
  onChange,
  remember,
  onRememberChange,
  onForget,
  hasStoredKey,
  required = false,
  error,
}) => {
  const t = useT();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        label={t('apiKey.label')}
        type="password"
        autoComplete="off"
        fullWidth
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error)}
        helperText={error ?? t('apiKey.notice', { provider: providerName })}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={remember}
              onChange={(event) => onRememberChange(event.target.checked)}
            />
          }
          label={t('apiKey.remember')}
        />
        <Button
          variant="text"
          color="error"
          onClick={onForget}
          disabled={!hasStoredKey}
        >
          {t('apiKey.forget')}
        </Button>
      </Box>
      {!remember && (
        <Typography variant="caption" color="text.secondary">
          {t('apiKey.sessionOnly')}
        </Typography>
      )}
    </Box>
  );
};

export default ApiKeyField;
