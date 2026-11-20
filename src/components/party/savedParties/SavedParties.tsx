import {
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@mui/material';
import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { label } from '../../../content/labels';
import { renderParty } from '../../../content/party';
import { classToken, raceToken } from '../../../themes/palette';
import useAlert from '../../../hooks/useAlert';
import useParty from '../../../hooks/useParty';
import { useLocale, useT } from '../../../i18n';
import type { Party } from '../../../types/party';
import ShareButton from '../../common/share/ShareButton';
import { shareUrl } from '../../../content/share';

const SavedPartyCard: FC<{ party: Party }> = ({ party }) => {
  const t = useT();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { openParty, deleteParty } = useParty();
  const { addSuccess } = useAlert();
  const [confirm, setConfirm] = useState(false);
  const { name } = renderParty(party, locale);

  return (
    <Card
      component="article"
      aria-label={name}
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h4"
          component="h3"
          sx={{ color: 'primary.main', mb: 1.5 }}
        >
          {name}
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
          {party.members.map(({ id, character }) => (
            <Box component="li" key={id} sx={{ py: 0.25 }}>
              <strong>
                {character.firstName} {character.lastName}
              </strong>{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                ·{' '}
                <Box component="span" sx={{ color: raceToken(character.race) }}>
                  {label('race', character.race, character.gender, locale)}
                </Box>{' '}
                <Box
                  component="span"
                  sx={{ color: classToken(character.characterClass) }}
                >
                  {label(
                    'class',
                    character.characterClass,
                    character.gender,
                    locale,
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<OpenIcon />}
          onClick={() => {
            openParty(party.id);
            navigate('/party');
          }}
        >
          {t('parties.open')}
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onBlur={() => setConfirm(false)}
          onClick={() => {
            if (confirm) {
              deleteParty(party.id);
              addSuccess(t('parties.deleted'));
            } else {
              setConfirm(true);
            }
          }}
        >
          {confirm ? t('parties.confirmDelete') : t('parties.delete')}
        </Button>
        <ShareButton
          variant="icon"
          label={t('share.party')}
          target={() => ({
            title: name,
            url: shareUrl({ kind: 'party', party }),
            copied: 'share.partyCopied',
          })}
        />
      </CardActions>
    </Card>
  );
};

/** The "Parties" tab of My characters (spec 004 US3). */
const SavedParties: FC = () => {
  const t = useT();
  const { savedParties } = useParty();

  if (!savedParties.length) {
    return (
      <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        {t('parties.empty')}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2.5,
        mt: 3,
      }}
    >
      {savedParties.map((party) => (
        <SavedPartyCard key={party.id} party={party} />
      ))}
    </Box>
  );
};

export default SavedParties;
