import {
  ArrowBack as BackIcon,
  Casino as AgainIcon,
  ExpandMore as ExpandIcon,
  FastForward as SkipIcon,
  PlayArrow as StartIcon,
  Replay as ReplayIcon,
  Share as ShareIcon,
  SkipNext as NextIcon,
  SystemUpdateAlt as UseIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ShareDialog from '../../components/common/share/ShareDialog';
import ContestantCard from '../../components/arena/contestantCard/ContestantCard';
import LoadoutPicker from '../../components/arena/loadoutPicker/LoadoutPicker';
import RosterBuilder from '../../components/arena/rosterBuilder/RosterBuilder';
import ContestantStatus from '../../components/arena/contestantStatus/ContestantStatus';
import MatchSummary from '../../components/arena/matchSummary/MatchSummary';
import RoundView from '../../components/arena/roundView/RoundView';
import {
  canStart,
  contestantSkills,
  simulate,
  summarize,
} from '../../content/arena';
import { renderRoundTitle } from '../../content/arenaText';
import { ARENA_PREFIX, arenaUrl, decodeArena } from '../../content/share';
import { CharacterContext } from '../../contexts/CharacterContext';
import { DataContext } from '../../contexts/DataContext';
import useArena from '../../hooks/useArena';
import useParty from '../../hooks/useParty';
import useShare from '../../hooks/useShare';
import { useLocale, useT } from '../../i18n';
import type { ArenaSetup } from '../../types/arena';

const Roster: FC<{ setup: ArenaSetup }> = ({ setup }) => {
  const t = useT();
  const arena = useArena();
  if (!setup.contestants.length) {
    return (
      <Typography sx={{ color: 'text.secondary' }}>
        {t('arena.empty')}
      </Typography>
    );
  }
  const grid = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
  };
  const card = (contestant: ArenaSetup['contestants'][number]) => (
    <ContestantCard
      key={contestant.id}
      contestant={contestant}
      skills={contestantSkills(setup, contestant.id)}
      onRemove={() => arena.remove(contestant.id)}
    >
      <LoadoutPicker
        id={contestant.id}
        name={contestant.character.firstName}
        perks={contestant.perks}
        items={contestant.items}
        onPerks={(perks) => arena.setPerks(contestant.id, perks)}
        onItems={(items) => arena.setItems(contestant.id, items)}
      />
    </ContestantCard>
  );
  const teams = setup.sides.filter((side) => side.kind === 'team');
  const solos = setup.contestants.filter(
    (c) => setup.sides.find((side) => side.id === c.sideId)?.kind !== 'team',
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {teams.map((side) => (
        <Box component="section" key={side.id} aria-label={side.name}>
          <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
            {t('arena.team')} · {side.name}
          </Typography>
          <Box sx={grid}>
            {setup.contestants.filter((c) => c.sideId === side.id).map(card)}
          </Box>
        </Box>
      ))}
      {solos.length > 0 && (
        <Box component="section" aria-label={t('arena.solo')}>
          {teams.length > 0 && (
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {t('arena.solo')}
            </Typography>
          )}
          <Box sx={grid}>{solos.map(card)}</Box>
        </Box>
      )}
    </Box>
  );
};

const isFinale = (events: { eventId: string }[]) =>
  events.length > 0 &&
  events.every((e) => e.eventId.startsWith('event-finale'));

type MatchViewProps = {
  setup: ArenaSetup;
  /** Rounds revealed; more than the match has shows the summary. */
  shownRounds: number;
  onShow: (rounds: number) => void;
  /** A new draw with the same roster (own matches only). */
  onPlayAgain?: VoidFunction;
  onBack?: VoidFunction;
  /** Takes a shared roster as one's own. */
  onUseRoster?: VoidFunction;
};

