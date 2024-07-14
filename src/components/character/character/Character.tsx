import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { CharacterContext } from '../../../contexts/CharacterContext';
import { DataContext } from '../../../contexts/DataContext';
import useAlert from '../../../hooks/useAlert';
import useCharacterRequest from '../../../hooks/useCharacterRequest';
import '../../common/Common.css';
import { GenderIcon } from '../../common/icons/gender/GenderIcon';
import '../Character.css';
import CharacterBackground from '../characterBackground/CharacterBackground';
import CharacterImage from '../characterImage/CharacterImage';
import CharacterInformation from '../characterInformation/CharacterInformation';

type CharacterProps = {
  onGenerateCallback: VoidFunction;
};

const Character: FC<CharacterProps> = ({ onGenerateCallback }) => {
  const characterContext = useContext(CharacterContext);

  const dataContext = useContext(DataContext);

  if (!dataContext) {
    throw new Error('Character must be used within a DataProvider');
  }

  if (!characterContext) {
    throw new Error('Character must be used within a CharacterProvider');
  }
  const { saveCharacter, characters } = dataContext;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isActionButtonDisabled, setIsActionButtonDisabled] = useState(false);
  const { character } = characterContext;
  const { firstName, lastName, gender, race, characterClass } = character;

  const { requestStatus, generateNewCharacter } = useCharacterRequest();

  const { addError, addSuccess } = useAlert();

  const isSaved = characters.some((c) => c === character);

  useEffect(() => {
    setIsActionButtonDisabled(requestStatus === 'loading');
  }, [requestStatus]);

  const onGenerateButtonClick = useCallback(() => {
    generateNewCharacter({
      doneCallback: onGenerateCallback,
      onSuccess: () => addSuccess('New character generated'),
      onError: addError,
    });
  }, [generateNewCharacter, onGenerateCallback, addSuccess, addError]);

  const onSaveButtonClick = useCallback(() => {
    try {
      saveCharacter(character);
      addSuccess('Character saved');
    } catch (error) {
      addError('Failed to save character');
    }
  }, [saveCharacter, character, addSuccess, addError]);

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
        {!isMobile && (
          <CharacterImage
            gender={gender}
            race={race}
            characterClass={characterClass}
            height={512}
            width={'30%'}
          />
        )}
        <div style={{ marginLeft: '20px', width: '70%' }}>
          <CharacterInformation />
          <CharacterBackground />
        </div>
      </CardContent>
      <CardActions>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: '100%',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoubleArrowIcon />}
            sx={{
              flex: 1,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.common.white,
            }}
            onClick={onGenerateButtonClick}
            disabled={isActionButtonDisabled}
          >
            Generate
          </Button>
          <Button
            variant="outlined"
            color={isSaved ? 'success' : 'secondary'}
            startIcon={<SaveIcon />}
            sx={{
              flex: 1,
            }}
            onClick={onSaveButtonClick}
            disabled={isSaved || isActionButtonDisabled}
          >
            {isSaved ? 'Saved' : 'Save Character'}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default Character;
