import {
  Container,
  Unstable_Grid2 as Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import React, { FC, useContext } from 'react';
import Character from '../../components/character/character/Character';
import HistoryCard from '../../components/history/historyCard/HistoryCard';
import { CharacterContext } from '../../contexts/CharacterContext';
import useCharacterHistory from '../../hooks/useCharacterHistory';

const Home: FC = () => {
  const { history, addToHistory } = useCharacterHistory();

  const characterContext = useContext(CharacterContext);
  const theme = useTheme();

  if (!characterContext) {
    throw new Error('Home must be used within a CharacterProvider');
  }

  const { character } = characterContext;

  const onGenerateCallback = () => {
    if (!history.includes(character)) {
      addToHistory([character]);
    }
  };

  return (
    <Container maxWidth={false}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography
          component="h1"
          variant="h5"
          align="center"
          sx={{ color: theme.palette.text.primary }}
        >
          Character Generator
        </Typography>
        <Grid
          container
          spacing={2}
          style={{ display: 'flex', alignItems: 'stretch' }}
        >
          <Grid xs={12} md={9} style={{ display: 'flex' }}>
            <Character onGenerateCallback={onGenerateCallback} />
          </Grid>
          <Grid xs={12} md={3} style={{ display: 'flex' }}>
            <HistoryCard />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
