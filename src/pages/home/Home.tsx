import { Container, Grid, Paper } from '@mui/material';
import React, { FC, useContext } from 'react';
import Character from '../../components/character/character/Character';
import PageTitle from '../../components/common/pageTitle/PageTitle';
import HistoryCard from '../../components/history/historyCard/HistoryCard';
import { CharacterContext } from '../../contexts/CharacterContext';
import useCharacterHistory from '../../hooks/useCharacterHistory';

const Home: FC = () => {
  const { history, addToHistory } = useCharacterHistory();

  const characterContext = useContext(CharacterContext);

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
    <Container maxWidth={false} disableGutters>
      <Paper elevation={3} sx={{ padding: { xs: 1.5, sm: 2.5 } }}>
        <PageTitle>Character Generator</PageTitle>
        <Grid
          container
          spacing={2}
          style={{ display: 'flex', alignItems: 'stretch' }}
        >
          <Grid size={{ xs: 12, lg: 8 }} style={{ display: 'flex' }}>
            <Character onGenerateCallback={onGenerateCallback} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} style={{ display: 'flex' }}>
            <HistoryCard />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
