import { DoubleArrow as DoubleArrowIcon } from '@mui/icons-material';
import { Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { FC, useCallback, useContext } from 'react';
import { CharacterContext } from '../../../contexts/CharacterContext';
import { DataContext } from '../../../contexts/DataContext';
import useAlert from '../../../hooks/useAlert';
import useCharacterRequest from '../../../hooks/useCharacterRequest';
import '../../common/Common.css';
import '../Character.css';
import CharacterBackground from '../characterBackground/CharacterBackground';
import CharacterImage from '../characterImage/CharacterImage';
import CharacterInformation from '../characterInformation/CharacterInformation';
import { useT } from '../../../i18n';
import CharacterHeader from '../characterHeader/CharacterHeader';

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
  const t = useT();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { character, setCharacter } = characterContext;
  const { gender, race, characterClass } = character;

  const { requestStatus, generateNewCharacter, translateCharacter, canUseAi } =
    useCharacterRequest();

  const { addError, addSuccess } = useAlert();

  // The current character becomes the saved copy, so they share an id (spec 006 R2).
  const isSaved =
    character.id !== undefined && characters.some((c) => c.id === character.id);

  const isActionButtonDisabled = requestStatus === 'loading';

  const onGenerateButtonClick = useCallback(() => {
    generateNewCharacter({ doneCallback: onGenerateCallback });
  }, [generateNewCharacter, onGenerateCallback]);

  const onSaveButtonClick = useCallback(() => {
    try {
      setCharacter(saveCharacter(character));
      addSuccess(t('character.savedAlert'));
    } catch {
      addError(t('character.saveFailed'));
    }
  }, [saveCharacter, setCharacter, character, addSuccess, addError, t]);

  return (
    <Card
      data-testid="character-card"
      className="paper-card"
      sx={{ width: '100%' }}
    >
      <CardContent
        sx={{ px: { xs: 1.5, sm: 3 }, pt: { xs: 1.5, sm: 2.5 }, pb: 1 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: '200px minmax(0, 1fr)',
            },
            gap: { xs: 2, sm: 3 },
            alignItems: 'start',
          }}
        >
          <CharacterImage
            gender={gender}
            race={race}
            characterClass={characterClass}
            height={isMobile ? 180 : 290}
            width="100%"
            crop
          />
          <Box sx={{ minWidth: 0 }}>
            <Box data-testid="character-name" sx={{ mb: 1 }}>
              <CharacterHeader character={character} />
            </Box>
            <CharacterInformation />
          </Box>
        </Box>
        <CharacterBackground
          onTranslate={canUseAi ? () => translateCharacter() : undefined}
          translating={requestStatus === 'loading'}
        />
      </CardContent>
      <CardActions sx={{ px: { xs: 1.5, sm: 3 }, pb: { xs: 1.5, sm: 2.5 } }}>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          sx={{
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoubleArrowIcon />}
            sx={{
              flex: '1 1 auto',
              boxShadow: '0 3px 0 rgba(0, 0, 0, 0.25)',
            }}
            onClick={onGenerateButtonClick}
            disabled={isActionButtonDisabled}
          >
            {t('character.generate')}
          </Button>
          <Button
            variant="outlined"
            color={isSaved ? 'success' : 'primary'}
            startIcon={<SaveIcon />}
            sx={{
              flex: '1 1 auto',
            }}
            onClick={onSaveButtonClick}
            disabled={isSaved || isActionButtonDisabled}
          >
            {isSaved ? t('character.saved') : t('character.save')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default Character;
