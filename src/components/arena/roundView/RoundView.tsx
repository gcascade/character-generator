import {
  Brightness2 as NightIcon,
  EmojiEvents as FinaleIcon,
  PersonOff as DefeatIcon,
  WbSunny as DayIcon,
} from '@mui/icons-material';
import { Box, Chip, Typography } from '@mui/material';
import React, { FC } from 'react';
import { ARENA_TEXTS } from '../../../content/data';
import {
  eventSides,
  eventParts,
  renderRoundTitle,
} from '../../../content/arenaText';
import ContestantPeek, { PeekCard } from '../contestantPeek/ContestantPeek';
import { useLocale, useT } from '../../../i18n';
import type { ArenaSetup, EventResult, Round } from '../../../types/arena';
import PortraitStack from '../portraitStack/PortraitStack';

type RoundViewProps = {
  round: Round;
  setup: ArenaSetup;
  /** The last duels after the round limit. */
  finale?: boolean;
  /** Contestants still standing after this round. */
  standing: number;
  /** Shows the dice rolled for each event. */
  showRolls?: boolean;
  /** Only the first events, while the match plays by itself. */
  visible?: number;
};

/** The rolls of an event: "Ana: Perception 54% → 32 ✓". */
const Rolls: FC<{ event: EventResult; setup: ArenaSetup }> = ({
  event,
  setup,
}) => {
  const t = useT();
  const { locale } = useLocale();
  if (!event.rolls?.length) return null;
  const nameOf = (id: string) =>
    setup.contestants.find((c) => c.id === id)?.character.firstName ?? '';
  return (
    <Typography
      variant="caption"
      component="p"
      sx={{
        color: 'text.secondary',
        mt: 0.25,
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 1.5,
      }}
    >
      {event.rolls.map((roll, index) => (
        <Box component="span" key={index} sx={{ whiteSpace: 'nowrap' }}>
          {t('arena.roll', {
            name: nameOf(roll.actor),
            skill: ARENA_TEXTS[locale].skills[roll.skill],
            chance: roll.chance,
            roll: roll.roll,
          })}{' '}
          <Box
            component="span"
            role="img"
            aria-label={t(
              roll.success ? 'arena.rollSuccess' : 'arena.rollFailure',
            )}
          >
            {roll.success ? '✓' : '✗'}
          </Box>
          {roll.reroll && ` (${t('arena.reroll')})`}
        </Box>
      ))}
    </Typography>
  );
};

/** One round of the match: its title and its events, told in the interface language. */
const RoundView: FC<RoundViewProps> = ({
  round,
  setup,
  finale,
  standing,
  showRolls = true,
  visible,
}) => {
  const t = useT();
  const { locale } = useLocale();
  const title = renderRoundTitle(round, locale, finale);
  const character = (id: string) =>
    setup.contestants.find((c) => c.id === id)!.character;
  const stack = (ids: string[], event: EventResult) => (
    <PortraitStack
      characters={ids.map(character)}
      faded={ids.map((id) => event.defeated.includes(id))}
      peek={(index) => (
        <PeekCard
          setup={setup}
          id={ids[index]}
          state={event.after?.[ids[index]]}
          before={event.before?.[ids[index]]}
        />
      )}
    />
  );
  const text = (event: EventResult) =>
    eventParts(event, setup, locale).map((part, index) =>
      typeof part === 'string' ? (
        part
      ) : (
        <ContestantPeek
          key={index}
          setup={setup}
          id={part.actor}
          state={event.after?.[part.actor]}
          before={event.before?.[part.actor]}
        >
          <Box
            component="span"
            tabIndex={0}
            sx={{
              fontWeight: 600,
              textDecoration: 'underline dotted',
              textUnderlineOffset: '3px',
              cursor: 'help',
            }}
          >
            {part.name}
          </Box>
        </ContestantPeek>
      ),
    );
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
        {round.events.slice(0, visible).map((event, index, shownEvents) =>
          event.eventId.startsWith('announce-') ? (
            // The narrator: a line of its own between events.
            <Box
              component="li"
              key={index}
              data-latest={index === shownEvents.length - 1 || undefined}
              sx={{
                my: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="story"
                component="p"
                sx={{ m: 0, fontStyle: 'italic' }}
              >
                {text(event)}
              </Typography>
            </Box>
          ) : (
            <Box
              component="li"
              key={index}
              data-latest={index === shownEvents.length - 1 || undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                py: 1,
                borderTop: index ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              {stack(eventSides(event).left, event)}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="story" component="p" sx={{ m: 0 }}>
                  {text(event)}
                </Typography>
                {event.defeated.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    {event.defeated.map((id) => (
                      <Chip
                        key={id}
                        size="small"
                        icon={<DefeatIcon fontSize="small" />}
                        label={t('arena.out', {
                          name: character(id).firstName,
                        })}
                      />
                    ))}
                  </Box>
                )}
                {showRolls && <Rolls event={event} setup={setup} />}
              </Box>
              {stack(eventSides(event).right, event)}
            </Box>
          ),
        )}
      </Box>
    </Box>
  );
};

export default RoundView;
