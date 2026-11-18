import { DoubleArrow as DoubleArrowIcon } from '@mui/icons-material';
import { Save as SaveIcon } from '@mui/icons-material';
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
import React, { FC, useCallback, useContext } from 'react';
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
import { useLocale, useT } from '../../../i18n';
import { label } from '../../../content/labels';

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
  const { locale } = useLocale();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { character } = characterContext;
  const { firstName, lastName, gender, race, characterClass } = character;

  const { requestStatus, generateNewCharacter, translateCharacter, canUseAi } =
    useCharacterRequest();

  const { addError, addSuccess } = useAlert();

  const isSaved = characters.some((c) => c === character);

  const isActionButtonDisabled = requestStatus === 'loading';

  const onGenerateButtonClick = useCallback(() => {
    generateNewCharacter({ doneCallback: onGenerateCallback });
  }, [generateNewCharacter, onGenerateCallback]);

  const onSaveButtonClick = useCallback(() => {
    try {
      saveCharacter(character);
      addSuccess(t('character.savedAlert'));
    } catch {
      addError(t('character.saveFailed'));
    }
  }, [saveCharacter, character, addSuccess, addError, t]);

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
        subheader={
          <div className="character-subheader">
            {t('character.subtitle', {
              race:
                locale === 'fr'
                  ? label('race', race, gender, locale).toLowerCase()
                  : label('race', race, gender, locale),
              characterClass: label('class', characterClass, gender, locale),
            })}
            <GenderIcon gender={gender} />
          </div>
        }
        slotProps={{
          title: { align: 'center', variant: 'h4' },
          subheader: { align: 'center', variant: 'subtitle1' },
        }}
      />
      <CardContent sx={{ display: 'flex', px: { xs: 1, sm: 2 } }}>
        {!isMobile && (
          <CharacterImage
            gender={gender}
            race={race}
            characterClass={characterClass}
            height={512}
            width={'30%'}
          />
        )}
        <div
          style={
            isMobile ? { width: '100%' } : { marginLeft: '20px', width: '70%' }
          }
        >
          <CharacterInformation />
          <CharacterBackground
            onTranslate={canUseAi ? () => translateCharacter() : undefined}
            translating={requestStatus === 'loading'}
          />
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
            {t('character.generate')}
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
            {isSaved ? t('character.saved') : t('character.save')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};

export default Character;
