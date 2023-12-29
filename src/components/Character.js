import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Character = ({ character }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{character.name}</Typography>
        <Typography variant="body1"><strong>Race:</strong> {character.race}</Typography>
        <Typography variant="body1"><strong>Class:</strong> {character.characterClass}</Typography>
        <Typography variant="body1"><strong>Description:</strong> {character.description}</Typography>
      </CardContent>
    </Card>
  );
};

export default Character;