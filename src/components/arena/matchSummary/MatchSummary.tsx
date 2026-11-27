import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { FC } from 'react';
import type { MatchSummary as Summary } from '../../../content/arena';
import { renderEvent } from '../../../content/arenaText';
import { useLocale, useT } from '../../../i18n';
import type { ArenaSetup } from '../../../types/arena';
import CharacterImage from '../../character/characterImage/CharacterImage';

type MatchSummaryProps = { setup: ArenaSetup; summary: Summary };

/** The end of the match: winner, defeats per contestant and notable moments. */
const MatchSummary: FC<MatchSummaryProps> = ({ setup, summary }) => {
  const t = useT();
  const { locale } = useLocale();
  const contestant = (id: string) =>
    setup.contestants.find((c) => c.id === id)!;
  const nameOf = (id: string) => {
    const { firstName, lastName } = contestant(id).character;
    return `${firstName} ${lastName}`.trim();
  };
  const side = setup.sides.find(
    (s) => s.id === contestant(summary.winners[0]).sideId,
  );
  const team = summary.couple
    ? summary.winners.map(nameOf).join(' & ')
    : summary.shared
      ? t('arena.winnersShared')
      : side?.kind === 'team'
        ? side.name
        : undefined;
  const champion = contestant(summary.winners[0]).character;

  return (
    <Card component="section" aria-label={t('arena.summary')}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" component="h2">
          {t('arena.summary')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <CharacterImage
            race={champion.race}
            characterClass={champion.characterClass}
            gender={champion.gender}
            firstName={champion.firstName}
            lastName={champion.lastName}
            portraitId={champion.portraitId}
            age={champion.age}
            height={112}
            width={112}
            crop
          />
          <Box>
            <Typography
              variant="overline"
              component="p"
              sx={{ color: 'text.secondary' }}
            >
              <TrophyIcon
                fontSize="inherit"
                sx={{ mr: 0.5, verticalAlign: 'middle' }}
              />
              {summary.couple
                ? t('arena.winnerCouple')
                : summary.shared
                  ? t('arena.byDecree')
                  : team
                    ? t('arena.winnerTeam')
                    : t('arena.winner')}
            </Typography>
            <Typography variant="h5" component="p">
              {team ?? nameOf(summary.winners[0])}
            </Typography>
            {summary.decree && !summary.shared && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('arena.byDecree')}
              </Typography>
            )}
            {team && !summary.couple && (
              <Typography sx={{ color: 'text.secondary' }}>
                {summary.winners.map(nameOf).join(', ')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box>
          <Typography variant="h5" component="h3" sx={{ mb: 1 }}>
            {t('arena.moments')}
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 3 }}>
            {summary.moments.map((event, index) => (
              <Typography
                component="li"
                variant="story"
                key={index}
                sx={{ mb: 1 }}
              >
                {renderEvent(event, setup, locale)}
              </Typography>
            ))}
          </Box>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('arena.contestant')}</TableCell>
                <TableCell align="right">{t('arena.defeats')}</TableCell>
                <TableCell>{t('arena.fell')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{nameOf(row.id)}</TableCell>
                  <TableCell align="right">{row.defeats}</TableCell>
                  <TableCell>
                    {row.defeatedRound === undefined
                      ? t('arena.survived')
                      : t('arena.fellIn', { round: row.defeatedRound })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MatchSummary;
