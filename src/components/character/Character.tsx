import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC, useContext } from 'react';
import { CharacterContext } from '../../contexts/CharacterContext';
import '../common/Common.css';
import { GenderIcon } from '../common/icons/GenderIcon';
import './Character.css';
import CharacterBackground from './CharacterBackground';
import CharacterImage from './CharacterImage';
import CharacterInformation from './CharacterInformation';

type CharacterProps = {
  onGenerate: VoidFunction;
};

const Character: FC<CharacterProps> = ({ onGenerate }) => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('Character must be used within a CharacterProvider');
  }
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    character: { firstName, lastName, gender, race, characterClass },
  } = context;

  return (
    <Card
      data-testid="character-card"
      className="paper-card"
      sx={{
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <span data-testid="character-name">{`${firstName} ${lastName}`}</span>
        }
        titleTypographyProps={{ align: 'center', variant: 'h4' }}
        subheader={
          <div className="character-subheader">
            {race} {characterClass}
            <GenderIcon gender={gender} />
          </div>
        }
        subheaderTypographyProps={{ align: 'center', variant: 'subtitle1' }}
      />
      <CardContent style={{ display: 'flex' }}>
        {!isMobile && <CharacterImage />}
        <div style={{ marginLeft: '20px', width: '70%' }}>
          <CharacterInformation />
          <CharacterBackground />
        </div>
      </CardContent>
      <CardActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            transition: 'background-color 0.5s, color 0.5s ease-in-out',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={onGenerate}
        >
          New Character
        </Button>
      </CardActions>
    </Card>
  );
};

export default Character;
