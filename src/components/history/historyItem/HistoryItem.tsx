import { Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton, ListItem } from '@mui/material';
import React, { FC } from 'react';
import { Character } from '../../../types/character';
import '../History.css';
import HistoryCharacterSummary from '../historyCharacterSummary/HistoryCharacterSummary';
import { useT } from '../../../i18n';

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
  const t = useT();
  const { firstName, lastName, age, race, characterClass } = character;

  return (
    <ListItem
      className="history-container"
      key={`${firstName}-${lastName}-${age}-${race}-${characterClass}`}
      onClick={() => onCharacterClick(character)}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        aria-label={t('history.delete')}
        sx={{
          flexShrink: 0,
        }}
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
};

export default HistoryItem;
