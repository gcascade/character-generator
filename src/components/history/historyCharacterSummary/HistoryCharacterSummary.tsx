import { Box, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { CharacterClass, CharacterRace } from '../../../types/character';
import ClassIcon from '../../common/icons/class/ClassIcon';
import RaceIcon from '../../common/icons/race/RaceIcon';
import { useLocale } from '../../../i18n';
import { label } from '../../../content/labels';

type CharacterInfoProps = {
  race: CharacterRace;
  characterClass: CharacterClass;
  firstName: string;
  lastName: string;
  age: number;
  textStyle?: React.CSSProperties;
};

const HistoryCharacterSummary: React.FC<CharacterInfoProps> = ({
  race,
  characterClass,
  firstName,
  lastName,
  age,
  textStyle,
}) => {
  const { locale } = useLocale();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Tooltip title={label('race', race, 'Male', locale)}>
        <Box sx={{ padding: '2px' }}>
          <RaceIcon characterRace={race} />
        </Box>
      </Tooltip>
      <Tooltip title={label('class', characterClass, 'Male', locale)}>
        <Box sx={{ padding: '2px' }}>
          <ClassIcon characterClass={characterClass} />
        </Box>
      </Tooltip>
      <Typography
        variant="subtitle1"
        sx={{
          paddingLeft: 1,
          flexGrow: 1,
          minWidth: 0,
          overflowWrap: 'anywhere',
          ...textStyle,
        }}
      >
        {firstName} {lastName} ({age})
      </Typography>
    </Box>
  );
};

export default HistoryCharacterSummary;
