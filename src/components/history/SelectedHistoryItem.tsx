import { ListItem, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Character } from '../../types/character';
import ClassIcon from '../common/icons/ClassIcon';
import RaceIcon from '../common/icons/RaceIcon';
import './History.css';

type SelectedHistoryItemProps = {
  character: Character;
};

const SelectedHistoryItem: FC<SelectedHistoryItemProps> = ({ character }) => {
  const { firstName, lastName, age, race, characterClass } = character;

  return (
    <ListItem
      className="history-container"
      key={`${firstName}-${lastName}-${age}`}
      sx={{
        borderRadius: 1,
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <RaceIcon characterRace={race} />
      <ClassIcon characterClass={characterClass} />
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
        {firstName} {lastName} ({age})
      </Typography>
    </ListItem>
  );
};

export default SelectedHistoryItem;
