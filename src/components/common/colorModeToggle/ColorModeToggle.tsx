import {
  BrightnessAuto as SystemIcon,
  DarkMode as DarkIcon,
  LightMode as LightIcon,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import React, { FC } from 'react';
import { useT } from '../../../i18n';

const MODES = ['light', 'system', 'dark'] as const;
type ColorMode = (typeof MODES)[number];

const ICONS: Record<ColorMode, React.ReactNode> = {
  light: <LightIcon fontSize="small" />,
  system: <SystemIcon fontSize="small" />,
  dark: <DarkIcon fontSize="small" />,
};

type ColorModeToggleProps = {
  /** Icon buttons for the menu, or a labelled select for Settings. */
  variant?: 'compact' | 'select';
};

/** Light, dark or system colour mode (spec 005 US5); MUI remembers the choice. */
const ColorModeToggle: FC<ColorModeToggleProps> = ({ variant = 'compact' }) => {
  const t = useT();
  const { mode, setMode } = useColorScheme();
  const current: ColorMode = mode ?? 'system';

  if (variant === 'select') {
    return (
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="color-mode-label">{t('colorMode.label')}</InputLabel>
        <Select
          labelId="color-mode-label"
          label={t('colorMode.label')}
          value={current}
          onChange={(event) => setMode(event.target.value as ColorMode)}
        >
          {MODES.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`colorMode.${value}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={current}
      aria-label={t('colorMode.label')}
      onChange={(_, value: ColorMode | null) => value && setMode(value)}
    >
      {MODES.map((value) => (
        <ToggleButton
          key={value}
          value={value}
          aria-label={t(`colorMode.${value}`)}
          title={t(`colorMode.${value}`)}
        >
          {ICONS[value]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ColorModeToggle;
