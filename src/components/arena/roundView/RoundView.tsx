import {
  Brightness2 as NightIcon,
  EmojiEvents as FinaleIcon,
  PersonOff as DefeatIcon,
  WbSunny as DayIcon,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import { renderEvent, renderRoundTitle } from '../../../content/arenaText';
import { useLocale, useT } from '../../../i18n';
import type { ArenaSetup, Round } from '../../../types/arena';

type RoundViewProps = {
  round: Round;
  setup: ArenaSetup;
  /** The last duels after the round limit. */
  finale?: boolean;
  /** Contestants still standing after this round. */
  standing: number;
};

/** One round of the match: its title and its events, told in the interface language. */
const RoundView: FC<RoundViewProps> = ({ round, setup, finale, standing }) => {
  const t = useT();
  const { locale } = useLocale();
  const title = renderRoundTitle(round, locale, finale);
  const Icon = finale
    ? FinaleIcon
    : round.phase === 'day'
      ? DayIcon
      : NightIcon;

  return (
    <Box component="section" aria-label={title}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Icon sx={{ color: 'text.secondary' }} />
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', ml: 'auto' }}
        >
          {t('arena.standing', { count: standing })}
        </Typography>
      </Box>
      <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
        {round.events.map((event, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              display: 'flex',
              gap: 1,
              py: 0.75,
              borderTop: index ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ width: 20, flexShrink: 0, pt: '2px' }}>
              {event.defeated.length > 0 && (
                <DefeatIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              )}
            </Box>
            <Typography variant="story" component="p" sx={{ m: 0 }}>
              {renderEvent(event, setup, locale)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RoundView;
