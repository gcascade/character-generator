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
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import PageTitle from '../../components/common/pageTitle/PageTitle';
import useSettings from '../../hooks/useSettings';

type SettingsFormValues = {
  useOllamaAPI: boolean;
  ollamaEndpoint: string;
  ollamaModelName: string;
  useAzureAPI: boolean;
  azureEndpoint: string;
  azureModelName: string;
  azureToken: string;
};

const Settings: React.FC = () => {
  const {
    ollamaSettings: { useOllamaAPI, ollamaEndpoint, ollamaModelName },
    setOllamaSettings,
    azureSettings: { useAzureAPI, azureEndpoint, azureModelName, azureToken },
    setAzureSettings,
  } = useSettings();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      useOllamaAPI,
      ollamaEndpoint,
      ollamaModelName,
      useAzureAPI,
      azureEndpoint,
      azureModelName,
      azureToken,
    },
  });

  const isOllamaEnabled = useWatch({ control, name: 'useOllamaAPI' });
  const isAzureEnabled = useWatch({ control, name: 'useAzureAPI' });

  useEffect(() => {
    setValue('useOllamaAPI', useOllamaAPI);
    setValue('ollamaEndpoint', ollamaEndpoint);
    setValue('ollamaModelName', ollamaModelName);
  }, [useOllamaAPI, ollamaEndpoint, ollamaModelName, setValue]);

  useEffect(() => {
    setValue('useAzureAPI', useAzureAPI);
    setValue('azureEndpoint', azureEndpoint);
    setValue('azureModelName', azureModelName);
    setValue('azureToken', azureToken);
  }, [useAzureAPI, azureEndpoint, azureModelName, azureToken, setValue]);

  const onSubmit: SubmitHandler<SettingsFormValues> = (data) => {
    setOllamaSettings({
      useOllamaAPI: data.useOllamaAPI,
      ollamaEndpoint: data.ollamaEndpoint,
      ollamaModelName: data.ollamaModelName,
    });
    setAzureSettings({
      useAzureAPI: data.useAzureAPI,
      azureEndpoint: data.azureEndpoint,
      azureModelName: data.azureModelName,
      azureToken: data.azureToken,
    });
  };

  const handleOllamaToggle = (checked: boolean) => {
    setValue('useOllamaAPI', checked);
    if (checked) setValue('useAzureAPI', false);
  };
  const handleAzureToggle = (checked: boolean) => {
    setValue('useAzureAPI', checked);
    if (checked) setValue('useOllamaAPI', false);
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
        <PageTitle>Character Generator Settings</PageTitle>
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
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6" component="h2">
                  Ollama API Integration
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      {...register('useOllamaAPI')}
                      checked={isOllamaEnabled}
                      onChange={(e) => handleOllamaToggle(e.target.checked)}
                      slotProps={{
                        input: {
                          'aria-label': 'Toggle Ollama API Integration',
                        },
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
                    required: isOllamaEnabled,
                    pattern: {
                      value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
                      message: 'Enter a valid URL',
                    },
                  })}
                  error={!!errors.ollamaEndpoint}
                  helperText={errors.ollamaEndpoint?.message}
                  disabled={!isOllamaEnabled}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <TextField
                  label="Ollama Model Name"
                  variant="outlined"
                  fullWidth
                  {...register('ollamaModelName', {
                    required: isOllamaEnabled,
                  })}
                  error={!!errors.ollamaModelName}
                  helperText={
                    errors.ollamaModelName && 'Model name is required'
                  }
                  disabled={!isOllamaEnabled}
                />
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6" component="h2">
                  Azure Integration
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      {...register('useAzureAPI')}
                      checked={isAzureEnabled}
                      onChange={(e) => handleAzureToggle(e.target.checked)}
                      slotProps={{
                        input: { 'aria-label': 'Toggle Azure API Integration' },
                      }}
                    />
                  }
                  label="Enable Azure API"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <TextField
                  label="Azure Endpoint"
                  variant="outlined"
                  fullWidth
                  {...register('azureEndpoint', {
                    required: isAzureEnabled,
                    pattern: {
                      value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
                      message: 'Enter a valid URL',
                    },
                  })}
                  error={!!errors.azureEndpoint}
                  helperText={errors.azureEndpoint?.message}
                  disabled={!isAzureEnabled}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <TextField
                  label="Azure Model Name"
                  variant="outlined"
                  fullWidth
                  {...register('azureModelName', {
                    required: isAzureEnabled,
                  })}
                  error={!!errors.azureModelName}
                  helperText={errors.azureModelName && 'Model name is required'}
                  disabled={!isAzureEnabled}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <TextField
                  label="Azure Token"
                  variant="outlined"
                  fullWidth
                  type="password"
                  {...register('azureToken', {
                    required: isAzureEnabled,
                  })}
                  error={!!errors.azureToken}
                  helperText={errors.azureToken && 'Token is required'}
                  disabled={!isAzureEnabled}
                />
              </div>
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
