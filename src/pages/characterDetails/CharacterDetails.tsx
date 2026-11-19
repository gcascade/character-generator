import { Box, Container, Link as MuiLink, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import CharacterDetail from '../../components/character/characterDetail/CharacterDetail';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import useAlert from '../../hooks/useAlert';
import useCharacterHistory from '../../hooks/useCharacterHistory';
import useCharacterRequest from '../../hooks/useCharacterRequest';
import { useT } from '../../i18n';

/** A saved character on its own page, `/characters/:id` (spec 006). */
const CharacterDetails: FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const data = useContext(DataContext);
  const current = useContext(CharacterContext);
  const { history, addToHistory } = useCharacterHistory();
  const { addSuccess } = useAlert();
  const { canUseAi, translateOther, requestStatus } = useCharacterRequest();

  if (!data || !current) {
    throw new Error(
      'CharacterDetails must be used within a DataProvider and a CharacterProvider',
    );
  }

  const character = data.findCharacter(id);

  // Back to the list where the user was (its page is in the history entry), or to the list itself.
  const back = () =>
    (location.state as { fromList?: boolean } | null)?.fromList
      ? navigate(-1)
      : navigate('/characters');

  if (!character) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t('details.notFound')}
        </Typography>
        <Typography gutterBottom>{t('details.notFoundHint')}</Typography>
        <MuiLink component={Link} to="/characters">
          {t('details.back')}
        </MuiLink>
      </Container>
    );
  }

  const openInGenerator = () => {
    const previous = current.character;
    if (!history.includes(previous)) addToHistory([previous]);
    current.setCharacter(character);
    navigate('/');
  };

  const remove = () => {
    data.removeCharacter(character.id!);
    addSuccess(t('details.deleted'));
    back();
  };

  return (
    <Box sx={{ padding: { xs: 0.5, sm: 2 } }}>
      <CharacterDetail
        character={character}
        onBack={back}
        onOpenInGenerator={openInGenerator}
        onDelete={remove}
        onTranslate={
          canUseAi
            ? () => translateOther(character, data.updateCharacter)
            : undefined
        }
        translating={requestStatus === 'loading'}
      />
    </Box>
  );
};

export default CharacterDetails;
