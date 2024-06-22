import { Tooltip, Typography } from '@mui/material';
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
    <>
      <Tooltip title={race}>
        <div style={{ padding: '2px' }}>
          <RaceIcon characterRace={race} />
        </div>
      </Tooltip>
      <Tooltip title={characterClass}>
        <div style={{ padding: '2px' }}>
          <ClassIcon characterClass={characterClass} />
        </div>
      </Tooltip>
      <Typography variant="subtitle1" sx={{ paddingLeft: '2px', ...textStyle }}>
        {firstName} {lastName} ({age})
      </Typography>
    </>
  );
};

export default HistoryCharacterSummary;
