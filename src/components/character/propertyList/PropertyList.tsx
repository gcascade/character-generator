import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderCharacter } from '../../../content/character';
import { label } from '../../../content/labels';
import { capitalize } from '../../../content/renderText';
import { type MessageKey, useLocale, useT } from '../../../i18n';
import type { Character } from '../../../types/character';

type PropertyListProps = { character: Character };

/** Read-only grid of a character's properties (spec 006 R6). */
const PropertyList: FC<PropertyListProps> = ({ character }) => {
  const t = useT();
  const { locale } = useLocale();
  const { gender } = character;
  const rows: [MessageKey, string | number][] = [
    ['field.firstName', character.firstName],
    ['field.lastName', character.lastName],
    ['field.epithet', capitalize(renderCharacter(character, locale).epithet)],
    ['field.race', label('race', character.race, gender, locale)],
    ['field.class', label('class', character.characterClass, gender, locale)],
    ['field.gender', label('gender', gender, gender, locale)],
    ['field.age', character.age],
    [
      'field.alignment',
      label('alignment', character.alignment, gender, locale),
    ],
  ];

  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        columnGap: 2,
        rowGap: 1.25,
      }}
    >
      {rows.map(([key, value]) => (
        <Box key={key} sx={{ px: 1.25, minWidth: 0 }}>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {t(key)}
          </Typography>
          <Typography
            component="dd"
            sx={{
              m: 0,
              fontWeight: 500,
              fontSize: '1.05rem',
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default PropertyList;
