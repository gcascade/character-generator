import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, ListItem } from '@mui/material';
import React, { FC } from 'react';
import { Character } from '../../types/character';
import './History.css';
import HistoryCharacterSummary from './HistoryCharacterSummary';

type HistoryItemProps = {
  character: Character;
  onCharacterClick: (character: Character) => void;
  onDeleteClick: (character: Character) => void;
};

const HistoryItem: FC<HistoryItemProps> = ({
  character,
  onCharacterClick,
  onDeleteClick,
}) => {
  const { firstName, lastName, age, race, characterClass } = character;

  return (
    <ListItem
      className="history-container"
      key={`${firstName}-${lastName}-${age}`}
      onClick={() => onCharacterClick(character)}
      sx={{
        borderRadius: 1,
        transition: 'background-color 0.3s',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
        },
      }}
    >
      <HistoryCharacterSummary
        {...character}
        textStyle={{ fontWeight: 'normal' }}
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

export default HistoryItem;
