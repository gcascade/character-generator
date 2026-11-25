import { PlayArrow as StartIcon } from '@mui/icons-material';
import { Alert, Box, Button, Typography } from '@mui/material';
import React, { FC, useContext } from 'react';
import ContestantCard from '../../components/arena/contestantCard/ContestantCard';
import RosterBuilder from '../../components/arena/rosterBuilder/RosterBuilder';
import { canStart, contestantSkills } from '../../content/arena';
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
