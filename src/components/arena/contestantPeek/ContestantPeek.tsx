import { Box, ClickAwayListener, Tooltip, Typography } from '@mui/material';
import React, {
  cloneElement,
  FC,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import { contestantSkills } from '../../../content/arena';
import { ARENA, ARENA_TEXTS } from '../../../content/data';
import { label } from '../../../content/labels';
import { useLocale, useT } from '../../../i18n';
import type { ArenaSetup, FighterState } from '../../../types/arena';
import CharacterImage from '../../character/characterImage/CharacterImage';
import SkillGrid from '../skillGrid/SkillGrid';
import { stateNotes } from './stateNotes';

type PeekCardProps = {
  setup: ArenaSetup;
  id: string;
  /** Hit points and items at this moment of the match. */
  state?: FighterState;
  /** The state just before, to show what changed (an event's effect). */
  before?: FighterState;
};

/** A contestant at a glance: portrait, skills, perks, and hit points and gear at a moment of the match. */
export const PeekCard: FC<PeekCardProps> = ({ setup, id, state, before }) => {
  const t = useT();
  const { locale } = useLocale();
  const texts = ARENA_TEXTS[locale];
  const contestant = setup.contestants.find((c) => c.id === id);
  if (!contestant) return null;
  const { character } = contestant;
  const skills = contestantSkills(setup, id);
  const items = state?.items ?? contestant.items;
  const gained = before ? items.filter((i) => !before.items.includes(i)) : [];
  const lost = before ? before.items.filter((i) => !items.includes(i)) : [];
  const hpChange = before && state ? state.hp - before.hp : 0;
  const itemNames = (ids: string[]) =>
    ids.map((i) => texts.items[i]?.a).join(', ');
  return (
    <Box sx={{ p: 1, width: 320, maxWidth: '80vw' }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
        <CharacterImage
          race={character.race}
          characterClass={character.characterClass}
          gender={character.gender}
          firstName={character.firstName}
          lastName={character.lastName}
          portraitId={character.portraitId}
          age={character.age}
          height={64}
          width={64}
          crop
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="p" sx={{ lineHeight: 1.2 }}>
            {character.firstName} {character.lastName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {label('race', character.race, character.gender, locale)} ·{' '}
            {label('class', character.characterClass, character.gender, locale)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {state && !state.standing
              ? t('arena.fell')
              : `${t('arena.hp')} ${state?.hp ?? skills.hp}/${state?.maxHp ?? skills.hp}`}
            {hpChange !== 0 && state?.standing && (
              <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                ({hpChange > 0 ? `+${hpChange}` : `−${-hpChange}`})
              </Box>
            )}
          </Typography>
        </Box>
      </Box>
      {state?.partner && (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          {t('arena.partner', {
            name:
              setup.contestants.find((c) => c.id === state.partner)?.character
                .firstName ?? '',
          })}
        </Typography>
      )}
      {stateNotes(contestant, state, texts, t).map((note) => (
        <Typography key={note} variant="body2" sx={{ fontStyle: 'italic' }}>
          {note}
        </Typography>
      ))}
      {contestant.perks.map((p) => (
        <Typography variant="body2" key={p}>
          <strong>
            {t(
              ARENA.perks.find((d) => d.id === p)?.flaw
                ? 'arena.flaw'
                : 'arena.strength',
            )}
          </strong>{' '}
          {texts.perks[p]?.name}
        </Typography>
      ))}
      {gained.length > 0 && (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t('arena.newItems', { items: itemNames(gained) })}
        </Typography>
      )}
      {lost.length > 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('arena.lostItems', { items: itemNames(lost) })}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>{t('arena.items')}</strong>{' '}
        {items.length
          ? items.map((i) => texts.items[i]?.a).join(', ')
          : t('arena.noItems')}
      </Typography>
      <SkillGrid skills={skills} name={character.firstName} hideHp />
    </Box>
  );
};

type ContestantPeekProps = PeekCardProps & {
  /** The element that opens the card: hover, keyboard focus or a tap. */
  children: PeekTooltipProps['children'];
};

const PEEK_SLOT_PROPS = {
  tooltip: {
    sx: {
      bgcolor: 'background.paper',
      color: 'text.primary',
      boxShadow: 6,
      maxWidth: 'none',
      p: 0,
    },
  },
} as const;

type PeekTooltipProps = {
  title: ReactNode;
  children: ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
};

/**
 * A card that opens on hover or keyboard focus, and on a tap or click (phones
 * have no hover); a tap elsewhere closes it.
 */
export const PeekTooltip: FC<PeekTooltipProps> = ({ title, children }) => {
  // A card opened by a click or tap stays until clicked again or elsewhere:
  // phones send a mouse leave right after a tap.
  const [open, setOpen] = useState<false | 'hover' | 'pinned'>(false);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box component="span" sx={{ display: 'inline' }}>
        <Tooltip
          title={title}
          open={open !== false}
          onOpen={() => setOpen((value) => value || 'hover')}
          onClose={() =>
            setOpen((value) => (value === 'pinned' ? value : false))
          }
          enterDelay={250}
          disableTouchListener
          describeChild
          slotProps={PEEK_SLOT_PROPS}
        >
          {cloneElement(children, {
            onClick: (event: React.MouseEvent) => {
              children.props.onClick?.(event);
              setOpen((value) => (value === 'pinned' ? false : 'pinned'));
            },
          })}
        </Tooltip>
      </Box>
    </ClickAwayListener>
  );
};

/** Shows a contestant's card over a name or portrait (maintainer feedback). */
const ContestantPeek: FC<ContestantPeekProps> = ({ children, ...card }) => (
  <PeekTooltip title={<PeekCard {...card} />}>{children}</PeekTooltip>
);

export default ContestantPeek;
