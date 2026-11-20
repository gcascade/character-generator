import {
  BookmarkAdded as SavedIcon,
  OpenInFull as OpenIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Link } from 'react-router';
import { label } from '../../../content/labels';
import { renderNpc } from '../../../content/npc';
import { useLocale, useT } from '../../../i18n';
import type { Npc } from '../../../types/npc';
import RaceEmblem from '../../character/raceEmblem/RaceEmblem';

type NpcCardProps = {
  npc: Npc;
  /** Makes this NPC the current one (batch). */
  onOpen?: VoidFunction;
  onSave?: VoidFunction;
  saved?: boolean;
  /** Page of the NPC (saved list): the name becomes a link. */
  to?: string;
};

/** A side character at a glance: name, occupation, race and quirk (spec 010). */
const NpcCard: FC<NpcCardProps> = ({ npc, onOpen, onSave, saved, to }) => {
  const t = useT();
  const { locale } = useLocale();
  const name = `${npc.firstName} ${npc.lastName}`;
  const { quirk } = renderNpc(npc, locale);

  return (
    <Card
      component="article"
      aria-label={name}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <RaceEmblem
        race={npc.race}
        occupation={npc.occupation}
        gender={npc.gender}
        height={140}
        width="100%"
      />
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography
          variant="h5"
          component="h3"
          sx={{ overflowWrap: 'anywhere' }}
        >
          {to ? (
            <Box
              component={Link}
              to={to}
              sx={{ color: 'inherit', textDecorationColor: 'currentColor' }}
            >
              {name}
            </Box>
          ) : (
            name
          )}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 1 }}>
          {label('occupation', npc.occupation, npc.gender, locale)} ·{' '}
          {label('race', npc.race, npc.gender, locale)}
        </Typography>
        <Typography variant="story" component="p" sx={{ fontStyle: 'italic' }}>
          {quirk}
        </Typography>
      </CardContent>
      {(onOpen || onSave) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1,
            px: 2,
            pb: 2,
          }}
        >
          {onOpen && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenIcon />}
              onClick={onOpen}
              aria-label={t('npc.openAria', { name })}
            >
              {t('npc.open')}
            </Button>
          )}
          {onSave && (
            <Button
              size="small"
              startIcon={saved ? <SavedIcon /> : <SaveIcon />}
              onClick={onSave}
              disabled={saved}
              aria-label={saved ? undefined : t('npc.saveAria', { name })}
            >
              {t(saved ? 'npc.saved' : 'npc.save')}
            </Button>
          )}
        </Box>
      )}
    </Card>
  );
};

export default NpcCard;
