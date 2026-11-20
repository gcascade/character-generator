import { Box } from '@mui/material';
import React, { FC } from 'react';
import { label } from '../../../content/labels';
import { useLocale, useT } from '../../../i18n';
import { classToken, raceToken } from '../../../themes/palette';
import type {
  CharacterClass,
  CharacterRace,
  Gender,
} from '../../../types/character';
import RaceIcon from '../../common/icons/race/RaceIcon';

type RaceEmblemProps = {
  race: CharacterRace;
  characterClass: CharacterClass;
  gender?: Gender;
  height: string | number;
  width: string | number;
};

/**
 * Neutral portrait shown while no image exists for a race and class (spec 009):
 * a shield in the class colour carrying the race symbol.
 */
const RaceEmblem: FC<RaceEmblemProps> = ({
  race,
  characterClass,
  gender = 'Male',
  height,
  width,
}) => {
  const t = useT();
  const { locale } = useLocale();

  return (
    <Box
      role="img"
      aria-label={t('character.emblem', {
        race: label('race', race, gender, locale),
        characterClass: label('class', characterClass, gender, locale),
      })}
      className="character-portrait"
      data-testid="race-emblem"
      sx={{
        height,
        width,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        backgroundImage: `url(${import.meta.env.BASE_URL}images/beige-paper.png)`,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 120"
        aria-hidden
        sx={{
          height: '78%',
          maxWidth: '85%',
          color: classToken(characterClass),
        }}
      >
        <path
          d="M50 5 L92 19 V58 C92 87 73 105 50 115 C27 105 8 87 8 58 V19 Z"
          fill="currentColor"
          fillOpacity={0.08}
          stroke="currentColor"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        <path
          d="M50 14 L84 25 V58 C84 81 69 96 50 105 C31 96 16 81 16 58 V25 Z"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.5}
          strokeWidth={1.5}
        />
      </Box>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: raceToken(race),
          '& svg': { fontSize: 'min(30cqh, 30cqw, 96px)' },
          containerType: 'size',
        }}
      >
        <RaceIcon characterRace={race} />
      </Box>
    </Box>
  );
};

export default RaceEmblem;