/** The match told round by round, up to the rounds the player has revealed. */
const MatchView: FC<MatchViewProps> = ({
  setup,
  shownRounds,
  onShow,
  onPlayAgain,
  onBack,
  onUseRoster,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const [showRolls, setShowRolls] = useState(true);
  const { share, fallbackUrl, closeFallback } = useShare();
  const { contestants, sides, seed } = setup;
  const match = useMemo(
    () => simulate({ contestants, sides, seed, shownRounds: 0 }),
    [contestants, sides, seed],
  );
  const total = match.rounds.length;
  const shown = Math.min(shownRounds, total);
  const finished = shownRounds > total;
  const standingAfter = match.rounds.reduce<number[]>((list, round) => {
    const before = list.at(-1) ?? contestants.length;
    const fallen = round.events.reduce((n, e) => n + e.defeated.length, 0);
    return [...list, before - fallen];
  }, []);
  const onShare = async () =>
    share({
      title: t('arena.title'),
      url: await arenaUrl(setup),
      copied: 'arena.shared',
    });

  const lastShown = match.rounds[shown - 1];
  const status = lastShown && (
    <ContestantStatus
      setup={setup}
      state={lastShown.after}
      moment={t('arena.statusAfter', {
        round: renderRoundTitle(lastShown, locale, isFinale(lastShown.events)),
      })}
    />
  );

  const story = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
      <FormControlLabel
        control={
          <Switch
            checked={showRolls}
            onChange={(_, value) => setShowRolls(value)}
          />
        }
        label={t('arena.showRolls')}
      />
      {match.rounds.slice(0, shown).map((round, index) => (
        <RoundView
          key={round.number}
          round={round}
          setup={setup}
          finale={isFinale(round.events)}
          standing={standingAfter[index]}
          showRolls={showRolls}
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
              onClick={() => onShow(shownRounds + 1)}
            >
              {t('arena.nextRound')}
            </Button>
            <Button startIcon={<SkipIcon />} onClick={() => onShow(total + 1)}>
              {t('arena.skip')}
            </Button>
          </>
        )}
        {finished && (
          <Button
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={() => onShow(1)}
          >
            {t('arena.replay')}
          </Button>
        )}
        {finished && onPlayAgain && (
          <Button startIcon={<AgainIcon />} onClick={onPlayAgain}>
            {t('arena.playAgain')}
          </Button>
        )}
        <Button startIcon={<ShareIcon />} onClick={() => void onShare()}>
          {t('arena.share')}
        </Button>
        {onUseRoster && (
          <Button startIcon={<UseIcon />} onClick={onUseRoster}>
            {t('arena.useRoster')}
          </Button>
        )}
        {onBack && (
          <Button startIcon={<BackIcon />} onClick={onBack}>
            {t('arena.backToSetup')}
          </Button>
        )}
      </Box>
      <ShareDialog url={fallbackUrl} onClose={closeFallback} />
    </Box>
  );

  if (!wide) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {status && (
          <Accordion disableGutters>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              {t('arena.status')}
            </AccordionSummary>
            <AccordionDetails>{status}</AccordionDetails>
          </Accordion>
        )}
        {story}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 4,
        alignItems: 'start',
      }}
    >
      {story}
      <Box
        sx={{
          position: 'sticky',
          top: 16,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          pr: 1,
        }}
      >
        {status}
      </Box>
    </Box>
  );
};

type Shared = 'loading' | 'unreadable' | ArenaSetup | undefined;

/** A match opened from an `#a1.` link (spec 012 US5): read-only, with its own progress. */
const SharedMatch: FC<{ shared: ArenaSetup }> = ({ shared }) => {
  const t = useT();
  const arena = useArena();
  const navigate = useNavigate();
  const [shownRounds, setShownRounds] = useState(1);
  return (
    <MatchView
      setup={shared}
      shownRounds={shownRounds}
      onShow={setShownRounds}
      onUseRoster={() => {
        if (!window.confirm(t('arena.useRosterConfirm'))) return;
        arena.replace({ ...shared, shownRounds: 0 });
        void navigate('/arena', { replace: true });
      }}
    />
  );
};

const useSharedMatch = (): Shared => {
  const { hash } = useLocation();
  const data = hash.startsWith(`#${ARENA_PREFIX}`)
    ? hash.slice(ARENA_PREFIX.length + 1)
    : undefined;
  const [result, setResult] = useState<{ data: string; setup: Shared }>();
  useEffect(() => {
    if (!data) return;
    let active = true;
    void decodeArena(data).then((setup) => {
      if (active) setResult({ data, setup: setup ?? 'unreadable' });
    });
    return () => {
      active = false;
    };
  }, [data]);
  if (!data) return undefined;
  return result?.data === data ? result.setup : 'loading';
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
  const shared = useSharedMatch();

  if (shared) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 1240,
          mx: 'auto',
        }}
      >
        <Typography variant="h3" component="h1">
          {t('arena.sharedTitle')}
        </Typography>
        {shared === 'loading' && (
          <CircularProgress aria-label={t('arena.sharedTitle')} />
        )}
        {shared === 'unreadable' && (
          <Alert severity="error">{t('arena.unreadable')}</Alert>
        )}
        {typeof shared === 'object' && <SharedMatch shared={shared} />}
      </Box>
    );
  }

  if (watching) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 1240,
          mx: 'auto',
        }}
      >
        <Typography variant="h3" component="h1">
          {t('arena.title')}
        </Typography>
        <MatchView
          setup={setup}
          shownRounds={setup.shownRounds}
          onShow={arena.showRounds}
          onPlayAgain={arena.newDraw}
          onBack={() => arena.showRounds(0)}
        />
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
        onFill={(target, shape) => arena.fill(target, shape, locale)}
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
      <Roster setup={setup} />
    </Box>
  );
};

export default Arena;
