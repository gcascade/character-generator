import { Character } from '@Types/character';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import React, { FC } from 'react';
import '../Character.css';
import CharacterImage from '../characterImage/CharacterImage';

type CharacterSummaryProps = {
  character: Character;
  width?: number | string | undefined;
  height?: number | string | undefined;
};

const CharacterSummary: FC<CharacterSummaryProps> = ({
  character,
  width,
  height,
}) => {
  const {
    firstName,
    lastName,
    age,
    epithet,
    race,
    characterClass,
    gender,
    alignment,
  } = character;

  return (
    <Card sx={{ width: width, height: height }}>
      <CharacterImage height={256} width={'100%'} {...character} />
      <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          align="center"
        >{`${firstName} ${lastName}`}</Typography>
        <Typography variant="subtitle1" align="center">
          {epithet}
        </Typography>
        <Divider />
        <Typography variant="body2" align="left">
          <strong>Gender:</strong> {gender}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Age:</strong> {age}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Orc:</strong> {race}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Class:</strong> {characterClass}
        </Typography>
        <Typography variant="body2" align="left">
          <strong>Alignment:</strong> {alignment}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CharacterSummary;
