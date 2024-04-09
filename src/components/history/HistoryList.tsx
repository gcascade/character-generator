import { Box, List } from '@mui/material';
import React, { FC, useContext } from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import { Character } from '../../types/character';
import HistoryItem from './HistoryItem';
import SelectedHistoryItem from './SelectedHistoryItem';

type HistoryListProps = {
  history: Character[];
};

const HistoryList: FC<HistoryListProps> = ({ history }) => {
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

          return isSelected ? (
            <SelectedHistoryItem
              key={`${character.firstName}-${character.lastName}-${character.age}`}
              character={character}
            />
          ) : (
            <HistoryItem
              key={`${character.firstName}-${character.lastName}-${character.age}`}
              character={character}
              onCharacterClick={onCharacterClick}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default HistoryList;
