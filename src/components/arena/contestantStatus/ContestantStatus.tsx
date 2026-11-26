import { Box, Chip, LinearProgress, Typography } from '@mui/material';
import React, { FC } from 'react';
import { ARENA_TEXTS } from '../../../content/data';
import { useLocale, useT } from '../../../i18n';
import type { ArenaSetup, FighterState } from '../../../types/arena';
import PortraitStack from '../portraitStack/PortraitStack';

type ContestantStatusProps = {
  setup: ArenaSetup;
  /** Everyone's state at the moment shown (end of the last revealed round). */
  state: Record<string, FighterState>;
  /** "After Night 2", "Before the start". */
  moment: string;
};

/**
 * Who is still standing, with hit points and gear, grouped by side as it is
 * now: teams, those who left them, alliances (maintainer feedback).
 */
const ContestantStatus: FC<ContestantStatusProps> = ({
  setup,
  state,
  moment,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const texts = ARENA_TEXTS[locale];
  const contestant = (id: string) =>
    setup.contestants.find((c) => c.id === id)!;
  const sideOf = (id: string) => setup.sides.find((s) => s.id === id);

  // Current sides, standing ones first.
  const ids = setup.contestants.map((c) => c.id);
  const sides = [...new Set(ids.map((id) => state[id].sideId))].sort(
    (a, b) =>
      Number(ids.some((id) => state[id].sideId === b && state[id].standing)) -
      Number(ids.some((id) => state[id].sideId === a && state[id].standing)),
  );
  const nameOfAlliance = (allianceId: string, self: string) =>
    ids
      .filter(
        (id) =>
          id !== self &&
          state[id].allianceId === allianceId &&
          state[id].standing,
      )
      .map((id) => contestant(id).character.firstName)
      .join(', ');

  return (
    <Box component="section" aria-label={t('arena.status')}>
      <Typography variant="h5" component="h2">
        {t('arena.status')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
        {moment}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {sides.map((sideId) => {
          const members = ids
            .filter((id) => state[id].sideId === sideId)
            .sort(
              (a, b) => Number(state[b].standing) - Number(state[a].standing),
            );
          const team = sideOf(sideId);
          return (
            <Box key={sideId}>
              {team?.kind === 'team' && (
                <Typography
                  variant="overline"
                  component="h3"
                  sx={{ lineHeight: 1.6 }}
                >
                  {team.name}
                </Typography>
              )}
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {members.map((id) => {
                  const now = state[id];
                  const { character } = contestant(id);
                  const original = sideOf(contestant(id).sideId);
                  const left =
                    original?.kind === 'team' && now.sideId !== original.id;
                  const allies =
                    now.allianceId && nameOfAlliance(now.allianceId, id);
                  return (
                    <Box
                      component="li"
                      key={id}
                      aria-label={character.firstName}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        py: 0.5,
                        opacity: now.standing ? 1 : 0.6,
                      }}
                    >
                      <PortraitStack
                        characters={[character]}
                        size={36}
                        faded={[!now.standing]}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'baseline',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                            noWrap
                          >
                            {character.firstName} {character.lastName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              ml: 'auto',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {now.standing
                              ? `${t('arena.hp')} ${now.hp}/${now.maxHp}`
                              : t('arena.fell')}
                          </Typography>
                        </Box>
                        {now.standing && (
                          <LinearProgress
                            variant="determinate"
                            value={(100 * now.hp) / now.maxHp}
                            aria-hidden
                            sx={{ height: 4, borderRadius: 2, my: 0.25 }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          component="p"
                          sx={{ color: 'text.secondary' }}
                        >
                          {now.items.length
                            ? now.items.map((i) => texts.items[i]?.a).join(', ')
                            : t('arena.noItems')}
                        </Typography>
                        {(left || allies || now.defeats > 0) && (
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 0.5,
                              mt: 0.25,
                            }}
                          >
                            {left && (
                              <Chip
                                size="small"
                                label={t('arena.leftTeam', {
                                  team: original.name ?? '',
                                })}
                              />
                            )}
                            {allies && (
                              <Chip
                                size="small"
                                label={t('arena.alliance', { names: allies })}
                              />
                            )}
                            {now.defeats > 0 && (
                              <Chip
                                size="small"
                                label={t('arena.defeatsCount', {
                                  count: now.defeats,
                                })}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ContestantStatus;
