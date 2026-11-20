import { Casino as RerollIcon, Close as RemoveIcon } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderTie } from '../../../content/partyDepth';
import { useLocale, useT } from '../../../i18n';
import type { Party } from '../../../types/party';

type PartyTiesProps = {
  party: Party;
  onReroll?: (tieId: string) => void;
  onRemove?: (tieId: string) => void;
};

/** Ties between members (spec 008 US1); some parties have none. */
const PartyTies: FC<PartyTiesProps> = ({ party, onReroll, onRemove }) => {
  const t = useT();
  const { locale } = useLocale();
  const ties = party.ties ?? [];

  return (
    <Box component="section" aria-labelledby="party-ties-title">
      <Typography
        id="party-ties-title"
        variant="h5"
        component="h3"
        sx={{ mb: 1 }}
      >
        {t('party.ties')}
      </Typography>
      {ties.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          {t('party.noTies')}
        </Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {ties.map((tie) => (
            <Box
              component="li"
              key={tie.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
            >
              <Typography
                variant="story"
                component="p"
                sx={{ flexGrow: 1, fontSize: '1.05rem' }}
              >
                {renderTie(tie, party, locale)}
              </Typography>
              {onReroll && (
                <Tooltip title={t('party.tie.reroll')}>
                  <IconButton
                    size="small"
                    aria-label={t('party.tie.reroll')}
                    onClick={() => onReroll(tie.id)}
                  >
                    <RerollIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onRemove && (
                <Tooltip title={t('party.tie.remove')}>
                  <IconButton
                    size="small"
                    aria-label={t('party.tie.remove')}
                    onClick={() => onRemove(tie.id)}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PartyTies;
