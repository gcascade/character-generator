import { Alert, Box, Button, CircularProgress } from '@mui/material';
import React, { FC, useEffect, useRef, useState } from 'react';
import { isCallerAbort } from '../../../ai/errors';
import { describeFailure, type ProviderContext } from '../../../ai/messages';
import type { ConnectionTestResult } from '../../../ai/types';
import { useT } from '../../../i18n';

type ConnectionTestProps = {
  provider: ProviderContext;
  onTest: (signal: AbortSignal) => Promise<ConnectionTestResult>;
  /** Called with the result of each completed test. */
  onResult?: (result: ConnectionTestResult) => void;
  disabled?: boolean;
};

/** "Test connection" button and its result (FR-006). */
const ConnectionTest: FC<ConnectionTestProps> = ({
  provider,
  onTest,
  onResult,
  disabled = false,
}) => {
  const [running, setRunning] = useState(false);
  const t = useT();
  const [result, setResult] = useState<ConnectionTestResult>();
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const run = async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setRunning(true);
    setResult(undefined);
    try {
      const outcome = await onTest(current.signal);
      setResult(outcome);
      onResult?.(outcome);
    } catch (error) {
      if (!isCallerAbort(error)) throw error;
    } finally {
      if (!current.signal.aborted) setRunning(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box>
        <Button
          variant="outlined"
          onClick={run}
          disabled={disabled || running}
          startIcon={running ? <CircularProgress size={16} /> : undefined}
        >
          {running ? t('connection.testing') : t('connection.test')}
        </Button>
      </Box>
      {result?.ok === true && (
        <Alert severity="success">
          {t('connection.success', {
            provider: provider.name,
            model: result.model,
          })}
          {result.models
            ? ` ${t('connection.models', { count: result.models.length })}`
            : ''}
        </Alert>
      )}
      {result?.ok === false && (
        <Alert severity="error">
          {describeFailure(result.error, provider, t)}
        </Alert>
      )}
    </Box>
  );
};

export default ConnectionTest;
