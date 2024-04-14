import { Box, List } from '@mui/material';
import hash from 'object-hash';
import React, { FC, useContext } from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import { Character } from '../../types/character';
import HistoryItem from './HistoryItem';
import SelectedHistoryItem from './SelectedHistoryItem';

type HistoryListProps = {
  history: Character[];
  removeFromHistory: (character: Character) => void;
};

const HistoryList: FC<HistoryListProps> = ({ history, removeFromHistory }) => {
  const characterContext = useContext(CharacterContext);

  if (!characterContext) {
    throw new Error('CharacterContext is not provided');
  }
  const { character: currentCharacter, setCharacter } = characterContext;

  if (history.length === 0) {
    return <></>;
  }

  const onCharacterClick = (character: Character) => {
    setCharacter(character);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <List
        sx={{
          width: '100%',
          position: 'relative',
          overflow: 'auto',
          maxHeight: 500,
          '& ul': { padding: 0 },
        }}
      >
        {history.map((character: Character) => {
          const isSelected = currentCharacter === character;
          const characterHash = hash(character);

          return isSelected ? (
            <SelectedHistoryItem
              key={characterHash}
              character={character}
              onDeleteClick={removeFromHistory}
            />
          ) : (
            <HistoryItem
              key={characterHash}
              character={character}
              onCharacterClick={onCharacterClick}
              onDeleteClick={removeFromHistory}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default HistoryList;
