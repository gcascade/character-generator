import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';

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
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <TextField
      label="API key"
      type="password"
      autoComplete="off"
      fullWidth
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={
        error ??
        `Your key is stored only in this browser and sent only to ${providerName}.`
      }
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
        label="Remember on this device"
      />
      <Button
        variant="text"
        color="error"
        onClick={onForget}
        disabled={!hasStoredKey}
      >
        Forget key
      </Button>
    </Box>
    {!remember && (
      <Typography variant="caption" color="text.secondary">
        The key will be deleted when you close this tab.
      </Typography>
    )}
  </Box>
);

export default ApiKeyField;
