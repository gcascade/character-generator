import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, ListItem } from '@mui/material';
import React, { FC } from 'react';
import { Character } from '../../types/character';
import './History.css';
import HistoryCharacterSummary from './HistoryCharacterSummary';

type SelectedHistoryItemProps = {
  character: Character;
  onDeleteClick: (character: Character) => void;
};

const SelectedHistoryItem: FC<SelectedHistoryItemProps> = ({
  character,
  onDeleteClick,
}) => {
  const { firstName, lastName, age, race, characterClass } = character;

  return (
    <ListItem
      className="history-container"
      key={`${firstName}-${lastName}-${age}-${race}-${characterClass}`}
      sx={{
        borderRadius: 1,
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <HistoryCharacterSummary
        {...character}
        textStyle={{ fontWeight: 'bold' }}
      />
      <IconButton
        onClick={(event) => {
          event.stopPropagation();
          onDeleteClick(character);
        }}
        edge="end"
        aria-label="delete"
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
};

export default SelectedHistoryItem;
