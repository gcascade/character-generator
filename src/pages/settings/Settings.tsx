import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useSettings from '../../hooks/useSettings';

type SettingsFormValues = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
};

const Settings: React.FC = () => {
  const {
    ollamaSettings: { useOllamaAPI, ollamaEndpoint, ollamaModelName },
    setOllamaSettings,
  } = useSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      useOllamaAPI,
      ollamaEndpoint,
      ollamaModelName,
    },
  });

  useEffect(() => {
    setValue('useOllamaAPI', useOllamaAPI);
    setValue('ollamaEndpoint', ollamaEndpoint);
    setValue('ollamaModelName', ollamaModelName);
  }, [useOllamaAPI, ollamaEndpoint, ollamaModelName, setValue]);

  const onSubmit: SubmitHandler<SettingsFormValues> = (data) => {
    setOllamaSettings({
      useOllamaAPI: data.useOllamaAPI,
      ollamaEndpoint: data.ollamaEndpoint,
      ollamaModelName: data.ollamaModelName,
    });
  };

  return (
    <Container maxWidth={false} sx={{}}>
      <Paper
        elevation={3}
        sx={{
          minHeight: '95vh',
          padding: '20px',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Character Generator Settings
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ marginBottom: '1.5rem' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              General Settings
            </Typography>
            <Typography variant="body1" gutterBottom>
              Here you can adjust the general settings of the character
              generator.
            </Typography>
          </Box>
          <Box sx={{ marginBottom: '1.5rem' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              API Integration
            </Typography>
            <Typography variant="body1" gutterBottom>
              Configure API settings for generative AI and other integrations.
            </Typography>
            <div style={{ marginBottom: '20px' }}>
              <Typography variant="h6" component="h2">
                Ollama API Integration
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    {...register('useOllamaAPI')}
                    checked={watch('useOllamaAPI')}
                    onChange={(e) => setValue('useOllamaAPI', e.target.checked)}
                    inputProps={{
                      'aria-label': 'Toggle Ollama API Integration',
                    }}
                  />
                }
                label="Enable Ollama API"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <TextField
                label="Ollama Endpoint"
                variant="outlined"
                fullWidth
                {...register('ollamaEndpoint', {
                  required: watch('useOllamaAPI'),
                  pattern: {
                    value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
                    message: 'Enter a valid URL',
                  },
                })}
                error={!!errors.ollamaEndpoint}
                helperText={errors.ollamaEndpoint?.message}
                disabled={!watch('useOllamaAPI')}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <TextField
                label="Ollama Model Name"
                variant="outlined"
                fullWidth
                {...register('ollamaModelName', {
                  required: watch('useOllamaAPI'),
                })}
                error={!!errors.ollamaModelName}
                helperText={errors.ollamaModelName && 'Model name is required'}
                disabled={!watch('useOllamaAPI')}
              />
            </div>
          </Box>
          <Box>
            <Button variant="contained" color="primary" type="submit">
              Save Settings
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Settings;
