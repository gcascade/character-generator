import React, { useState } from 'react';
import { Button, Container, CssBaseline, Paper, Typography } from '@mui/material';
import Character from './Character';

const races = ['Human', 'Elf', 'Dwarf', 'Orc'];
const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric'];

const generateRandomCharacter = () => {
  const randomName = `Character${Math.floor(Math.random() * 1000)}`;
  const randomRace = races[Math.floor(Math.random() * races.length)];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const randomDescription = `A brave ${randomRace} ${randomClass} ready for adventure.`;

  return {
    name: randomName,
    race: randomRace,
    characterClass: randomClass,
    description: randomDescription,
  };
};

const CharacterGenerator = () => {
  const [character, setCharacter] = useState(generateRandomCharacter);

  const generateNewCharacter = () => {
    setCharacter(generateRandomCharacter());
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography component="h1" variant="h5" align="center">
          RPG Character Generator
        </Typography>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={generateNewCharacter}
          style={{ marginTop: '20px' }}
        >
          Generate Character
        </Button>
        <Character character={character} />
      </Paper>
    </Container>
  );
};

export default CharacterGenerator;