import {
  Container,
  CssBaseline,
  Unstable_Grid2 as Grid,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { FC, useContext } from 'react';
import { CharacterContext } from '../contexts/CharacterContext';
import useCharacterHistory from '../hooks/useCharacterHistory';
import theme from '../themes/themes';
import Character from './character/Character';
import HistoryCard from './history/HistoryCard';

const CharacterGenerator: FC = () => {
  const { history, addToHistory } = useCharacterHistory();

  const characterContext = useContext(CharacterContext);

  if (!characterContext) {
    throw new Error(
      'CharacterGenerator must be used within a CharacterProvider',
    );
  }

  const { character } = characterContext;

  const onGenerateCallback = () => {
    if (!history.includes(character)) {
      addToHistory([character]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          backgroundColor: theme.palette.background.default,
          padding: '24px',
        }}
      >
        <CssBaseline />
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
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
    </ThemeProvider>
  );
};

export default CharacterGenerator;
