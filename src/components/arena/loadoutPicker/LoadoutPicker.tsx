import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import { MAX_ITEMS, MAX_PERKS } from '../../../content/arena';
import { ARENA, ARENA_TEXTS } from '../../../content/data';
import { useLocale, useT } from '../../../i18n';

type LoadoutPickerProps = {
  /** Whose choices: used for labels. */
  name: string;
  /** Prefix for the field ids (one picker per contestant). */
  id: string;
  perks: string[];
  items: string[];
  onPerks: (perks: string[]) => void;
  onItems: (items: string[]) => void;
};

/** Up to two perks and three items for a contestant (spec 012 FR-009). */
const LoadoutPicker: FC<LoadoutPickerProps> = ({
  name,
  id,
  perks,
  items,
  onPerks,
  onItems,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const texts = ARENA_TEXTS[locale];

  const slot = (
    kind: 'perk' | 'item',
    index: number,
    chosen: string[],
    onChange: (values: string[]) => void,
  ) => {
    const value = chosen[index] ?? '';
    const labelId = `${id}-${kind}-${index}`;
    const label = t(kind === 'perk' ? 'arena.perk' : 'arena.item', {
      number: index + 1,
    });
    const options =
      kind === 'perk'
        ? ARENA.perks
            .filter((p) => p.id === value || !chosen.includes(p.id))
            .map((p) => ({ id: p.id, ...texts.perks[p.id] }))
        : ARENA.items.map((i) => ({
            id: i.id,
            name: texts.items[i.id].a,
            description: texts.items[i.id].description,
          }));
    const description = options.find((o) => o.id === value)?.description;
    const update = (next: string) => {
      const values = [...chosen];
      values[index] = next;
      onChange(values.filter(Boolean));
    };
    return (
      <FormControl size="small" key={labelId} sx={{ minWidth: 0 }}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <Select
          labelId={labelId}
          label={label}
          value={value}
          onChange={(event) => update(event.target.value)}
          renderValue={(selected) =>
            options.find((o) => o.id === selected)?.name ?? t('arena.none')
          }
        >
          <MenuItem value="">
            <em>{t('arena.none')}</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <ListItemText
                primary={option.name}
                secondary={option.description}
              />
            </MenuItem>
          ))}
        </Select>
        {description && <FormHelperText>{description}</FormHelperText>}
      </FormControl>
    );
  };

  return (
    <Box
      role="group"
      aria-label={t('arena.loadoutOf', { name })}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}
    >
      <Typography
        variant="overline"
        component="p"
        sx={{ color: 'text.secondary', lineHeight: 1.6 }}
      >
        {t('arena.perks')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {Array.from({ length: MAX_PERKS }, (_, i) =>
          i <= perks.length ? slot('perk', i, perks, onPerks) : null,
        )}
      </Box>
      <Typography
        variant="overline"
        component="p"
        sx={{ color: 'text.secondary', lineHeight: 1.6 }}
      >
        {t('arena.items')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {Array.from({ length: MAX_ITEMS }, (_, i) =>
          i <= items.length ? slot('item', i, items, onItems) : null,
        )}
      </Box>
    </Box>
  );
};

export default LoadoutPicker;
