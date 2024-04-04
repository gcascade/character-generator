import {
  Container,
  CssBaseline,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import useCharacterGenerator from '../hooks/useCharacterGenerator';
import theme from '../themes/themes';
import Character from './Character';

const CharacterGenerator: FC = () => {
  const { generateNewCharacter } = useCharacterGenerator();

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="lg"
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
            RPG Character Generator
          </Typography>
          <Character onGenerate={generateNewCharacter} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default CharacterGenerator;