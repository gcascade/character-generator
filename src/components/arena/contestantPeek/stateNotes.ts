import { HUNGRY, STARVING } from '../../../content/arenaEvents';
import type { ArenaTexts } from '../../../content/data';
import type { useT } from '../../../i18n';
import type { Contestant, FighterState } from '../../../types/arena';

/**
 * What else is worth knowing about a contestant at a moment (spec 013): a
 * guest, a companion, hunger, the relic.
 */
export const stateNotes = (
  contestant: Contestant,
  state: FighterState | undefined,
  texts: ArenaTexts,
  t: ReturnType<typeof useT>,
): string[] => [
  ...(contestant.guest ? [t('arena.guest')] : []),
  ...(state?.companion
    ? [t('arena.companion', { animal: texts.animals[state.companion]?.a })]
    : []),
  ...((state?.hunger ?? 0) >= STARVING
    ? [t('arena.starving')]
    : (state?.hunger ?? 0) >= HUNGRY
      ? [t('arena.hungry')]
      : []),
  ...(state?.relic ? [t('arena.relic')] : []),
];
