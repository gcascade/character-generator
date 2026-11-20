import { Box, Chip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderCharacter } from '../../../content/character';
import { label } from '../../../content/labels';
import { capitalize } from '../../../content/renderText';
import { classToken, raceToken } from '../../../themes/palette';
import { useLocale, useT } from '../../../i18n';
import type { Character } from '../../../types/character';

type CharacterHeaderProps = {
  character: Character;
  /** Smaller, centred version for saved-character cards. */
  compact?: boolean;
  /** Heading level of the name. */
  headingLevel?: 'h1' | 'h2' | 'h3';
};

/** Name, epithet and race / class / gender badges (spec 005 US2). */
const CharacterHeader: FC<CharacterHeaderProps> = ({
  character,
  compact = false,
  headingLevel = 'h2',
}) => {
  const { locale } = useLocale();
  const t = useT();
  const { firstName, lastName, race, characterClass, gender, age } = character;
  const epithet = capitalize(renderCharacter(character, locale).epithet);

  const badge = (text: string, color: string) => (
    <Chip
      size={compact ? 'small' : 'medium'}
      label={text}
      sx={{ bgcolor: color, color: 'badgeText.main' }}
    />
  );

  return (
    <Box sx={{ textAlign: compact ? 'center' : 'left', minWidth: 0 }}>
      <Typography
        variant={compact ? 'h5' : 'h3'}
        component={headingLevel}
        sx={{ overflowWrap: 'anywhere', lineHeight: 1.2 }}
      >
        {firstName} {lastName}
      </Typography>
      {epithet && (
        <Typography
          sx={{
            fontFamily: 'Alegreya, Georgia, serif',
            fontStyle: 'italic',
            fontSize: compact ? '1rem' : '1.25rem',
            color: 'text.secondary',
            mb: 1.5,
          }}
        >
          {epithet}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: compact ? 'center' : 'flex-start',
        }}
      >
        {badge(label('race', race, gender, locale), raceToken(race))}
        {badge(
          label('class', characterClass, gender, locale),
          classToken(characterClass),
        )}
        <Chip
          size={compact ? 'small' : 'medium'}
          variant="outlined"
          label={`${label('gender', gender, gender, locale)} · ${t('character.age', { age })}`}
          sx={{
            color: 'text.secondary',
            '& .MuiChip-label': { fontWeight: 500 },
          }}
        />
      </Box>
    </Box>
  );
};

export default CharacterHeader;
