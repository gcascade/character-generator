import {
  ArrowBack as BackIcon,
  Casino as AgainIcon,
  FastForward as SkipIcon,
  PlayArrow as StartIcon,
  Replay as ReplayIcon,
  SkipNext as NextIcon,
} from '@mui/icons-material';
import { Alert, Box, Button, Typography } from '@mui/material';
import React, { FC, useContext, useMemo } from 'react';
import ContestantCard from '../../components/arena/contestantCard/ContestantCard';
import RosterBuilder from '../../components/arena/rosterBuilder/RosterBuilder';
import MatchSummary from '../../components/arena/matchSummary/MatchSummary';
import RoundView from '../../components/arena/roundView/RoundView';
import {
  canStart,
  contestantSkills,
  simulate,
  summarize,
} from '../../content/arena';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import useArena from '../../hooks/useArena';
import useParty from '../../hooks/useParty';
import { useLocale, useT } from '../../i18n';
import type { ArenaSetup } from '../../types/arena';

const Roster: FC<{ setup: ArenaSetup; onRemove: (id: string) => void }> = ({
  setup,
  onRemove,
}) => {
  const t = useT();
  if (!setup.contestants.length) {
    return (
      <Typography sx={{ color: 'text.secondary' }}>
        {t('arena.empty')}
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {setup.sides.map((side) => (
        <Box
          component="section"
          key={side.id}
          aria-label={side.name ?? t('arena.solo')}
        >
          {side.kind === 'team' && (
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {t('arena.team')} · {side.name}
            </Typography>
          )}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            }}
          >
            {setup.contestants
              .filter((c) => c.sideId === side.id)
              .map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  contestant={contestant}
                  skills={contestantSkills(setup, contestant.id)}
                  onRemove={() => onRemove(contestant.id)}
                />
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const isFinale = (events: { eventId: string }[]) =>
  events.length > 0 &&
  events.every((e) => e.eventId.startsWith('event-finale'));

/** The match told round by round, up to the rounds the player has revealed. */
const MatchView: FC = () => {
  const t = useT();
  const arena = useArena();
  const { setup } = arena;
  const { contestants, sides, seed } = setup;
  const match = useMemo(
    () => simulate({ contestants, sides, seed, shownRounds: 0 }),
    [contestants, sides, seed],
  );
  const total = match.rounds.length;
  const shown = Math.min(setup.shownRounds, total);
  const finished = setup.shownRounds > total;
  const standingAfter = match.rounds.reduce<number[]>((list, round) => {
    const before = list.at(-1) ?? contestants.length;
    const fallen = round.events.reduce((n, e) => n + e.defeated.length, 0);
    return [...list, before - fallen];
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {match.rounds.slice(0, shown).map((round, index) => (
        <RoundView
          key={round.number}
          round={round}
          setup={setup}
          finale={isFinale(round.events)}
          standing={standingAfter[index]}
        />
      ))}
      {finished && (
        <MatchSummary setup={setup} summary={summarize(setup, match)} />
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {!finished && (
          <>
            <Button
              variant="contained"
              startIcon={<NextIcon />}
              onClick={() => arena.showRounds(setup.shownRounds + 1)}
            >
              {t('arena.nextRound')}
            </Button>
            <Button
              startIcon={<SkipIcon />}
              onClick={() => arena.showRounds(total + 1)}
            >
              {t('arena.skip')}
            </Button>
          </>
        )}
        {finished && (
          <>
            <Button
              variant="contained"
              startIcon={<ReplayIcon />}
              onClick={() => arena.showRounds(1)}
            >
              {t('arena.replay')}
            </Button>
            <Button startIcon={<AgainIcon />} onClick={arena.newDraw}>
              {t('arena.playAgain')}
            </Button>
          </>
        )}
        <Button startIcon={<BackIcon />} onClick={() => arena.showRounds(0)}>
          {t('arena.backToSetup')}
        </Button>
      </Box>
    </Box>
  );
};

/** The arena (spec 012): build a roster, then watch the match. */
const Arena: FC = () => {
  const t = useT();
  const { locale } = useLocale();
  const arena = useArena();
  const { setup } = arena;
  const current = useContext(CharacterContext)?.character;
  const saved = useContext(DataContext)?.characters ?? [];
  const { party, savedParties } = useParty();
  const start = canStart(setup);
  const watching = setup.shownRounds > 0 && start.ok;

  if (watching) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        <Typography variant="h3" component="h1">
          {t('arena.title')}
        </Typography>
        <MatchView />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Box>
        <Typography variant="h3" component="h1">
          {t('arena.title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {t('arena.intro')}
        </Typography>
      </Box>
      <RosterBuilder
        count={setup.contestants.length}
        current={current}
        saved={saved.filter((c) => c.id)}
        party={party}
        savedParties={savedParties}
        onAddCharacter={arena.addCharacter}
        onAddParty={(p) => arena.addParty(p, locale)}
        onAddRandom={arena.addRandom}
        onRandomLoadouts={arena.randomLoadouts}
        onClear={arena.clear}
      />
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<StartIcon />}
          disabled={!start.ok}
          onClick={() => arena.showRounds(1)}
        >
          {t('arena.start')}
        </Button>
        {!start.ok && setup.contestants.length > 0 && (
          <Alert severity="info" sx={{ flexGrow: 1 }}>
            {t('arena.tooFew')}
          </Alert>
        )}
      </Box>
      <Typography variant="h4" component="h2">
        {t('arena.roster')}
      </Typography>
      <Roster setup={setup} onRemove={arena.remove} />
    </Box>
  );
};

export default Arena;
