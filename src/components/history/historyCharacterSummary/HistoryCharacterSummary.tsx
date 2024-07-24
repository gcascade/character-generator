import { Box, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { CharacterClass, CharacterRace } from '../../../types/character';
import ClassIcon from '../../common/icons/class/ClassIcon';
import RaceIcon from '../../common/icons/race/RaceIcon';

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
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Tooltip title={race}>
        <Box sx={{ padding: '2px' }}>
          <RaceIcon characterRace={race} />
        </Box>
      </Tooltip>
      <Tooltip title={characterClass}>
        <Box sx={{ padding: '2px' }}>
          <ClassIcon characterClass={characterClass} />
        </Box>
      </Tooltip>
      <Typography
        variant="subtitle1"
        sx={{ paddingLeft: '2px', flexGrow: 1, ...textStyle }}
      >
        {firstName} {lastName} ({age})
      </Typography>
    </Box>
  );
};

export default HistoryCharacterSummary;
