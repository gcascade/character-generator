import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { FC, useMemo, useState } from 'react';
import { testConnection } from '../../ai/generate';
import { providerContext } from '../../ai/messages';
import { createProvider } from '../../ai/providers';
import { modelSchema, urlSchema } from '../../ai/schemas';
import type {
  ApiKeys,
  ConnectionTestResult,
  KeyedProviderType,
  ProviderSettings,
  ProviderType,
} from '../../ai/types';
import PageTitle from '../../components/common/pageTitle/PageTitle';
import ApiKeyField from '../../components/settings/apiKeyField/ApiKeyField';
import ConnectionTest from '../../components/settings/connectionTest/ConnectionTest';
import useAlert from '../../hooks/useAlert';
import useSettings from '../../hooks/useSettings';
import {
  type Locale,
  LOCALES,
  type MessageKey,
  useLocale,
  useT,
} from '../../i18n';

const PROVIDER_KEYS: Record<ProviderType, string> = {
  none: 'none',
  ollama: 'ollama',
  anthropic: 'anthropic',
  'openai-compatible': 'openaiCompatible',
};

const providerLabel = (type: ProviderType): MessageKey =>
  `settings.provider.${PROVIDER_KEYS[type]}` as MessageKey;
const providerHint = (type: ProviderType): MessageKey =>
  `settings.hint.${PROVIDER_KEYS[type]}` as MessageKey;

type FieldErrors = Partial<Record<'baseUrl' | 'model', MessageKey>>;

const isKeyed = (type: ProviderType): type is KeyedProviderType =>
  type === 'anthropic' || type === 'openai-compatible';

const baseUrlOf = (draft: ProviderSettings) =>
  draft.activeType === 'ollama'
    ? draft.ollama.baseUrl
    : draft.activeType === 'openai-compatible'
      ? draft.openaiCompatible.baseUrl
      : undefined;

const modelOf = (draft: ProviderSettings) =>
  draft.activeType === 'ollama'
    ? draft.ollama.model
    : draft.activeType === 'openai-compatible'
      ? draft.openaiCompatible.model
      : draft.activeType === 'anthropic'
        ? draft.anthropic.model
        : undefined;

const validate = (draft: ProviderSettings): FieldErrors => {
  const errors: FieldErrors = {};
  const baseUrl = baseUrlOf(draft);
  if (baseUrl !== undefined && !urlSchema.safeParse(baseUrl).success) {
    errors.baseUrl = 'settings.address.invalid';
  }
  const model = modelOf(draft);
  if (model !== undefined && !modelSchema.safeParse(model).success) {
    errors.model = 'settings.model.invalid';
  }
  return errors;
};

