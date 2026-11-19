import { Groups as PartyIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import { label } from '../../../content/labels';
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from '../../../content/party';
import useParty from '../../../hooks/useParty';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import {
  CharacterAlignments,
  CharacterClasses,
  CharacterRaces,
  Genders,
} from '../../../types/character';
import type { AlignmentMode, PartyConstraints } from '../../../types/party';

const CONSTRAINTS: {
  key: keyof PartyConstraints;
  field: MessageKey;
  kind: 'race' | 'class' | 'gender' | 'alignment';
  values: readonly string[];
}[] = [
  {
    key: 'race',
    field: 'field.race',
    kind: 'race',
    values: Object.values(CharacterRaces),
  },
  {
    key: 'characterClass',
    field: 'field.class',
    kind: 'class',
    values: Object.values(CharacterClasses),
  },
  {
    key: 'gender',
    field: 'field.gender',
    kind: 'gender',
    values: Object.values(Genders),
  },
  {
    key: 'alignment',
    field: 'field.alignment',
    kind: 'alignment',
    values: Object.values(CharacterAlignments),
  },
];

const SIZES = Array.from(
  { length: MAX_PARTY_SIZE - MIN_PARTY_SIZE + 1 },
  (_, i) => MIN_PARTY_SIZE + i,
);

type PartyControlsProps = {
  onGenerate: VoidFunction;
  onSave: VoidFunction;
  generating?: boolean;
};

/** Party size, shared settings, alignment mode, Generate and Save (spec 004). */
const PartyControls: FC<PartyControlsProps> = ({
  onGenerate,
  onSave,
  generating = false,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const {
    party,
    size,
    constraints,
    alignmentMode,
    setSize,
    setConstraint,
    setAlignmentMode,
    isSaved,
  } = useParty();

  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          px: { xs: 2, sm: 3 },
        }}
      >
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="party-size-label">{t('party.size')}</InputLabel>
          <Select
            labelId="party-size-label"
            label={t('party.size')}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          >
            {SIZES.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {CONSTRAINTS.map(({ key, field, kind, values }) => (
          <FormControl key={key} size="small" sx={{ minWidth: 150 }}>
            <InputLabel id={`party-${key}-label`}>{t(field)}</InputLabel>
            <Select
              labelId={`party-${key}-label`}
              label={t(field)}
              value={constraints[key] ?? ''}
              displayEmpty
              renderValue={(value) =>
                value
                  ? label(kind, String(value), 'Male', locale)
                  : t('party.any')
              }
              onChange={(event) =>
                setConstraint(key, (event.target.value || undefined) as never)
              }
            >
              <MenuItem value="">{t('party.any')}</MenuItem>
              {values.map((value) => (
                <MenuItem key={value} value={value}>
                  {label(kind, value, 'Male', locale)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        <Box>
          <Typography
            id="party-mode-label"
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {t('party.alignmentMode')}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={alignmentMode}
            aria-labelledby="party-mode-label"
            onChange={(_, mode: AlignmentMode | null) =>
              mode && setAlignmentMode(mode)
            }
          >
            <ToggleButton value="harmonious">
              {t('party.harmonious')}
            </ToggleButton>
            <ToggleButton value="anything">{t('party.anything')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            ml: { md: 'auto' },
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            startIcon={<PartyIcon />}
            onClick={onGenerate}
            disabled={generating}
          >
            {t('party.generate')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={!party || isSaved || generating}
          >
            {isSaved ? t('party.saved') : t('party.save')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PartyControls;
