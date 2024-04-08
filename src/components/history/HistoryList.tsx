import { Box, List, ListItem, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Character } from '../../types/character';
import ClassIcon from '../common/icons/ClassIcon';
import RaceIcon from '../common/icons/RaceIcon';

type HistoryListProps = {
  history: Character[];
};

const HistoryList: FC<HistoryListProps> = ({ history }) => {
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
          const { firstName, lastName, age, race, characterClass } = character;
          return (
            <ListItem
              className="history-container"
              key={`${firstName}-${lastName}-${age}`}
            >
              <RaceIcon characterRace={race} />
              <ClassIcon characterClass={characterClass} />
              <Typography variant="body1">
                {firstName} {lastName} ({age})
              </Typography>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default HistoryList;
