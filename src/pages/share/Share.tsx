import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import React, { FC, useContext, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import CharacterDetail from '../../components/character/characterDetail/CharacterDetail';
import PartyMemberCard from '../../components/party/partyMemberCard/PartyMemberCard';
import PartyStory from '../../components/party/partyStory/PartyStory';
import AdventureHook from '../../components/party/adventureHook/AdventureHook';
import PartyBalance from '../../components/party/partyBalance/PartyBalance';
import PartyTies from '../../components/party/partyTies/PartyTies';
import RoleMenu from '../../components/party/roleMenu/RoleMenu';
import NpcSheet from '../../components/npc/npcSheet/NpcSheet';
import useNpcs from '../../hooks/useNpcs';
import type { Npc } from '../../types/npc';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <PartyStory party={party} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 2.5,
          }}
        >
          <Card>
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
              <PartyTies party={party} />
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ px: { xs: 2, sm: 3 } }}>
              <PartyBalance party={party} />
            </CardContent>
          </Card>
        </Box>
        <AdventureHook party={party} />
      </Box>
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
            roleControl={
              <RoleMenu
                role={member.role}
                gender={member.character.gender}
                name={member.character.firstName}
              />
            }
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

/** Same side character, whatever its id. */
const sameNpc = (a: Npc, b: Npc) => {
  const strip = (npc: Npc) => {
    const copy = { ...npc };
    delete copy.id;
    delete copy.portraitId;
    return JSON.stringify(copy);
  };
  return strip(a) === strip(b);
};

const SharedNpc: FC<{ npc: Npc }> = ({ npc }) => {
  const t = useT();
  const navigate = useNavigate();
  const { savedNpcs, saveSharedNpc, setNpc } = useNpcs();
  const { addSuccess } = useAlert();
  const saved = savedNpcs.some((s) => sameNpc(s, npc));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Typography
        sx={{
          fontSize: '0.8rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1,
        }}
      >
        {t('share.sharedNpc')}
      </Typography>
      <NpcSheet
        npc={npc}
        headingLevel="h1"
        footer={
          <>
            <Button
              variant="contained"
              disabled={saved}
              onClick={() => {
                saveSharedNpc(npc);
                addSuccess(t('npc.savedAlert'));
              }}
            >
              {saved ? t('npc.saved') : t('npc.save')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setNpc(npc);
                navigate('/npcs');
              }}
            >
              {t('share.openNpc')}
            </Button>
          </>
        }
      />
    </Box>
  );
};

/** `/share#…`: a shared character, party or side character, read-only until the visitor acts (spec 007). */
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
      ) : shared.kind === 'party' ? (
        <SharedParty party={shared.party} />
      ) : (
        <SharedNpc npc={shared.npc} />
      )}
    </Box>
  );
};

export default Share;
