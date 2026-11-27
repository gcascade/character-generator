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
import { MAX_ITEMS } from '../../../content/arena';
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

/** A perk, a flaw and up to three items for a contestant (spec 012 FR-009, maintainer feedback). */
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

  const isFlaw = (perk: string) =>
    !!ARENA.perks.find((p) => p.id === perk)?.flaw;
  const strength = perks.find((p) => !isFlaw(p));
  const flaw = perks.find(isFlaw);
  // One list each: a perk and a flaw.
  const perkSlot = (kind: 'strength' | 'flaw') => {
    const value = (kind === 'flaw' ? flaw : strength) ?? '';
    const labelId = `${id}-${kind}`;
    const label = t(kind === 'flaw' ? 'arena.flaw' : 'arena.strength');
    const options = ARENA.perks
      .filter((p) => !!p.flaw === (kind === 'flaw'))
      .map((p) => ({ id: p.id, ...texts.perks[p.id] }));
    const update = (next: string) =>
      onPerks(
        [
          kind === 'flaw' ? strength : next,
          kind === 'flaw' ? next : flaw,
        ].filter((p): p is string => !!p),
      );
    return select(labelId, label, value, options, update);
  };

  const select = (
    labelId: string,
    label: string,
    value: string,
    options: { id: string; name: string; description: string }[],
    update: (next: string) => void,
  ) => {
    const description = options.find((o) => o.id === value)?.description;
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

  const slot = (
    kind: 'item',
    index: number,
    chosen: string[],
    onChange: (values: string[]) => void,
  ) => {
    const value = chosen[index] ?? '';
    const labelId = `${id}-${kind}-${index}`;
    const label = t('arena.item', { number: index + 1 });
    const options = ARENA.items.map((i) => ({
      id: i.id,
      name: texts.items[i.id].a,
      description: texts.items[i.id].description,
    }));
    const update = (next: string) => {
      const values = [...chosen];
      values[index] = next;
      onChange(values.filter(Boolean));
    };
    return select(labelId, label, value, options, update);
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
        {t('arena.perkAndFlaw')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {perkSlot('strength')}
        {perkSlot('flaw')}
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
