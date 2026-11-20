import { Box, LinearProgress, Typography } from '@mui/material';
import React, { FC } from 'react';
import { BALANCE_AREAS, balanceOf, gaps } from '../../../content/partyDepth';
import { useT } from '../../../i18n';
import type { Party } from '../../../types/party';

/** What the party covers, area by area, with hints for gaps (spec 008 US3). */
const PartyBalance: FC<{ party: Pick<Party, 'members'> }> = ({ party }) => {
  const t = useT();
  const balance = balanceOf(party);
  const missing = gaps(party);

  return (
    <Box component="section" aria-labelledby="party-balance-title">
      <Typography
        id="party-balance-title"
        variant="h5"
        component="h3"
        sx={{ mb: 1 }}
      >
        {t('party.balance')}
      </Typography>
      <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1 }}>
        {BALANCE_AREAS.map((area) => (
          <Box
            key={area}
            sx={{
              display: 'grid',
              gridTemplateColumns: '7rem 1fr 4.5rem',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography component="dt" sx={{ fontWeight: 500 }}>
              {t(`balance.${area}`)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(balance[area] / 3) * 100}
              color="secondary"
              aria-hidden
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography component="dd" sx={{ m: 0, color: 'text.secondary' }}>
              {t(`balance.level.${balance[area]}`)}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box component="ul" sx={{ mt: 1.5, mb: 0, pl: 2.5 }}>
        {missing.length === 0 ? (
          <Typography component="li">{t('balance.ok')}</Typography>
        ) : (
          missing.map((area) => (
            <Typography component="li" key={area}>
              {t(`balance.gap.${area}`)}
            </Typography>
          ))
        )}
      </Box>
    </Box>
  );
};

export default PartyBalance;
