import {
  Casino as GenerateIcon,
  Groups as BatchIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import React, { FC } from 'react';
import { type LabelKind, label } from '../../../content/labels';
import type { NpcConstraints } from '../../../content/storedNpc';
import useNpcs from '../../../hooks/useNpcs';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import { CharacterRaces, Genders } from '../../../types/character';
import { Occupations } from '../../../types/npc';

const CONSTRAINTS: {
  key: keyof NpcConstraints;
  field: MessageKey;
  kind: LabelKind;
  values: readonly string[];
}[] = [
  {
    key: 'occupation',
    field: 'field.occupation',
    kind: 'occupation',
    values: Object.values(Occupations),
  },
  {
    key: 'race',
    field: 'field.race',
    kind: 'race',
    values: Object.values(CharacterRaces),
  },
  {
    key: 'gender',
    field: 'field.gender',
    kind: 'gender',
    values: Object.values(Genders),
  },
];

type NpcControlsProps = {
  onGenerate: VoidFunction;
  onGenerateBatch: VoidFunction;
  generating?: boolean;
};

/** Occupation, race and gender (or "Any"), Generate and Generate 5 (spec 010). */
const NpcControls: FC<NpcControlsProps> = ({
  onGenerate,
  onGenerateBatch,
  generating = false,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const { constraints, setConstraint } = useNpcs();

  // Sorted by label in the interface language: easier to find a trade.
  const sorted = (kind: LabelKind, values: readonly string[]) =>
    kind === 'occupation'
      ? [...values].sort((a, b) =>
          label(kind, a, 'Male', locale).localeCompare(
            label(kind, b, 'Male', locale),
            locale,
          ),
        )
      : values;

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
        {CONSTRAINTS.map(({ key, field, kind, values }) => (
          <FormControl key={key} size="small" sx={{ minWidth: 160 }}>
            {/* "Any" is shown as a value, so the label stays raised. */}
            <InputLabel id={`npc-${key}-label`} shrink>
              {t(field)}
            </InputLabel>
            <Select
              labelId={`npc-${key}-label`}
              label={t(field)}
              notched
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
              {sorted(kind, values).map((value) => (
                <MenuItem key={value} value={value}>
                  {label(kind, value, 'Male', locale)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            ml: { md: 'auto' },
          }}
        >
          <Button
            variant="contained"
            startIcon={<GenerateIcon />}
            onClick={onGenerate}
            disabled={generating}
          >
            {t('npc.generate')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<BatchIcon />}
            onClick={onGenerateBatch}
            disabled={generating}
          >
            {t('npc.generateBatch')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NpcControls;
