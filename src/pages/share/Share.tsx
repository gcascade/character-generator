import { Box, Button, Container, Typography } from '@mui/material';
import React, { FC, useContext, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import CharacterDetail from '../../components/character/characterDetail/CharacterDetail';
import PartyMemberCard from '../../components/party/partyMemberCard/PartyMemberCard';
import PartyStory from '../../components/party/partyStory/PartyStory';
import { parseShareHash, sameCharacter } from '../../content/share';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import { PartyContext } from '../../contexts/PartyContext';
import useAlert from '../../hooks/useAlert';
import useCharacterHistory from '../../hooks/useCharacterHistory';
import { useT } from '../../i18n';
import type { Character } from '../../types/character';
import type { Party } from '../../types/party';

const Invalid: FC = () => {
  const t = useT();
  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('share.invalid')}
      </Typography>
      <Typography gutterBottom>{t('share.invalidHint')}</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
        {t('share.toGenerator')}
      </Button>
    </Container>
  );
};

const SharedCharacter: FC<{ character: Character }> = ({ character }) => {
  const t = useT();
  const navigate = useNavigate();
  const data = useContext(DataContext)!;
  const current = useContext(CharacterContext)!;
  const { history, addToHistory } = useCharacterHistory();
  const { addSuccess } = useAlert();
  const saved = data.characters.some((c) => sameCharacter(c, character));

  return (
    <CharacterDetail
      character={character}
      eyebrow={t('share.sharedCharacter')}
      saved={saved}
      onSave={() => {
        data.saveCharacter(character);
        addSuccess(t('share.savedAlert'));
      }}
      onOpenInGenerator={() => {
        const previous = current.character;
        if (!history.includes(previous)) addToHistory([previous]);
        current.setCharacter(character);
        navigate('/');
      }}
    />
  );
};

const SharedParty: FC<{ party: Party }> = ({ party }) => {
  const t = useT();
  const navigate = useNavigate();
  const data = useContext(DataContext)!;
  const parties = useContext(PartyContext)!;
  const { addSuccess } = useAlert();
  const content = (p: Party) =>
    JSON.stringify(p.members.map((m) => m.character));
  const saved = parties.savedParties.some((p) => content(p) === content(party));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography
        sx={{
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1,
        }}
      >
        {t('share.sharedParty')}
      </Typography>
      <PartyStory party={party} />
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', my: 2.5 }}>
        <Button
          variant="contained"
          disabled={saved}
          onClick={() => {
            parties.saveSharedParty(party);
            addSuccess(t('party.savedAlert'));
          }}
        >
          {saved ? t('party.saved') : t('party.save')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            parties.setParty(party);
            navigate('/party');
          }}
        >
          {t('share.openParty')}
        </Button>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2.5,
        }}
      >
        {party.members.map((member) => (
          <PartyMemberCard
            key={member.id}
            member={member}
            onSave={
              data.characters.some((c) => sameCharacter(c, member.character))
                ? undefined
                : () => {
                    data.saveCharacter(member.character);
                    addSuccess(
                      t('party.memberSavedAlert', {
                        name: member.character.firstName,
                      }),
                    );
                  }
            }
          />
        ))}
      </Box>
    </Box>
  );
};

/** `/share#…`: a shared character or party, read-only until the visitor acts (spec 007). */
const Share: FC = () => {
  const { hash } = useLocation();
  // Decoded once per link: references to removed fragments are resolved at random.
  const shared = useMemo(() => parseShareHash(hash), [hash]);

  return (
    <Box sx={{ padding: { xs: 0.5, sm: 2 } }}>
      {!shared ? (
        <Invalid />
      ) : shared.kind === 'character' ? (
        <SharedCharacter character={shared.character} />
      ) : (
        <SharedParty party={shared.party} />
      )}
    </Box>
  );
};

export default Share;