const Settings: FC = () => {
  const { settings, keys, updateSettings, setKey, setRememberKey, forgetKey } =
    useSettings();
  const { addSuccess } = useAlert();
  const t = useT();
  const { locale, setLocale } = useLocale();

  // Edits stay a draft until saved, so a half-typed address is never used.
  const [draft, setDraft] = useState<ProviderSettings>(settings);
  const [draftKeys, setDraftKeys] = useState<ApiKeys>(keys);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [models, setModels] = useState<Partial<Record<ProviderType, string[]>>>(
    {},
  );

  const type = draft.activeType;
  const provider = useMemo(() => providerContext(draft), [draft]);

  const setModel = (model: string) =>
    setDraft((previous) => {
      switch (previous.activeType) {
        case 'ollama':
          return { ...previous, ollama: { ...previous.ollama, model } };
        case 'openai-compatible':
          return {
            ...previous,
            openaiCompatible: { ...previous.openaiCompatible, model },
          };
        case 'anthropic':
          return { ...previous, anthropic: { model } };
        default:
          return previous;
      }
    });

  const setBaseUrl = (baseUrl: string) =>
    setDraft((previous) =>
      previous.activeType === 'ollama'
        ? { ...previous, ollama: { ...previous.ollama, baseUrl } }
        : {
            ...previous,
            openaiCompatible: { ...previous.openaiCompatible, baseUrl },
          },
    );

  const onSave = () => {
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    updateSettings(() => ({ ...draft, rememberKey: settings.rememberKey }));
    if (isKeyed(type)) setKey(type, draftKeys[type] ?? '');
    addSuccess(t('settings.saved'));
  };

  const onTest = (signal: AbortSignal): Promise<ConnectionTestResult> => {
    const found = validate(draft);
    setErrors(found);
    const testedProvider = createProvider(draft, draftKeys);
    if (Object.keys(found).length || !testedProvider) {
      return Promise.reject(new DOMException('Invalid', 'AbortError'));
    }
    return testConnection(testedProvider, modelOf(draft) ?? '', signal);
  };

  const onTestResult = (result: ConnectionTestResult) => {
    if (result.ok && result.models) {
      setModels((previous) => ({ ...previous, [type]: result.models }));
    }
  };

  const onForget = (keyType: KeyedProviderType) => {
    forgetKey(keyType);
    setDraftKeys((previous) => {
      const rest = { ...previous };
      delete rest[keyType];
      return rest;
    });
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Paper
        elevation={3}
        sx={{ minHeight: '95vh', padding: { xs: 1.5, sm: 2.5 } }}
      >
        <PageTitle>{t('page.settings')}</PageTitle>
        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            maxWidth: 720,
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('settings.ai.title')}
            </Typography>
            <Typography variant="body1">{t('settings.ai.intro')}</Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="provider-label">
              {t('settings.provider')}
            </InputLabel>
            <Select
              labelId="provider-label"
              label={t('settings.provider')}
              value={type}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  activeType: event.target.value as ProviderType,
                }))
              }
            >
              {(Object.keys(PROVIDER_KEYS) as ProviderType[]).map((key) => (
                <MenuItem key={key} value={key}>
                  {t(providerLabel(key))}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {t(providerHint(type))}
          </Typography>

          {(type === 'ollama' || type === 'openai-compatible') && (
            <TextField
              label={t('settings.address')}
              fullWidth
              value={baseUrlOf(draft)}
              onChange={(event) => setBaseUrl(event.target.value)}
              error={Boolean(errors.baseUrl)}
              helperText={
                errors.baseUrl
                  ? t(errors.baseUrl)
                  : type === 'ollama'
                    ? t('settings.address.hint.ollama')
                    : t('settings.address.hint.openaiCompatible')
              }
            />
          )}

          {type !== 'none' && (
            <Autocomplete
              freeSolo
              forcePopupIcon={Boolean(models[type])}
              options={models[type] ?? []}
              // Setting both value and inputValue lets the list show every model
              // until the user starts typing.
              value={modelOf(draft) ?? ''}
              onChange={(_, value) => setModel(value ?? '')}
              inputValue={modelOf(draft) ?? ''}
              onInputChange={(_, value) => setModel(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('settings.model')}
                  error={Boolean(errors.model)}
                  helperText={
                    errors.model
                      ? t(errors.model)
                      : models[type]
                        ? t('settings.model.hint.list')
                        : t('settings.model.hint.test')
                  }
                />
              )}
            />
          )}

          {isKeyed(type) && (
            <ApiKeyField
              providerName={provider?.name ?? t(providerLabel(type))}
              value={draftKeys[type] ?? ''}
              onChange={(value) =>
                setDraftKeys((previous) => ({ ...previous, [type]: value }))
              }
              remember={settings.rememberKey}
              onRememberChange={setRememberKey}
              onForget={() => onForget(type)}
              hasStoredKey={Boolean(keys[type])}
              required={type === 'anthropic'}
            />
          )}

          {provider && (
            <ConnectionTest
              key={type}
              provider={provider}
              onTest={onTest}
              onResult={onTestResult}
            />
          )}

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('settings.language.title')}
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="language-label">{t('language.label')}</InputLabel>
              <Select
                labelId="language-label"
                label={t('language.label')}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
              >
                {LOCALES.map((code) => (
                  <MenuItem key={code} value={code} lang={code}>
                    {t(`language.${code}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Button variant="contained" color="primary" type="submit">
              {t('settings.save')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Settings;
